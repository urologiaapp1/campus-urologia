'use client';
import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

const DIFFICULTIES = ['básico', 'intermedio', 'avanzado'];
const EMPTY = {
  title: '', specialty: 'Urología', difficulty: 'básico',
  patient_profile: '', learning_objectives: '',
  is_global: false, program_ids: [],
};

export default function AdminCasosGlobalesPage() {
  const supabase = createClient();
  const [cases,    setCases]    = useState([]);
  const [programs, setPrograms] = useState([]);
  const [form,     setForm]     = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [saving,   setSaving]   = useState(false);

  const load = useCallback(async () => {
    const { data: c } = await supabase
      .from('clinical_cases')
      .select('id, title, specialty, difficulty, is_global, program_id, programs(title), clinical_case_programs(program_id)')
      .order('created_at', { ascending: false });
    setCases(c || []);
    const { data: p } = await supabase.from('programs').select('id, title').order('title');
    setPrograms(p || []);
  }, []);

  useEffect(() => { load(); }, [load]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const toggle = (k) => setForm((f) => ({ ...f, [k]: !f[k] }));

  function toggleProgram(pid) {
    setForm((f) => ({
      ...f,
      program_ids: f.program_ids.includes(pid)
        ? f.program_ids.filter((id) => id !== pid)
        : [...f.program_ids, pid],
    }));
  }

  async function submit(e) {
    e.preventDefault();
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();

    const payload = {
      title:               form.title,
      specialty:           form.specialty,
      difficulty:          form.difficulty,
      patient_profile:     form.patient_profile,
      learning_objectives: form.learning_objectives,
      is_global:           form.is_global,
      program_id:          form.program_ids.length === 1 ? form.program_ids[0] : null,
    };

    let caseId = editingId;

    if (editingId) {
      await supabase.from('clinical_cases').update(payload).eq('id', editingId);
    } else {
      const { data: inserted } = await supabase.from('clinical_cases')
        .insert({ ...payload, created_by: user.id }).select('id').single();
      caseId = inserted?.id;
    }

    // Gestionar asignaciones multi-programa via junction table
    if (caseId && form.program_ids.length > 1) {
      await supabase.from('clinical_case_programs').delete().eq('case_id', caseId);
      await supabase.from('clinical_case_programs').insert(
        form.program_ids.map((pid) => ({ case_id: caseId, program_id: pid }))
      );
    }

    setForm(EMPTY);
    setEditingId(null);
    setShowForm(false);
    setSaving(false);
    load();
  }

  async function startEdit(c) {
    const { data } = await supabase.from('clinical_cases').select('*').eq('id', c.id).single();
    const { data: ccp } = await supabase.from('clinical_case_programs').select('program_id').eq('case_id', c.id);
    const assignedIds = (ccp || []).map((r) => r.program_id);
    if (data.program_id && !assignedIds.includes(data.program_id)) assignedIds.push(data.program_id);
    setForm({
      title:               data.title,
      specialty:           data.specialty,
      difficulty:          data.difficulty,
      patient_profile:     data.patient_profile || '',
      learning_objectives: data.learning_objectives || '',
      is_global:           data.is_global || false,
      program_ids:         assignedIds,
    });
    setEditingId(c.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function deleteCase(c) {
    if (!confirm(`¿Eliminar "${c.title}"? Se borrarán las sesiones asociadas.`)) return;
    await supabase.from('clinical_cases').delete().eq('id', c.id);
    load();
  }

  const programLabel = (c) => {
    if (c.is_global) return '🌐 Global (todos los alumnos)';
    const multi = c.clinical_case_programs?.map((r) => r.program_id) || [];
    if (multi.length > 1) return `${multi.length} programas`;
    return c.programs?.title || '—';
  };

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link href="/admin" className="text-sm text-brand-600 hover:underline">← Administración</Link>
          <h1 className="mt-1 text-xl font-black tracking-tight text-[var(--text-1)]">Casos clínicos — gestión global</h1>
          <p className="mt-1 text-sm text-[var(--text-2)]">
            Crea casos y asígnalos a múltiples programas o actívalos para todos los alumnos.
          </p>
        </div>
        <button onClick={() => setShowForm((v) => !v)} className="btn-primary">
          {showForm ? '✕ Cancelar' : '+ Nuevo caso'}
        </button>
      </div>

      {/* Formulario */}
      {showForm && (
        <form onSubmit={submit} className="card mt-6 space-y-4 p-6">
          <h2 className="text-sm font-bold text-[var(--text-1)]">
            {editingId ? 'Editar caso' : 'Crear nuevo caso'}
          </h2>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="sm:col-span-2">
              <label className="label">Título del caso</label>
              <input className="input" value={form.title} onChange={set('title')} required />
            </div>
            <div>
              <label className="label">Especialidad</label>
              <input className="input" value={form.specialty} onChange={set('specialty')} />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Dificultad</label>
              <select className="input" value={form.difficulty} onChange={set('difficulty')}>
                {DIFFICULTIES.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Objetivos de aprendizaje</label>
              <input className="input" value={form.learning_objectives} onChange={set('learning_objectives')} />
            </div>
          </div>

          <div>
            <label className="label">Perfil del paciente (contexto para la IA)</label>
            <textarea className="input" rows={4} value={form.patient_profile} onChange={set('patient_profile')}
              placeholder="Ej: Varón 65 años, tabaquista, consulta por hematuria…" />
          </div>

          {/* Visibilidad */}
          <div className="rounded-xl border border-[var(--border)] p-4 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[var(--text-3)]">Visibilidad</p>

            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.is_global} onChange={() => toggle('is_global')} className="accent-brand-600" />
              <span className="text-sm font-semibold text-[var(--text-1)]">
                🌐 Global — visible para todos los alumnos con alguna matrícula
              </span>
            </label>

            {!form.is_global && (
              <div>
                <p className="mb-2 text-xs text-[var(--text-2)]">O selecciona uno o más programas específicos:</p>
                <div className="grid gap-1.5 sm:grid-cols-2">
                  {programs.map((p) => (
                    <label key={p.id} className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-[var(--surface-2)]">
                      <input
                        type="checkbox"
                        checked={form.program_ids.includes(p.id)}
                        onChange={() => toggleProgram(p.id)}
                        className="accent-brand-600"
                      />
                      {p.title}
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <button className="btn-primary" disabled={saving}>{saving ? 'Guardando…' : editingId ? 'Actualizar caso' : 'Crear caso'}</button>
            <button type="button" onClick={() => { setForm(EMPTY); setEditingId(null); setShowForm(false); }} className="btn-secondary">Cancelar</button>
          </div>
        </form>
      )}

      {/* Lista de casos */}
      <div className="card mt-6 divide-y divide-[var(--border)]">
        <div className="flex items-center justify-between px-5 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[var(--text-3)]">
            {cases.length} caso{cases.length !== 1 ? 's' : ''}
          </p>
        </div>
        {cases.map((c) => (
          <div key={c.id} className="flex flex-wrap items-start justify-between gap-3 px-5 py-4">
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold text-[var(--text-1)]">{c.title}</span>
                <span className="badge badge-slate text-[10px]">{c.difficulty}</span>
                <span className="text-xs text-[var(--text-3)]">{c.specialty}</span>
              </div>
              <p className="mt-1 text-xs text-[var(--text-3)]">{programLabel(c)}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => startEdit(c)} className="btn-secondary text-xs">Editar</button>
              <button onClick={() => deleteCase(c)} className="btn-danger text-xs">Eliminar</button>
            </div>
          </div>
        ))}
        {cases.length === 0 && (
          <p className="px-5 py-8 text-center text-sm text-[var(--text-3)]">Sin casos. Crea el primero arriba.</p>
        )}
      </div>
    </div>
  );
}
