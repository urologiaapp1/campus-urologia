-- =============================================================================
-- FASE 6: Tutor IA con RAG (pgvector)
-- Ejecutar DESPUÉS de migration_fase4.sql
-- Requiere que la extensión vector esté habilitada en Supabase:
--   Dashboard → Database → Extensions → vector → Enable
-- =============================================================================

-- Habilitar extensión pgvector
CREATE EXTENSION IF NOT EXISTS vector;

-- ── Embeddings de lecciones ───────────────────────────────────────────────────
-- Almacena el embedding del contenido de cada lección para búsqueda semántica
CREATE TABLE IF NOT EXISTS lesson_embeddings (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id    uuid NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  chunk_index  int  NOT NULL DEFAULT 0,        -- para lecciones largas, múltiples chunks
  chunk_text   text NOT NULL,                   -- texto del chunk indexado
  embedding    vector(1536),                    -- compatible con text-embedding-3-small de OpenAI
                                                -- (o 1024 para claude-embedding-*)
  created_at   timestamptz DEFAULT now(),
  UNIQUE(lesson_id, chunk_index)
);

CREATE INDEX IF NOT EXISTS lesson_embeddings_lesson_id_idx
  ON lesson_embeddings(lesson_id);

-- Índice HNSW para búsqueda semántica rápida
CREATE INDEX IF NOT EXISTS lesson_embeddings_vector_idx
  ON lesson_embeddings USING hnsw (embedding vector_cosine_ops);

-- ── RLS: solo staff puede insertar/actualizar embeddings ──────────────────────
ALTER TABLE lesson_embeddings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff manage embeddings"
  ON lesson_embeddings FOR ALL
  USING (is_staff())
  WITH CHECK (is_staff());

CREATE POLICY "Enrolled users can read embeddings"
  ON lesson_embeddings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM lessons l
      JOIN modules m ON m.id = l.module_id
      JOIN enrollments e ON e.program_id = m.program_id
      WHERE l.id = lesson_embeddings.lesson_id
        AND e.user_id = auth.uid()
    )
  );

-- ── Historial de conversaciones con el tutor ─────────────────────────────────
CREATE TABLE IF NOT EXISTS ai_chat_history (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id  uuid REFERENCES lessons(id) ON DELETE SET NULL,
  role       text NOT NULL CHECK (role IN ('user', 'assistant')),
  content    text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ai_chat_history_user_lesson_idx
  ON ai_chat_history(user_id, lesson_id, created_at);

ALTER TABLE ai_chat_history ENABLE ROW LEVEL SECURITY;

-- Usuarios solo ven su propio historial
CREATE POLICY "Users manage own chat history"
  ON ai_chat_history FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Staff puede ver todo para moderación
CREATE POLICY "Staff read all chat history"
  ON ai_chat_history FOR SELECT
  USING (is_staff());

-- ── Función: búsqueda semántica de chunks relevantes ─────────────────────────
-- Busca los N chunks más cercanos al embedding de la consulta
-- Llamada desde el servidor con service role
CREATE OR REPLACE FUNCTION match_lesson_chunks(
  p_query_embedding vector(1536),
  p_lesson_ids      uuid[],
  p_match_count     int DEFAULT 5
)
RETURNS TABLE (
  lesson_id   uuid,
  chunk_index int,
  chunk_text  text,
  similarity  float
)
LANGUAGE sql STABLE
AS $$
  SELECT
    le.lesson_id,
    le.chunk_index,
    le.chunk_text,
    1 - (le.embedding <=> p_query_embedding) AS similarity
  FROM lesson_embeddings le
  WHERE le.lesson_id = ANY(p_lesson_ids)
    AND le.embedding IS NOT NULL
  ORDER BY le.embedding <=> p_query_embedding
  LIMIT p_match_count;
$$;

-- ── Tabla de configuración del tutor por programa ────────────────────────────
CREATE TABLE IF NOT EXISTS ai_tutor_config (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id   uuid NOT NULL REFERENCES programs(id) ON DELETE CASCADE UNIQUE,
  system_prompt text,                    -- instrucciones custom por programa
  enabled      boolean DEFAULT true,
  created_at   timestamptz DEFAULT now(),
  updated_at   timestamptz DEFAULT now()
);

ALTER TABLE ai_tutor_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff manage tutor config"
  ON ai_tutor_config FOR ALL
  USING (is_staff())
  WITH CHECK (is_staff());

CREATE POLICY "Enrolled users read tutor config"
  ON ai_tutor_config FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM enrollments e
      WHERE e.program_id = ai_tutor_config.program_id
        AND e.user_id = auth.uid()
    )
  );

-- Config por defecto para el programa de Cirugía Reconstructiva Uretral
-- (se actualizará con el ID real del programa tras correr los seeds)
-- INSERT INTO ai_tutor_config(program_id, system_prompt) VALUES (...);
