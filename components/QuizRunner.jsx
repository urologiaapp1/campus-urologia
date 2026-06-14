'use client';
import { useState, useMemo, useEffect } from 'react';

/* ── Nota chilena 1.0-7.0 ───────────────────────────────────────── */
function toGrade(pct, passScore = 60) {
  const s = Math.min(100, Math.max(0, pct));
  const g = s < passScore
    ? 1 + 3 * (s / passScore)
    : 4 + 3 * ((s - passScore) / (100 - passScore));
  return (Math.round(g * 10) / 10).toFixed(1);
}

function gradeColor(pct, passScore = 60) {
  if (pct >= passScore) return 'text-emerald-600 dark:text-emerald-400';
  if (pct >= passScore * 0.7) return 'text-amber-600 dark:text-amber-400';
  return 'text-red-600 dark:text-red-400';
}

/* ── Shuffle Fisher-Yates ────────────────────────────────────────── */
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* ── Panel de revisión de respuestas ────────────────────────────── */
function ReviewPanel({ review, passScore }) {
  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-brand-200 bg-brand-50 px-5 py-3 dark:border-brand-900/40 dark:bg-brand-900/20">
        <p className="text-sm font-semibold text-brand-800 dark:text-brand-300">
          Revisión de respuestas correctas
        </p>
        <p className="mt-0.5 text-xs text-brand-600 dark:text-brand-400">
          Agotaste tus intentos — aquí están las respuestas y explicaciones.
        </p>
      </div>
      {review.map((q, i) => (
        <div key={q.id} className="card p-5">
          <p className="font-semibold text-[var(--text-1)]">
            {i + 1}. {q.question}
          </p>
          <div className="mt-3 space-y-1.5">
            {(q.options || []).map((opt, oi) => {
              const isCorrect = oi === q.correct_index;
              const wasChosen = q.user_answer === oi;
              return (
                <div
                  key={oi}
                  className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm ${
                    isCorrect
                      ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300'
                      : wasChosen
                      ? 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300'
                      : 'text-[var(--text-2)]'
                  }`}
                >
                  <span className="shrink-0 text-base">
                    {isCorrect ? '✓' : wasChosen ? '✗' : '○'}
                  </span>
                  <span>{opt}</span>
                  {isCorrect && (
                    <span className="ml-auto text-[11px] font-semibold">Correcta</span>
                  )}
                  {wasChosen && !isCorrect && (
                    <span className="ml-auto text-[11px] font-semibold">Tu respuesta</span>
                  )}
                </div>
              );
            })}
          </div>
          {q.explanation && (
            <div className="mt-3 rounded-lg bg-[var(--surface-2)] px-3 py-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-3)]">Explicación</p>
              <p className="mt-1 text-sm text-[var(--text-2)]">{q.explanation}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/* ── Componente principal ────────────────────────────────────────── */
export default function QuizRunner({ quiz, attemptCount = 0, userId }) {
  const allQuestions = useMemo(
    () => [...(quiz.quiz_questions || [])].sort((a, b) => a.position - b.position),
    [quiz]
  );

  const maxAttempts        = quiz.max_attempts ?? 2;
  const questionsPerAttempt = quiz.questions_per_attempt
    ? Math.min(quiz.questions_per_attempt, allQuestions.length)
    : allQuestions.length;
  const passScore = quiz.pass_score ?? 60;

  // Selección aleatoria de preguntas para este intento
  const questions = useMemo(
    () => shuffle(allQuestions).slice(0, questionsPerAttempt),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [quiz.id] // recalcular solo si cambia el quiz, no entre renders
  );

  const [answers, setAnswers] = useState({});
  const [result, setResult]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [review, setReview]   = useState(null);

  const attemptsUsed = attemptCount + (result ? 1 : 0);
  const attemptsLeft = Math.max(0, maxAttempts - attemptsUsed);
  const exhausted    = attemptsUsed >= maxAttempts && !result;

  // Cargar revisión si ya agotó intentos antes de este render
  useEffect(() => {
    if (exhausted && !review) {
      fetch(`/api/quiz/review?quiz_id=${quiz.id}`)
        .then((r) => r.json())
        .then((d) => { if (d.review) setReview(d.review); })
        .catch(() => {});
    }
  }, [exhausted, quiz.id]);

  async function submit() {
    const unanswered = questions.filter((q) => answers[q.id] === undefined);
    if (unanswered.length > 0) {
      alert(`Faltan ${unanswered.length} pregunta${unanswered.length > 1 ? 's' : ''} por responder.`);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/quiz/grade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quiz_id: quiz.id, answers }),
      });
      const json = await res.json();
      if (!res.ok) {
        alert(json.error || 'Error al corregir');
      } else {
        setResult(json);
        if (json.review) setReview(json.review);
      }
    } finally {
      setLoading(false);
    }
  }

  if (allQuestions.length === 0) return null;

  /* ── Modo: intentos agotados sin nuevo resultado ─────────────── */
  if (exhausted) {
    return (
      <div className="space-y-4">
        <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 dark:border-red-900/40 dark:bg-red-900/20">
          <p className="font-semibold text-red-700 dark:text-red-400">Sin intentos disponibles</p>
          <p className="mt-1 text-sm text-red-600 dark:text-red-500">
            Usaste los {maxAttempts} intentos permitidos para este quiz.
          </p>
        </div>
        {review ? (
          <ReviewPanel review={review} passScore={passScore} />
        ) : (
          <p className="text-sm text-[var(--text-3)]">Cargando revisión…</p>
        )}
      </div>
    );
  }

  /* ── Resultado del intento actual ───────────────────────────── */
  if (result) {
    const colorClass = gradeColor(result.score, passScore);
    return (
      <div className="space-y-6">
        {/* Tarjeta de resultado */}
        <div className={`card p-6 ${result.passed ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-900/40 dark:bg-emerald-900/10' : 'border-red-200 bg-red-50 dark:border-red-900/40 dark:bg-red-900/10'}`}>
          <div className="flex flex-wrap items-center gap-6">
            <div className="text-center">
              <p className={`text-5xl font-black ${colorClass}`}>
                {toGrade(result.score, passScore)}
              </p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-[var(--text-3)]">Nota</p>
            </div>
            <div className="flex-1">
              <p className={`text-lg font-bold ${colorClass}`}>
                {result.passed ? '✓ Aprobado' : '✗ Reprobado'}
              </p>
              <p className="mt-1 text-sm text-[var(--text-2)]">
                {result.correct} de {result.total} correctas · {result.score}%
              </p>
              <p className="text-xs text-[var(--text-3)]">
                Exigencia: {passScore}% · Nota de aprobación: {toGrade(passScore, passScore)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-[var(--text-2)]">
                Intento {result.attempt_number}/{result.max_attempts}
              </p>
              {result.attempts_left > 0 && (
                <p className="text-xs text-[var(--text-3)]">
                  {result.attempts_left} intento{result.attempts_left > 1 ? 's' : ''} restante{result.attempts_left > 1 ? 's' : ''}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Revisión de respuestas (si es el último intento) */}
        {review && <ReviewPanel review={review} passScore={passScore} />}
      </div>
    );
  }

  /* ── Formulario de quiz ─────────────────────────────────────── */
  const answered = Object.keys(answers).length;

  return (
    <div>
      {/* Header del quiz */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          {questionsPerAttempt < allQuestions.length && (
            <p className="text-xs text-[var(--text-3)]">
              {questionsPerAttempt} preguntas aleatorias de un banco de {allQuestions.length}
            </p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <div className="flex gap-1">
            {Array.from({ length: maxAttempts }).map((_, i) => (
              <div
                key={i}
                className={`h-2 w-2 rounded-full ${i < attemptCount ? 'bg-red-400' : 'bg-[var(--border-2)]'}`}
                title={i < attemptCount ? 'Intento usado' : 'Intento disponible'}
              />
            ))}
          </div>
          <span className="text-xs text-[var(--text-3)]">
            {attemptsLeft} intento{attemptsLeft !== 1 ? 's' : ''} disponible{attemptsLeft !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Preguntas */}
      <div className="space-y-6">
        {questions.map((q, qi) => (
          <div key={q.id} className="card p-5">
            <p className="font-semibold text-[var(--text-1)]">
              {qi + 1}. {q.question}
            </p>
            <div className="mt-3 space-y-1.5">
              {(q.options || []).map((opt, oi) => (
                <label
                  key={oi}
                  className={`flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${
                    answers[q.id] === oi
                      ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300'
                      : 'text-[var(--text-2)] hover:bg-[var(--surface-2)]'
                  }`}
                >
                  <input
                    type="radio"
                    name={q.id}
                    checked={answers[q.id] === oi}
                    onChange={() => setAnswers({ ...answers, [q.id]: oi })}
                    className="accent-brand-600 shrink-0"
                  />
                  <span>{String.fromCharCode(65 + oi)}. {opt}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-[var(--text-3)]">
          {answered}/{questions.length} respondidas
        </p>
        <button
          onClick={submit}
          disabled={loading || answered < questions.length}
          className="btn-primary"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              Corrigiendo…
            </span>
          ) : 'Enviar respuestas'}
        </button>
      </div>
    </div>
  );
}
