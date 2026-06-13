import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getSessionProfile } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export default async function EstadisticasPage({ params }) {
  const { profile } = await getSessionProfile();
  if (!profile || !['admin', 'editor'].includes(profile.role)) redirect('/dashboard');

  const admin = createAdminClient();

  const { data: program } = await admin
    .from('programs')
    .select('id, title, kind')
    .eq('id', params.id)
    .single();

  if (!program) redirect('/admin');

  // Datos base
  const { data: modules } = await admin
    .from('modules')
    .select('id, title, position, lessons(id, quizzes(id))')
    .eq('program_id', params.id)
    .order('position');

  const { data: enrollments } = await admin
    .from('enrollments')
    .select('user_id, created_at')
    .eq('program_id', params.id);

  const userIds = (enrollments || []).map((e) => e.user_id);
  const allLessonIds = (modules || []).flatMap((m) => (m.lessons || []).map((l) => l.id));
  const allQuizIds = (modules || []).flatMap((m) =>
    (m.lessons || []).flatMap((l) => (l.quizzes || []).map((q) => q.id))
  );
  const moduleIds = (modules || []).map((m) => m.id);

  // Progreso por módulo
  const moduleProgress = [];
  for (const m of modules || []) {
    const modLessonIds = (m.lessons || []).map((l) => l.id);
    if (!modLessonIds.length || !userIds.length) {
      moduleProgress.push({ ...m, pct: 0, completed: 0, total: 0 });
      continue;
    }
    const { count: total } = await admin
      .from('lesson_progress')
      .select('id', { count: 'exact', head: true })
      .in('user_id', userIds)
      .in('lesson_id', modLessonIds);
    const maxPossible = modLessonIds.length * userIds.length;
    moduleProgress.push({
      ...m,
      completed: total || 0,
      total: maxPossible,
      pct: maxPossible ? Math.round(((total || 0) / maxPossible) * 100) : 0,
    });
  }

  // Distribución de notas de quizzes
  let quizScoreRanges = [0, 0, 0, 0, 0]; // <50, 50-59, 60-69, 70-84, 85-100
  if (allQuizIds.length && userIds.length) {
    const { data: attempts } = await admin
      .from('quiz_attempts')
      .select('score')
      .in('quiz_id', allQuizIds)
      .in('user_id', userIds);
    (attempts || []).forEach(({ score }) => {
      if (score < 50) quizScoreRanges[0]++;
      else if (score < 60) quizScoreRanges[1]++;
      else if (score < 70) quizScoreRanges[2]++;
      else if (score < 85) quizScoreRanges[3]++;
      else quizScoreRanges[4]++;
    });
  }

  // Actividad de comunidad
  const { count: topicCount } = await admin
    .from('topics')
    .select('id', { count: 'exact', head: true })
    .in('module_id', moduleIds);

  const { count: commentCount } = await admin
    .from('topic_comments')
    .select('id', { count: 'exact', head: true });

  // NPS del programa
  const { data: npsRow } = await admin
    .from('program_nps')
    .select('*')
    .eq('program_id', params.id)
    .maybeSingle();

  // Matrículas por semana (últimas 8 semanas)
  const weekBuckets = {};
  const now = new Date();
  for (let i = 7; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i * 7);
    const key = d.toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit' });
    weekBuckets[key] = 0;
  }
  (enrollments || []).forEach(({ created_at }) => {
    const d = new Date(created_at);
    const weeksAgo = Math.floor((now - d) / (7 * 24 * 3600 * 1000));
    if (weeksAgo < 8) {
      const refDate = new Date(now);
      refDate.setDate(refDate.getDate() - weeksAgo * 7);
      const key = refDate.toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit' });
      if (weekBuckets[key] !== undefined) weekBuckets[key]++;
    }
  });

  const totalEnrolled = userIds.length;
  const avgProgress = moduleProgress.length
    ? Math.round(moduleProgress.reduce((s, m) => s + m.pct, 0) / moduleProgress.length)
    : 0;

  const scoreLabels = ['<50%', '50–59%', '60–69%', '70–84%', '85–100%'];
  const scoreColors = ['bg-red-400', 'bg-orange-400', 'bg-amber-400', 'bg-green-400', 'bg-emerald-500'];
  const maxScoreRange = Math.max(...quizScoreRanges, 1);

  return (
    <div>
      <Link href="/admin" className="text-sm text-brand-600 hover:underline">← Programas</Link>
      <h1 className="mt-2 text-2xl font-bold text-slate-900">Estadísticas</h1>
      <p className="mt-1 text-sm text-slate-500">{program.title}</p>

      {/* KPIs */}
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: 'Matriculados', value: totalEnrolled, icon: '👥' },
          { label: 'Progreso promedio', value: `${avgProgress}%`, icon: '📈' },
          { label: 'Tópicos creados', value: topicCount || 0, icon: '💬' },
          { label: 'Comentarios', value: commentCount || 0, icon: '🗨️' },
        ].map((kpi) => (
          <div key={kpi.label} className="card p-4 text-center">
            <p className="text-2xl">{kpi.icon}</p>
            <p className="mt-1 text-2xl font-black text-brand-700">{kpi.value}</p>
            <p className="text-xs text-slate-500">{kpi.label}</p>
          </div>
        ))}
      </div>

      {/* Progreso por módulo */}
      <div className="card mt-6 p-5">
        <h2 className="mb-4 font-bold text-slate-800">Progreso por módulo (% de lecciones completadas)</h2>
        <div className="space-y-3">
          {moduleProgress.map((m, i) => (
            <div key={m.id}>
              <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
                <span className="truncate max-w-xs">Tema {i + 1}: {m.title}</span>
                <span className="font-semibold">{m.pct}%</span>
              </div>
              <div className="h-3 w-full rounded-full bg-slate-100">
                <div
                  className="h-3 rounded-full bg-brand-500 transition-all"
                  style={{ width: `${m.pct}%` }}
                />
              </div>
            </div>
          ))}
          {moduleProgress.length === 0 && (
            <p className="text-sm text-slate-400">Sin módulos creados.</p>
          )}
        </div>
      </div>

      {/* Distribución de notas */}
      {allQuizIds.length > 0 && (
        <div className="card mt-4 p-5">
          <h2 className="mb-4 font-bold text-slate-800">Distribución de notas en quizzes</h2>
          <div className="space-y-2">
            {scoreLabels.map((label, i) => (
              <div key={label} className="flex items-center gap-3">
                <span className="w-16 text-right text-xs text-slate-500">{label}</span>
                <div className="flex-1 rounded-full bg-slate-100 h-5">
                  <div
                    className={`h-5 rounded-full ${scoreColors[i]} transition-all`}
                    style={{ width: `${(quizScoreRanges[i] / maxScoreRange) * 100}%` }}
                  />
                </div>
                <span className="w-8 text-xs font-semibold text-slate-600">{quizScoreRanges[i]}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Matrículas por semana */}
      <div className="card mt-4 p-5">
        <h2 className="mb-4 font-bold text-slate-800">Matrículas (últimas 8 semanas)</h2>
        <div className="flex items-end gap-2 h-24">
          {Object.entries(weekBuckets).map(([week, count]) => {
            const maxCount = Math.max(...Object.values(weekBuckets), 1);
            return (
              <div key={week} className="flex flex-1 flex-col items-center gap-1">
                <div
                  className="w-full rounded-t bg-brand-400 transition-all"
                  style={{ height: `${(count / maxCount) * 80}px`, minHeight: count > 0 ? '4px' : '0' }}
                />
                <span className="text-xs text-slate-400 rotate-45 origin-left">{week}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* NPS */}
      {npsRow && (
        <div className="card mt-4 p-5">
          <h2 className="mb-1 font-bold text-slate-800">Net Promoter Score (NPS)</h2>
          <p className="mb-4 text-xs text-slate-400">
            {npsRow.total_responses} respuesta{npsRow.total_responses !== 1 ? 's' : ''} ·{' '}
            Promotores (9-10): {npsRow.promoters} · Pasivos (7-8): {npsRow.passives} · Detractores (0-6): {npsRow.detractors}
          </p>
          <div className="flex items-center gap-4">
            <div
              className={`text-4xl font-black ${
                npsRow.nps >= 50 ? 'text-emerald-600' : npsRow.nps >= 0 ? 'text-amber-500' : 'text-red-500'
              }`}
            >
              {npsRow.nps > 0 ? '+' : ''}{npsRow.nps}
            </div>
            <div className="flex-1">
              <div className="relative h-4 w-full rounded-full bg-slate-100 overflow-hidden">
                {/* Bar -100 to +100 mapped to 0-100% */}
                <div
                  className={`absolute top-0 h-4 rounded-full ${
                    npsRow.nps >= 50 ? 'bg-emerald-500' : npsRow.nps >= 0 ? 'bg-amber-400' : 'bg-red-400'
                  }`}
                  style={{ width: `${((npsRow.nps + 100) / 200) * 100}%` }}
                />
                {/* Center line (0) */}
                <div className="absolute top-0 left-1/2 h-4 w-px bg-slate-300" />
              </div>
              <div className="mt-0.5 flex justify-between text-xs text-slate-400">
                <span>-100</span><span>0</span><span>+100</span>
              </div>
            </div>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            {npsRow.nps >= 70 ? '🌟 Excelente' : npsRow.nps >= 50 ? '✅ Muy bueno' : npsRow.nps >= 0 ? '⚠️ Mejorable' : '🔴 Crítico'}
          </p>
        </div>
      )}
    </div>
  );
}
