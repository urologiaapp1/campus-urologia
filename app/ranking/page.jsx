import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getSessionProfile } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function RankingPage({ searchParams }) {
  const { user, profile, supabase } = await getSessionProfile();
  if (!user) redirect('/login');
  if (profile?.role !== 'admin') redirect('/dashboard');

  const { data: enrollments } = await supabase
    .from('enrollments')
    .select('program_id, programs(id, slug, title)')
    .eq('user_id', user.id);

  const programs = (enrollments || []).map((e) => e.programs).filter(Boolean);
  const selectedId = searchParams?.program || programs[0]?.id;
  const selectedProgram = programs.find((p) => p.id === selectedId) || programs[0];

  if (!selectedProgram) {
    return (
      <div>
        <h1 className="text-2xl font-black tracking-tight text-[var(--text-1)]">Ranking</h1>
        <p className="mt-4 text-sm text-[var(--text-3)]">Debes estar matriculado en un programa para ver el ranking.</p>
      </div>
    );
  }

  const { data: enrolled } = await supabase
    .from('enrollments')
    .select('user_id, profiles(id, full_name, specialty)')
    .eq('program_id', selectedProgram.id);

  const enrolledUsers = (enrolled || []).map((e) => ({ ...e.profiles, user_id: e.user_id })).filter(Boolean);

  const { data: modules } = await supabase
    .from('modules').select('id').eq('program_id', selectedProgram.id);
  const moduleIds = (modules || []).map((m) => m.id);

  const { data: lessons } = moduleIds.length
    ? await supabase.from('lessons').select('id').in('module_id', moduleIds)
    : { data: [] };
  const lessonIds = (lessons || []).map((l) => l.id);

  const userIds = enrolledUsers.map((u) => u.user_id);

  const [progressData, quizData, topicsData, badgesData] = await Promise.all([
    lessonIds.length
      ? supabase.from('lesson_progress').select('user_id, lesson_id').in('user_id', userIds).in('lesson_id', lessonIds)
      : { data: [] },
    supabase.from('quiz_attempts').select('user_id, score, quiz_id').in('user_id', userIds).eq('passed', true),
    supabase.from('topics').select('author_id').in('author_id', userIds),
    supabase.from('user_badges').select('user_id').in('user_id', userIds),
  ]);

  const scores = enrolledUsers.map((u) => {
    const uid = u.user_id;
    const lessonsDone = (progressData.data || []).filter((p) => p.user_id === uid).length;
    const lessonPct = lessonIds.length ? (lessonsDone / lessonIds.length) * 100 : 0;
    const passedQuizzes = new Set((quizData.data || []).filter((q) => q.user_id === uid).map((q) => q.quiz_id));
    const topicsCount = (topicsData.data || []).filter((t) => t.author_id === uid).length;
    const badgesCount = (badgesData.data || []).filter((b) => b.user_id === uid).length;
    const score = Math.round(lessonPct * 2 + passedQuizzes.size * 30 + topicsCount * 5 + badgesCount * 10);
    return { ...u, lessonPct: Math.round(lessonPct), quizzesApproved: passedQuizzes.size, topicsCount, badgesCount, score };
  }).sort((a, b) => b.score - a.score);

  const myPos = scores.findIndex((s) => s.user_id === user.id);

  return (
    <div>
      <h1 className="text-2xl font-black tracking-tight text-[var(--text-1)]">Ranking</h1>
      <p className="mt-1 text-sm text-[var(--text-2)]">
        Clasificación de participantes basada en progreso, quizzes aprobados, tópicos y logros.
      </p>

      {/* Selector de programa */}
      {programs.length > 1 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {programs.map((p) => (
            <Link key={p.id} href={`/ranking?program=${p.id}`}
              className={`rounded-full px-3 py-1 text-sm font-medium transition ${
                p.id === selectedProgram.id
                  ? 'bg-brand-600 text-white'
                  : 'bg-[var(--surface-2)] text-[var(--text-2)] hover:bg-brand-100 hover:text-brand-700'
              }`}>
              {p.title}
            </Link>
          ))}
        </div>
      )}

      {myPos >= 0 && (
        <div className="card mt-6 flex items-center gap-4 border-brand-200 bg-brand-50 p-4 dark:border-brand-900/40 dark:bg-brand-900/20">
          <span className="text-3xl font-black text-brand-600 dark:text-brand-400">#{myPos + 1}</span>
          <div>
            <p className="font-semibold text-brand-800 dark:text-brand-300">Tu posición en {selectedProgram.title}</p>
            <p className="text-xs text-[var(--text-3)]">
              {scores[myPos]?.score} pts · {scores[myPos]?.lessonPct}% lecciones ·{' '}
              {scores[myPos]?.quizzesApproved} quizzes · {scores[myPos]?.topicsCount} tópicos ·{' '}
              {scores[myPos]?.badgesCount} insignias
            </p>
          </div>
        </div>
      )}

      <div className="card mt-4 divide-y divide-[var(--border)]">
        {scores.map((s, i) => {
          const isMe = s.user_id === user.id;
          const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : null;
          return (
            <Link key={s.user_id} href={`/usuario/${s.user_id}`}
              className={`flex items-center gap-4 px-5 py-3 transition-colors hover:bg-[var(--surface-2)] ${
                isMe ? 'bg-brand-50 dark:bg-brand-900/20' : ''
              }`}>
              <span className={`w-8 text-center font-bold ${i < 3 ? 'text-2xl' : 'text-sm text-[var(--text-3)]'}`}>
                {medal || `${i + 1}`}
              </span>
              <div className="flex-1">
                <p className={`text-sm font-semibold ${isMe ? 'text-brand-700 dark:text-brand-300' : 'text-[var(--text-1)]'}`}>
                  {s.full_name || 'Participante'}
                  {isMe && <span className="ml-2 text-xs font-normal text-brand-400">(tú)</span>}
                </p>
                {s.specialty && <p className="text-xs text-[var(--text-3)]">{s.specialty}</p>}
              </div>
              <div className="text-right text-sm">
                <p className="font-bold text-[var(--text-1)]">{s.score} pts</p>
                <p className="text-xs text-[var(--text-3)]">
                  {s.lessonPct}% · {s.quizzesApproved}✅ · {s.badgesCount}🏅
                </p>
              </div>
            </Link>
          );
        })}
      </div>

      <p className="mt-4 text-center text-xs text-[var(--text-3)]">
        Puntaje = progreso×2 + quizzes aprobados×30 + tópicos×5 + insignias×10
      </p>
    </div>
  );
}
