-- ============================================================
-- Fase 8: Bucket de Supabase Storage para imágenes de lecciones
-- Ejecutar en Supabase → SQL Editor
-- ============================================================

-- Bucket público para imágenes embebidas en lecciones
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'lesson-images',
  'lesson-images',
  true,
  10485760,  -- 10 MB máximo por imagen
  ARRAY['image/jpeg','image/png','image/webp','image/gif','image/svg+xml']
)
ON CONFLICT (id) DO NOTHING;

-- Lectura pública (cualquiera puede ver las imágenes embebidas)
CREATE POLICY "Public read lesson images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'lesson-images');

-- Solo staff puede subir imágenes
CREATE POLICY "Staff upload lesson images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'lesson-images'
    AND (SELECT public.my_role()) IN ('admin', 'editor')
  );

-- Solo staff puede eliminar imágenes
CREATE POLICY "Staff delete lesson images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'lesson-images'
    AND (SELECT public.my_role()) IN ('admin', 'editor')
  );
