import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getSessionProfile } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export default async function TareasAdminPage() {
  const { profile } = await getSessionProfile();
  if (!profile || !['admin', 'editor'].includes(profile.role)) redirect('/dashboard');

  const admin = createAdminClient();
  const { data: assignments } = await admin
    .from('assignments')
    .select('id, title, due_at, pass_score, max_score, modules(title, programs(title))')
    .order('due_at', { ascending: true });

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tareas</h1>
          <p className="mt-1 text-sm text-slate-500">Actividades evaluadas con rúbricas por módulo.</p>
        </div>
        <Link href="/admin/tareas/nueva" className="btn-primary">+ Nueva tarea</Link>
      </div>

      <div className="card mt-6 divide-y divide-slate-100">
        {(assignments || []).map((a) => {
          const now = new Date();
          const due = a.due_at ? new Date(a.due_at) : null;
          const overdue = due && now > due;
          return (
            <div key={a.id} className="flex flex-wrap items-center justify-between gap-2 px-5 py-4">
              <div>
                <p className="font-semibold text-slate-800">{a.title}</p>
                <p className="mt-0.5 text-xs text-slate-400">
                  {a.modules?.programs?.title} › {a.modules?.title}
                  {due && (
                    <span className={overdue ? 'ml-2 font-medium text-red-500' : 'ml-2 text-slate-400'}>
                      · Entrega {due.toLocaleDateString('es-CL')}
                    </span>
                  )}
                </p>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <span className="text-slate-500">Nota mín. {a.pass_score}/{a.max_score}</span>
                <Link href={`/admin/tareas/${a.id}`} className="btn-secondary text-xs">Gestionar</Link>
              </div>
            </div>
          );
        })}
        {(assignments || []).length === 0 && (
          <p className="px-5 py-10 text-center text-sm text-slate-400">No hay tareas creadas.</p>
        )}
      </div>
    </div>
  );
}
