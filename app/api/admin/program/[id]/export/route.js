import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request, { params }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Solo admins' }, { status: 403 });

  const { id } = await params;

  const { data: program, error } = await supabase
    .from('programs')
    .select('title, slug, description, kind, is_free')
    .eq('id', id)
    .single();
  if (error || !program) return NextResponse.json({ error: 'Programa no encontrado' }, { status: 404 });

  const { data: modules } = await supabase
    .from('modules')
    .select('id, title, position')
    .eq('program_id', id)
    .order('position');

  const modulesWithContent = await Promise.all((modules || []).map(async (mod) => {
    const { data: lessons } = await supabase
      .from('lessons')
      .select('id, title, kind, drive_file_id, body, duration_min, position')
      .eq('module_id', mod.id)
      .order('position');

    const lessonsWithQuizzes = await Promise.all((lessons || []).map(async (lesson) => {
      const { data: quiz } = await supabase
        .from('quizzes')
        .select('id, title, pass_score')
        .eq('lesson_id', lesson.id)
        .maybeSingle();

      let quizData = null;
      if (quiz) {
        const { data: questions } = await supabase
          .from('quiz_questions')
          .select('id, question, options, position')
          .eq('quiz_id', quiz.id)
          .order('position');

        const qIds = (questions || []).map((q) => q.id);
        const { data: keys } = qIds.length
          ? await supabase.from('quiz_answer_keys').select('question_id, correct_index').in('question_id', qIds)
          : { data: [] };
        const keyMap = Object.fromEntries((keys || []).map((k) => [k.question_id, k.correct_index]));

        quizData = {
          title: quiz.title,
          pass_score: quiz.pass_score,
          questions: (questions || []).map((q) => ({
            question: q.question,
            options: q.options,
            correct_index: keyMap[q.id] ?? 0,
            position: q.position,
          })),
        };
      }

      const { id: _lid, ...lessonFields } = lesson;
      return { ...lessonFields, quiz: quizData };
    }));

    const { id: _mid, ...modFields } = mod;
    return { ...modFields, lessons: lessonsWithQuizzes };
  }));

  const exportData = {
    version: '1',
    format: 'cuch-program',
    exported_at: new Date().toISOString(),
    program: { ...program, modules: modulesWithContent },
  };

  const filename = `${program.slug}-${new Date().toISOString().slice(0, 10)}.cuch.json`;

  return new NextResponse(JSON.stringify(exportData, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}
