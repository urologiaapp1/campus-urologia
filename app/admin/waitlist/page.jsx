import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getSessionProfile } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export default async function WaitlistPage() {
  const { profile } = await getSessionProfile();
  if (!profile || !['admin', 'editor'].includes(profile.role)) redirect('/dashboard');

  const admin = createAdminClient();

  const { data: programs } = await admin
    .from('programs')
    .select('id, title')
    .order('created_at');

  const { data: entries } = await admin
    .from('program_waitlist')
    .select('id, program_id, email, full_name, notified, created_at')
    .order('created_at', { ascending: false });

  // Agrupar por programa
  const byProgram = {};
  (entries || []).forEach((e) => {
    if (!byProgram[e.program_id]) byProgram[e.program_id] = [];
    byProgram[e.program_id].push(e);
  });

  const programMap = {};
  (programs || []).forEach((p) => { programMap[p.id] = p.title; });

  const totalEntries = (entries || []).length;

  return (
    <div>
      <Link href="/admin" className="text-sm text-brand-600 hover:underline">← Administración</Link>
      <h1 className="mt-2 text-2xl font-bold text-slate-900">Lista de espera</h1>
      <p className="mt-1 text-sm text-slate-500">
        {totalEntries} registro{totalEntries !== 1 ? 's' : ''} en total
      </p>

      {Object.keys(byProgram).length === 0 && (
        <div className="card mt-6 p-8 text-center text-sm text-slate-400">
          Ningún interesado registrado aún.
        </div>
      )}

      {Object.entries(byProgram).map(([programId, list]) => (
        <div key={programId} className="card mt-6">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3 bg-slate-50">
            <h2 className="font-bold text-slate-800">
              {programMap[programId] || 'Programa desconocido'}
            </h2>
            <span className="text-xs text-slate-500">{list.length} interesados</span>
          </div>
          <div className="divide-y divide-slate-100">
            {list.map((e) => (
              <div key={e.id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="text-sm font-medium text-slate-800">{e.email}</p>
                  {e.full_name && <p className="text-xs text-slate-400">{e.full_name}</p>}
                  <p className="text-xs text-slate-300">
                    {new Date(e.created_at).toLocaleDateString('es-CL')}
                  </p>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                  e.notified ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-400'
                }`}>
                  {e.notified ? 'Notificado' : 'Pendiente'}
                </span>
              </div>
            ))}
          </div>
          {/* Export CSV de este programa */}
          <div className="border-t border-slate-100 px-5 py-3">
            <a
              href={`/api/admin/export-waitlist?program_id=${programId}`}
              className="text-xs text-brand-600 hover:underline"
            >
              ⬇ Exportar CSV
            </a>
          </div>
        </div>
      ))}
    </div>
  );
}
