'use client';
import { useState } from 'react';

/**
 * El alumno envía sus respuestas y la corrección ocurre EN EL SERVIDOR
 * (/api/quiz/grade). Las respuestas correctas nunca llegan al navegador.
 */
export default function QuizRunner({ quiz }) {
  const questions = [...(quiz.quiz_questions || [])].sort((a, b) => a.position - b.position);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (Object.keys(answers).length < questions.length) {
      alert('Responde todas las preguntas antes de enviar.');
      return;
    }
    setLoading(true);
    const res = await fetch('/api/quiz/grade', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quiz_id: quiz.id, answers }),
    });
    const json = await res.json();
    if (!res.ok) {
      alert('Error: ' + (json.error || 'no se pudo corregir'));
    } else {
      setResult(json);
    }
    setLoading(false);
  }

  if (questions.length === 0) return null;

  return (
    <div className="card p-6">
      {questions.map((q, qi) => (
        <div key={q.id} className={qi > 0 ? 'mt-6 border-t border-slate-100 pt-6' : ''}>
          <p className="font-semibold text-slate-800">
            {qi + 1}. {q.question}
          </p>
          <div className="mt-2 space-y-1">
            {(q.options || []).map((opt, oi) => (
              <label key={oi} className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-slate-50">
                <input
                  type="radio"
                  name={q.id}
                  checked={answers[q.id] === oi}
                  onChange={() => setAnswers({ ...answers, [q.id]: oi })}
                  disabled={!!result}
                />
                <span>{opt}</span>
              </label>
            ))}
          </div>
        </div>
      ))}

      <div className="mt-6 flex items-center gap-4">
        {!result ? (
          <button onClick={submit} disabled={loading} className="btn-primary">
            {loading ? 'Corrigiendo…' : 'Enviar respuestas'}
          </button>
        ) : (
          <div className={`rounded-lg px-4 py-3 text-sm font-semibold ${result.passed ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            Nota: {result.score}% ({result.correct}/{result.total} correctas) —{' '}
            {result.passed ? 'Aprobado ✓' : `No aprobado (mínimo ${result.pass_score}%)`}
          </div>
        )}
      </div>
    </div>
  );
}
