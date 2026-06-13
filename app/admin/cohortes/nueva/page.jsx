'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function NuevaCohorte() {
  const router = useRouter();
  const supabase = createClient();
  const [programs, setPrograms] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [form, setForm] = useState({
    program_id: '',
    name: '',
    starts_at: '',
    ends_at: '',
    max_seats: '',
  });
  const [saving, setSaving] = useState(false);

  if (!loaded) {
    supabase.from('programs').select('id, title').order('title').then(({ data }) => {
      setPrograms(data || []);
      setLoaded(true);
    });
  }

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    const payload = {
      program_id: form.program_id,
      name: form.name,
      starts_at: form.starts_at,
      ends_at: form.ends_at || null,
      max_seats: form.max_seats ? parseInt(form.max_seats) : null,
    };
    const { error } = await supabase.from('cohorts').insert(payload);
    if (error) { alert('Error: ' + error.message); setSaving(false); return; }
    router.push('/admin/cohortes');
  }

  return (
    <div className="max-w-lg">
      <Link href="/admin/cohortes" className="text-sm text-brand-600 hover:underline">← Cohortes</Link>
      <h1 className="mt-2 text-2xl font-bold text-slate-900">Nueva cohorte</h1>

      <form onSubmit={save} className="card mt-6 space-y-4 p-6">
        <div>
          <label className="label">Programa</label>
          <select className="input" required value={form.program_id}
            onChange={(e) => setForm({ ...form, program_id: e.target.value })}>
            <option value="">Seleccionar…</option>
            {programs.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Nombre de la cohorte</label>
          <input className="input" required value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="ej: Cohorte 2025-1" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Fecha de inicio</label>
            <input type="date" className="input" required value={form.starts_at}
              onChange={(e) => setForm({ ...form, starts_at: e.target.value })} />
          </div>
          <div>
            <label className="label">Fecha de cierre (opcional)</label>
            <input type="date" className="input" value={form.ends_at}
              onChange={(e) => setForm({ ...form, ends_at: e.target.value })} />
          </div>
        </div>
        <div>
          <label className="label">Cupos máximos (opcional)</label>
          <input type="number" min="1" className="input" value={form.max_seats}
            onChange={(e) => setForm({ ...form, max_seats: e.target.value })}
            placeholder="Sin límite si se deja vacío" />
        </div>
        <div className="flex gap-3 pt-2">
          <button className="btn-primary" disabled={saving}>
            {saving ? 'Guardando…' : 'Crear cohorte'}
          </button>
          <Link href="/admin/cohortes" className="btn-secondary">Cancelar</Link>
        </div>
      </form>
    </div>
  );
}
