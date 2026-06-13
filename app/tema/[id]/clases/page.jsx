import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSessionProfile } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function ClasesEnVivoPage({ params }) {
  const { user, profile, supabase } = await getSessionProfile();
  if (!user) redirect('/login');

  const { data: module_ } = await supabase
    .from('modules')
    .select('id, title, programs(slug, title)')
    .eq('id', params.id)
    .single();

  if (!module_) redirect('/dashboard');

  const { data: sessions } = await supabase
    .from('live_sessions')
    .select('id, title, description, join_url, starts_at, duration_min, recording_url, password')
    .eq('module_id', params.id)
    .order('starts_at', { ascending: false });

  const now = new Date();
  const isStaff = profile && ['admin', 'editor'].includes(profile.role);

  return (
    <div>
      <Link href={`/programa/${module_.programs?.slug}`} className="text-sm text-brand-600 hover:underline">
        ← {module_.programs?.title}
      </Link>
      <div className="mt-1 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Clases en vivo: {module_.title}</h1>
        {isStaff && (
          <Link href={`/admin/clases/nueva?module_id=${params.id}`} className="btn-primary">
            + Programar clase
          </Link>
        )}
      </div>

      <div className="mt-6 space-y-4">
        {(sessions || []).map((s) => {
          const start = new Date(s.starts_at);
          const end = new Date(start.getTime() + s.duration_min * 60_000);
          const isLive = now >= start && now <= end;
          const isPast = now > end;
          const isUpcoming = now < start;

          return (
            <div key={s.id} className={`card p-5 ${isLive ? 'border-green-300 bg-green-50' : ''}`}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    {isLive && (
                      <span className="flex items-center gap-1 rounded-full bg-green-500 px-2 py-0.5 text-xs font-bold text-white">
                        <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-white" />
                        EN VIVO
                      </span>
                    )}
                    {isUpcoming && (
                      <span className="rounded-full bg-brand-100 px-2 py-0.5 text-xs font-medium text-brand-700">
                        Próxima
                      </span>
                    )}
                    {isPast && !s.recording_url && (
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
                        Finalizada
                      </span>
                    )}
                    <h2 className="font-bold text-slate-800">{s.title}</h2>
                  </div>
                  <p className="mt-1 text-sm text-slate-500">
                    {start.toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' })}
                    {' · '}
                    {start.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })} hrs
                    {' · '}{s.duration_min} min
                  </p>
                  {s.description && (
                    <p className="mt-2 text-sm text-slate-600">{s.description}</p>
                  )}
                </div>

                <div className="flex flex-col gap-2 text-right">
                  {(isLive || isUpcoming) && s.join_url && (
                    <a href={s.join_url} target="_blank" rel="noopener noreferrer"
                      className={`btn-primary ${isLive ? 'bg-green-600 hover:bg-green-700' : ''}`}>
                      {isLive ? '🟢 Unirse ahora' : '📅 Agregar a calendario'}
                    </a>
                  )}
                  {s.recording_url && (
                    <a href={s.recording_url} target="_blank" rel="noopener noreferrer"
                      className="btn-secondary">
                      🎬 Ver grabación
                    </a>
                  )}
                  {s.password && (isLive || isUpcoming) && (
                    <p className="text-xs text-slate-400">Contraseña: <b>{s.password}</b></p>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {(sessions || []).length === 0 && (
          <div className="card py-12 text-center text-slate-400">
            No hay clases en vivo programadas para este módulo.
          </div>
        )}
      </div>
    </div>
  );
}
