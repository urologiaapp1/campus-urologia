'use client';
import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

function slugify(s) {
  return s.toLowerCase().normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export default function AdminPrograms() {
  const supabase = createClient();
  const [programs, setPrograms] = useState([]);
  const [myRole, setMyRole] = useState(null);
  const [title, setTitle] = useState('');
  const [kind, setKind] = useState('diplomado');
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase
      .from('profiles').select('role').eq('id', user.id).single();
    const role = profile?.role;
    setMyRole(role);

    let query = supabase
      .from('programs')
      .select('id, slug, title, kind, published')
      .order('created_at');

    // Editores de curso: filtrar por sus asignaciones
    if (role === 'editor') {
      const { data: staff } = await supabase
        .from('program_staff')
        .select('program_id')
        .eq('user_id', user.id);
      const ids = (staff || []).map((s) => s.program_id);
      if (ids.length) query = query.in('id', ids);
      else { setPrograms([]); return; }
    }

    const { data } = await query;
    setPrograms(data || []);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function createProgram(e) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.from('programs').insert({ title, kind, slug: slugify(title) });
    if (error) alert('Error: ' + error.message);
    setTitle('');
    setLoading(false);
    load();
  }

  async function togglePublish(p) {
    await supabase.from('programs').update({ published: !p.published }).eq('id', p.id);
    load();
  }

  async function remove(p) {
    if (!confirm(`¿Eliminar "${p.title}" y todo su contenido?`)) return;
    await supabase.from('programs').delete().eq('id', p.id);
    load();
  }

  const isAdmin = myRole === 'admin';

  return (
    <div>
      <h1 className="text-xl font-bold text-slate-900">Programas</h1>

      {/* Solo admins globales pueden crear programas */}
      {isAdmin && (
        <form onSubmit={createProgram} className="card mt-4 flex flex-wrap items-end gap-3 p-4">
          <div className="grow">
            <label className="label">Título del nuevo programa</label>
            <input className="input" value={title} onChange={(e) => setTitle(e.target.value)}
              placeholder="Diplomado en Urología Oncológica" required />
          </div>
          <div>
            <label className="label">Tipo</label>
            <select className="input" value={kind} onChange={(e) => setKind(e.target.value)}>
              <option value="diplomado">Diplomado</option>
              <option value="magister">Magíster</option>
              <option value="curso">Curso</option>
            </select>
          </div>
          <button className="btn-primary" disabled={loading}>Crear</button>
        </form>
      )}

      <div className="card mt-6 divide-y divide-slate-100">
        {programs.map((p) => (
          <div key={p.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3">
            <div>
              <p className="font-semibold text-slate-800">{p.title}</p>
              <p className="text-xs text-slate-400">{p.kind} · /{p.slug}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                p.published ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-500'
              }`}>
                {p.published ? 'Publicado' : 'Borrador'}
              </span>
              {isAdmin && (
                <button onClick={() => togglePublish(p)} className="btn-secondary">
                  {p.published ? 'Despublicar' : 'Publicar'}
                </button>
              )}
              <Link href={`/admin/programa/${p.id}`} className="btn-primary">Contenido</Link>
              <Link href={`/admin/estadisticas/${p.id}`} className="btn-secondary">Estadísticas</Link>
              {isAdmin && (
                <button onClick={() => remove(p)} className="btn-danger">Eliminar</button>
              )}
            </div>
          </div>
        ))}
        {programs.length === 0 && (
          <p className="px-5 py-4 text-sm text-slate-400">
            {myRole === 'editor' ? 'No tienes programas asignados.' : 'Aún no hay programas.'}
          </p>
        )}
      </div>
    </div>
  );
}
