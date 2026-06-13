import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

/**
 * POST /api/assignments/grade
 * Califica una entrega usando la rúbrica.
 * Solo staff puede calificar.
 * Body: { submission_id, grades: [{ rubric_item_id, points_awarded, feedback }] }
 */
export async function POST(request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

  // Verificar que sea staff
  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single();
  if (!profile || !['admin', 'editor'].includes(profile.role)) {
    return NextResponse.json({ error: 'Sin permisos' }, { status: 403 });
  }

  const { submission_id, grades } = await request.json();
  if (!submission_id || !Array.isArray(grades)) {
    return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });
  }

  const admin = createAdminClient();

  // Eliminar calificaciones previas (upsert manual)
  await admin.from('submission_grades').delete().eq('submission_id', submission_id);

  // Insertar nuevas calificaciones
  const rows = grades.map((g) => ({
    submission_id,
    rubric_item_id: g.rubric_item_id,
    points_awarded: Math.max(0, parseInt(g.points_awarded) || 0),
    feedback: g.feedback || null,
    graded_by: user.id,
  }));

  const { error } = await admin.from('submission_grades').insert(rows);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
