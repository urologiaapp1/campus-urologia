/**
 * POST /api/ai/index
 * Indexa el contenido de una lección generando embeddings con OpenAI.
 * Solo staff. Llamar tras crear/actualizar contenido de texto.
 *
 * Body: { lesson_id: string }
 */

import { createAdminClient } from '@/lib/supabase/admin';
import { getSessionProfile } from '@/lib/supabase/server';
import { rateLimit } from '@/lib/ratelimit';

const CHUNK_SIZE = 800;   // caracteres por chunk
const CHUNK_OVERLAP = 100;

function chunkText(text, size = CHUNK_SIZE, overlap = CHUNK_OVERLAP) {
  const chunks = [];
  let start = 0;
  while (start < text.length) {
    chunks.push(text.slice(start, start + size));
    start += size - overlap;
  }
  return chunks;
}

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
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || 'Error generando embedding');
  }
  const data = await res.json();
  return data.data[0].embedding;
}

export async function POST(request) {
  const rl = rateLimit(request, { max: 20, windowMs: 60_000 });
  if (!rl.ok) {
    return Response.json({ error: 'Límite de peticiones alcanzado' }, {
      status: 429,
      headers: { 'Retry-After': rl.retryAfter },
    });
  }

  const { profile } = await getSessionProfile();
  if (!profile || !['admin', 'editor'].includes(profile.role)) {
    return Response.json({ error: 'No autorizado' }, { status: 403 });
  }

  const { lesson_id } = await request.json();
  if (!lesson_id) {
    return Response.json({ error: 'lesson_id requerido' }, { status: 400 });
  }

  const admin = createAdminClient();

  // Obtener lección con su contenido
  const { data: lesson, error: lessonErr } = await admin
    .from('lessons')
    .select('id, title, kind, body')
    .eq('id', lesson_id)
    .single();

  if (lessonErr || !lesson) {
    return Response.json({ error: 'Lección no encontrada' }, { status: 404 });
  }

  // Solo indexar lecciones de tipo texto (el contenido Drive no es accesible)
  const text = lesson.kind === 'texto' ? lesson.body : null;
  if (!text?.trim()) {
    return Response.json({
      message: 'Lección sin contenido de texto para indexar. Solo se indexan lecciones de tipo "texto".',
      indexed: 0,
    });
  }

  // Crear chunks
  const fullText = `${lesson.title}\n\n${text}`;
  const chunks = chunkText(fullText);

  // Generar embeddings y guardar
  const rows = [];
  for (let i = 0; i < chunks.length; i++) {
    const embedding = await getEmbedding(chunks[i]);
    rows.push({
      lesson_id,
      chunk_index: i,
      chunk_text: chunks[i],
      embedding: JSON.stringify(embedding),
    });
  }

  // Upsert (reemplaza embeddings anteriores)
  const { error: upsertErr } = await admin
    .from('lesson_embeddings')
    .upsert(rows, { onConflict: 'lesson_id,chunk_index' });

  if (upsertErr) {
    return Response.json({ error: upsertErr.message }, { status: 500 });
  }

  // Eliminar chunks sobrantes de versiones anteriores (si ahora hay menos)
  await admin
    .from('lesson_embeddings')
    .delete()
    .eq('lesson_id', lesson_id)
    .gte('chunk_index', chunks.length);

  return Response.json({ indexed: chunks.length, lesson_id });
}
