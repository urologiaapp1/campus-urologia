'use client';
import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function FlashcardsPage() {
  const { id: moduleId } = useParams();
  const supabase = createClient();
  const [module_, setModule] = useState(null);
  const [cards, setCards] = useState([]);
  const [progress, setProgress] = useState({}); // flashcard_id → { mastered }
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [mode, setMode] = useState('all'); // 'all' | 'pending'
  const [me, setMe] = useState(null);

  const load = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setMe(user);

    const { data: m } = await supabase
      .from('modules')
      .select('id, title, programs(slug, title)')
      .eq('id', moduleId)
      .single();
    setModule(m);

    const { data: fc } = await supabase
      .from('flashcards')
      .select('id, front, back, hint, difficulty')
      .eq('module_id', moduleId)
      .order('position');
    setCards(fc || []);

    if (user && fc?.length) {
      const { data: prog } = await supabase
        .from('flashcard_progress')
        .select('flashcard_id, mastered')
        .eq('user_id', user.id)
        .in('flashcard_id', fc.map((c) => c.id));
      const map = {};
      (prog || []).forEach((p) => { map[p.flashcard_id] = p; });
      setProgress(map);
    }
  }, [moduleId]);

  useEffect(() => { load(); }, [load]);

  const visibleCards = mode === 'pending'
    ? cards.filter((c) => !progress[c.id]?.mastered)
    : cards;

  const current = visibleCards[idx];

  async function toggleMastered() {
    if (!current || !me) return;
    const isMastered = !!progress[current.id]?.mastered;
    await supabase.from('flashcard_progress').upsert({
      flashcard_id: current.id,
      user_id: me.id,
      mastered: !isMastered,
      last_seen: new Date().toISOString(),
    });
    setProgress((prev) => ({
      ...prev,
      [current.id]: { ...prev[current.id], mastered: !isMastered }
    }));
  }

  function next() {
    setFlipped(false);
    setTimeout(() => setIdx((i) => Math.min(i + 1, visibleCards.length - 1)), 150);
  }

  function prev() {
    setFlipped(false);
    setTimeout(() => setIdx((i) => Math.max(i - 1, 0)), 150);
  }

  const masteredCount = cards.filter((c) => progress[c.id]?.mastered).length;
  const diffColor = { easy: 'text-green-600', medium: 'text-amber-600', hard: 'text-red-600' };

  if (!module_) return <p className="text-sm text-slate-400">Cargando…</p>;

  return (
    <div className="max-w-2xl">
      <Link href={`/programa/${module_.programs?.slug}`} className="text-sm text-brand-600 hover:underline">
        ← {module_.programs?.title}
      </Link>
      <div className="mt-2 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Flashcards: {module_.title}</h1>
        <span className="text-sm text-slate-400">{masteredCount}/{cards.length} dominadas</span>
      </div>

      {cards.length === 0 ? (
        <div className="card mt-6 py-12 text-center text-slate-400">
          No hay flashcards en este módulo aún.
        </div>
      ) : (
        <>
          {/* Progreso */}
          <div className="mt-3 h-2 w-full rounded-full bg-slate-100">
            <div
              className="h-2 rounded-full bg-brand-500 transition-all"
              style={{ width: `${cards.length ? (masteredCount / cards.length) * 100 : 0}%` }}
            />
          </div>

          {/* Filtro */}
          <div className="mt-4 flex gap-2">
            {['all', 'pending'].map((m) => (
              <button key={m} onClick={() => { setMode(m); setIdx(0); setFlipped(false); }}
                className={`rounded-full px-3 py-1 text-sm font-medium transition ${
                  mode === m ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-brand-100'
                }`}>
                {m === 'all' ? `Todas (${cards.length})` : `Pendientes (${cards.filter((c) => !progress[c.id]?.mastered).length})`}
              </button>
            ))}
          </div>

          {visibleCards.length === 0 ? (
            <div className="card mt-6 py-12 text-center">
              <p className="text-2xl">🎉</p>
              <p className="mt-2 font-bold text-slate-700">¡Dominaste todas las tarjetas!</p>
              <button onClick={() => { setMode('all'); setIdx(0); }} className="btn-secondary mt-4">
                Repasar todas
              </button>
            </div>
          ) : (
            <>
              {/* Tarjeta */}
              <div
                className="card mt-4 cursor-pointer select-none"
                style={{ minHeight: '220px' }}
                onClick={() => setFlipped((f) => !f)}
              >
                <div className="flex h-full flex-col items-center justify-center p-8 text-center">
                  {!flipped ? (
                    <>
                      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-brand-400">
                        {current?.difficulty && (
                          <span className={diffColor[current.difficulty]}>
                            {current.difficulty === 'easy' ? 'Fácil' : current.difficulty === 'medium' ? 'Media' : 'Difícil'}
                            {' · '}
                          </span>
                        )}
                        Pregunta {idx + 1}/{visibleCards.length}
                      </p>
                      <p className="text-xl font-semibold text-slate-800">{current?.front}</p>
                      {current?.hint && (
                        <p className="mt-3 text-xs text-slate-400 italic">💡 Pista: {current.hint}</p>
                      )}
                      <p className="mt-6 text-xs text-slate-300">Toca para ver la respuesta</p>
                    </>
                  ) : (
                    <>
                      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-green-500">Respuesta</p>
                      <p className="text-lg text-slate-700 leading-relaxed">{current?.back}</p>
                    </>
                  )}
                </div>
              </div>

              {/* Controles */}
              <div className="mt-4 flex items-center justify-between gap-3">
                <button onClick={prev} disabled={idx === 0} className="btn-secondary disabled:opacity-40">← Anterior</button>

                <button
                  onClick={toggleMastered}
                  className={`flex-1 rounded-lg py-2 text-sm font-semibold transition ${
                    progress[current?.id]?.mastered
                      ? 'bg-green-100 text-green-700 hover:bg-red-50 hover:text-red-600'
                      : 'bg-slate-100 text-slate-600 hover:bg-green-100 hover:text-green-700'
                  }`}
                >
                  {progress[current?.id]?.mastered ? '✅ Dominada · marcar pendiente' : 'Marcar como dominada'}
                </button>

                <button onClick={next} disabled={idx >= visibleCards.length - 1} className="btn-secondary disabled:opacity-40">Siguiente →</button>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
