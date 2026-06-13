'use client';
import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

const DIFFICULTIES = ['básico', 'intermedio', 'avanzado'];
const BADGE = {
  básico: 'bg-green-100 text-green-700',
  intermedio: 'bg-yellow-100 text-yellow-700',
  avanzado: 'bg-red-100 text-red-700',
};
const EMPTY = { title: '', specialty: 'Urología', difficulty: 'básico', patient_profile: '', learning_objectives: '' };

export default function CasosAdminPage() {
  const { id: programId } = useParams();
  const supabase = createClient();
  const [program, setProgram] = useState(null);
  const [cases, setCases] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const load = useCallback(async () => {
    const { data: p } = await supabase.from('programs').select('id, title').eq('id', programId).single();
    setProgram(p);
    const { data: c } = await supabase
      .from('clinical_cases')
      .select('id, title, specialty, difficulty, learning_objectives, created_at')
      .eq('program_id', programId)
      .order('created_at', { ascending: false });
    setCases(c || []);
  }, [programId]);

  useEffect(() => { load(); }, [load]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit(e) {
    e.preventDefault();
    if (editingId) {
      await supabase.from('clinical_cases').update(form).eq('id', editingId);
    } else {
      const { data: { user } } = await supabase.auth.getUser();
      await supabase.from('clinical_cases').insert({ ...form, program_id: programId, created_by: user.id });
    }
    setForm(EMPTY);
    setEditingId(null);
    setShowForm(false);
    load();
  }

  async function startEdit(c) {
    const { data } = await supabase.from('clinical_cases').select('*').eq('id', c.id).single();
    setForm({
      title: data.title,
      specialty: data.specialty,
      difficulty: data.difficulty,
      patient_profile: data.patient_profile,
      learning_objectives: data.learning_objectives || '',
    });
    setEditingId(c.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function deleteCase(c) {
    if (!confirm(`¿Eliminar el caso "${c.title}"? Se borrarán todas las sesiones de simulación asociadas.`)) return;
    await supabase.from('clinical_cases').delete().eq('id', c.id);
    load();
  }

  function cancelForm() {
    setForm(EMPTY);
    setEditingId(null);
    setShowForm(false);
  }

  if (!program) return <p className="text-sm text-slate-400">Cargando…</p>;

  return (
    <div>
      <Link href={`/admin/programa/${programId}`} className="text-sm text-brand-600 hover:underline">
        ← {program.title}
      </Link>
      <div className="mt-1 flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900">🩺 Casos clínicos</h1>
        {!showForm && (
          <button onClick={() => setShowForm(true)} className="btn-primary">+ Nuevo caso</button>
        )}
      </div>

      {showForm && (
        <form onSubmit={submit} className="card mt-4 space-y-4 p-5">
          <h2 className="font-semibold text-slate-800">{editingId ? 'Editar caso' : 'Nuevo caso clínico'}</h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Título</label>
              <input className="input" value={form.title} onChange={set('title')} required
                placeholder="Ej: Hematuria en hombre de 65 años" />
            </div>
            <div>
              <label className="label">Especialidad</label>
              <input className="input" value={form.specialty} onChange={set('specialty')} required />
            </div>
            <div>
              <label className="label">Dificultad</label>
              <select className="input" value={form.difficulty} onChange={set('difficulty')}>
                {DIFFICULTIES.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="label">
              Perfil del paciente{' '}
              <span className="text-xs font-normal text-red-500">— secreto, nunca llega al alumno</span>
            </label>
            <textarea className="input font-mono text-xs" rows={9} value={form.patient_profile}
              onChange={set('patient_profile')} required
              placeholder={'Describe detalladamente:\n- Motivo de consulta (como lo describiría el paciente)\n- Síntomas: inicio, duración, características, factores agravantes/atenuantes\n- Antecedentes médicos, quirúrgicos, familiares, medicamentos\n- Historia social relevante\n- Diagnóstico correcto\n- Hallazgos de exámenes (laboratorio, imágenes) que el médico podría solicitar\n- Tratamiento correcto'} />
          </div>

          <div>
            <label className="label">Objetivos de aprendizaje</label>
            <textarea className="input" rows={3} value={form.learning_objectives}
              onChange={set('learning_objectives')}
              placeholder="Ej: Identificar las causas más frecuentes de hematuria macroscópica, solicitar cistoscopía y urocultivo como primera línea…" />
          </div>

          <div className="flex gap-2">
            <button type="submit" className="btn-primary">{editingId ? 'Guardar cambios' : 'Crear caso'}</button>
            <button type="button" onClick={cancelForm} className="btn-secondary">Cancelar</button>
          </div>
        </form>
      )}

      {cases.length === 0 && !showForm ? (
        <p className="mt-10 text-center text-sm text-slate-400">Sin casos clínicos. Crea el primero.</p>
      ) : (
        <div className="mt-6 space-y-3">
          {cases.map((c) => (
            <div key={c.id} className="card flex items-start justify-between gap-4 p-4">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium text-slate-900">{c.title}</span>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${BADGE[c.difficulty]}`}>
                    {c.difficulty}
                  </span>
                  <span className="text-xs text-slate-400">{c.specialty}</span>
                </div>
                {c.learning_objectives && (
                  <p className="mt-1 line-clamp-1 text-xs text-slate-500">{c.learning_objectives}</p>
                )}
              </div>
              <div className="flex shrink-0 gap-2">
                <button onClick={() => startEdit(c)} className="btn-secondary text-xs">Editar</button>
                <button onClick={() => deleteCase(c)} className="btn-danger text-xs">Eliminar</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
