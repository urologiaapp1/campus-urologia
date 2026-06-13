'use client';
import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function QuizEditor() {
  const { id: lessonId } = useParams();
  const router = useRouter();
  const supabase = createClient();
  const [lesson, setLesson] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [keys, setKeys] = useState({});
  const [form, setForm] = useState({ question: '', options: ['', '', '', ''], correct: 0 });

  const load = useCallback(async () => {
    const { data: l } = await supabase
      .from('lessons')
      .select('id, title, modules(program_id)')
      .eq('id', lessonId)
      .single();
    setLesson(l);
    const { data: q } = await supabase.from('quizzes').select('*').eq('lesson_id', lessonId).maybeSingle();
    setQuiz(q);
    if (q) {
      const { data: qs } = await supabase
        .from('quiz_questions').select('*').eq('quiz_id', q.id).order('position');
      setQuestions(qs || []);
      const ids = (qs || []).map((x) => x.id);
      if (ids.length) {
        const { data: ks } = await supabase
          .from('quiz_answer_keys').select('question_id, correct_index').in('question_id', ids);
        setKeys(Object.fromEntries((ks || []).map((k) => [k.question_id, k.correct_index])));
      } else {
        setKeys({});
      }
    }
  }, [lessonId]);
  useEffect(() => { load(); }, [load]);

  async function createQuiz() {
    await supabase.from('quizzes').insert({ lesson_id: lessonId });
    load();
  }

  async function deleteQuiz() {
    if (!confirm('¿Eliminar el quiz completo?')) return;
    await supabase.from('quizzes').delete().eq('id', quiz.id);
    router.back();
  }

  async function updatePassScore(v) {
    await supabase.from('quizzes').update({ pass_score: parseInt(v) || 60 }).eq('id', quiz.id);
  }

  async function addQuestion(e) {
    e.preventDefault();
    const options = form.options.filter((o) => o.trim());
    if (options.length < 2) { alert('Agrega al menos 2 alternativas.'); return; }
    if (form.correct >= options.length) { alert('La alternativa correcta está vacía.'); return; }
    const { data: inserted, error } = await supabase.from('quiz_questions').insert({
      quiz_id: quiz.id,
      question: form.question,
      options,
      position: questions.length,
    }).select('id').single();
    if (error) { alert('Error: ' + error.message); return; }
    await supabase.from('quiz_answer_keys').insert({
      question_id: inserted.id,
      correct_index: form.correct,
    });
    setForm({ question: '', options: ['', '', '', ''], correct: 0 });
    load();
  }

  async function removeQuestion(q) {
    await supabase.from('quiz_questions').delete().eq('id', q.id);
    load();
  }

  if (!lesson) return <p className="text-sm text-slate-400">Cargando…</p>;

  return (
    <div>
      <Link href={`/admin/programa/${lesson.modules?.program_id}`} className="text-sm text-brand-600 hover:underline">
        ← Volver al programa
      </Link>
      <h1 className="mt-1 text-xl font-bold text-slate-900">Quiz: {lesson.title}</h1>

      {!quiz ? (
        <button onClick={createQuiz} className="btn-primary mt-4">Crear quiz para esta lección</button>
      ) : (
        <>
          <div className="card mt-4 flex items-end gap-3 p-4">
            <div className="w-40">
              <label className="label">Nota de aprobación (%)</label>
              <input className="input" type="number" defaultValue={quiz.pass_score}
                onBlur={(e) => updatePassScore(e.target.value)} />
            </div>
            <button onClick={deleteQuiz} className="btn-danger">Eliminar quiz</button>
          </div>

          <div className="card mt-6 divide-y divide-slate-100">
            {questions.map((q, i) => (
              <div key={q.id} className="px-5 py-3">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-semibold text-slate-800">{i + 1}. {q.question}</p>
                  <button onClick={() => removeQuestion(q)} className="btn-danger">Eliminar</button>
                </div>
                <ul className="mt-1 space-y-0.5 text-sm text-slate-500">
                  {q.options.map((o, oi) => (
                    <li key={oi} className={oi === keys[q.id] ? 'font-semibold text-green-700' : ''}>
                      {String.fromCharCode(97 + oi)}) {o} {oi === keys[q.id] && '✓'}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            {questions.length === 0 && (
              <p className="px-5 py-4 text-sm text-slate-400">Sin preguntas aún.</p>
            )}
          </div>

          <form onSubmit={addQuestion} className="card mt-6 space-y-3 p-4">
            <div>
              <label className="label">Nueva pregunta</label>
              <input className="input" value={form.question}
                onChange={(e) => setForm({ ...form, question: e.target.value })} required />
            </div>
            {form.options.map((o, oi) => (
              <div key={oi} className="flex items-center gap-2">
                <input type="radio" name="correct" checked={form.correct === oi}
                  onChange={() => setForm({ ...form, correct: oi })}
                  title="Marcar como correcta" />
                <input className="input" placeholder={`Alternativa ${String.fromCharCode(97 + oi)})`}
                  value={o}
                  onChange={(e) => {
                    const options = [...form.options];
                    options[oi] = e.target.value;
                    setForm({ ...form, options });
                  }} />
              </div>
            ))}
            <p className="text-xs text-slate-400">Selecciona el círculo de la alternativa correcta.</p>
            <button className="btn-primary">Agregar pregunta</button>
          </form>
        </>
      )}
    </div>
  );
}
