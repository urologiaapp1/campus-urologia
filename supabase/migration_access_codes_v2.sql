-- ============================================================
-- Códigos de acceso v2: múltiples códigos por programa,
-- uso ilimitado o único.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.program_access_codes (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  program_id    UUID NOT NULL REFERENCES public.programs(id) ON DELETE CASCADE,
  code          TEXT UNIQUE NOT NULL,
  kind          TEXT NOT NULL DEFAULT 'unlimited' CHECK (kind IN ('unlimited', 'single')),
  used_count    INT NOT NULL DEFAULT 0,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  expires_at    TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Índice para lookup rápido por código
CREATE INDEX IF NOT EXISTS idx_pac_code ON public.program_access_codes (code) WHERE is_active = TRUE;

-- RLS
ALTER TABLE public.program_access_codes ENABLE ROW LEVEL SECURITY;

-- Staff puede gestionar todos los códigos
CREATE POLICY "staff manage codes"
  ON public.program_access_codes FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','editor'))
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','editor'))
  );

-- Cualquier usuario autenticado puede leer (para validar en el flujo de matrícula)
CREATE POLICY "authenticated read codes"
  ON public.program_access_codes FOR SELECT
  USING (auth.role() = 'authenticated');
