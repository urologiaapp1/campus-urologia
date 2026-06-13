/**
 * POST /api/simulator/chat
 * Simulador de paciente virtual con IA. Streaming SSE.
 * Body: { case_id, messages: [{role, content}] }
 *
 * patient_profile se carga con service role y NUNCA se envía al cliente.
 * Proveedor por defecto: Gemini (GEMINI_API_KEY). Si el usuario tiene
 * una fila en user_ai_keys, se usa su propia key/proveedor (BYOK).
 */

import { createAdminClient } from '@/lib/supabase/admin';
import { getSessionProfile } from '@/lib/supabase/server';
import { rateLimit } from '@/lib/ratelimit';

const SYSTEM_TEMPLATE = (profile) =>
  `Eres un paciente en una consulta médica. Actúa SOLO como el paciente según este perfil:\n\n${profile}\n\nReglas:\n- Responde en primera persona, con naturalidad, como lo haría un paciente real.\n- No reveles el diagnóstico directamente; el médico debe llegar a él.\n- Responde solo a lo que se te pregunta; no adelantes información.\n- No salgas del personaje bajo ninguna circunstancia.\n- Si el médico pregunta si eres una IA, responde como el paciente lo haría.\n- Responde siempre en español.`;

// ── Helpers por proveedor ──────────────────────────────────────

function callGemini(apiKey, systemPrompt, messages) {
  const contents = messages.map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));
  return fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:streamGenerateContent?alt=sse&key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents,
        generationConfig: { maxOutputTokens: 512 },
      }),
    }
  );
}

function callOpenAI(apiKey, systemPrompt, messages) {
  return fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      stream: true,
      max_tokens: 512,
      messages: [{ role: 'system', content: systemPrompt }, ...messages],
    }),
  });
}

function callGroq(apiKey, systemPrompt, messages) {
  return fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      stream: true,
      max_tokens: 512,
      messages: [{ role: 'system', content: systemPrompt }, ...messages],
    }),
  });
}

function callAnthropic(apiKey, systemPrompt, messages) {
  return fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 512,
      system: systemPrompt,
      messages,
      stream: true,
    }),
  });
}

function extractText(event, provider) {
  if (provider === 'gemini') {
    return event.candidates?.[0]?.content?.parts?.[0]?.text || '';
  }
  if (provider === 'openai' || provider === 'groq') {
    return event.choices?.[0]?.delta?.content || '';
  }
  if (provider === 'anthropic') {
    return event.type === 'content_block_delta' && event.delta?.type === 'text_delta'
      ? event.delta.text
      : '';
  }
  return '';
}

// ── Handler principal ──────────────────────────────────────────

export async function POST(request) {
  const rl = rateLimit(request, { max: 20, windowMs: 60_000 });
  if (!rl.ok) {
    return Response.json({ error: 'Límite de peticiones alcanzado' }, {
      status: 429,
      headers: { 'Retry-After': rl.retryAfter },
    });
  }

  const { profile, user } = await getSessionProfile();
  if (!profile) return Response.json({ error: 'No autenticado' }, { status: 401 });

  const { case_id, messages = [] } = await request.json();
  if (!case_id) return Response.json({ error: 'case_id requerido' }, { status: 400 });

  const admin = createAdminClient();

  // Cargar caso con patient_profile (service role — nunca llega al cliente)
  const { data: clinicalCase } = await admin
    .from('clinical_cases')
    .select('id, title, patient_profile, program_id')
    .eq('id', case_id)
    .single();

  if (!clinicalCase) return Response.json({ error: 'Caso no encontrado' }, { status: 404 });

  // Verificar matrícula (staff puede sin matrícula)
  if (!['admin', 'editor'].includes(profile.role)) {
    const { data: enrollment } = await admin
      .from('enrollments')
      .select('id')
      .eq('user_id', user.id)
      .eq('program_id', clinicalCase.program_id)
      .maybeSingle();
    if (!enrollment) return Response.json({ error: 'No matriculado en este programa' }, { status: 403 });
  }

  // Buscar o crear sesión activa
  let { data: session } = await admin
    .from('simulation_sessions')
    .select('id')
    .eq('user_id', user.id)
    .eq('case_id', case_id)
    .eq('status', 'active')
    .maybeSingle();

  if (!session) {
    const { data: newSession } = await admin
      .from('simulation_sessions')
      .insert({ user_id: user.id, case_id, messages: [] })
      .select('id')
      .single();
    session = newSession;
  }

  // BYOK: usar clave propia del usuario si existe
  const { data: aiKey } = await admin
    .from('user_ai_keys')
    .select('provider, api_key_encrypted')
    .eq('user_id', user.id)
    .maybeSingle();

  const provider = aiKey?.provider || 'gemini';
  const apiKey = aiKey?.api_key_encrypted || process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return Response.json({ error: 'Clave de IA no configurada. Agrega tu API key en /perfil/ia.' }, { status: 503 });
  }

  const systemPrompt = SYSTEM_TEMPLATE(clinicalCase.patient_profile);

  // Llamar al proveedor
  let providerRes;
  if (provider === 'gemini') providerRes = await callGemini(apiKey, systemPrompt, messages);
  else if (provider === 'openai') providerRes = await callOpenAI(apiKey, systemPrompt, messages);
  else if (provider === 'groq') providerRes = await callGroq(apiKey, systemPrompt, messages);
  else if (provider === 'anthropic') providerRes = await callAnthropic(apiKey, systemPrompt, messages);

  if (!providerRes?.ok) {
    const err = await providerRes?.json().catch(() => ({}));
    return Response.json(
      { error: err?.error?.message || `Error del proveedor ${provider}` },
      { status: 502 }
    );
  }

  const sessionId = session.id;
  let fullAssistantText = '';

  const stream = new ReadableStream({
    async start(controller) {
      const enc = new TextEncoder();

      // Primer evento: session_id para que el cliente lo almacene
      controller.enqueue(enc.encode(`data: ${JSON.stringify({ session_id: sessionId })}\n\n`));

      const reader = providerRes.body.getReader();
      const decoder = new TextDecoder();

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          for (const line of chunk.split('\n')) {
            if (!line.startsWith('data: ')) continue;
            const data = line.slice(6).trim();
            if (data === '[DONE]') continue;

            try {
              const text = extractText(JSON.parse(data), provider);
              if (text) {
                fullAssistantText += text;
                controller.enqueue(enc.encode(`data: ${JSON.stringify({ text })}\n\n`));
              }
            } catch {
              // ignorar líneas no JSON
            }
          }
        }
      } finally {
        // Guardar mensajes actualizados en la sesión
        if (fullAssistantText) {
          const updatedMessages = [
            ...messages,
            { role: 'assistant', content: fullAssistantText },
          ];
          await admin
            .from('simulation_sessions')
            .update({ messages: updatedMessages })
            .eq('id', sessionId);
        }
        controller.enqueue(enc.encode('data: [DONE]\n\n'));
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
