/**
 * GET /api/admin/export-waitlist?program_id=xxx
 * Exporta la lista de espera de un programa como CSV.
 * Solo staff.
 */

import { createAdminClient } from '@/lib/supabase/admin';
import { getSessionProfile } from '@/lib/supabase/server';

export async function GET(request) {
  const { profile } = await getSessionProfile();
  if (!profile || !['admin', 'editor'].includes(profile.role)) {
    return Response.json({ error: 'No autorizado' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const programId = searchParams.get('program_id');
  if (!programId) {
    return Response.json({ error: 'program_id requerido' }, { status: 400 });
  }

  const admin = createAdminClient();

  const { data: program } = await admin
    .from('programs')
    .select('title')
    .eq('id', programId)
    .single();

  const { data: entries } = await admin
    .from('program_waitlist')
    .select('email, full_name, notified, created_at')
    .eq('program_id', programId)
    .order('created_at');

  const rows = entries || [];
  const BOM = '﻿';
  const header = 'Email,Nombre,Notificado,Fecha registro\n';
  const body = rows.map((r) =>
    [
      `"${r.email}"`,
      `"${r.full_name || ''}"`,
      r.notified ? 'Sí' : 'No',
      new Date(r.created_at).toLocaleDateString('es-CL'),
    ].join(',')
  ).join('\n');

  const csv = BOM + header + body;
  const filename = `waitlist-${(program?.title || programId).replace(/\s+/g, '-').toLowerCase()}.csv`;

  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}
