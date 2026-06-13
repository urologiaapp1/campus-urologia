'use client';
import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function AnunciosPage() {
  const { id } = useParams();
  const supabase = createClient();
  const [announcements, setAnnouncements] = useState([]);
  const [form, setForm] = useState({ title: '', body: '', pinned: false });
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [me, setMe] = useState(null);

  const load = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setMe(user);
    const { data } = await supabase
      .from('announcements')
      .select('id, title, body, pinned, created_at, profiles(full_name)')
      .eq('program_id', id)
      .order('pinned', { ascending: false })
      .order('created_at', { ascending: false });
    setAnnouncements(data || []);
  }, [id]);

  useEffect(() => { load(); }, [load]);

  async function create(e) {
    e.preventDefault();
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from('announcements').insert({
      program_id: id,
      author_id: user.id,
      title: form.title,
      body: form.body,
      pinned: form.pinned,
    });
    if (error) alert('Error: ' + error.message);
    setForm({ title: '', body: '', pinned: false });
    setOpen(false);
    setSaving(false);
    load();
  }

  async function remove(annId) {
    if (!confirm('¿Eliminar anuncio?')) return;
    await supabase.from('announcements').delete().eq('id', annId);
    load();
  }

  async function togglePin(ann) {
    await supabase.from('announcements').update({ pinned: !ann.pinned }).eq('id', ann.id);
    load();
  }

  return (
    <div>
      <Link href={`/admin/programa/${id}`} className="text-sm text-brand-600 hover:underline">← Contenido</Link>
      <div className="mt-2 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Anuncios del programa</h1>
        <button onClick={() => setOpen(!open)} className="btn-primary">
          {open ? '✕ Cerrar' : '+ Nuevo anuncio'}
        </button>
      </div>
      <p className="mt-1 text-sm text-slate-500">
        Los anuncios son notificados a todos los matriculados automáticamente.
      </p>

      {open && (
        <form onSubmit={create} className="card mt-4 space-y-3 p-5">
          <div>
            <label className="label">Título</label>
            <input className="input" required value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="ej: Clase en vivo este viernes a las 19:00 hrs" />
          </div>
          <div>
            <label className="label">Mensaje</label>
            <textarea className="input" rows={4} required value={form.body}
              onChange={(e) => setForm({ ...form, body: e.target.value })} />
          </div>
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input type="checkbox" checked={form.pinned}
              onChange={(e) => setForm({ ...form, pinned: e.target.checked })} />
            Fijar este anuncio arriba
          </label>
          <div className="flex gap-3">
            <button className="btn-primary" disabled={saving}>{saving ? 'Publicando…' : 'Publicar anuncio'}</button>
            <button type="button" onClick={() => setOpen(false)} className="btn-secondary">Cancelar</button>
          </div>
        </form>
      )}

      <div className="card mt-6 divide-y divide-slate-100">
        {announcements.map((a) => (
          <div key={a.id} className="px-5 py-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  {a.pinned && <span className="text-amber-500" title="Fijado">📌</span>}
                  <p className="font-semibold text-slate-800">{a.title}</p>
                </div>
                <p className="mt-0.5 text-xs text-slate-400">
                  por {a.profiles?.full_name || 'Staff'} · {new Date(a.created_at).toLocaleString('es-CL')}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <button onClick={() => togglePin(a)} className="text-xs text-slate-400 hover:text-amber-600">
                  {a.pinned ? 'Desfijar' : 'Fijar'}
                </button>
                <button onClick={() => remove(a.id)} className="text-xs text-red-400 hover:text-red-600">
                  Eliminar
                </button>
              </div>
            </div>
            <p className="mt-2 whitespace-pre-wrap text-sm text-slate-600">{a.body}</p>
          </div>
        ))}
        {announcements.length === 0 && (
          <p className="px-5 py-8 text-center text-sm text-slate-400">No hay anuncios.</p>
        )}
      </div>
    </div>
  );
}
