/**
 * GET /api/quiz/review?quiz_id=X
 * Devuelve preguntas + respuestas correctas + explicaciones SOLO si el alumno
 * ya agotó sus intentos. Los admins/editores siempre tienen acceso.
 */
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const quiz_id = searchParams.get('quiz_id');
  if (!quiz_id) return NextResponse.json({ error: 'quiz_id requerido' }, { status: 400 });

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single();
  const isStaff = ['admin', 'editor'].includes(profile?.role);

  const { data: quiz } = await supabase
    .from('quizzes').select('id, max_attempts').eq('id', quiz_id).maybeSingle();
  if (!quiz) return NextResponse.json({ error: 'Quiz no encontrado' }, { status: 404 });

  if (!isStaff) {
    const { count } = await supabase
      .from('quiz_attempts')
      .select('id', { count: 'exact', head: true })
      .eq('quiz_id', quiz_id)
      .eq('user_id', user.id);

    if (count < (quiz.max_attempts ?? 2)) {
      return NextResponse.json({ error: 'Aún tienes intentos disponibles.' }, { status: 403 });
    }
  }

  // Obtener preguntas
  const { data: questions } = await supabase
    .from('quiz_questions')
    .select('id, question, options, position, explanation')
    .eq('quiz_id', quiz_id)
    .order('position');

  // Obtener claves (service role)
  const admin = createAdminClient();
  const qIds = (questions || []).map((q) => q.id);
  const { data: keys } = await admin
    .from('quiz_answer_keys')
    .select('question_id, correct_index, explanation')
    .in('question_id', qIds);

  const keyMap = Object.fromEntries((keys || []).map((k) => [k.question_id, k]));

  const review = (questions || []).map((q) => ({
    id:            q.id,
    question:      q.question,
    options:       q.options,
    position:      q.position,
    correct_index: keyMap[q.id]?.correct_index ?? null,
    explanation:   keyMap[q.id]?.explanation || q.explanation || null,
  }));

  return NextResponse.json({ review });
}
