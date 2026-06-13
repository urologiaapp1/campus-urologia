import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSessionProfile } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

const BADGE = {
  básico: 'bg-green-100 text-green-700',
  intermedio: 'bg-yellow-100 text-yellow-700',
  avanzado: 'bg-red-100 text-red-700',
};

export default async function SimuladorPage() {
  const { user, supabase } = await getSessionProfile();
  if (!user) redirect('/login');

  // RLS filtra automáticamente según matrícula (o staff ve todos)
  const { data: cases } = await supabase
    .from('clinical_cases')
    .select('id, title, specialty, difficulty, learning_objectives, program_id, programs(title)')
    .order('created_at', { ascending: false });

  const byProgram = (cases || []).reduce((acc, c) => {
    const key = c.program_id;
    if (!acc[key]) acc[key] = { title: c.programs?.title || 'Sin programa', cases: [] };
    acc[key].cases.push(c);
    return acc;
  }, {});

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">🩺 Simulador de paciente</h1>
          <p className="mt-1 text-sm text-slate-500">
            Practica tu anamnesis con pacientes virtuales generados por IA.
          </p>
        </div>
        <Link href="/perfil/ia" className="btn-secondary text-sm">⚙️ Mi API key</Link>
      </div>

      {Object.keys(byProgram).length === 0 ? (
        <div className="card mt-10 p-8 text-center">
          <p className="text-slate-500">Sin casos disponibles para tus programas.</p>
          <p className="mt-1 text-xs text-slate-400">El equipo docente publicará casos clínicos próximamente.</p>
        </div>
      ) : (
        Object.entries(byProgram).map(([programId, { title, cases: programCases }]) => (
          <div key={programId} className="mt-8">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">{title}</p>
            <div className="space-y-3">
              {programCases.map((c) => (
                <Link
                  key={c.id}
                  href={`/simulador/${c.id}`}
                  className="card block p-4 transition-all hover:border-brand-300 hover:shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium text-slate-900">{c.title}</span>
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${BADGE[c.difficulty]}`}>
                          {c.difficulty}
                        </span>
                        <span className="text-xs text-slate-400">{c.specialty}</span>
                      </div>
                      {c.learning_objectives && (
                        <p className="mt-1 line-clamp-2 text-xs text-slate-500">{c.learning_objectives}</p>
                      )}
                    </div>
                    <span className="shrink-0 text-brand-400">→</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
