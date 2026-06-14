/**
 * POST /api/ai/chat
 * Tutor IA con RAG: busca chunks relevantes de la lección y responde con Claude.
 * Streaming con ReadableStream.
 *
 * Body: { lesson_id: string, message: string, history?: [{role, content}] }
 */

import { createAdminClient } from '@/lib/supabase/admin';
import { getSessionProfile } from '@/lib/supabase/server';
import { rateLimit } from '@/lib/ratelimit';

const MAX_HISTORY = 6; // turnos de conversación a enviar

async function getEmbedding(text) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY no configurada');

  const res = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'text-embedding-3-small',
      input: text,
      dimensions: 1536,
    }),
  });
  const data = await res.json();
  return data.data[0].embedding;
}

export async function POST(request) {
  const rl = rateLimit(request, { max: 30, windowMs: 60_000 });
  if (!rl.ok) {
    return Response.json({ error: 'Límite de peticiones alcanzado' }, {
      status: 429,
      headers: { 'Retry-After': rl.retryAfter },
    });
  }

  const { profile, user } = await getSessionProfile();
  if (!profile) {
    return Response.json({ error: 'No autenticado' }, { status: 401 });
  }

  const { lesson_id, message, history = [] } = await request.json();
  if (!lesson_id || !message?.trim()) {
    return Response.json({ error: 'lesson_id y message son requeridos' }, { status: 400 });
  }

  const admin = createAdminClient();

  // Verificar matrícula
  const { data: lesson } = await admin
    .from('lessons')
    .select('id, title, module_id, modules(program_id)')
    .eq('id', lesson_id)
    .single();

  if (!lesson) {
    return Response.json({ error: 'Lección no encontrada' }, { status: 404 });
  }

  const programId = lesson.modules?.program_id;

  if (!['admin', 'editor'].includes(profile.role)) {
    const { data: enrollment } = await admin
      .from('enrollments')
      .select('id')
      .eq('user_id', user.id)
      .eq('program_id', programId)
      .maybeSingle();

    if (!enrollment) {
      return Response.json({ error: 'No matriculado en este programa' }, { status: 403 });
    }
  }

  // Obtener config del tutor para este programa
  const { data: tutorConfig } = await admin
    .from('ai_tutor_config')
    .select('system_prompt, enabled')
    .eq('program_id', programId)
    .maybeSingle();

  if (tutorConfig?.enabled === false) {
    return Response.json({ error: 'El tutor IA no está habilitado para este programa' }, { status: 403 });
  }

  // RAG: buscar chunks relevantes
  let contextChunks = '';
  try {
    const queryEmbedding = await getEmbedding(message);
    const { data: chunks } = await admin.rpc('match_lesson_chunks', {
      p_query_embedding: JSON.stringify(queryEmbedding),
      p_lesson_ids: [lesson_id],
      p_match_count: 4,
    });

    if (chunks?.length) {
      contextChunks = chunks
        .filter((c) => c.similarity > 0.3)
        .map((c) => c.chunk_text)
        .join('\n\n---\n\n');
    }
  } catch {
    // Si no hay embeddings, el tutor responde sin contexto
  }

  // Guardar mensaje del usuario en historial
  await admin.from('ai_chat_history').insert({
    user_id: user.id,
    lesson_id,
    role: 'user',
    content: message,
  });

  // Construir system prompt
  const baseSystemPrompt = tutorConfig?.system_prompt ||
    `Eres un tutor médico especializado en urología para el Campus Urología Chile.
Ayudas a médicos y estudiantes de posgrado a comprender conceptos de urología
con un enfoque clínico y basado en evidencia. Eres conciso, preciso y didáctico.
Cuando no sabes algo, lo dices claramente. Respondes siempre en español.`;

  const systemPrompt = contextChunks
    ? `${baseSystemPrompt}\n\nContexto de la lección "${lesson.title}":\n\n${contextChunks}`
    : baseSystemPrompt;

  // Preparar mensajes para Claude
  const recentHistory = history.slice(-MAX_HISTORY);
  const messages = [
    ...recentHistory,
    { role: 'user', content: message },
  ];

  // Llamar a Claude API con streaming
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  if (!anthropicKey) {
    return Response.json({ error: 'ANTHROPIC_API_KEY no configurada' }, { status: 500 });
  }

  const claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': anthropicKey,
      'anthropic-version': '2023-06-01',
      'anthropic-beta': 'messages-2023-12-15',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system: systemPrompt,
      messages,
      stream: true,
    }),
  });

  if (!claudeRes.ok) {
    const err = await claudeRes.json();
    return Response.json({ error: err.error?.message || 'Error del tutor IA' }, { status: 500 });
  }

  // Streaming: pasar SSE de Claude al cliente + guardar respuesta completa
  let fullAssistantText = '';

  const stream = new ReadableStream({
    async start(controller) {
      const reader = claudeRes.body.getReader();
      const decoder = new TextDecoder();

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue;
            const data = line.slice(6);
            if (data === '[DONE]') continue;

            try {
              const event = JSON.parse(data);
              if (event.type === 'content_block_delta' && event.delta?.type === 'text_delta') {
                const text = event.delta.text;
                fullAssistantText += text;
                controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ text })}\n\n`));
              }
            } catch {
              // ignorar líneas no JSON
            }
          }
        }
      } finally {
        // Guardar respuesta completa del asistente
        if (fullAssistantText) {
          await admin.from('ai_chat_history').insert({
            user_id: user.id,
            lesson_id,
            role: 'assistant',
            content: fullAssistantText,
          });
        }
        controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'));
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
