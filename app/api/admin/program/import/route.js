import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

function slugify(s) {
  return (s || 'programa').toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export async function POST(request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Solo admins' }, { status: 403 });

  let body;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 });
  }

  if (body.format !== 'cuch-program' || !body.program) {
    return NextResponse.json({ error: 'Formato de archivo inválido. Debe ser un archivo .cuch.json exportado desde Campus.' }, { status: 400 });
  }

  return createFromData(supabase, body.program, null);
}

export async function createFromData(supabase, programData, titleOverride) {
  let slug = slugify(titleOverride || programData.title);
  const { data: existing } = await supabase.from('programs').select('slug').eq('slug', slug).maybeSingle();
  if (existing) slug = `${slug}-${Date.now()}`;

  const { data: newProgram, error: pErr } = await supabase
    .from('programs')
    .insert({
      title:       titleOverride || programData.title,
      slug,
      description: programData.description || '',
      kind:        programData.kind || 'diplomado',
      is_free:     programData.is_free || false,
      published:   false,
    })
    .select('id')
    .single();

  if (pErr) return NextResponse.json({ error: pErr.message }, { status: 500 });

  for (const mod of (programData.modules || [])) {
    const { data: newMod, error: mErr } = await supabase
      .from('modules')
      .insert({ program_id: newProgram.id, title: mod.title, position: mod.position ?? 0 })
      .select('id')
      .single();
    if (mErr) continue;

    for (const lesson of (mod.lessons || [])) {
      const { data: newLesson, error: lErr } = await supabase
        .from('lessons')
        .insert({
          module_id:    newMod.id,
          title:        lesson.title,
          kind:         lesson.kind || 'texto',
          drive_file_id: lesson.drive_file_id || null,
          body:          lesson.body || null,
          duration_min:  lesson.duration_min || null,
          position:      lesson.position ?? 0,
        })
        .select('id')
        .single();
      if (lErr || !lesson.quiz) continue;

      const { data: newQuiz, error: qErr } = await supabase
        .from('quizzes')
        .insert({ lesson_id: newLesson.id, title: lesson.quiz.title, pass_score: lesson.quiz.pass_score ?? 60 })
        .select('id')
        .single();
      if (qErr) continue;

      for (const q of (lesson.quiz.questions || [])) {
        const { data: newQ, error: qqErr } = await supabase
          .from('quiz_questions')
          .insert({ quiz_id: newQuiz.id, question: q.question, options: q.options, position: q.position ?? 0 })
          .select('id')
          .single();
        if (qqErr) continue;

        await supabase.from('quiz_answer_keys').insert({
          question_id: newQ.id,
          correct_index: q.correct_index ?? 0,
        });
      }
    }
  }

  return NextResponse.json({ id: newProgram.id, slug, title: titleOverride || programData.title });
}
