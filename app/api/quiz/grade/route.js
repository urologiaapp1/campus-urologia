import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { rateLimit } from '@/lib/ratelimit';

/* Nota escala chilena 1.0-7.0 con umbral configurable */
function toChileanGrade(pct, passScore = 60) {
  const s = Math.min(100, Math.max(0, pct));
  let g = s < passScore
    ? 1 + 3 * (s / passScore)
    : 4 + 3 * ((s - passScore) / (100 - passScore));
  return Math.round(g * 10) / 10;
}

export async function POST(request) {
  const { ok, retryAfter } = rateLimit(request, { max: 30, windowMs: 60_000 });
  if (!ok) return NextResponse.json({ error: 'Demasiadas solicitudes.' }, {
    status: 429, headers: { 'Retry-After': retryAfter },
  });

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

  const { quiz_id, answers } = await request.json();
  if (!quiz_id || typeof answers !== 'object') {
    return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 });
  }

  // Quiz con configuración (RLS valida acceso del alumno)
  const { data: quiz } = await supabase
    .from('quizzes')
    .select('id, pass_score, max_attempts, quiz_questions(id)')
    .eq('id', quiz_id)
    .maybeSingle();
  if (!quiz) return NextResponse.json({ error: 'Quiz no disponible' }, { status: 403 });

  // Verificar límite de intentos
  const { count: attemptCount } = await supabase
    .from('quiz_attempts')
    .select('id', { count: 'exact', head: true })
    .eq('quiz_id', quiz_id)
    .eq('user_id', user.id);

  const maxAttempts = quiz.max_attempts ?? 2;
  if (attemptCount >= maxAttempts) {
    return NextResponse.json({ error: `Ya usaste los ${maxAttempts} intentos permitidos.` }, { status: 403 });
  }

  // Validar que las preguntas respondidas pertenecen al quiz
  const validIds = new Set((quiz.quiz_questions || []).map((q) => q.id));
  const submittedIds = Object.keys(answers).filter((id) => validIds.has(id));
  if (submittedIds.length === 0) {
    return NextResponse.json({ error: 'Sin preguntas válidas' }, { status: 400 });
  }

  // Corrección server-side con service role
  const admin = createAdminClient();
  const { data: keys } = await admin
    .from('quiz_answer_keys')
    .select('question_id, correct_index')
    .in('question_id', submittedIds);

  const keyMap = Object.fromEntries((keys || []).map((k) => [k.question_id, k.correct_index]));
  const correct = submittedIds.filter((id) => answers[id] === keyMap[id]).length;
  const total   = submittedIds.length;
  const score   = Math.round((correct / total) * 100);
  const passed  = score >= (quiz.pass_score ?? 60);
  const grade   = toChileanGrade(score, quiz.pass_score ?? 60);

  await admin.from('quiz_attempts').insert({
    quiz_id,
    user_id: user.id,
    score,
    answers,
    passed,
  });

  const newAttemptCount = attemptCount + 1;
  const isLastAttempt   = newAttemptCount >= maxAttempts;

  // En el último intento: revelar respuestas correctas y explicaciones
  let review = null;
  if (isLastAttempt) {
    const { data: fullKeys } = await admin
      .from('quiz_answer_keys')
      .select('question_id, correct_index, explanation')
      .in('question_id', submittedIds);

    const { data: qTexts } = await supabase
      .from('quiz_questions')
      .select('id, question, options, explanation')
      .in('id', submittedIds);

    review = (qTexts || []).map((q) => {
      const k = (fullKeys || []).find((k) => k.question_id === q.id);
      return {
        id:            q.id,
        question:      q.question,
        options:       q.options,
        correct_index: k?.correct_index ?? null,
        explanation:   k?.explanation || q.explanation || null,
        user_answer:   answers[q.id] ?? null,
        was_correct:   answers[q.id] === k?.correct_index,
      };
    });
  }

  return NextResponse.json({
    score,
    correct,
    total,
    passed,
    grade,
    pass_score:      quiz.pass_score ?? 60,
    attempt_number:  newAttemptCount,
    max_attempts:    maxAttempts,
    attempts_left:   Math.max(0, maxAttempts - newAttemptCount),
    review,
  });
}
