import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSessionProfile } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

const KIND_LABEL = { diplomado: 'Diplomado', magister: 'Magíster', curso: 'Curso' };

const KIND_STYLE = {
  diplomado: { bar: 'from-brand-500 to-cyan-400',   text: 'text-brand-600 dark:text-brand-400'   },
  magister:  { bar: 'from-purple-500 to-pink-400',  text: 'text-purple-600 dark:text-purple-400' },
  curso:     { bar: 'from-emerald-500 to-teal-400', text: 'text-emerald-600 dark:text-emerald-400' },
};

function ProgressRing({ pct }) {
  const size = 60;
  const stroke = 4;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const dash = Math.min(pct / 100, 1) * circ;
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }} aria-hidden="true">
      <circle
        cx={size / 2} cy={size / 2} r={r}
        strokeWidth={stroke} fill="none"
        className="stroke-[var(--surface-2)]"
      />
      <circle
        cx={size / 2} cy={size / 2} r={r}
        strokeWidth={stroke} fill="none"
        strokeLinecap="round"
        strokeDasharray={`${dash} ${circ}`}
        className="stroke-brand-500"
        style={{ transition: 'stroke-dasharray .6s ease' }}
      />
    </svg>
  );
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Buenos días';
  if (h < 19) return 'Buenas tardes';
  return 'Buenas noches';
}

export default async function Dashboard() {
  const { user, profile, supabase } = await getSessionProfile();
  if (!user) redirect('/login');

  const { data: enrollments } = await supabase
    .from('enrollments')
    .select('program_id, cohort_id, programs(id, slug, title, description, kind), cohorts(name, starts_at, ends_at)')
    .eq('user_id', user.id);

  const programs = (enrollments || []).map((e) => e.programs).filter(Boolean);

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

  const { data: userBadges } = await supabase
    .from('user_badges')
    .select('awarded_at, badges(slug, name, icon, description)')
    .eq('user_id', user.id)
    .order('awarded_at', { ascending: false });

  const badges = (userBadges || []).map((ub) => ({ ...ub.badges, awarded_at: ub.awarded_at }));

  const firstName = profile?.full_name?.split(' ')[0] || 'Doctor';

  return (
    <div className="space-y-12">

      {/* ── Saludo ──────────────────────────────────────────────── */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[var(--text-3)]">
          {greeting()}
        </p>
        <h1 className="mt-1 text-4xl font-black tracking-tight text-[var(--text-1)]">
          {firstName}
        </h1>
        {programs.length > 0 && (
          <p className="mt-2 text-sm text-[var(--text-2)]">
            Tienes{' '}
            <span className="font-semibold text-[var(--text-1)]">{programs.length}</span>{' '}
            {programs.length === 1 ? 'programa matriculado' : 'programas matriculados'}
          </p>
        )}
      </div>

      {/* ── Programas ───────────────────────────────────────────── */}
      <div>
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.15em] text-[var(--text-3)]">
          Mis programas
        </h2>

        {programs.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[var(--border-2)] bg-[var(--surface)] p-14 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--surface-2)] text-2xl">
              📋
            </div>
            <p className="mt-4 font-semibold text-[var(--text-1)]">Sin programas matriculados</p>
            <p className="mt-1 text-sm text-[var(--text-3)]">
              Contacta a la coordinación para inscribirte.
            </p>
            <Link href="/" className="btn-outline mt-5 inline-flex">
              Ver catálogo
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {programs.map((p) => {
              const pct = progress[p.id];
              const style = KIND_STYLE[p.kind] || KIND_STYLE.diplomado;
              const enrollment = (enrollments || []).find((e) => e.program_id === p.id);
              const cohort = enrollment?.cohorts;

              const endsAt = cohort?.ends_at ? new Date(cohort.ends_at) : null;
              const daysLeft = endsAt ? Math.ceil((endsAt - new Date()) / 86400000) : null;
              const isUrgent = daysLeft !== null && daysLeft <= 14 && daysLeft > 0;

              return (
                <Link
                  key={p.id}
                  href={`/programa/${p.slug}`}
                  className="group relative flex flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-elev-1 transition-all duration-200 hover:shadow-elev-2 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                >
                  {/* Borde superior de color */}
                  <div className={`h-[3px] w-full bg-gradient-to-r ${style.bar}`} />

                  <div className="flex flex-1 items-start gap-4 p-6">
                    {/* Texto */}
                    <div className="flex-1 min-w-0">
                      <span className={`text-[11px] font-bold uppercase tracking-wider ${style.text}`}>
                        {KIND_LABEL[p.kind] || p.kind}
                      </span>
                      <h3 className="mt-1 font-bold leading-snug text-[var(--text-1)] line-clamp-2">
                        {p.title}
                      </h3>

                      {cohort && (
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-[var(--surface-2)] px-2.5 py-0.5 text-[11px] font-medium text-[var(--text-2)]">
                            {cohort.name}
                          </span>
                          {isUrgent && (
                            <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-semibold text-amber-700 dark:bg-amber-900/20 dark:text-amber-300">
                              {daysLeft}d restantes
                            </span>
                          )}
                          {endsAt && !isUrgent && (
                            <span className="text-[11px] text-[var(--text-3)]">
                              Hasta {endsAt.toLocaleDateString('es-CL', { day: 'numeric', month: 'short' })}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Anillo de progreso */}
                    <div className="relative shrink-0">
                      <ProgressRing pct={pct} />
                      <span className="absolute inset-0 flex items-center justify-center text-[11px] font-black text-[var(--text-1)]">
                        {pct}%
                      </span>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between border-t border-[var(--border)] px-6 py-3">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--surface-2)]">
                      <div
                        className={`h-1.5 rounded-full bg-gradient-to-r ${style.bar} transition-all`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="ml-4 text-xs font-medium text-[var(--text-3)] transition-colors group-hover:text-[var(--text-1)]">
                      Continuar →
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Insignias ───────────────────────────────────────────── */}
      {badges.length > 0 && (
        <div>
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.15em] text-[var(--text-3)]">
            Insignias obtenidas · {badges.length}
          </h2>
          <div className="flex flex-wrap gap-2">
            {badges.map((b) => (
              <div
                key={b.slug}
                title={`${b.description || b.name} — ${new Date(b.awarded_at).toLocaleDateString('es-CL')}`}
                className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 dark:border-amber-900/40 dark:bg-amber-900/20"
              >
                <span className="text-lg leading-none">{b.icon}</span>
                <div>
                  <p className="text-[11px] font-bold text-amber-800 dark:text-amber-300">{b.name}</p>
                  <p className="text-[10px] text-amber-600 dark:text-amber-500">
                    {new Date(b.awarded_at).toLocaleDateString('es-CL', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
