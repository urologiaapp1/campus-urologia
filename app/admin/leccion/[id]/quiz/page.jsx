'use client';
import { useEffect, useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

/* ── Parsers de importación masiva ─────────────────────────────── */

function parseCSV(text) {
  const lines = text.trim().split('\n').filter(Boolean);
  if (lines.length < 2) throw new Error('CSV vacío o sin datos.');
  const rows = lines.slice(1); // saltar cabecera
  return rows.map((line, i) => {
    // Respeta comillas dobles
    const cols = line.match(/(".*?"|[^,]+)(?=,|$)/g)?.map((c) => c.replace(/^"|"$/g, '').trim()) || [];
    if (cols.length < 5) throw new Error(`Fila ${i + 2}: faltan columnas (mínimo 5).`);
    const [stem, a, b, c, d, correcta, explanation] = cols;
    const opts = [a, b, c, d].filter(Boolean);
    const correctRaw = (correcta || '').toUpperCase().trim();
    let correct_index = parseInt(correctRaw);
    if (isNaN(correct_index)) correct_index = ['A','B','C','D'].indexOf(correctRaw);
    if (correct_index < 0 || correct_index >= opts.length) throw new Error(`Fila ${i + 2}: columna "correcta" inválida ("${correcta}").`);
    return { stem, options: opts, correct_index, explanation: explanation || '' };
  });
}

function parseJSON(text) {
  let arr;
  try { arr = JSON.parse(text); } catch { throw new Error('JSON inválido.'); }
  if (!Array.isArray(arr)) throw new Error('El JSON debe ser un array.');
  return arr.map((q, i) => {
    if (!q.stem && !q.question && !q.enunciado) throw new Error(`Item ${i + 1}: sin enunciado.`);
    if (!Array.isArray(q.options) && !Array.isArray(q.opciones)) throw new Error(`Item ${i + 1}: sin opciones.`);
    const stem    = q.stem || q.question || q.enunciado;
    const options = q.options || q.opciones;
    const ci      = q.correct_index ?? q.correcta ?? q.respuesta ?? 0;
    return { stem, options, correct_index: parseInt(ci) || 0, explanation: q.explanation || q.explicacion || '' };
  });
}

function parseText(text) {
  // Formato:
  // ¿Pregunta?
  // A) Opción A *      ← el * indica correcta
  // B) Opción B
  // Explicación: texto opcional
  // (línea vacía)
  const blocks = text.trim().split(/\n\s*\n/).filter(Boolean);
  return blocks.map((block, bi) => {
    const lines = block.trim().split('\n').map((l) => l.trim()).filter(Boolean);
    const stem = lines[0];
    const opts = [];
    let correct_index = 0;
    let explanation = '';
    for (let i = 1; i < lines.length; i++) {
      const l = lines[i];
      if (/^explicaci[oó]n[:\s]/i.test(l)) {
        explanation = l.replace(/^explicaci[oó]n[:\s]*/i, '').trim();
        continue;
      }
      const m = l.match(/^[a-dA-D][).]\s*(.*?)(\s*\*)?$/);
      if (m) {
        if (m[2]) correct_index = opts.length;
        opts.push(m[1].trim());
      }
    }
    if (!stem) throw new Error(`Bloque ${bi + 1}: sin enunciado.`);
    if (opts.length < 2) throw new Error(`Bloque ${bi + 1}: se necesitan al menos 2 opciones.`);
    return { stem, options: opts, correct_index, explanation };
  });
}

function detectFormat(text) {
  const t = text.trimStart();
  if (t.startsWith('[') || t.startsWith('{')) return 'json';
  if (t.includes(',') && /^[^,\n]+,[^,\n]+,[^,\n]+/.test(t.split('\n')[0])) return 'csv';
  return 'texto';
}

