'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function GradeSubmissionForm({ submission, rubric, maxScore, existingGrades }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [grades, setGrades] = useState(() => {
    const init = {};
    rubric.forEach((item) => {
      const eg = existingGrades.find((g) => g.rubric_item_id === item.id);
      init[item.id] = { points: eg?.points_awarded ?? 0, feedback: eg?.feedback ?? '' };
    });
    return init;
  });
  const [saving, setSaving] = useState(false);

  const total = rubric.reduce((s, item) => s + (parseInt(grades[item.id]?.points) || 0), 0);

  async function save() {
    setSaving(true);
    const payload = {
      submission_id: submission.id,
      grades: rubric.map((item) => ({
        rubric_item_id: item.id,
        points_awarded: parseInt(grades[item.id]?.points) || 0,
        feedback: grades[item.id]?.feedback || null,
      })),
    };
    const res = await fetch('/api/assignments/grade', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) { alert('Error al guardar calificación'); }
    setSaving(false);
    setOpen(false);
    router.refresh();
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)}
        className="mt-3 text-sm text-brand-600 hover:underline">
        {existingGrades.length > 0 ? 'Editar calificación' : 'Calificar entrega'}
      </button>
    );
  }

  return (
    <div className="mt-4 rounded-lg border border-brand-200 bg-brand-50 p-4 space-y-3">
      <p className="text-sm font-semibold text-brand-800">Rúbrica de evaluación</p>
      {rubric.map((item) => (
        <div key={item.id} className="space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-600">
            <span>{item.label}</span>
            <span className="text-slate-400">máx. {item.max_points} pts</span>
          </div>
          <div className="flex gap-2">
            <input
              type="number" min="0" max={item.max_points}
              className="input w-20 text-sm"
              value={grades[item.id]?.points ?? 0}
              onChange={(e) => setGrades((prev) => ({
                ...prev,
                [item.id]: { ...prev[item.id], points: e.target.value }
              }))}
            />
            <input
              className="input flex-1 text-sm"
              placeholder="Retroalimentación (opcional)"
              value={grades[item.id]?.feedback ?? ''}
              onChange={(e) => setGrades((prev) => ({
                ...prev,
                [item.id]: { ...prev[item.id], feedback: e.target.value }
              }))}
            />
          </div>
        </div>
      ))}
      <div className="flex items-center justify-between pt-2">
        <p className="text-sm font-bold text-slate-700">
          Total: {total}/{maxScore} pts
        </p>
        <div className="flex gap-2">
          <button onClick={() => setOpen(false)} className="btn-secondary text-xs">Cancelar</button>
          <button onClick={save} className="btn-primary text-xs" disabled={saving}>
            {saving ? 'Guardando…' : 'Guardar calificación'}
          </button>
        </div>
      </div>
    </div>
  );
}
