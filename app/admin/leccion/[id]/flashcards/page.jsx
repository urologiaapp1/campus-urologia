'use client';
import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function AdminFlashcardsPage() {
  const { id: moduleId } = useParams();
  const supabase = createClient();
  const [cards, setCards] = useState([]);
  const [module_, setModule] = useState(null);
  const [form, setForm] = useState({ front: '', back: '', hint: '', difficulty: 'medium' });
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const { data: m } = await supabase.from('modules').select('id, title, program_id').eq('id', moduleId).single();
    setModule(m);
    const { data: fc } = await supabase
      .from('flashcards')
      .select('id, front, back, hint, difficulty, position')
      .eq('module_id', moduleId)
      .order('position');
    setCards(fc || []);
  }, [moduleId]);

  useEffect(() => { load(); }, [load]);

  async function addCard(e) {
    e.preventDefault();
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from('flashcards').insert({
      module_id: moduleId,
      front: form.front,
      back: form.back,
      hint: form.hint || null,
      difficulty: form.difficulty,
      position: cards.length,
      created_by: user.id,
    });
    if (error) alert('Error: ' + error.message);
    setForm({ front: '', back: '', hint: '', difficulty: 'medium' });
    setOpen(false);
    setSaving(false);
    load();
  }

  async function remove(id) {
    if (!confirm('¿Eliminar tarjeta?')) return;
    await supabase.from('flashcards').delete().eq('id', id);
    load();
  }

  const diffColors = { easy: 'text-green-600 bg-green-50', medium: 'text-amber-600 bg-amber-50', hard: 'text-red-600 bg-red-50' };
  const diffLabel = { easy: 'Fácil', medium: 'Media', hard: 'Difícil' };

  return (
    <div>
      <Link href={`/admin/programa/${module_?.program_id}`} className="text-sm text-brand-600 hover:underline">
        ← Contenido del programa
      </Link>
      <div className="mt-2 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Flashcards: {module_?.title}</h1>
        <button onClick={() => setOpen(!open)} className="btn-primary">
          {open ? '✕ Cerrar' : '+ Agregar tarjeta'}
        </button>
      </div>

      {open && (
        <form onSubmit={addCard} className="card mt-5 space-y-3 p-5">
          <div>
            <label className="label">Frente (pregunta / concepto)</label>
            <textarea className="input" rows={2} required value={form.front}
              onChange={(e) => setForm({ ...form, front: e.target.value })} />
          </div>
          <div>
            <label className="label">Reverso (respuesta / definición)</label>
            <textarea className="input" rows={3} required value={form.back}
              onChange={(e) => setForm({ ...form, back: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Pista (opcional)</label>
              <input className="input" value={form.hint}
                onChange={(e) => setForm({ ...form, hint: e.target.value })} />
            </div>
            <div>
              <label className="label">Dificultad</label>
              <select className="input" value={form.difficulty}
                onChange={(e) => setForm({ ...form, difficulty: e.target.value })}>
                <option value="easy">Fácil</option>
                <option value="medium">Media</option>
                <option value="hard">Difícil</option>
              </select>
            </div>
          </div>
          <button className="btn-primary" disabled={saving}>{saving ? 'Guardando…' : 'Agregar tarjeta'}</button>
        </form>
      )}

      <div className="card mt-6 divide-y divide-slate-100">
        {cards.map((c, i) => (
          <div key={c.id} className="flex items-start gap-4 px-5 py-3">
            <span className="shrink-0 text-xs text-slate-300 pt-1">{i + 1}</span>
            <div className="flex-1">
              <p className="text-sm font-semibold text-slate-800">{c.front}</p>
              <p className="mt-1 text-sm text-slate-500">{c.back}</p>
              {c.hint && <p className="mt-0.5 text-xs text-slate-400 italic">💡 {c.hint}</p>}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${diffColors[c.difficulty]}`}>
                {diffLabel[c.difficulty]}
              </span>
              <button onClick={() => remove(c.id)} className="text-xs text-red-400 hover:text-red-600">eliminar</button>
            </div>
          </div>
        ))}
        {cards.length === 0 && (
          <p className="px-5 py-8 text-center text-sm text-slate-400">No hay tarjetas. Agrega la primera.</p>
        )}
      </div>
    </div>
  );
}
