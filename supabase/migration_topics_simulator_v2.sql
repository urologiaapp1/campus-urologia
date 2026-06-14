-- ============================================================
-- Jerarquía de tópicos: subtemas y tips
-- Simulador: casos globales y multi-programa
-- ============================================================

-- ── Tópicos jerárquicos ─────────────────────────────────────
ALTER TABLE public.topics
  ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES public.topics(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS kind TEXT NOT NULL DEFAULT 'topic'
    CHECK (kind IN ('topic', 'subtopic', 'tip'));

-- Índice para búsqueda rápida de hijos
CREATE INDEX IF NOT EXISTS idx_topics_parent ON public.topics(parent_id) WHERE parent_id IS NOT NULL;

-- La política RLS existente de "ver topicos" ya cubre los hijos
-- porque heredan el module_id indirectamente.
-- Política adicional para crear subtemas/tips:
CREATE POLICY IF NOT EXISTS "crear subtemas" ON public.topics
  FOR INSERT WITH CHECK (
    parent_id IS NOT NULL
    AND author_id = auth.uid()
    AND public.can_access_module(
      (SELECT module_id FROM public.topics WHERE id = parent_id)
    )
  );


-- ── Simulador: casos globales y multi-programa ──────────────
ALTER TABLE public.clinical_cases
  ADD COLUMN IF NOT EXISTS is_global BOOLEAN NOT NULL DEFAULT FALSE,
  ALTER COLUMN program_id DROP NOT NULL;

CREATE TABLE IF NOT EXISTS public.clinical_case_programs (
  case_id    UUID NOT NULL REFERENCES public.clinical_cases(id) ON DELETE CASCADE,
  program_id UUID NOT NULL REFERENCES public.programs(id) ON DELETE CASCADE,
  PRIMARY KEY (case_id, program_id)
);

ALTER TABLE public.clinical_case_programs ENABLE ROW LEVEL SECURITY;

-- Staff gestiona asignaciones
CREATE POLICY "staff gestiona case_programs" ON public.clinical_case_programs
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','editor'))
  );

-- Actualizar RLS de clinical_cases para cubrir global + multi-programa
DROP POLICY IF EXISTS "estudiantes ven sus casos" ON public.clinical_cases;
DROP POLICY IF EXISTS "staff gestiona casos" ON public.clinical_cases;

CREATE POLICY "ver casos simulador" ON public.clinical_cases
  FOR SELECT USING (
    -- Staff ve todo
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','editor'))
    OR
    -- Alumno matriculado en el programa específico
    (program_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.enrollments WHERE user_id = auth.uid() AND program_id = clinical_cases.program_id
    ))
    OR
    -- Caso global: cualquier alumno con alguna matrícula
    (is_global = TRUE AND EXISTS (
      SELECT 1 FROM public.enrollments WHERE user_id = auth.uid()
    ))
    OR
    -- Caso asignado a uno de los programas del alumno via tabla junction
    EXISTS (
      SELECT 1 FROM public.clinical_case_programs ccp
      JOIN public.enrollments e ON e.program_id = ccp.program_id
      WHERE ccp.case_id = clinical_cases.id AND e.user_id = auth.uid()
    )
  );

CREATE POLICY "staff crea y edita casos" ON public.clinical_cases
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','editor'))
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','editor'))
  );
