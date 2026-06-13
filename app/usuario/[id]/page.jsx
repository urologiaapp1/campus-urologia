import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getSessionProfile } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function UserProfilePage({ params }) {
  const { user, supabase } = await getSessionProfile();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, full_name, specialty, institution, country, role')
    .eq('id', params.id)
    .single();

  if (!profile) redirect('/dashboard');

  // Insignias del usuario
  const { data: userBadges } = await supabase
    .from('user_badges')
    .select('awarded_at, badges(slug, name, icon, description)')
    .eq('user_id', params.id)
    .order('awarded_at', { ascending: false });

  const badges = (userBadges || []).map((ub) => ({ ...ub.badges, awarded_at: ub.awarded_at }));

  // Tópicos publicados
  const { data: topics } = await supabase
    .from('topics')
    .select('id, title, created_at, modules(title)')
    .eq('author_id', params.id)
    .order('created_at', { ascending: false })
    .limit(10);

  // Comentarios realizados (conteo)
  const { count: commentCount } = await supabase
    .from('topic_comments')
    .select('id', { count: 'exact', head: true })
    .eq('author_id', params.id);

  const isMe = user.id === params.id;
  const roleLabels = { admin: 'Administrador', editor: 'Docente', student: 'Estudiante' };

  return (
    <div className="max-w-2xl">
      {/* Encabezado */}
      <div className="card p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-100 text-2xl font-black text-brand-600">
              {(profile.full_name || '?')[0].toUpperCase()}
            </div>
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-slate-900">
              {profile.full_name || 'Usuario'}
            </h1>
            <p className="text-sm text-slate-500">
              {profile.specialty && <span>{profile.specialty}</span>}
              {profile.institution && <span> · {profile.institution}</span>}
              {profile.country && <span> · {profile.country}</span>}
            </p>
            <span className="mt-1 inline-block rounded-full bg-brand-100 px-2 py-0.5 text-xs font-medium text-brand-700">
              {roleLabels[profile.role] || profile.role}
            </span>
          </div>
          {isMe && (
            <Link href="/perfil" className="btn-secondary shrink-0 text-xs">Editar perfil</Link>
          )}
        </div>

        {/* Estadísticas rápidas */}
        <div className="mt-5 grid grid-cols-3 divide-x divide-slate-100 rounded-xl bg-slate-50 text-center">
          <div className="py-3">
            <p className="text-xl font-bold text-slate-800">{(topics || []).length > 9 ? '10+' : (topics || []).length}</p>
            <p className="text-xs text-slate-500">Tópicos</p>
          </div>
          <div className="py-3">
            <p className="text-xl font-bold text-slate-800">{commentCount || 0}</p>
            <p className="text-xs text-slate-500">Comentarios</p>
          </div>
          <div className="py-3">
            <p className="text-xl font-bold text-slate-800">{badges.length}</p>
            <p className="text-xs text-slate-500">Insignias</p>
          </div>
        </div>
      </div>

      {/* Insignias */}
      {badges.length > 0 && (
        <div className="mt-6">
          <h2 className="mb-3 font-bold text-slate-800">Insignias</h2>
          <div className="flex flex-wrap gap-2">
            {badges.map((b) => (
              <div key={b.slug}
                className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2"
                title={b.description}>
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

      {/* Tópicos publicados */}
      {(topics || []).length > 0 && (
        <div className="mt-6">
          <h2 className="mb-3 font-bold text-slate-800">Últimos tópicos publicados</h2>
          <div className="card divide-y divide-slate-100">
            {(topics || []).map((t) => (
              <Link key={t.id} href={`/topico/${t.id}`}
                className="flex items-center justify-between px-5 py-3 hover:bg-slate-50">
                <div>
                  <p className="text-sm font-medium text-slate-800">{t.title}</p>
                  <p className="text-xs text-slate-400">{t.modules?.title}</p>
                </div>
                <p className="text-xs text-slate-400">
                  {new Date(t.created_at).toLocaleDateString('es-CL')}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
