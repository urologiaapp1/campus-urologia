import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getSessionProfile } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

async function getCohorts() {
  const admin = createAdminClient();
  const { data } = await admin
    .from('cohorts')
    .select('id, name, starts_at, ends_at, max_seats, programs(title, slug)')
    .order('starts_at', { ascending: false });
  return data || [];
}

async function getPrograms() {
  const admin = createAdminClient();
  const { data } = await admin.from('programs').select('id, title').order('title');
  return data || [];
}

async function getEnrollmentCounts() {
  const admin = createAdminClient();
  const { data } = await admin
    .from('enrollments')
    .select('cohort_id')
    .not('cohort_id', 'is', null);
  const counts = {};
  (data || []).forEach(({ cohort_id }) => {
    counts[cohort_id] = (counts[cohort_id] || 0) + 1;
  });
  return counts;
}

export default async function CohortesPage() {
  const { profile } = await getSessionProfile();
  if (!profile || !['admin', 'editor'].includes(profile.role)) redirect('/dashboard');

  const [cohorts, programs, enrollmentCounts] = await Promise.all([
    getCohorts(), getPrograms(), getEnrollmentCounts()
  ]);

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Cohortes</h1>
          <p className="mt-1 text-sm text-slate-500">
            Organiza las matrículas en grupos con fechas de inicio y fin.
          </p>
        </div>
        <Link href="/admin/cohortes/nueva" className="btn-primary">+ Nueva cohorte</Link>
      </div>

      {cohorts.length === 0 ? (
        <div className="card mt-6 py-12 text-center text-slate-400">
          No hay cohortes. Crea la primera para organizar tus programas por período.
        </div>
      ) : (
        <div className="card mt-6 divide-y divide-slate-100">
          {cohorts.map((c) => {
            const now = new Date();
            const start = new Date(c.starts_at);
            const end = c.ends_at ? new Date(c.ends_at) : null;
            const isActive = now >= start && (!end || now <= end);
            const isPast = end && now > end;
            const count = enrollmentCounts[c.id] || 0;
            return (
              <div key={c.id} className="flex flex-wrap items-center justify-between gap-2 px-5 py-4">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-slate-800">{c.name}</p>
                    {isActive && <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">Activa</span>}
                    {isPast && <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">Finalizada</span>}
                    {!isActive && !isPast && <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">Próxima</span>}
                  </div>
                  <p className="mt-0.5 text-xs text-slate-400">
                    {c.programs?.title} ·{' '}
                    Inicia {new Date(c.starts_at).toLocaleDateString('es-CL')}
                    {c.ends_at && ` · Cierra ${new Date(c.ends_at).toLocaleDateString('es-CL')}`}
                  </p>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-slate-600">
                    <b>{count}</b>{c.max_seats ? `/${c.max_seats}` : ''} matriculados
                  </span>
                  <Link href={`/admin/cohortes/${c.id}`} className="btn-secondary text-xs">
                    Gestionar
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
