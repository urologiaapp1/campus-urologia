-- ============================================================
-- Fase 7: Simulador de paciente virtual con IA
-- Ejecutar en Supabase → SQL Editor
-- ============================================================

-- 1. CASOS CLÍNICOS
-- patient_profile nunca se envía al browser: el API route lo usa con
-- service role únicamente para construir el system prompt de la IA.
CREATE TABLE IF NOT EXISTS clinical_cases (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id          uuid REFERENCES programs(id) ON DELETE CASCADE,
  title               text NOT NULL,
  specialty           text NOT NULL,
  difficulty          text NOT NULL CHECK (difficulty IN ('básico', 'intermedio', 'avanzado')),
  patient_profile     text NOT NULL,   -- instrucciones secretas para la IA (síntomas, Dx, hallazgos)
  learning_objectives text,
  created_by          uuid REFERENCES auth.users(id),
  created_at          timestamptz DEFAULT now()
);

ALTER TABLE clinical_cases ENABLE ROW LEVEL SECURITY;

-- Staff gestiona todos los casos (incluye patient_profile)
CREATE POLICY "staff_manage_clinical_cases" ON clinical_cases
  FOR ALL TO authenticated
  USING (is_staff())
  WITH CHECK (is_staff());

-- Alumnos matriculados pueden leer la fila (el código cliente NUNCA selecciona patient_profile)
CREATE POLICY "enrolled_read_clinical_cases" ON clinical_cases
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM enrollments
      WHERE user_id = auth.uid()
        AND program_id = clinical_cases.program_id
    )
  );

-- 2. SESIONES DE SIMULACIÓN
CREATE TABLE IF NOT EXISTS simulation_sessions (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  case_id     uuid REFERENCES clinical_cases(id) ON DELETE CASCADE NOT NULL,
  messages    jsonb NOT NULL DEFAULT '[]'::jsonb,
  status      text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed')),
  score       int,
  feedback    text,
  created_at  timestamptz DEFAULT now()
);

ALTER TABLE simulation_sessions ENABLE ROW LEVEL SECURITY;

-- Cada usuario gestiona sus propias sesiones
CREATE POLICY "user_own_simulation_sessions" ON simulation_sessions
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Staff puede leer todas las sesiones (para seguimiento docente)
CREATE POLICY "staff_read_simulation_sessions" ON simulation_sessions
  FOR SELECT TO authenticated
  USING (is_staff());

-- 3. CLAVES IA PROPIAS (BYOK)
CREATE TABLE IF NOT EXISTS user_ai_keys (
  user_id           uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  provider          text NOT NULL DEFAULT 'gemini'
                        CHECK (provider IN ('gemini', 'groq', 'openai', 'anthropic')),
  api_key_encrypted text NOT NULL,
  created_at        timestamptz DEFAULT now(),
  updated_at        timestamptz DEFAULT now()
);

ALTER TABLE user_ai_keys ENABLE ROW LEVEL SECURITY;

-- Solo el dueño puede ver/editar su clave
CREATE POLICY "user_own_ai_key" ON user_ai_keys
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
