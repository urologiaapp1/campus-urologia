/**
 * POST /api/enroll/code
 * Valida un código de acceso y matricula al usuario en el programa.
 * Body: { code: string }
 */
import { createAdminClient } from '@/lib/supabase/admin';
import { getSessionProfile } from '@/lib/supabase/server';

export async function POST(request) {
  const { user } = await getSessionProfile();
  if (!user) return Response.json({ error: 'Debes iniciar sesión primero.' }, { status: 401 });

  const { code } = await request.json();
  if (!code?.trim()) return Response.json({ error: 'Código requerido.' }, { status: 400 });

  const admin = createAdminClient();

  // Buscar programa por código
  const { data: program } = await admin
    .from('programs')
    .select('id, title, access_code_expires_at')
    .eq('access_code', code.trim().toUpperCase())
    .single();

  if (!program) return Response.json({ error: 'Código inválido.' }, { status: 404 });

  // Verificar expiración
  if (program.access_code_expires_at && new Date(program.access_code_expires_at) < new Date()) {
    return Response.json({ error: 'Este código ha expirado.' }, { status: 410 });
  }

  // Matricular (upsert por si ya está matriculado)
  const { error } = await admin
    .from('enrollments')
    .upsert({ user_id: user.id, program_id: program.id }, { onConflict: 'user_id,program_id' });

  if (error) return Response.json({ error: 'Error al matricular: ' + error.message }, { status: 500 });

  return Response.json({ message: `¡Acceso concedido a "${program.title}"!` });
}
