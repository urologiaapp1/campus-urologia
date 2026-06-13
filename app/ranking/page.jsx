import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getSessionProfile } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function RankingPage({ searchParams }) {
  const { user, supabase } = await getSessionProfile();
  if (!user) redirect('/login');

  // Programas matriculados
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
        <h1 className="text-2xl font-bold text-slate-900">Ranking</h1>
        <p className="mt-4 text-sm text-slate-400">Debes estar matriculado en un programa para ver el ranking.</p>
      </div>
    );
  }

  // Todos los matriculados en el programa seleccionado
  const { data: enrolled } = await supabase
    .from('enrollments')
    .select('user_id, profiles(id, full_name, specialty)')
    .eq('program_id', selectedProgram.id);

  const enrolledUsers = (enrolled || []).map((e) => ({ ...e.profiles, user_id: e.user_id })).filter(Boolean);

  // Módulos y lecciones del programa
  const { data: modules } = await supabase
    .from('modules').select('id').eq('program_id', selectedProgram.id);
  const moduleIds = (modules || []).map((m) => m.id);

  const { data: lessons } = moduleIds.length
    ? await supabase.from('lessons').select('id').in('module_id', moduleIds)
    : { data: [] };
  const lessonIds = (lessons || []).map((l) => l.id);

  // Calcular puntaje compuesto para cada usuario
  const userIds = enrolledUsers.map((u) => u.user_id);

  const [progressData, quizData, topicsData, badgesData] = await Promise.all([
    lessonIds.length
      ? supabase.from('lesson_progress').select('user_id, lesson_id').in('user_id', userIds).in('lesson_id', lessonIds)
      : { data: [] },
    supabase.from('quiz_attempts').select('user_id, score, quiz_id').in('user_id', userIds).eq('passed', true),
    supabase.from('topics').select('author_id').in('author_id', userIds),
    supabase.from('user_badges').select('user_id').in('user_id', userIds),
  ]);

  // Puntaje: lessons*2 + bestQuizAvg*3 + topics*5 + badges*10
  const scores = enrolledUsers.map((u) => {
    const uid = u.user_id;
    const lessonsDone = (progressData.data || []).filter((p) => p.user_id === uid).length;
    const lessonPct = lessonIds.length ? (lessonsDone / lessonIds.length) * 100 : 0;

    // Mejor intento por quiz único aprobado
    const passedQuizzes = new Set((quizData.data || []).filter((q) => q.user_id === uid).map((q) => q.quiz_id));

    const topicsCount = (topicsData.data || []).filter((t) => t.author_id === uid).length;
    const badgesCount = (badgesData.data || []).filter((b) => b.user_id === uid).length;

    const score = Math.round(
      lessonPct * 2 +
      passedQuizzes.size * 30 +
      topicsCount * 5 +
      badgesCount * 10
    );

    return {
      ...u,
      lessonPct: Math.round(lessonPct),
      quizzesApproved: passedQuizzes.size,
      topicsCount,
      badgesCount,
      score,
    };
  }).sort((a, b) => b.score - a.score);

  const myPos = scores.findIndex((s) => s.user_id === user.id);

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Ranking</h1>
      <p className="mt-1 text-sm text-slate-500">
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
                  : 'bg-slate-100 text-slate-600 hover:bg-brand-100'
              }`}>
              {p.title}
            </Link>
          ))}
        </div>
      )}

      {myPos >= 0 && (
        <div className="card mt-6 flex items-center gap-4 border-brand-200 bg-brand-50 p-4">
          <span className="text-3xl font-black text-brand-600">#{myPos + 1}</span>
          <div>
            <p className="font-semibold text-brand-800">Tu posición en {selectedProgram.title}</p>
            <p className="text-xs text-slate-500">
              {scores[myPos]?.score} pts · {scores[myPos]?.lessonPct}% lecciones ·{' '}
              {scores[myPos]?.quizzesApproved} quizzes · {scores[myPos]?.topicsCount} tópicos ·{' '}
              {scores[myPos]?.badgesCount} insignias
            </p>
          </div>
        </div>
      )}

      <div className="card mt-4 divide-y divide-slate-100">
        {scores.map((s, i) => {
          const isMe = s.user_id === user.id;
          const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : null;
          return (
            <Link key={s.user_id} href={`/usuario/${s.user_id}`}
              className={`flex items-center gap-4 px-5 py-3 hover:bg-slate-50 ${isMe ? 'bg-brand-50' : ''}`}>
              <span className={`w-8 text-center font-bold ${i < 3 ? 'text-2xl' : 'text-sm text-slate-400'}`}>
                {medal || `${i + 1}`}
              </span>
              <div className="flex-1">
                <p className={`text-sm font-semibold ${isMe ? 'text-brand-700' : 'text-slate-800'}`}>
                  {s.full_name || 'Participante'}
                  {isMe && <span className="ml-2 text-xs font-normal text-brand-400">(tú)</span>}
                </p>
                {s.specialty && <p className="text-xs text-slate-400">{s.specialty}</p>}
              </div>
              <div className="text-right text-sm">
                <p className="font-bold text-slate-700">{s.score} pts</p>
                <p className="text-xs text-slate-400">
                  {s.lessonPct}% · {s.quizzesApproved}✅ · {s.badgesCount}🏅
                </p>
              </div>
            </Link>
          );
        })}
      </div>

      <p className="mt-4 text-center text-xs text-slate-400">
        Puntaje = progreso×2 + quizzes aprobados×30 + tópicos×5 + insignias×10
      </p>
    </div>
  );
}
