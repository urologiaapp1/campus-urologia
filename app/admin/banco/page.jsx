'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';

/* ── Parsers (misma lógica que en quiz/page.jsx) ─────────────── */
function parseCSV(text) {
  const lines = text.trim().split('\n').filter(Boolean);
  if (lines.length < 2) throw new Error('CSV vacío.');
  return lines.slice(1).map((line, i) => {
    const cols = line.match(/(".*?"|[^,]+)(?=,|$)/g)?.map((c) => c.replace(/^"|"$/g, '').trim()) || [];
    if (cols.length < 5) throw new Error(`Fila ${i + 2}: faltan columnas.`);
    const [stem, a, b, c, d, correcta, explanation] = cols;
    const opts = [a, b, c, d].filter(Boolean);
    const cr = (correcta || '').toUpperCase().trim();
    let ci = parseInt(cr); if (isNaN(ci)) ci = ['A','B','C','D'].indexOf(cr);
    if (ci < 0 || ci >= opts.length) throw new Error(`Fila ${i + 2}: correcta inválida.`);
    return { stem, options: opts, correct_index: ci, explanation: explanation || '' };
  });
}
function parseJSON(text) {
  let arr; try { arr = JSON.parse(text); } catch { throw new Error('JSON inválido.'); }
  if (!Array.isArray(arr)) throw new Error('Debe ser un array.');
  return arr.map((q, i) => {
    const stem = q.stem || q.question || q.enunciado;
    if (!stem) throw new Error(`Item ${i + 1}: sin enunciado.`);
    const options = q.options || q.opciones;
    if (!Array.isArray(options)) throw new Error(`Item ${i + 1}: sin opciones.`);
    return { stem, options, correct_index: parseInt(q.correct_index ?? q.correcta ?? 0) || 0, explanation: q.explanation || q.explicacion || '' };
  });
}
function parseText(text) {
  return text.trim().split(/\n\s*\n/).filter(Boolean).map((block, bi) => {
    const lines = block.trim().split('\n').map((l) => l.trim()).filter(Boolean);
    const stem = lines[0]; const opts = []; let ci = 0; let explanation = '';
    for (let i = 1; i < lines.length; i++) {
      if (/^explicaci[oó]n[:\s]/i.test(lines[i])) { explanation = lines[i].replace(/^explicaci[oó]n[:\s]*/i, ''); continue; }
      const m = lines[i].match(/^[a-dA-D][).]\s*(.*?)(\s*\*)?$/);
      if (m) { if (m[2]) ci = opts.length; opts.push(m[1].trim()); }
    }
    if (!stem) throw new Error(`Bloque ${bi + 1}: sin enunciado.`);
    if (opts.length < 2) throw new Error(`Bloque ${bi + 1}: necesita 2+ opciones.`);
    return { stem, options: opts, correct_index: ci, explanation };
  });
}
function detectFormat(text) {
  const t = text.trimStart();
  if (t.startsWith('[') || t.startsWith('{')) return 'json';
  if (t.includes(',') && /^[^,\n]+,[^,\n]+,[^,\n]+/.test(t.split('\n')[0])) return 'csv';
  return 'texto';
}
function exportBancoCSV(questions) {
  const header = 'enunciado,opcion_a,opcion_b,opcion_c,opcion_d,correcta,explicacion,dificultad,categoria,programa,modulo';
  const rows = questions.map((q) => {
    const opts = q.options || [];
    return [q.stem, opts[0]||'', opts[1]||'', opts[2]||'', opts[3]||'',
      ['A','B','C','D'][q.correct_index ?? 0] || 'A',
      '', q.difficulty || '', q.category || '', q.programs?.title || '', q.modules?.title || '',
    ].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',');
  });
  const blob = new Blob([[header, ...rows].join('\n')], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob); const a = document.createElement('a');
  a.href = url; a.download = 'banco_preguntas.csv'; a.click(); URL.revokeObjectURL(url);
}

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
  const [importTab,  setImportTab]  = useState(false);
  const [importText, setImportText] = useState('');
  const [importError, setImportError] = useState('');
  const [importing,  setImporting]  = useState(false);
  const fileRef = useRef(null);

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

  async function handleImport() {
    setImportError(''); setImporting(true);
    try {
      const fmt = detectFormat(importText);
      const parsed = fmt === 'json' ? parseJSON(importText) : fmt === 'csv' ? parseCSV(importText) : parseText(importText);
      for (const p of parsed) {
        const { data: q, error } = await supabase.from('question_bank').insert({
          program_id: form.program_id || null, module_id: form.module_id || null,
          category: form.category || null, difficulty: form.difficulty,
          stem: p.stem, options: p.options,
        }).select('id').single();
        if (error) throw new Error(error.message);
        await supabase.from('question_bank_keys').insert({
          question_id: q.id, correct_index: p.correct_index, explanation: p.explanation || null,
        });
      }
      setImportText(''); setImportTab(false); loadQuestions();
    } catch (err) { setImportError(err.message); }
    finally { setImporting(false); }
  }

  function handleFileImport(e) {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setImportText(ev.target.result || '');
    reader.readAsText(file, 'utf-8'); e.target.value = '';
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Banco de preguntas</h1>
          <p className="mt-1 text-sm text-slate-500">Repositorio central de preguntas para quizzes aleatorios.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setImportTab((v) => !v)} className="btn-secondary">
            {importTab ? '✕ Cerrar' : '↑ Importar'}
          </button>
          <button onClick={() => exportBancoCSV(questions)} className="btn-secondary" disabled={!questions.length}>
            ↓ Exportar CSV
          </button>
          <button onClick={() => setOpen(!open)} className="btn-primary">
            {open ? '✕ Cerrar' : '+ Nueva pregunta'}
          </button>
        </div>
      </div>

      {importTab && (
        <div className="card mt-4 space-y-3 p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-[var(--text-1)]">Importar preguntas al banco</h2>
            <button type="button" onClick={() => fileRef.current?.click()} className="btn-secondary text-xs">
              Cargar archivo
            </button>
            <input ref={fileRef} type="file" accept=".csv,.json,.txt" onChange={handleFileImport} className="hidden" />
          </div>
          <p className="text-xs text-[var(--text-3)]">
            Acepta CSV (enunciado, opciones A-D, correcta, explicación), JSON o texto con * en la correcta.
            Las preguntas se asignarán al programa/módulo/dificultad actualmente seleccionados en los filtros.
          </p>
          <textarea className="input font-mono text-xs" rows={8}
            value={importText}
            onChange={(e) => { setImportText(e.target.value); setImportError(''); }}
            placeholder="Pega CSV, JSON o texto aquí…" />
          {importError && <p className="text-xs text-red-600">{importError}</p>}
          <button onClick={handleImport} disabled={importing || !importText.trim()} className="btn-primary text-sm">
            {importing ? 'Importando…' : 'Importar al banco'}
          </button>
        </div>
      )}

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