/* ── Exportar a CSV ─────────────────────────────────────────────── */
function exportCSV(questions, keys) {
  const header = 'enunciado,opcion_a,opcion_b,opcion_c,opcion_d,correcta,explicacion';
  const rows = questions.map((q) => {
    const ci = keys[q.id] ?? 0;
    const opts = q.options || [];
    const cells = [
      q.question,
      opts[0] || '', opts[1] || '', opts[2] || '', opts[3] || '',
      ['A','B','C','D'][ci] || '0',
      q.explanation || '',
    ].map((v) => `"${String(v).replace(/"/g, '""')}"`);
    return cells.join(',');
  });
  const blob = new Blob([[header, ...rows].join('\n')], { type: 'text/csv;charset=utf-8' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a'); a.href = url; a.download = 'quiz_preguntas.csv'; a.click();
  URL.revokeObjectURL(url);
}

function exportJSON(questions, keys) {
  const data = questions.map((q) => ({
    stem:          q.question,
    options:       q.options,
    correct_index: keys[q.id] ?? 0,
    explanation:   q.explanation || '',
  }));
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a'); a.href = url; a.download = 'quiz_preguntas.json'; a.click();
  URL.revokeObjectURL(url);
}

/* ── Página principal ───────────────────────────────────────────── */
export default function QuizEditor() {
  const { id: lessonId } = useParams();
  const router  = useRouter();
  const supabase = createClient();

  const [lesson,    setLesson]    = useState(null);
  const [quiz,      setQuiz]      = useState(null);
  const [questions, setQuestions] = useState([]);
  const [keys,      setKeys]      = useState({});
  const [form,      setForm]      = useState({ question: '', options: ['', '', '', ''], correct: 0, explanation: '' });

  // Import
  const [importText,   setImportText]   = useState('');
  const [importError,  setImportError]  = useState('');
  const [importing,    setImporting]    = useState(false);
  const [importTab,    setImportTab]    = useState(false);
  const fileRef = useRef(null);

  const load = useCallback(async () => {
    const { data: l } = await supabase.from('lessons').select('id, title, modules(program_id)').eq('id', lessonId).single();
    setLesson(l);
    const { data: q } = await supabase.from('quizzes').select('*').eq('lesson_id', lessonId).maybeSingle();
    setQuiz(q);
    if (q) {
      const { data: qs } = await supabase.from('quiz_questions').select('*').eq('quiz_id', q.id).order('position');
      setQuestions(qs || []);
      const ids = (qs || []).map((x) => x.id);
      if (ids.length) {
        const { data: ks } = await supabase.from('quiz_answer_keys').select('question_id, correct_index, explanation').in('question_id', ids);
        setKeys(Object.fromEntries((ks || []).map((k) => [k.question_id, k.correct_index])));
      } else { setKeys({}); }
    }
  }, [lessonId]);
  useEffect(() => { load(); }, [load]);

  async function createQuiz() {
    await supabase.from('quizzes').insert({ lesson_id: lessonId, max_attempts: 2 });
    load();
  }

  async function deleteQuiz() {
    if (!confirm('¿Eliminar el quiz completo con todas sus preguntas?')) return;
    await supabase.from('quizzes').delete().eq('id', quiz.id);
    router.back();
  }

  async function updateQuiz(field, value) {
    await supabase.from('quizzes').update({ [field]: parseInt(value) || null }).eq('id', quiz.id);
    setQuiz((prev) => ({ ...prev, [field]: parseInt(value) || null }));
  }

  async function addQuestion(e) {
    e.preventDefault();
    const options = form.options.filter((o) => o.trim());
    if (options.length < 2) { alert('Agrega al menos 2 alternativas.'); return; }
    if (form.correct >= options.length) { alert('La alternativa correcta está vacía.'); return; }
    const { data: inserted, error } = await supabase.from('quiz_questions').insert({
      quiz_id: quiz.id, question: form.question, options, position: questions.length,
    }).select('id').single();
    if (error) { alert('Error: ' + error.message); return; }
    await supabase.from('quiz_answer_keys').insert({
      question_id: inserted.id, correct_index: form.correct,
      explanation: form.explanation || null,
    });
    setForm({ question: '', options: ['', '', '', ''], correct: 0, explanation: '' });
    load();
  }

  async function removeQuestion(q) {
    await supabase.from('quiz_questions').delete().eq('id', q.id);
    load();
  }

  /* ── Importación masiva ───────────────────────────────────────── */
  async function handleImport() {
    setImportError('');
    setImporting(true);
    try {
      const fmt = detectFormat(importText);
      let parsed;
      if (fmt === 'json')  parsed = parseJSON(importText);
      else if (fmt === 'csv') parsed = parseCSV(importText);
      else parsed = parseText(importText);

      let pos = questions.length;
      for (const p of parsed) {
        const { data: inserted, error } = await supabase.from('quiz_questions').insert({
          quiz_id: quiz.id, question: p.stem, options: p.options, position: pos++,
        }).select('id').single();
        if (error) throw new Error(error.message);
        await supabase.from('quiz_answer_keys').insert({
          question_id: inserted.id, correct_index: p.correct_index,
          explanation: p.explanation || null,
        });
      }
      setImportText('');
      setImportTab(false);
      load();
    } catch (err) {
      setImportError(err.message);
    } finally {
      setImporting(false);
    }
  }

  function handleFileImport(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setImportText(ev.target.result || '');
    reader.readAsText(file, 'utf-8');
    e.target.value = '';
  }

  if (!lesson) return <p className="text-sm text-[var(--text-3)]">Cargando…</p>;

  return (
    <div>
      <Link href={`/admin/programa/${lesson.modules?.program_id}`} className="text-sm text-brand-600 hover:underline">
        ← Volver al programa
      </Link>
      <h1 className="mt-1 text-xl font-black tracking-tight text-[var(--text-1)]">Quiz: {lesson.title}</h1>

      {!quiz ? (
        <button onClick={createQuiz} className="btn-primary mt-4">Crear quiz para esta lección</button>
      ) : (
        <>
          {/* Configuración */}
          <div className="card mt-4 grid gap-4 p-5 sm:grid-cols-3">
            <div>
              <label className="label">Aprobación (%)</label>
              <input className="input" type="number" min={1} max={100}
                defaultValue={quiz.pass_score ?? 60}
                onBlur={(e) => updateQuiz('pass_score', e.target.value)} />
              <p className="mt-1 text-[11px] text-[var(--text-3)]">60% = nota 4.0</p>
            </div>
            <div>
              <label className="label">Máx. intentos</label>
              <input className="input" type="number" min={1} max={10}
                defaultValue={quiz.max_attempts ?? 2}
                onBlur={(e) => updateQuiz('max_attempts', e.target.value)} />
              <p className="mt-1 text-[11px] text-[var(--text-3)]">Al terminarlos se muestran las correctas</p>
            </div>
            <div>
              <label className="label">Preguntas por intento</label>
              <input className="input" type="number" min={1}
                defaultValue={quiz.questions_per_attempt || ''}
                placeholder={`Todas (${questions.length})`}
                onBlur={(e) => updateQuiz('questions_per_attempt', e.target.value || null)} />
              <p className="mt-1 text-[11px] text-[var(--text-3)]">Se eligen al azar del banco</p>
            </div>
          </div>

          {/* Acciones */}
          <div className="mt-4 flex flex-wrap gap-2">
            <button onClick={() => setImportTab((v) => !v)} className="btn-secondary text-sm">
              {importTab ? '✕ Cerrar importador' : '↑ Importar preguntas'}
            </button>
            <button onClick={() => exportCSV(questions, keys)} className="btn-secondary text-sm" disabled={!questions.length}>
              ↓ Exportar CSV
            </button>
            <button onClick={() => exportJSON(questions, keys)} className="btn-secondary text-sm" disabled={!questions.length}>
              ↓ Exportar JSON
            </button>
            <button onClick={deleteQuiz} className="btn-danger text-sm ml-auto">Eliminar quiz</button>
          </div>

          {/* Panel de importación */}
          {importTab && (
            <div className="card mt-4 space-y-3 p-5">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-[var(--text-1)]">Importación masiva de preguntas</h2>
                <button type="button" onClick={() => fileRef.current?.click()} className="btn-secondary text-xs">
                  Cargar archivo
                </button>
                <input ref={fileRef} type="file" accept=".csv,.json,.txt" onChange={handleFileImport} className="hidden" />
              </div>

              <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4 text-xs text-[var(--text-2)] space-y-2">
                <p className="font-semibold text-[var(--text-1)]">Formatos aceptados — se detectan automáticamente:</p>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div>
                    <p className="font-semibold">CSV</p>
                    <pre className="mt-1 text-[10px] leading-relaxed opacity-80">{`enunciado,opcion_a,opcion_b,opcion_c,opcion_d,correcta,explicacion
"¿Pregunta?","Opt A","Opt B","Opt C","Opt D","A","Porque..."`}</pre>
                    <p className="mt-1 opacity-70">correcta = A/B/C/D o 0/1/2/3</p>
                  </div>
                  <div>
                    <p className="font-semibold">JSON</p>
                    <pre className="mt-1 text-[10px] leading-relaxed opacity-80">{`[{
  "stem": "¿Pregunta?",
  "options": ["A","B","C","D"],
  "correct_index": 0,
  "explanation": "Porque..."
}]`}</pre>
                  </div>
                  <div>
                    <p className="font-semibold">Texto (con *)</p>
                    <pre className="mt-1 text-[10px] leading-relaxed opacity-80">{`¿Pregunta?
A) Opción correcta *
B) Opción B
C) Opción C
Explicación: Porque...

¿Siguiente pregunta?
...`}</pre>
                  </div>
                </div>
              </div>

              <textarea
                className="input font-mono text-xs"
                rows={10}
                value={importText}
                onChange={(e) => { setImportText(e.target.value); setImportError(''); }}
                placeholder="Pega aquí el contenido CSV, JSON o texto…"
              />
              {importError && (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700 dark:bg-red-900/20 dark:text-red-400">
                  {importError}
                </p>
              )}
              <div className="flex items-center gap-3">
                <button onClick={handleImport} disabled={importing || !importText.trim()} className="btn-primary text-sm">
                  {importing ? 'Importando…' : 'Importar preguntas'}
                </button>
                {!importing && importText && (
                  <p className="text-xs text-[var(--text-3)]">
                    Se detectará el formato automáticamente
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Lista de preguntas */}
          <div className="card mt-6 divide-y divide-[var(--border)]">
            <div className="flex items-center justify-between px-5 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-3)]">
                {questions.length} pregunta{questions.length !== 1 ? 's' : ''}
                {quiz.questions_per_attempt && questions.length > 0
                  ? ` · ${Math.min(quiz.questions_per_attempt, questions.length)} por intento (aleatorias)`
                  : ''}
              </p>
            </div>
            {questions.map((q, i) => (
              <div key={q.id} className="px-5 py-3">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-semibold text-[var(--text-1)]">{i + 1}. {q.question}</p>
                  <button onClick={() => removeQuestion(q)} className="shrink-0 text-xs text-red-500 hover:text-red-700">
                    Eliminar
                  </button>
                </div>
                <ul className="mt-1 space-y-0.5 text-sm">
                  {q.options.map((o, oi) => (
                    <li key={oi} className={`${oi === keys[q.id] ? 'font-semibold text-emerald-700 dark:text-emerald-400' : 'text-[var(--text-3)]'}`}>
                      {String.fromCharCode(65 + oi)}. {o} {oi === keys[q.id] && '✓'}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            {questions.length === 0 && (
              <p className="px-5 py-6 text-center text-sm text-[var(--text-3)]">Sin preguntas. Agrega una a mano o importa en bloque.</p>
            )}
          </div>

          {/* Formulario individual */}
          <form onSubmit={addQuestion} className="card mt-6 space-y-3 p-5">
            <h2 className="text-sm font-bold text-[var(--text-1)]">Agregar pregunta individual</h2>
            <div>
              <label className="label">Enunciado</label>
              <input className="input" value={form.question}
                onChange={(e) => setForm({ ...form, question: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <label className="label">Opciones (marca la correcta con el radio)</label>
              {form.options.map((o, oi) => (
                <div key={oi} className="flex items-center gap-2">
                  <input type="radio" name="correct" checked={form.correct === oi}
                    onChange={() => setForm({ ...form, correct: oi })}
                    className="accent-brand-600 shrink-0" />
                  <input className="input flex-1"
                    placeholder={`Opción ${String.fromCharCode(65 + oi)}`}
                    value={o}
                    onChange={(e) => {
                      const opts = [...form.options]; opts[oi] = e.target.value;
                      setForm({ ...form, options: opts });
                    }} />
                </div>
              ))}
            </div>
            <div>
              <label className="label">Explicación (opcional)</label>
              <input className="input" value={form.explanation}
                placeholder="Se muestra al alumno cuando agota los intentos"
                onChange={(e) => setForm({ ...form, explanation: e.target.value })} />
            </div>
            <button className="btn-primary">Agregar pregunta</button>
          </form>
        </>
      )}
    </div>
  );
}
