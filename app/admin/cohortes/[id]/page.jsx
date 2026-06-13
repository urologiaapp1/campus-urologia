import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getSessionProfile } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import CohortEnrollForm from './CohortEnrollForm';

export const dynamic = 'force-dynamic';

export default async function CohortDetail({ params }) {
  const { profile } = await getSessionProfile();
  if (!profile || !['admin', 'editor'].includes(profile.role)) redirect('/dashboard');

  const admin = createAdminClient();
  const { data: cohort } = await admin
    .from('cohorts')
    .select('id, name, starts_at, ends_at, max_seats, programs(id, title, slug)')
    .eq('id', params.id)
    .single();

  if (!cohort) redirect('/admin/cohortes');

  // Matriculados en esta cohorte
  const { data: enrolled } = await admin
    .from('enrollments')
    .select('id, user_id, created_at, profiles(full_name)')
    .eq('cohort_id', params.id)
    .order('created_at');

  // Todos los usuarios disponibles para matricular
  const { data: allProfiles } = await admin
    .from('profiles')
    .select('id, full_name, role')
    .eq('role', 'student')
    .order('full_name');

  const enrolledIds = new Set((enrolled || []).map((e) => e.user_id));
  const available = (allProfiles || []).filter((p) => !enrolledIds.has(p.id));

  return (
    <div>
      <Link href="/admin/cohortes" className="text-sm text-brand-600 hover:underline">← Cohortes</Link>
      <h1 className="mt-2 text-2xl font-bold text-slate-900">{cohort.name}</h1>
      <p className="mt-1 text-sm text-slate-500">
        {cohort.programs?.title} ·{' '}
        Inicia {new Date(cohort.starts_at).toLocaleDateString('es-CL')}
        {cohort.ends_at && ` · Cierra ${new Date(cohort.ends_at).toLocaleDateString('es-CL')}`}
        {cohort.max_seats && ` · ${(enrolled || []).length}/${cohort.max_seats} cupos`}
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Matriculados */}
        <div>
          <h2 className="mb-2 font-semibold text-slate-700">Matriculados ({(enrolled || []).length})</h2>
          <div className="card divide-y divide-slate-100">
            {(enrolled || []).map((e) => (
              <div key={e.id} className="flex items-center justify-between px-4 py-2 text-sm">
                <span>{e.profiles?.full_name || e.user_id}</span>
                <span className="text-xs text-slate-400">
                  {new Date(e.created_at).toLocaleDateString('es-CL')}
                </span>
              </div>
            ))}
            {(enrolled || []).length === 0 && (
              <p className="px-4 py-4 text-sm text-slate-400">Sin matrículas aún.</p>
            )}
          </div>
        </div>

        {/* Agregar matriculados */}
        <div>
          <h2 className="mb-2 font-semibold text-slate-700">Agregar estudiante</h2>
          <CohortEnrollForm
            cohortId={cohort.id}
            programId={cohort.programs?.id}
            available={available}
            isFull={cohort.max_seats && (enrolled || []).length >= cohort.max_seats}
          />
        </div>
      </div>
    </div>
  );
}
