import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { rateLimit } from '@/lib/ratelimit';

function genCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let c = 'US-';
  for (let i = 0; i < 10; i++) c += chars[Math.floor(Math.random() * chars.length)];
  return c;
}

/**
 * Emite el certificado de un programa. Requisitos verificados EN SERVIDOR:
 *  - estar matriculado
 *  - 100% de las lecciones completadas
 *  - todos los quizzes del programa aprobados (mejor intento >= pass_score)
 */
export async function POST(request) {
  const { ok, retryAfter } = rateLimit(request, { max: 10, windowMs: 60_000 });
  if (!ok) return NextResponse.json({ error: 'Demasiadas solicitudes.' }, {
    status: 429, headers: { 'Retry-After': retryAfter }
  });

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

  const { program_id } = await request.json();
  const admin = createAdminClient();

  // ¿ya existe?
  const { data: existing } = await admin
    .from('certificates')
    .select('code')
    .eq('user_id', user.id)
    .eq('program_id', program_id)
    .maybeSingle();
  if (existing) return NextResponse.json({ code: existing.code, new: false });

  const { data: enrollment } = await admin
    .from('enrollments')
    .select('user_id')
    .eq('user_id', user.id)
    .eq('program_id', program_id)
    .maybeSingle();
  if (!enrollment) return NextResponse.json({ error: 'No estás matriculado en este programa' }, { status: 403 });

  // lecciones del programa
  const { data: modules } = await admin
    .from('modules')
    .select('id, lessons(id, title, quizzes(id, title, pass_score))')
    .eq('program_id', program_id);

  const lessons = (modules || []).flatMap((m) => m.lessons || []);
  if (lessons.length === 0) {
    return NextResponse.json({ error: 'El programa no tiene contenidos' }, { status: 400 });
  }
  const lessonIds = lessons.map((l) => l.id);

  const { data: progress } = await admin
    .from('lesson_progress')
    .select('lesson_id')
    .eq('user_id', user.id)
    .in('lesson_id', lessonIds);
  const done = new Set((progress || []).map((p) => p.lesson_id));
  const pendingLessons = lessons.filter((l) => !done.has(l.id));
  if (pendingLessons.length > 0) {
    return NextResponse.json({
      error: `Te faltan ${pendingLessons.length} lección(es) por completar`,
    }, { status: 400 });
  }

  // quizzes aprobados
  const quizzes = lessons.flatMap((l) => l.quizzes || []);
  const scores = [];
  for (const q of quizzes) {
    const { data: attempts } = await admin
      .from('quiz_attempts')
      .select('score')
      .eq('quiz_id', q.id)
      .eq('user_id', user.id)
      .order('score', { ascending: false })
      .limit(1);
    const best = attempts?.[0]?.score;
    if (best === undefined || best < q.pass_score) {
      return NextResponse.json({
        error: `Tienes evaluaciones pendientes de aprobar: "${q.title}"`,
      }, { status: 400 });
    }
    scores.push(best);
  }
  const avg = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null;

  const code = genCode();
  const { error } = await admin.from('certificates').insert({
    code,
    user_id: user.id,
    program_id,
    avg_score: avg,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ code, new: true });
}
