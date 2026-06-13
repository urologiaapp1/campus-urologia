'use client';
import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';

const DIFFICULTIES = { easy: 'Fácil', medium: 'Media', hard: 'Difícil' };
const DIFF_COLORS = { easy: 'text-green-600', medium: 'text-amber-600', hard: 'text-red-600' };

export default function BancoPage() {
  const supabase = createClient();
  const [questions, setQuestions] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [modules, setModules] = useState([]);
  const [filter, setFilter] = useState({ program_id: '', module_id: '', difficulty: '' });
  const [form, setForm] = useState({
    program_id: '', module_id: '', category: '', difficulty: 'medium',
    stem: '', options: ['', '', '', ''], correct_index: 0, explanation: '',
  });
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    supabase.from('programs').select('id, title').order('title').then(({ data }) => setPrograms(data || []));
  }, []);

  useEffect(() => {
    if (filter.program_id) {
      supabase.from('modules').select('id, title').eq('program_id', filter.program_id).order('position')
        .then(({ data }) => setModules(data || []));
    }
  }, [filter.program_id]);

  const loadQuestions = useCallback(async () => {
    let q = supabase
      .from('question_bank')
      .select('id, stem, category, difficulty, options, program_id, module_id, modules(title), programs(title)')
      .order('created_at', { ascending: false });
    if (filter.program_id) q = q.eq('program_id', filter.program_id);
    if (filter.module_id) q = q.eq('module_id', filter.module_id);
    if (filter.difficulty) q = q.eq('difficulty', filter.difficulty);
    const { data } = await q;
    setQuestions(data || []);
  }, [filter]);

  useEffect(() => { loadQuestions(); }, [loadQuestions]);

  function updateOption(i, v) {
    setForm((prev) => { const o = [...prev.options]; o[i] = v; return { ...prev, options: o }; });
  }

  async function saveQuestion(e) {
    e.preventDefault();
    setSaving(true);
    const { data: q, error } = await supabase.from('question_bank').insert({
      program_id: form.program_id || null,
      module_id: form.module_id || null,
      category: form.category || null,
      difficulty: form.difficulty,
      stem: form.stem,
      options: form.options.filter(Boolean),
    }).select('id').single();

    if (error) { alert('Error: ' + error.message); setSaving(false); return; }

    await supabase.from('question_bank_keys').insert({
      question_id: q.id,
      correct_index: parseInt(form.correct_index),
      explanation: form.explanation || null,
    });

    setForm({ program_id: '', module_id: '', category: '', difficulty: 'medium',
      stem: '', options: ['', '', '', ''], correct_index: 0, explanation: '' });
    setOpen(false);
    setSaving(false);
    loadQuestions();
  }

  async function deleteQuestion(id) {
    if (!confirm('¿Eliminar pregunta?')) return;
    await supabase.from('question_bank').delete().eq('id', id);
    loadQuestions();
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Banco de preguntas</h1>
          <p className="mt-1 text-sm text-slate-500">Repositorio central de preguntas para quizzes aleatorios.</p>
        </div>
        <button onClick={() => setOpen(!open)} className="btn-primary">
          {open ? '✕ Cerrar' : '+ Nueva pregunta'}
        </button>
      </div>

      {open && (
        <form onSubmit={saveQuestion} className="card mt-6 space-y-4 p-5">
          <h2 className="font-semibold text-slate-700">Nueva pregunta</h2>
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label className="label">Programa</label>
              <select className="input" value={form.program_id}
                onChange={(e) => setForm({ ...form, program_id: e.target.value, module_id: '' })}>
                <option value="">Sin asignar</option>
                {programs.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Módulo</label>
              <select className="input" value={form.module_id}
                onChange={(e) => setForm({ ...form, module_id: e.target.value })}>
                <option value="">Sin asignar</option>
                {modules.map((m) => <option key={m.id} value={m.id}>{m.title}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Dificultad</label>
              <select className="input" value={form.difficulty}
                onChange={(e) => setForm({ ...form, difficulty: e.target.value })}>
                {Object.entries(DIFFICULTIES).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="label">Categoría (opcional)</label>
            <input className="input" value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              placeholder="ej: Anatomía, Técnica quirúrgica, Complicaciones" />
          </div>
          <div>
            <label className="label">Enunciado de la pregunta</label>
            <textarea className="input" rows={3} required value={form.stem}
              onChange={(e) => setForm({ ...form, stem: e.target.value })} />
          </div>
          <div className="space-y-2">
            <label className="label">Opciones de respuesta</label>
            {form.options.map((opt, i) => (
              <div key={i} className="flex items-center gap-2">
                <input type="radio" name="correct" value={i} checked={parseInt(form.correct_index) === i}
                  onChange={() => setForm({ ...form, correct_index: i })}
                  className="accent-brand-600 shrink-0" title="Marcar como correcta" />
                <input className="input flex-1" value={opt} required
                  placeholder={`Opción ${String.fromCharCode(65 + i)}`}
                  onChange={(e) => updateOption(i, e.target.value)} />
              </div>
            ))}
            <p className="text-xs text-slate-400">El radio marcado indica la respuesta correcta.</p>
          </div>
          <div>
            <label className="label">Explicación de la respuesta (opcional)</label>
            <textarea className="input" rows={2} value={form.explanation}
              onChange={(e) => setForm({ ...form, explanation: e.target.value })} />
          </div>
          <button className="btn-primary" disabled={saving}>
            {saving ? 'Guardando…' : 'Agregar al banco'}
          </button>
        </form>
      )}

      {/* Filtros */}
      <div className="mt-6 flex flex-wrap gap-2">
        <select className="input w-auto text-sm" value={filter.program_id}
          onChange={(e) => setFilter({ ...filter, program_id: e.target.value, module_id: '' })}>
          <option value="">Todos los programas</option>
          {programs.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
        </select>
        <select className="input w-auto text-sm" value={filter.difficulty}
          onChange={(e) => setFilter({ ...filter, difficulty: e.target.value })}>
          <option value="">Todas las dificultades</option>
          {Object.entries(DIFFICULTIES).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <span className="self-center text-xs text-slate-400">{questions.length} pregunta{questions.length !== 1 && 's'}</span>
      </div>

      <div className="card mt-3 divide-y divide-slate-100">
        {questions.map((q) => (
          <div key={q.id} className="px-5 py-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 cursor-pointer" onClick={() => setExpandedId(expandedId === q.id ? null : q.id)}>
                <p className="text-sm font-medium text-slate-800">{q.stem}</p>
                <p className="mt-0.5 text-xs text-slate-400">
                  {q.programs?.title && `${q.programs.title} · `}
                  {q.modules?.title && `${q.modules.title} · `}
                  {q.category && `${q.category} · `}
                  <span className={DIFF_COLORS[q.difficulty]}>{DIFFICULTIES[q.difficulty]}</span>
                </p>
              </div>
              <button onClick={() => deleteQuestion(q.id)}
                className="shrink-0 text-xs text-red-400 hover:text-red-600">eliminar</button>
            </div>
            {expandedId === q.id && (
              <ul className="mt-2 space-y-0.5">
                {(q.options || []).map((opt, i) => (
                  <li key={i} className="text-xs text-slate-600">
                    {String.fromCharCode(65 + i)}. {opt}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
        {questions.length === 0 && (
          <p className="px-5 py-8 text-center text-sm text-slate-400">
            No hay preguntas en el banco con los filtros actuales.
          </p>
        )}
      </div>
    </div>
  );
}
