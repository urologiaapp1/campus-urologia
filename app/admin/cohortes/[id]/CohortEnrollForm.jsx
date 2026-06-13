'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function CohortEnrollForm({ cohortId, programId, available, isFull }) {
  const router = useRouter();
  const supabase = createClient();
  const [userId, setUserId] = useState('');
  const [saving, setSaving] = useState(false);

  if (isFull) {
    return <p className="card px-4 py-6 text-sm text-amber-700">⚠️ La cohorte está llena (cupo máximo alcanzado).</p>;
  }

  async function enroll(e) {
    e.preventDefault();
    if (!userId) return;
    setSaving(true);
    // Upsert enrollment: si ya existe el par (program_id, user_id) solo le asigna la cohorte
    const { data: existing } = await supabase
      .from('enrollments')
      .select('id')
      .eq('program_id', programId)
      .eq('user_id', userId)
      .maybeSingle();

    if (existing) {
      await supabase.from('enrollments').update({ cohort_id: cohortId }).eq('id', existing.id);
    } else {
      await supabase.from('enrollments').insert({ program_id: programId, user_id: userId, cohort_id: cohortId });
    }
    setSaving(false);
    setUserId('');
    router.refresh();
  }

  return (
    <form onSubmit={enroll} className="card space-y-3 p-4">
      {available.length === 0 ? (
        <p className="text-sm text-slate-400">Todos los estudiantes ya están matriculados en esta cohorte.</p>
      ) : (
        <>
          <select className="input" required value={userId}
            onChange={(e) => setUserId(e.target.value)}>
            <option value="">Seleccionar estudiante…</option>
            {available.map((p) => (
              <option key={p.id} value={p.id}>{p.full_name || p.id}</option>
            ))}
          </select>
          <button className="btn-primary w-full" disabled={saving}>
            {saving ? 'Matriculando…' : 'Matricular en esta cohorte'}
          </button>
        </>
      )}
    </form>
  );
}
