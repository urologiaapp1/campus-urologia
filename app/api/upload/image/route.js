/**
 * POST /api/upload/image
 * Sube una imagen al bucket lesson-images de Supabase Storage.
 * Solo staff. Devuelve { url } pública.
 */
import { createAdminClient } from '@/lib/supabase/admin';
import { getSessionProfile } from '@/lib/supabase/server';

export async function POST(request) {
  const { profile } = await getSessionProfile();
  if (!profile || !['admin', 'editor'].includes(profile.role)) {
    return Response.json({ error: 'No autorizado' }, { status: 403 });
  }

  const formData = await request.formData();
  const file = formData.get('file');
  if (!file) return Response.json({ error: 'Archivo requerido' }, { status: 400 });

  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
  if (!allowed.includes(file.type)) {
    return Response.json({ error: 'Tipo de archivo no permitido' }, { status: 400 });
  }

  if (file.size > 10 * 1024 * 1024) {
    return Response.json({ error: 'Imagen demasiado grande (máx 10 MB)' }, { status: 400 });
  }

  const ext = file.name.split('.').pop();
  const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const admin = createAdminClient();
  const bytes = await file.arrayBuffer();

  const { error } = await admin.storage
    .from('lesson-images')
    .upload(path, bytes, { contentType: file.type, upsert: false });

  if (error) return Response.json({ error: error.message }, { status: 500 });

  const { data } = admin.storage.from('lesson-images').getPublicUrl(path);
  return Response.json({ url: data.publicUrl });
}
