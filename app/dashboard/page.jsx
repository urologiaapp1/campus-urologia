import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSessionProfile } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

const KIND_LABEL = { diplomado: 'Diplomado', magister: 'Magíster', curso: 'Curso' };

export default async function Dashboard() {
  const { user, profile, supabase } = await getSessionProfile();
  if (!user) redirect('/login');

  const { data: enrollments } = await supabase
    .from('enrollments')
    .select('program_id, cohort_id, programs(id, slug, title, description, kind), cohorts(name, starts_at, ends_at)')
    .eq('user_id', user.id);

  const programs = (enrollments || []).map((e) => e.programs).filter(Boolean);

  // Progreso por programa
  const progress = {};
  for (const p of programs) {
    const { data: modules } = await supabase.from('modules').select('id').eq('program_id', p.id);
    const moduleIds = (modules || []).map((m) => m.id);
    let total = 0, done = 0;
    if (moduleIds.length) {
      const { data: lessons } = await supabase.from('lessons').select('id').in('module_id', moduleIds);
      const lessonIds = (lessons || []).map((l) => l.id);
      total = lessonIds.length;
      if (lessonIds.length) {
        const { count } = await supabase
          .from('lesson_progress')
          .select('lesson_id', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .in('lesson_id', lessonIds);
        done = count || 0;
      }
    }
    progress[p.id] = total ? Math.round((done / total) * 100) : 0;
  }

  // Cohortes activas del usuario
  const cohorts = (enrollments || [])
    .filter((e) => e.cohorts)
    .map((e) => ({ ...e.cohorts, program: e.programs?.title }));

  // Insignias obtenidas
  const { data: userBadges } = await supabase
    .from('user_badges')
    .select('awarded_at, badges(slug, name, icon, description)')
    .eq('user_id', user.id)
    .order('awarded_at', { ascending: false });

  const badges = (userBadges || []).map((ub) => ({ ...ub.badges, awarded_at: ub.awarded_at }));

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">
        Hola, {profile?.full_name || user.email}
      </h1>
      <p className="mt-1 text-sm text-slate-500">Tus programas matriculados</p>

      {/* Programas */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {programs.map((p) => {
          const enrollment = (enrollments || []).find((e) => e.program_id === p.id);
          const cohort = enrollment?.cohorts;
          return (
            <Link key={p.id} href={`/programa/${p.slug}`} className="card p-5 transition hover:shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wide text-brand-600">
                  {KIND_LABEL[p.kind] || p.kind}
                </span>
                {cohort && (
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
                    {cohort.name}
                  </span>
                )}
              </div>
              <h2 className="mt-1 font-bold text-slate-900">{p.title}</h2>
              {cohort?.ends_at && (
                <p className="mt-0.5 text-xs text-slate-400">
                  Cierra {new Date(cohort.ends_at).toLocaleDateString('es-CL')}
                </p>
              )}
              <div className="mt-4">
                <div className="h-2 w-full rounded-full bg-slate-100">
                  <div
                    className="h-2 rounded-full bg-brand-500 transition-all"
                    style={{ width: `${progress[p.id]}%` }}
                  />
                </div>
                <p className="mt-1 text-xs text-slate-500">{progress[p.id]}% completado</p>
              </div>
            </Link>
          );
        })}
        {programs.length === 0 && (
          <p className="col-span-2 text-sm text-slate-500">
            Aún no estás matriculado en ningún programa. Contacta a la coordinación.
          </p>
        )}
      </div>

      {/* Insignias */}
      {badges.length > 0 && (
        <div className="mt-10">
          <h2 className="text-lg font-bold text-slate-900">
            Tus insignias <span className="ml-1 text-sm font-normal text-slate-400">({badges.length})</span>
          </h2>
          <div className="mt-3 flex flex-wrap gap-3">
            {badges.map((b) => (
              <div key={b.slug}
                className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2"
                title={`${b.description || b.name} — ${new Date(b.awarded_at).toLocaleDateString('es-CL')}`}
              >
                <span className="text-xl">{b.icon}</span>
                <div>
                  <p className="text-xs font-semibold text-amber-800">{b.name}</p>
                  <p className="text-xs text-amber-600">{new Date(b.awarded_at).toLocaleDateString('es-CL')}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
