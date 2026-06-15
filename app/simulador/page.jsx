import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSessionProfile } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

const BADGE = {
  básico:     'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  intermedio: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  avanzado:   'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

export default async function SimuladorPage() {
  const { user, profile, supabase } = await getSessionProfile();
  if (!user) redirect('/login');

  const isStaff = ['admin', 'editor'].includes(profile?.role);

  // Intentar con is_global; si falla (columna no existe), caer a query simple
  let cases = null;
  let hasGlobalCol = true;

  const { data: casesWithGlobal, error: errFull } = await supabase
    .from('clinical_cases')
    .select('id, title, specialty, difficulty, learning_objectives, program_id, is_global, programs(title)')
    .order('created_at', { ascending: false });

  if (errFull) {
    hasGlobalCol = false;
    const { data: casesSimple } = await supabase
      .from('clinical_cases')
      .select('id, title, specialty, difficulty, learning_objectives, program_id, programs(title)')
      .order('created_at', { ascending: false });
    cases = casesSimple;
  } else {
    cases = casesWithGlobal;
  }

  const allCases = cases || [];

  // Agrupar: globales primero, luego por programa
  const global_cases  = hasGlobalCol ? allCases.filter((c) => c.is_global)  : [];
  const program_cases = hasGlobalCol ? allCases.filter((c) => !c.is_global) : allCases;

  const byProgram = program_cases.reduce((acc, c) => {
    const key = c.program_id || 'sin-programa';
    if (!acc[key]) acc[key] = { title: c.programs?.title || 'Sin programa', cases: [] };
    acc[key].cases.push(c);
    return acc;
  }, {});

  const totalCases = allCases.length;

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-[var(--text-1)]">Simulador de paciente</h1>
          <p className="mt-1 text-sm text-[var(--text-2)]">
            Practica tu anamnesis con pacientes virtuales generados por IA.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/perfil/ia" className="btn-secondary text-sm">Mi API key</Link>
          {isStaff && (
            <Link href="/admin/casos" className="btn-primary text-sm">+ Gestionar casos</Link>
          )}
        </div>
      </div>

      {totalCases === 0 ? (
        <div className="card mt-10 p-10 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--surface-2)] text-2xl">🩺</div>
          <p className="mt-4 font-medium text-[var(--text-2)]">Sin casos disponibles para tus programas.</p>
          <p className="mt-1 text-xs text-[var(--text-3)]">El equipo docente publicará casos clínicos próximamente.</p>
        </div>
      ) : (
        <div className="mt-8 space-y-8">
          {global_cases.length > 0 && (
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.15em] text-[var(--text-3)]">
                Disponibles para todos los alumnos
              </p>
              <div className="space-y-2">
                {global_cases.map((c) => <CaseRow key={c.id} c={c} />)}
              </div>
            </div>
          )}

          {Object.entries(byProgram).map(([key, { title, cases: pCases }]) => (
            <div key={key}>
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.15em] text-[var(--text-3)]">{title}</p>
              <div className="space-y-2">
                {pCases.map((c) => <CaseRow key={c.id} c={c} />)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CaseRow({ c }) {
  return (
    <Link href={`/simulador/${c.id}`}
      className="card flex items-center gap-4 p-4 transition-all hover:border-brand-300 hover:shadow-elev-2">
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold text-[var(--text-1)]">{c.title}</span>
          {c.difficulty && (
            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${BADGE[c.difficulty] || 'bg-[var(--surface-2)] text-[var(--text-2)]'}`}>
              {c.difficulty}
            </span>
          )}
          {c.is_global && (
            <span className="badge badge-brand text-[10px]">Global</span>
          )}
          <span className="text-xs text-[var(--text-3)]">{c.specialty}</span>
        </div>
        {c.learning_objectives && (
          <p className="mt-1 line-clamp-2 text-xs text-[var(--text-3)]">{c.learning_objectives}</p>
        )}
      </div>
      <span className="shrink-0 text-[var(--text-3)]">→</span>
    </Link>
  );
}
