-- ============================================================
-- Casos clínicos: media (imagen/video) + RLS solo admin
-- ============================================================

-- 1. Columnas media en clinical_cases
ALTER TABLE public.clinical_cases
  ADD COLUMN IF NOT EXISTS media_url  TEXT,
  ADD COLUMN IF NOT EXISTS media_type TEXT CHECK (media_type IN ('image', 'video'));

-- 2. RLS: solo admin crea/edita/borra casos (editor solo lee via políticas de alumnos)
DROP POLICY IF EXISTS "staff crea y edita casos"    ON public.clinical_cases;
DROP POLICY IF EXISTS "staff_manage_clinical_cases" ON public.clinical_cases;

CREATE POLICY "admin gestiona casos" ON public.clinical_cases
  FOR ALL
  USING   (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- 3. Bucket para imágenes y videos de casos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'case-media', 'case-media', true,
  104857600,  -- 100 MB
  ARRAY['image/jpeg','image/png','image/webp','image/gif',
        'video/mp4','video/webm','video/quicktime','video/ogg']
)
ON CONFLICT (id) DO NOTHING;

-- 4. Políticas storage
DROP POLICY IF EXISTS "Public read case media"   ON storage.objects;
DROP POLICY IF EXISTS "Admin upload case media"  ON storage.objects;
DROP POLICY IF EXISTS "Admin delete case media"  ON storage.objects;

CREATE POLICY "Public read case media"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'case-media');

CREATE POLICY "Admin upload case media"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'case-media'
    AND (SELECT public.my_role()) = 'admin'
  );

CREATE POLICY "Admin delete case media"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'case-media'
    AND (SELECT public.my_role()) = 'admin'
  );
