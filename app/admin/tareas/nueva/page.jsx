'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function NuevaTarea() {
  const router = useRouter();
  const supabase = createClient();
  const [modules, setModules] = useState([]);
  const [form, setForm] = useState({
    module_id: '', title: '', instructions: '',
    due_at: '', max_score: 100, pass_score: 60,
  });
  const [rubric, setRubric] = useState([
    { label: 'Presentación del caso', max_points: 20 },
    { label: 'Análisis clínico', max_points: 30 },
    { label: 'Manejo terapéutico', max_points: 30 },
    { label: 'Referencias bibliográficas', max_points: 20 },
  ]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase
      .from('modules')
      .select('id, title, programs(title)')
      .order('title')
      .then(({ data }) => setModules(data || []));
  }, []);

  function updateRubric(i, field, value) {
    setRubric((prev) => prev.map((r, idx) => idx === i ? { ...r, [field]: value } : r));
  }

  function addRubricItem() {
    setRubric((prev) => [...prev, { label: '', max_points: 10 }]);
  }

  function removeRubricItem(i) {
    setRubric((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function save(e) {
    e.preventDefault();
    setSaving(true);

    // Insertar assignment
    const { data: asn, error } = await supabase.from('assignments').insert({
      module_id: form.module_id,
      title: form.title,
      instructions: form.instructions || null,
      due_at: form.due_at || null,
      max_score: parseInt(form.max_score),
      pass_score: parseInt(form.pass_score),
    }).select('id').single();

    if (error) { alert('Error: ' + error.message); setSaving(false); return; }

    // Insertar ítems de rúbrica
    const items = rubric
      .filter((r) => r.label.trim())
      .map((r, i) => ({ assignment_id: asn.id, label: r.label, max_points: parseInt(r.max_points), position: i }));

    if (items.length > 0) {
      await supabase.from('rubric_items').insert(items);
    }

    router.push(`/admin/tareas/${asn.id}`);
  }

  const totalRubric = rubric.reduce((s, r) => s + (parseInt(r.max_points) || 0), 0);

  return (
    <div className="max-w-2xl">
      <Link href="/admin/tareas" className="text-sm text-brand-600 hover:underline">← Tareas</Link>
      <h1 className="mt-2 text-2xl font-bold text-slate-900">Nueva tarea</h1>

      <form onSubmit={save} className="mt-6 space-y-6">
        <div className="card p-5 space-y-4">
          <h2 className="font-semibold text-slate-700">Información general</h2>
          <div>
            <label className="label">Módulo</label>
            <select className="input" required value={form.module_id}
              onChange={(e) => setForm({ ...form, module_id: e.target.value })}>
              <option value="">Seleccionar módulo…</option>
              {modules.map((m) => (
                <option key={m.id} value={m.id}>{m.programs?.title} › {m.title}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Título de la tarea</label>
            <input className="input" required value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="ej: Presentación de caso clínico de uretroplastia" />
          </div>
          <div>
            <label className="label">Instrucciones (opcional)</label>
            <textarea className="input" rows={4} value={form.instructions}
              onChange={(e) => setForm({ ...form, instructions: e.target.value })}
              placeholder="Describe qué deben entregar, formato esperado, fuentes requeridas…" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="label">Fecha de entrega</label>
              <input type="datetime-local" className="input" value={form.due_at}
                onChange={(e) => setForm({ ...form, due_at: e.target.value })} />
            </div>
            <div>
              <label className="label">Puntaje máximo</label>
              <input type="number" min="1" className="input" required value={form.max_score}
                onChange={(e) => setForm({ ...form, max_score: e.target.value })} />
            </div>
            <div>
              <label className="label">Puntaje mínimo</label>
              <input type="number" min="0" className="input" required value={form.pass_score}
                onChange={(e) => setForm({ ...form, pass_score: e.target.value })} />
            </div>
          </div>
        </div>

        <div className="card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-slate-700">Rúbrica de evaluación</h2>
            <span className={`text-xs font-medium ${totalRubric === parseInt(form.max_score) ? 'text-green-600' : 'text-amber-600'}`}>
              Total: {totalRubric}/{form.max_score} pts
            </span>
          </div>
          {rubric.map((r, i) => (
            <div key={i} className="flex items-center gap-2">
              <input className="input flex-1" placeholder="Criterio de evaluación" value={r.label}
                onChange={(e) => updateRubric(i, 'label', e.target.value)} />
              <input type="number" min="1" className="input w-24" placeholder="Pts" value={r.max_points}
                onChange={(e) => updateRubric(i, 'max_points', e.target.value)} />
              <button type="button" onClick={() => removeRubricItem(i)}
                className="shrink-0 text-red-400 hover:text-red-600">✕</button>
            </div>
          ))}
          <button type="button" onClick={addRubricItem}
            className="text-sm text-brand-600 hover:underline">+ Agregar criterio</button>
        </div>

        <div className="flex gap-3">
          <button className="btn-primary" disabled={saving}>
            {saving ? 'Guardando…' : 'Crear tarea'}
          </button>
          <Link href="/admin/tareas" className="btn-secondary">Cancelar</Link>
        </div>
      </form>
    </div>
  );
}
