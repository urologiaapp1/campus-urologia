'use client';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

/**
 * Modal de encuesta NPS que aparece al obtener certificado.
 * Solo se muestra si el usuario no respondió aún.
 * Se cierra sin responder (no bloquea el certificado).
 */
export default function NpsModal({ programId, onClose }) {
  const supabase = createClient();
  const [score, setScore] = useState(null);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);

  async function submit() {
    if (score === null) return;
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('program_surveys').upsert({
      program_id: programId,
      user_id: user.id,
      nps_score: score,
      comment: comment || null,
    });
    setSubmitted(true);
    setSaving(false);
    setTimeout(onClose, 2000);
  }

  const npsLabel = score === null ? '' :
    score <= 6 ? '😕 Poco probable' :
    score <= 8 ? '😐 Neutral' : '😊 Muy probable';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        {submitted ? (
          <div className="text-center py-4">
            <p className="text-4xl mb-3">🙏</p>
            <p className="text-lg font-bold text-slate-800">¡Gracias por tu opinión!</p>
            <p className="mt-1 text-sm text-slate-500">Tu retroalimentación nos ayuda a mejorar.</p>
          </div>
        ) : (
          <>
            <h2 className="text-lg font-bold text-slate-900">¿Recomendarías este programa?</h2>
            <p className="mt-1 text-sm text-slate-500">
              En una escala del 0 al 10, ¿cuán probable es que recomiendes este programa a un colega?
            </p>

            {/* Escala NPS */}
            <div className="mt-5 flex gap-1">
              {Array.from({ length: 11 }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setScore(i)}
                  className={`flex-1 rounded-lg py-2 text-sm font-bold transition ${
                    score === i
                      ? i <= 6 ? 'bg-red-500 text-white' : i <= 8 ? 'bg-amber-500 text-white' : 'bg-green-500 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {i}
                </button>
              ))}
            </div>
            <div className="mt-1 flex justify-between text-xs text-slate-400">
              <span>Nada probable</span>
              {score !== null && <span className="font-medium text-slate-600">{npsLabel}</span>}
              <span>Muy probable</span>
            </div>

            <div className="mt-4">
              <label className="label">Comentario (opcional)</label>
              <textarea className="input" rows={3} value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="¿Qué mejorarías? ¿Qué fue lo mejor?" />
            </div>

            <div className="mt-4 flex gap-3">
              <button
                onClick={submit}
                disabled={score === null || saving}
                className="btn-primary flex-1"
              >
                {saving ? 'Enviando…' : 'Enviar opinión'}
              </button>
              <button onClick={onClose} className="btn-secondary">Ahora no</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
