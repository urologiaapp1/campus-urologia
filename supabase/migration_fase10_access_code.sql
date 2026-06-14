-- ============================================================
-- Fase 10: Código de acceso por programa
-- Ejecutar en Supabase → SQL Editor
-- ============================================================

-- Agregar columna access_code a programs
ALTER TABLE public.programs
  ADD COLUMN IF NOT EXISTS access_code text UNIQUE,
  ADD COLUMN IF NOT EXISTS access_code_expires_at timestamptz;

-- Índice para búsqueda rápida por código
CREATE INDEX IF NOT EXISTS idx_programs_access_code
  ON public.programs (access_code)
  WHERE access_code IS NOT NULL;
