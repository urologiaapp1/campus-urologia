'use client';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function NuevaClase() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const [modules, setModules] = useState([]);
  const [form, setForm] = useState({
    module_id: searchParams.get('module_id') || '',
    title: '',
    description: '',
    join_url: '',
    starts_at: '',
    duration_min: 60,
    password: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase
      .from('modules')
      .select('id, title, programs(title)')
      .order('title')
      .then(({ data }) => setModules(data || []));
  }, []);

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from('live_sessions').insert({
      module_id: form.module_id,
      title: form.title,
      description: form.description || null,
      join_url: form.join_url || null,
      starts_at: form.starts_at,
      duration_min: parseInt(form.duration_min),
      password: form.password || null,
      created_by: user.id,
    });
    if (error) { alert('Error: ' + error.message); setSaving(false); return; }
    const mod = modules.find((m) => m.id === form.module_id);
    router.push(mod ? `/tema/${form.module_id}/clases` : '/admin');
  }

  return (
    <div className="max-w-lg">
      <Link href="/admin" className="text-sm text-brand-600 hover:underline">← Administración</Link>
      <h1 className="mt-2 text-2xl font-bold text-slate-900">Programar clase en vivo</h1>

      <form onSubmit={save} className="card mt-6 space-y-4 p-6">
        <div>
          <label className="label">Módulo</label>
          <select className="input" required value={form.module_id}
            onChange={(e) => setForm({ ...form, module_id: e.target.value })}>
            <option value="">Seleccionar…</option>
            {modules.map((m) => (
              <option key={m.id} value={m.id}>{m.programs?.title} › {m.title}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Título de la clase</label>
          <input className="input" required value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="ej: Clase 1 — Anatomía uretral" />
        </div>
        <div>
          <label className="label">Descripción (opcional)</label>
          <textarea className="input" rows={2} value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Fecha y hora</label>
            <input type="datetime-local" className="input" required value={form.starts_at}
              onChange={(e) => setForm({ ...form, starts_at: e.target.value })} />
          </div>
          <div>
            <label className="label">Duración (minutos)</label>
            <input type="number" min="15" step="15" className="input" value={form.duration_min}
              onChange={(e) => setForm({ ...form, duration_min: e.target.value })} />
          </div>
        </div>
        <div>
          <label className="label">Enlace de Zoom / Meet / Teams</label>
          <input className="input" value={form.join_url}
            onChange={(e) => setForm({ ...form, join_url: e.target.value })}
            placeholder="https://zoom.us/j/123456789" />
        </div>
        <div>
          <label className="label">Contraseña (opcional)</label>
          <input className="input" value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })} />
        </div>
        <div className="flex gap-3 pt-2">
          <button className="btn-primary" disabled={saving}>
            {saving ? 'Guardando…' : 'Programar clase'}
          </button>
          <Link href="/admin" className="btn-secondary">Cancelar</Link>
        </div>
      </form>

      <p className="mt-3 text-xs text-slate-400">
        Al guardar, se enviará una notificación a todos los matriculados en el programa.
      </p>
    </div>
  );
}
