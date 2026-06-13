import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

/**
 * GET /api/admin/export-notas?program_id=XXX
 * Exporta notas del programa seleccionado como CSV.
 * Solo staff.
 */
export async function GET(request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (!profile || !['admin', 'editor'].includes(profile.role)) {
    return NextResponse.json({ error: 'Sin permisos' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const programId = searchParams.get('program_id');
  if (!programId) return NextResponse.json({ error: 'program_id requerido' }, { status: 400 });

  const admin = createAdminClient();

  // Información del programa
  const { data: program } = await admin.from('programs').select('title').eq('id', programId).single();

  // Matriculados
  const { data: enrollments } = await admin
    .from('enrollments')
    .select('user_id, profiles(full_name)')
    .eq('program_id', programId);

  // Módulos y lecciones
  const { data: modules } = await admin.from('modules').select('id').eq('program_id', programId);
  const moduleIds = (modules || []).map((m) => m.id);

  const { data: lessons } = moduleIds.length
    ? await admin.from('lessons').select('id').in('module_id', moduleIds)
    : { data: [] };
  const lessonIds = (lessons || []).map((l) => l.id);

  // Quizzes del programa
  const { data: quizzes } = lessonIds.length
    ? await admin.from('quizzes').select('id, title').in('lesson_id', lessonIds)
    : { data: [] };

  // Emails (via auth admin)
  const userIds = (enrollments || []).map((e) => e.user_id);
  const emailMap = {};
  for (const uid of userIds) {
    const { data: au } = await admin.auth.admin.getUserById(uid);
    emailMap[uid] = au?.user?.email || '';
  }

  // Progreso por alumno
  const { data: allProgress } = lessonIds.length
    ? await admin.from('lesson_progress').select('user_id, lesson_id').in('user_id', userIds).in('lesson_id', lessonIds)
    : { data: [] };

  // Intentos de quiz
  const quizIds = (quizzes || []).map((q) => q.id);
  const { data: allAttempts } = quizIds.length
    ? await admin.from('quiz_attempts').select('user_id, quiz_id, score').in('user_id', userIds).in('quiz_id', quizIds)
    : { data: [] };

  // Certificados
  const { data: certs } = await admin
    .from('certificates')
    .select('user_id, code, issued_at')
    .eq('program_id', programId)
    .in('user_id', userIds);
  const certMap = {};
  (certs || []).forEach((c) => { certMap[c.user_id] = c; });

  // Construir CSV
  const quizHeaders = (quizzes || []).map((q) => `"${(q.title || 'Quiz').replace(/"/g, '""')}"`);
  const headers = [
    'Alumno', 'Email', 'Lecciones %',
    ...quizHeaders,
    'Promedio quizzes', 'Certificado', 'Fecha certificado'
  ];

  const rows = (enrollments || []).map((e) => {
    const uid = e.user_id;
    const name = e.profiles?.full_name || uid;
    const email = emailMap[uid] || '';

    const doneLessons = (allProgress || []).filter((p) => p.user_id === uid).length;
    const lessonPct = lessonIds.length ? Math.round((doneLessons / lessonIds.length) * 100) : 0;

    // Mejor intento por quiz
    const quizScores = (quizzes || []).map((q) => {
      const attempts = (allAttempts || []).filter((a) => a.user_id === uid && a.quiz_id === q.id);
      if (!attempts.length) return '';
      return Math.max(...attempts.map((a) => a.score)).toFixed(1);
    });

    const numericScores = quizScores.filter((s) => s !== '').map(Number);
    const avg = numericScores.length
      ? (numericScores.reduce((a, b) => a + b, 0) / numericScores.length).toFixed(1)
      : '';

    const cert = certMap[uid];
    return [
      `"${name.replace(/"/g, '""')}"`,
      `"${email}"`,
      lessonPct,
      ...quizScores,
      avg,
      cert ? cert.code : '',
      cert ? new Date(cert.issued_at).toLocaleDateString('es-CL') : '',
    ];
  });

  const csv = [
    headers.join(','),
    ...rows.map((r) => r.join(',')),
  ].join('\n');

  const filename = `notas-${(program?.title || 'programa').toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().slice(0, 10)}.csv`;

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}
