/**
 * POST /api/enroll/code
 * Valida un código de acceso y matricula al usuario.
 * Soporta la nueva tabla program_access_codes (ilimitado/único uso)
 * y el código legacy programs.access_code como fallback.
 */
import { createAdminClient } from '@/lib/supabase/admin';
import { getSessionProfile } from '@/lib/supabase/server';

function generateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

export async function POST(request) {
  const { user } = await getSessionProfile();
  if (!user) return Response.json({ error: 'Debes iniciar sesión primero.' }, { status: 401 });

  const { code } = await request.json();
  if (!code?.trim()) return Response.json({ error: 'Código requerido.' }, { status: 400 });

  const admin = createAdminClient();
  const upperCode = code.trim().toUpperCase();

  // ── Buscar en tabla nueva program_access_codes ───────────────
  const { data: pac } = await admin
    .from('program_access_codes')
    .select('id, program_id, kind, used_count, is_active, expires_at, programs(id, title)')
    .eq('code', upperCode)
    .maybeSingle();

  if (pac) {
    if (!pac.is_active) return Response.json({ error: 'Este código ha sido desactivado.' }, { status: 410 });
    if (pac.expires_at && new Date(pac.expires_at) < new Date()) {
      return Response.json({ error: 'Este código ha expirado.' }, { status: 410 });
    }
    if (pac.kind === 'single' && pac.used_count >= 1) {
      return Response.json({ error: 'Este código ya fue utilizado.' }, { status: 410 });
    }

    // Matricular
    const { error: enErr } = await admin
      .from('enrollments')
      .upsert({ user_id: user.id, program_id: pac.program_id }, { onConflict: 'user_id,program_id' });
    if (enErr) return Response.json({ error: 'Error al matricular: ' + enErr.message }, { status: 500 });

    // Incrementar uso
    await admin
      .from('program_access_codes')
      .update({ used_count: pac.used_count + 1 })
      .eq('id', pac.id);

    return Response.json({ message: `¡Acceso concedido a "${pac.programs?.title}"!` });
  }

  // ── Fallback: código legacy en programs.access_code ─────────
  const { data: program } = await admin
    .from('programs')
    .select('id, title, access_code_expires_at')
    .eq('access_code', upperCode)
    .single();

  if (!program) return Response.json({ error: 'Código inválido o expirado.' }, { status: 404 });

  if (program.access_code_expires_at && new Date(program.access_code_expires_at) < new Date()) {
    return Response.json({ error: 'Este código ha expirado.' }, { status: 410 });
  }

  const { error } = await admin
    .from('enrollments')
    .upsert({ user_id: user.id, program_id: program.id }, { onConflict: 'user_id,program_id' });

  if (error) return Response.json({ error: 'Error al matricular: ' + error.message }, { status: 500 });
  return Response.json({ message: `¡Acceso concedido a "${program.title}"!` });
}
