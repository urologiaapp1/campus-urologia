-- ============================================================
-- FASE 2: Cohortes, Tareas, Banco de preguntas, Gamificación
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- 1. COHORTES
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cohorts (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id  uuid NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  name        text NOT NULL,                     -- ej: "Cohorte 2025-1"
  starts_at   date NOT NULL,
  ends_at     date,
  max_seats   int,                               -- null = sin límite
  created_at  timestamptz DEFAULT now()
);

ALTER TABLE enrollments
  ADD COLUMN IF NOT EXISTS cohort_id uuid REFERENCES cohorts(id) ON DELETE SET NULL;

-- RLS cohorts
ALTER TABLE cohorts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ver cohortes" ON cohorts FOR SELECT TO authenticated
  USING (true);
CREATE POLICY "gestionar cohortes" ON cohorts FOR ALL TO authenticated
  USING (is_staff()) WITH CHECK (is_staff());

-- ────────────────────────────────────────────────────────────
-- 2. TAREAS CON RÚBRICAS
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS assignments (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id    uuid NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  title        text NOT NULL,
  instructions text,
  due_at       timestamptz,
  max_score    int NOT NULL DEFAULT 100,
  pass_score   int NOT NULL DEFAULT 60,
  created_at   timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS rubric_items (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id uuid NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
  label         text NOT NULL,      -- ej: "Presentación del caso clínico"
  max_points    int NOT NULL DEFAULT 20,
  position      int NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS submissions (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id  uuid NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
  student_id     uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  drive_file_id  text,              -- archivo entregado por el alumno
  drive_kind     text DEFAULT 'documento',
  comment        text,              -- comentario del alumno
  submitted_at   timestamptz DEFAULT now(),
  UNIQUE(assignment_id, student_id)
);

CREATE TABLE IF NOT EXISTS submission_grades (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id    uuid NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
  rubric_item_id   uuid REFERENCES rubric_items(id) ON DELETE SET NULL,
  points_awarded   int NOT NULL DEFAULT 0,
  feedback         text,
  graded_by        uuid REFERENCES profiles(id),
  graded_at        timestamptz DEFAULT now()
);

-- RLS assignments
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ver tareas" ON assignments FOR SELECT TO authenticated
  USING (
    is_staff() OR
    EXISTS (
      SELECT 1 FROM modules m
      JOIN enrollments e ON e.program_id = m.program_id
      WHERE m.id = assignments.module_id AND e.user_id = auth.uid()
    )
  );
CREATE POLICY "gestionar tareas" ON assignments FOR ALL TO authenticated
  USING (is_staff()) WITH CHECK (is_staff());

ALTER TABLE rubric_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ver rúbrica" ON rubric_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "gestionar rúbrica" ON rubric_items FOR ALL TO authenticated
  USING (is_staff()) WITH CHECK (is_staff());

ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ver entregas" ON submissions FOR SELECT TO authenticated
  USING (student_id = auth.uid() OR is_staff());
CREATE POLICY "crear entrega" ON submissions FOR INSERT TO authenticated
  WITH CHECK (student_id = auth.uid());
CREATE POLICY "actualizar entrega" ON submissions FOR UPDATE TO authenticated
  USING (
    student_id = auth.uid()
    AND NOT EXISTS (
      SELECT 1 FROM submission_grades sg WHERE sg.submission_id = submissions.id
    )
  )
  WITH CHECK (student_id = auth.uid());

-- submission_grades: staff califica, estudiante solo lee la suya
ALTER TABLE submission_grades ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ver calificación" ON submission_grades FOR SELECT TO authenticated
  USING (
    is_staff() OR
    EXISTS (SELECT 1 FROM submissions s WHERE s.id = submission_grades.submission_id AND s.student_id = auth.uid())
  );
CREATE POLICY "calificar entrega" ON submission_grades FOR ALL TO authenticated
  USING (is_staff()) WITH CHECK (is_staff());

-- helper: score total de una entrega
CREATE OR REPLACE FUNCTION submission_total_score(p_submission_id uuid)
RETURNS int LANGUAGE sql STABLE AS $$
  SELECT COALESCE(SUM(points_awarded), 0)::int
  FROM submission_grades
  WHERE submission_id = p_submission_id;
$$;

-- ────────────────────────────────────────────────────────────
-- 3. BANCO DE PREGUNTAS CON QUIZZES ALEATORIOS
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS question_bank (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id  uuid REFERENCES programs(id) ON DELETE CASCADE,
  module_id   uuid REFERENCES modules(id) ON DELETE CASCADE,
  category    text,                 -- ej: "Anatomía", "Técnica quirúrgica"
  difficulty  text DEFAULT 'medium' CHECK (difficulty IN ('easy','medium','hard')),
  stem        text NOT NULL,        -- enunciado
  options     jsonb NOT NULL,       -- ["opción A", "opción B", "opción C", "opción D"]
  created_by  uuid REFERENCES profiles(id),
  created_at  timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS question_bank_keys (
  question_id   uuid PRIMARY KEY REFERENCES question_bank(id) ON DELETE CASCADE,
  correct_index int NOT NULL,
  explanation   text                -- opcional: explicación de la respuesta
);

-- RLS question_bank
ALTER TABLE question_bank ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ver banco preguntas" ON question_bank FOR SELECT TO authenticated
  USING (is_staff());
CREATE POLICY "gestionar banco" ON question_bank FOR ALL TO authenticated
  USING (is_staff()) WITH CHECK (is_staff());

ALTER TABLE question_bank_keys ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ver claves banco" ON question_bank_keys FOR SELECT TO authenticated
  USING (is_staff());
CREATE POLICY "gestionar claves banco" ON question_bank_keys FOR ALL TO authenticated
  USING (is_staff()) WITH CHECK (is_staff());

-- ────────────────────────────────────────────────────────────
-- 4. GAMIFICACIÓN: INSIGNIAS
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS badges (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        text UNIQUE NOT NULL,
  name        text NOT NULL,
  description text,
  icon        text NOT NULL DEFAULT '🏅',  -- emoji o URL
  condition   text NOT NULL                -- para documentación del trigger
);

CREATE TABLE IF NOT EXISTS user_badges (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  badge_id   uuid NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  awarded_at timestamptz DEFAULT now(),
  UNIQUE(user_id, badge_id)
);

-- RLS badges
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ver insignias" ON badges FOR SELECT TO authenticated USING (true);
CREATE POLICY "gestionar insignias" ON badges FOR ALL TO authenticated
  USING (is_staff()) WITH CHECK (is_staff());

ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ver mis insignias" ON user_badges FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR is_staff());
CREATE POLICY "otorgar insignia" ON user_badges FOR INSERT TO authenticated
  WITH CHECK (is_staff());

-- ── Semilla de insignias base ──
INSERT INTO badges (slug, name, description, icon, condition) VALUES
  ('primer_paso',       'Primer paso',          'Completaste tu primera lección',             '👣', 'lesson_progress INSERT cuando count=1'),
  ('primer_topico',     'Voz de la comunidad',  'Publicaste tu primer tópico clínico',        '💬', 'topics INSERT cuando count=1'),
  ('primer_quiz',       'Primer examen',        'Aprobaste tu primer quiz',                   '✅', 'quiz_attempts INSERT con passed=true count=1'),
  ('primer_cert',       'Graduado',             'Obtuviste tu primer certificado',            '🎓', 'certificates INSERT count=1'),
  ('cinco_lecciones',   'Estudioso',            'Completaste 5 lecciones',                    '📚', 'lesson_progress count=5'),
  ('diez_topicos',      'Líder de comunidad',   'Publicaste 10 tópicos',                      '🌟', 'topics count=10'),
  ('evaluador',         'Evaluador',            'Calificaste 10 tópicos de la comunidad',     '⭐', 'topic_ratings count=10'),
  ('perfil_completo',   'Perfil completo',      'Completaste tu perfil con especialidad',     '🪪', 'profiles specialty IS NOT NULL'),
  ('maratonista',       'Maratonista',          'Completaste un programa en menos de 30 días','🏃', 'certificates issued_at - enrollment created_at < 30d')
ON CONFLICT (slug) DO NOTHING;

-- ── Función para otorgar insignias automáticamente ──
-- (llamada desde triggers o desde /api/badges/check)
CREATE OR REPLACE FUNCTION award_badge_if_earned(
  p_user_id uuid,
  p_badge_slug text
) RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO user_badges (user_id, badge_id)
  SELECT p_user_id, id FROM badges WHERE slug = p_badge_slug
  ON CONFLICT DO NOTHING;
END;
$$;

-- ── Trigger: primer paso (primera lección completada) ──
CREATE OR REPLACE FUNCTION trg_check_primer_paso()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_count int;
BEGIN
  SELECT COUNT(*) INTO v_count FROM lesson_progress WHERE user_id = NEW.user_id;
  IF v_count = 1 THEN
    PERFORM award_badge_if_earned(NEW.user_id, 'primer_paso');
  ELSIF v_count = 5 THEN
    PERFORM award_badge_if_earned(NEW.user_id, 'cinco_lecciones');
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS trg_primer_paso ON lesson_progress;
CREATE TRIGGER trg_primer_paso
  AFTER INSERT ON lesson_progress
  FOR EACH ROW EXECUTE FUNCTION trg_check_primer_paso();

-- ── Trigger: primer tópico ──
CREATE OR REPLACE FUNCTION trg_check_primer_topico()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_count int;
BEGIN
  SELECT COUNT(*) INTO v_count FROM topics WHERE author_id = NEW.author_id;
  IF v_count = 1 THEN
    PERFORM award_badge_if_earned(NEW.author_id, 'primer_topico');
  ELSIF v_count = 10 THEN
    PERFORM award_badge_if_earned(NEW.author_id, 'diez_topicos');
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS trg_primer_topico ON topics;
CREATE TRIGGER trg_primer_topico
  AFTER INSERT ON topics
  FOR EACH ROW EXECUTE FUNCTION trg_check_primer_topico();

-- ── Trigger: primer quiz aprobado ──
CREATE OR REPLACE FUNCTION trg_check_primer_quiz()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_count int;
BEGIN
  IF NEW.passed THEN
    SELECT COUNT(*) INTO v_count
    FROM quiz_attempts WHERE user_id = NEW.user_id AND passed = true;
    IF v_count = 1 THEN
      PERFORM award_badge_if_earned(NEW.user_id, 'primer_quiz');
    END IF;
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS trg_primer_quiz ON quiz_attempts;
CREATE TRIGGER trg_primer_quiz
  AFTER INSERT ON quiz_attempts
  FOR EACH ROW EXECUTE FUNCTION trg_check_primer_quiz();

-- ── Trigger: primer certificado ──
CREATE OR REPLACE FUNCTION trg_check_primer_cert()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_count int;
BEGIN
  SELECT COUNT(*) INTO v_count FROM certificates WHERE user_id = NEW.user_id;
  IF v_count = 1 THEN
    PERFORM award_badge_if_earned(NEW.user_id, 'primer_cert');
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS trg_primer_cert ON certificates;
CREATE TRIGGER trg_primer_cert
  AFTER INSERT ON certificates
  FOR EACH ROW EXECUTE FUNCTION trg_check_primer_cert();

-- ── Trigger: evaluador (10 ratings dados) ──
CREATE OR REPLACE FUNCTION trg_check_evaluador()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_count int;
BEGIN
  SELECT COUNT(*) INTO v_count FROM topic_ratings WHERE user_id = NEW.user_id;
  IF v_count = 10 THEN
    PERFORM award_badge_if_earned(NEW.user_id, 'evaluador');
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS trg_evaluador ON topic_ratings;
CREATE TRIGGER trg_evaluador
  AFTER INSERT OR UPDATE ON topic_ratings
  FOR EACH ROW EXECUTE FUNCTION trg_check_evaluador();

-- ── Trigger: perfil completo ──
CREATE OR REPLACE FUNCTION trg_check_perfil_completo()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF NEW.specialty IS NOT NULL AND NEW.specialty <> '' THEN
    PERFORM award_badge_if_earned(NEW.id, 'perfil_completo');
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS trg_perfil_completo ON profiles;
CREATE TRIGGER trg_perfil_completo
  AFTER UPDATE OF specialty ON profiles
  FOR EACH ROW EXECUTE FUNCTION trg_check_perfil_completo();
