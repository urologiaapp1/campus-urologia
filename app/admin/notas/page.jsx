'use client';
import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';

/**
 * Libro de notas: por programa, muestra avance, promedio de quizzes
 * (mejor intento por quiz) y participación de cada alumno matriculado.
 */
export default function Gradebook() {
  const supabase = createClient();
  const [programs, setPrograms] = useState([]);
  const [programId, setProgramId] = useState('');
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('programs').select('id, title').order('created_at');
      setPrograms(data || []);
      if (data?.length) setProgramId(data[0].id);
    })();
  }, []);

  const load = useCallback(async () => {
    if (!programId) return;
    setLoading(true);

    const [{ data: enrollments }, { data: modules }] = await Promise.all([
      supabase.from('enrollments')
        .select('user_id, profiles(full_name, specialty, country)')
        .eq('program_id', programId),
      supabase.from('modules')
        .select('id, lessons(id, quizzes(id))')
        .eq('program_id', programId),
    ]);

    const lessons = (modules || []).flatMap((m) => m.lessons || []);
    const lessonIds = lessons.map((l) => l.id);
    const quizIds = lessons.flatMap((l) => (l.quizzes || []).map((q) => q.id));
    const moduleIds = (modules || []).map((m) => m.id);
    const userIds = (enrollments || []).map((e) => e.user_id);

    let progress = [], attempts = [], topics = [];
    if (userIds.length) {
      if (lessonIds.length) {
        ({ data: progress } = await supabase.from('lesson_progress')
          .select('user_id, lesson_id').in('lesson_id', lessonIds).in('user_id', userIds));
      }
      if (quizIds.length) {
        ({ data: attempts } = await supabase.from('quiz_attempts')
          .select('user_id, quiz_id, score').in('quiz_id', quizIds).in('user_id', userIds));
      }
      if (moduleIds.length) {
        ({ data: topics } = await supabase.from('topics')
          .select('author_id').in('module_id', moduleIds));
      }
    }

    const result = (enrollments || []).map((e) => {
      const done = (progress || []).filter((p) => p.user_id === e.user_id).length;
      const pct = lessonIds.length ? Math.round((done / lessonIds.length) * 100) : 0;

      // mejor intento por quiz
      const best = {};
      (attempts || []).filter((a) => a.user_id === e.user_id).forEach((a) => {
        best[a.quiz_id] = Math.max(best[a.quiz_id] ?? 0, a.score);
      });
      const scores = Object.values(best);
      const avg = scores.length ? Math.round(scores.reduce((x, y) => x + y, 0) / scores.length) : null;

      const nTopics = (topics || []).filter((t) => t.author_id === e.user_id).length;

      return {
        userId: e.user_id,
        name: e.profiles?.full_name || '(sin nombre)',
        detail: [e.profiles?.specialty, e.profiles?.country].filter(Boolean).join(' · '),
        pct,
        quizzesTaken: scores.length,
        totalQuizzes: quizIds.length,
        avg,
        nTopics,
      };
    }).sort((a, b) => b.pct - a.pct);

    setRows(result);
    setLoading(false);
  }, [programId]);
  useEffect(() => { load(); }, [load]);

  return (
    <div>
      <h1 className="text-xl font-bold text-slate-900">Libro de notas</h1>

      <div className="mt-4 flex flex-wrap items-end gap-3">
        <div className="flex-1 min-w-48">
          <label className="label">Programa</label>
          <select className="input" value={programId} onChange={(e) => setProgramId(e.target.value)}>
            {programs.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
          </select>
        </div>
        {programId && (
          <a
            href={`/api/admin/export-notas?program_id=${programId}`}
            download
            className="btn-secondary flex items-center gap-1 text-sm"
          >
            ⬇ Exportar CSV
          </a>
        )}
      </div>

      <div className="card mt-6 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left">
              <th className="px-4 py-2 font-semibold text-slate-600">Alumno</th>
              <th className="px-4 py-2 font-semibold text-slate-600">Avance</th>
              <th className="px-4 py-2 font-semibold text-slate-600">Quizzes rendidos</th>
              <th className="px-4 py-2 font-semibold text-slate-600">Promedio</th>
              <th className="px-4 py-2 font-semibold text-slate-600">Tópicos creados</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((r) => (
              <tr key={r.userId}>
                <td className="px-4 py-2">
                  <p className="font-medium text-slate-800">{r.name}</p>
                  {r.detail && <p className="text-xs text-slate-400">{r.detail}</p>}
                </td>
                <td className="px-4 py-2">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-24 rounded-full bg-slate-100">
                      <div className="h-2 rounded-full bg-brand-500" style={{ width: `${r.pct}%` }} />
                    </div>
                    <span className="text-xs text-slate-500">{r.pct}%</span>
                  </div>
                </td>
                <td className="px-4 py-2 text-slate-600">{r.quizzesTaken}/{r.totalQuizzes}</td>
                <td className="px-4 py-2 font-semibold text-slate-700">
                  {r.avg !== null ? `${r.avg}%` : '—'}
                </td>
                <td className="px-4 py-2 text-slate-600">{r.nTopics}</td>
              </tr>
            ))}
            {rows.length === 0 && !loading && (
              <tr><td className="px-4 py-4 text-slate-400" colSpan={5}>Sin alumnos matriculados.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
