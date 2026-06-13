import Link from 'next/link';
import { redirect, notFound } from 'next/navigation';
import nextDynamic from 'next/dynamic';
import { getSessionProfile } from '@/lib/supabase/server';
import DriveViewer from '@/components/DriveViewer';
import MarkComplete from '@/components/MarkComplete';
import QuizRunner from '@/components/QuizRunner';
import RichTextViewer from '@/components/RichTextViewer';

const TutorChat = nextDynamic(() => import('@/components/TutorChat'), { ssr: false });

export const dynamic = 'force-dynamic';

export default async function LessonPage({ params }) {
  const { user, supabase } = await getSessionProfile();
  if (!user) redirect('/login');

  const { data: lesson } = await supabase
    .from('lessons')
    .select('id, title, kind, drive_file_id, body, duration_min, modules(id, title, program_id, programs(slug, title))')
    .eq('id', params.id)
    .single();
  if (!lesson) notFound(); // RLS protege: solo matriculados o staff

  const program = lesson.modules?.programs;

  const { data: progressRow } = await supabase
    .from('lesson_progress')
    .select('lesson_id')
    .eq('user_id', user.id)
    .eq('lesson_id', lesson.id)
    .maybeSingle();

  const { data: quiz } = await supabase
    .from('quizzes')
    .select('id, title, pass_score, quiz_questions(id, question, options, position)')
    .eq('lesson_id', lesson.id)
    .maybeSingle();

  let lastAttempt = null;
  if (quiz) {
    const { data: attempts } = await supabase
      .from('quiz_attempts')
      .select('score, created_at')
      .eq('quiz_id', quiz.id)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1);
    lastAttempt = attempts?.[0] || null;
  }

  return (
    <div className="select-none">
      {program && (
        <Link href={`/programa/${program.slug}`} className="text-sm text-brand-600 hover:underline">
          ← {program.title}
        </Link>
      )}
      <h1 className="mt-2 text-2xl font-bold text-slate-900">{lesson.title}</h1>
      <p className="mt-1 text-xs text-slate-400">
        {lesson.modules?.title}
        {lesson.duration_min ? ` · ${lesson.duration_min} min` : ''}
      </p>

      <div className="mt-6">
        {lesson.kind === 'texto' ? (
          <div className="card p-6">
            {lesson.body
              ? <RichTextViewer html={lesson.body} />
              : <p className="text-sm text-slate-400">Sin contenido.</p>}
          </div>
        ) : (
          <DriveViewer fileId={lesson.drive_file_id} kind={lesson.kind} title={lesson.title} />
        )}
      </div>

      <div className="mt-6 flex items-center gap-4">
        <MarkComplete lessonId={lesson.id} initialDone={!!progressRow} />
      </div>

      {quiz && (
        <div className="mt-10">
          <h2 className="text-lg font-bold text-slate-900">{quiz.title}</h2>
          {lastAttempt && (
            <p className="mt-1 text-sm text-slate-500">
              Último intento: <b>{lastAttempt.score}%</b>{' '}
              {lastAttempt.score >= quiz.pass_score ? '— aprobado ✓' : '— no aprobado'}
            </p>
          )}
          <div className="mt-4">
            <QuizRunner quiz={quiz} />
          </div>
        </div>
      )}

      {/* Tutor IA flotante */}
      <TutorChat lessonId={lesson.id} lessonTitle={lesson.title} />
    </div>
  );
}
