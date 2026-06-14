-- ============================================================
-- Fase 9: Editores de programa (admin por curso)
-- Ejecutar en Supabase → SQL Editor
-- ============================================================

-- Tabla de asignación editor ↔ programa
CREATE TABLE IF NOT EXISTS public.program_staff (
  program_id uuid NOT NULL REFERENCES public.programs(id) ON DELETE CASCADE,
  user_id    uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (program_id, user_id)
);

ALTER TABLE public.program_staff ENABLE ROW LEVEL SECURITY;

-- Solo admins globales gestionan asignaciones
CREATE POLICY "admin_manage_program_staff" ON public.program_staff
  FOR ALL TO authenticated
  USING (public.my_role() = 'admin')
  WITH CHECK (public.my_role() = 'admin');

-- El editor puede leer sus propias asignaciones
CREATE POLICY "editor_read_own_program_staff" ON public.program_staff
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- Función helper: ¿el usuario actual es staff del programa?
-- Retorna true si es admin global O si tiene asignación en program_staff
CREATE OR REPLACE FUNCTION public.is_program_staff(p_program uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT public.my_role() = 'admin'
      OR EXISTS (
        SELECT 1 FROM public.program_staff
        WHERE program_id = p_program AND user_id = auth.uid()
      );
$$;
