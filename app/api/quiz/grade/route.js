import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { rateLimit } from '@/lib/ratelimit';

/**
 * Corrige un quiz en el servidor. El alumno nunca recibe las respuestas
 * correctas; solo su nota y cuántas acertó.
 */
export async function POST(request) {
  const { ok, retryAfter } = rateLimit(request, { max: 30, windowMs: 60_000 });
  if (!ok) return NextResponse.json({ error: 'Demasiadas solicitudes. Espera un momento.' }, {
    status: 429, headers: { 'Retry-After': retryAfter }
  });

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

  const { quiz_id, answers } = await request.json();
  if (!quiz_id || typeof answers !== 'object') {
    return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 });
  }

  // El acceso del alumno al quiz se valida con su propia sesión (RLS):
  const { data: quiz } = await supabase
    .from('quizzes')
    .select('id, pass_score, quiz_questions(id)')
    .eq('id', quiz_id)
    .maybeSingle();
  if (!quiz) return NextResponse.json({ error: 'Quiz no disponible' }, { status: 403 });

  const questionIds = (quiz.quiz_questions || []).map((q) => q.id);
  if (questionIds.length === 0) {
    return NextResponse.json({ error: 'Quiz sin preguntas' }, { status: 400 });
  }

  // Corrección con service role (la tabla de respuestas es staff-only):
  const admin = createAdminClient();
  const { data: keys } = await admin
    .from('quiz_answer_keys')
    .select('question_id, correct_index')
    .in('question_id', questionIds);

  const keyMap = Object.fromEntries((keys || []).map((k) => [k.question_id, k.correct_index]));
  const correct = questionIds.filter((id) => answers[id] === keyMap[id]).length;
  const score = Math.round((correct / questionIds.length) * 100);

  await admin.from('quiz_attempts').insert({
    quiz_id,
    user_id: user.id,
    score,
    answers,
  });

  return NextResponse.json({
    score,
    correct,
    total: questionIds.length,
    passed: score >= quiz.pass_score,
    pass_score: quiz.pass_score,
  });
}
