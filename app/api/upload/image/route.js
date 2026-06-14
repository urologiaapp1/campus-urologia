/**
 * POST /api/upload/image
 * Sube una imagen a Supabase Storage (bucket lesson-images).
 * Staff (admin/editor): hasta 10 MB → carpeta lessons/
 * Alumnos autenticados: hasta 5 MB → carpeta comments/
 */
import { createAdminClient } from '@/lib/supabase/admin';
import { getSessionProfile } from '@/lib/supabase/server';

const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];

export async function POST(request) {
  const { user, profile } = await getSessionProfile();
  if (!user) return Response.json({ error: 'No autenticado' }, { status: 401 });

  const isStaff  = profile && ['admin', 'editor'].includes(profile.role);
  const maxBytes = isStaff ? 10 * 1024 * 1024 : 5 * 1024 * 1024;
  const folder   = isStaff ? 'lessons' : 'comments';

  const formData = await request.formData();
  const file = formData.get('file');
  if (!file) return Response.json({ error: 'Archivo requerido' }, { status: 400 });

  if (!ALLOWED.includes(file.type)) {
    return Response.json({ error: 'Tipo de archivo no permitido' }, { status: 400 });
  }
  if (file.size > maxBytes) {
    return Response.json({ error: `Imagen demasiado grande (máx ${isStaff ? '10' : '5'} MB)` }, { status: 400 });
  }

  const ext  = file.name.split('.').pop().toLowerCase();
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const admin = createAdminClient();
  const bytes = await file.arrayBuffer();

  const { error } = await admin.storage
    .from('lesson-images')
    .upload(path, bytes, { contentType: file.type, upsert: false });

  if (error) return Response.json({ error: error.message }, { status: 500 });

  const { data } = admin.storage.from('lesson-images').getPublicUrl(path);
  return Response.json({ url: data.publicUrl });
}
