-- ============================================================
-- FASE 4: Clases en vivo, Flashcards, Encuesta NPS
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- 1. CLASES EN VIVO
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS live_sessions (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id       uuid NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  title           text NOT NULL,
  description     text,
  join_url        text,                   -- Zoom / Meet / Teams link
  starts_at       timestamptz NOT NULL,
  duration_min    int NOT NULL DEFAULT 60,
  recording_url   text,                   -- URL de la grabación (post-sesión)
  password        text,                   -- contraseña Zoom (opcional)
  created_by      uuid REFERENCES profiles(id),
  created_at      timestamptz DEFAULT now()
);

ALTER TABLE live_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ver clases" ON live_sessions FOR SELECT TO authenticated
  USING (
    is_staff() OR
    EXISTS (
      SELECT 1 FROM modules m
      JOIN enrollments e ON e.program_id = m.program_id
      WHERE m.id = live_sessions.module_id AND e.user_id = auth.uid()
    )
  );
CREATE POLICY "gestionar clases" ON live_sessions FOR ALL TO authenticated
  USING (is_staff()) WITH CHECK (is_staff());

-- Trigger: notificar a matriculados cuando se programa una clase en vivo
CREATE OR REPLACE FUNCTION trg_notify_live_session()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_user_id uuid;
  v_program_id uuid;
  v_slug text;
BEGIN
  SELECT m.program_id, p.slug INTO v_program_id, v_slug
  FROM modules m JOIN programs p ON p.id = m.program_id
  WHERE m.id = NEW.module_id;

  FOR v_user_id IN
    SELECT user_id FROM enrollments WHERE program_id = v_program_id
  LOOP
    IF v_user_id <> NEW.created_by THEN
      PERFORM create_notification(
        v_user_id,
        'anuncio',
        '🎥 Nueva clase en vivo: ' || NEW.title,
        to_char(NEW.starts_at AT TIME ZONE 'America/Santiago', 'DD/MM/YYYY HH24:MI') || ' hrs',
        '/programa/' || v_slug
      );
    END IF;
  END LOOP;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS trg_notify_live_session ON live_sessions;
CREATE TRIGGER trg_notify_live_session
  AFTER INSERT ON live_sessions
  FOR EACH ROW EXECUTE FUNCTION trg_notify_live_session();

-- ────────────────────────────────────────────────────────────
-- 2. FLASHCARDS DE REPASO
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS flashcards (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id   uuid NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  front       text NOT NULL,  -- pregunta / concepto
  back        text NOT NULL,  -- respuesta / definición
  hint        text,           -- pista opcional
  difficulty  text DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  position    int DEFAULT 0,
  created_by  uuid REFERENCES profiles(id),
  created_at  timestamptz DEFAULT now()
);

-- Progreso individual de flashcards
CREATE TABLE IF NOT EXISTS flashcard_progress (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  flashcard_id uuid NOT NULL REFERENCES flashcards(id) ON DELETE CASCADE,
  user_id      uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  mastered     boolean NOT NULL DEFAULT false,
  last_seen    timestamptz DEFAULT now(),
  UNIQUE(flashcard_id, user_id)
);

ALTER TABLE flashcards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ver flashcards" ON flashcards FOR SELECT TO authenticated
  USING (
    is_staff() OR
    EXISTS (
      SELECT 1 FROM modules m
      JOIN enrollments e ON e.program_id = m.program_id
      WHERE m.id = flashcards.module_id AND e.user_id = auth.uid()
    )
  );
CREATE POLICY "gestionar flashcards" ON flashcards FOR ALL TO authenticated
  USING (is_staff()) WITH CHECK (is_staff());

ALTER TABLE flashcard_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ver mi progreso flashcard" ON flashcard_progress FOR SELECT TO authenticated
  USING (user_id = auth.uid());
CREATE POLICY "actualizar mi progreso flashcard" ON flashcard_progress FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- ────────────────────────────────────────────────────────────
-- 3. ENCUESTA NPS AL COMPLETAR PROGRAMA
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS program_surveys (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id  uuid NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  user_id     uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  nps_score   int NOT NULL CHECK (nps_score BETWEEN 0 AND 10),
  comment     text,
  submitted_at timestamptz DEFAULT now(),
  UNIQUE(program_id, user_id)
);

ALTER TABLE program_surveys ENABLE ROW LEVEL SECURITY;
-- Estudiante: ver y crear su propia encuesta
CREATE POLICY "crear mi encuesta" ON program_surveys FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "ver mi encuesta" ON program_surveys FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR is_staff());
-- Staff: ver todas para análisis
CREATE POLICY "staff ver encuestas" ON program_surveys FOR SELECT TO authenticated
  USING (is_staff());

-- Vista de NPS promedio por programa (útil para estadísticas)
CREATE OR REPLACE VIEW program_nps AS
SELECT
  p.id AS program_id,
  p.title,
  COUNT(s.id)::int AS responses,
  ROUND(AVG(s.nps_score), 1) AS avg_score,
  COUNT(CASE WHEN s.nps_score >= 9 THEN 1 END)::int AS promoters,
  COUNT(CASE WHEN s.nps_score BETWEEN 7 AND 8 THEN 1 END)::int AS passives,
  COUNT(CASE WHEN s.nps_score <= 6 THEN 1 END)::int AS detractors,
  -- NPS = % promotores - % detractores
  ROUND(
    100.0 * COUNT(CASE WHEN s.nps_score >= 9 THEN 1 END) / NULLIF(COUNT(s.id), 0) -
    100.0 * COUNT(CASE WHEN s.nps_score <= 6 THEN 1 END) / NULLIF(COUNT(s.id), 0)
  , 1) AS nps
FROM programs p
LEFT JOIN program_surveys s ON s.program_id = p.id
GROUP BY p.id, p.title;
