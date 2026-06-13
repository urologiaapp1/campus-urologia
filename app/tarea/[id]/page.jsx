'use client';
import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { extractDriveId } from '@/lib/drive';

export default function TareaPage() {
  const { id } = useParams();
  const supabase = createClient();
  const [me, setMe] = useState(null);
  const [assignment, setAssignment] = useState(null);
  const [rubric, setRubric] = useState([]);
  const [submission, setSubmission] = useState(null);
  const [grades, setGrades] = useState([]);
  const [form, setForm] = useState({ driveUrl: '', comment: '' });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setMe(user);

    const { data: asn } = await supabase
      .from('assignments')
      .select('id, title, instructions, due_at, max_score, pass_score, modules(id, title, programs(slug, title))')
      .eq('id', id)
      .single();
    setAssignment(asn);

    const { data: rub } = await supabase
      .from('rubric_items')
      .select('id, label, max_points, position')
      .eq('assignment_id', id)
      .order('position');
    setRubric(rub || []);

    if (user) {
      const { data: sub } = await supabase
        .from('submissions')
        .select('id, submitted_at, comment, drive_file_id')
        .eq('assignment_id', id)
        .eq('student_id', user.id)
        .maybeSingle();
      setSubmission(sub);

      if (sub) {
        const { data: g } = await supabase
          .from('submission_grades')
          .select('rubric_item_id, points_awarded, feedback')
          .eq('submission_id', sub.id);
        setGrades(g || []);
      }
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const now = new Date();
  const due = assignment?.due_at ? new Date(assignment.due_at) : null;
  const overdue = due && now > due;

  async function submit(e) {
    e.preventDefault();
    setSaving(true);
    const driveId = form.driveUrl ? extractDriveId(form.driveUrl) : null;
    if (form.driveUrl && !driveId) {
      alert('El enlace de Drive no es válido.');
      setSaving(false);
      return;
    }
    const payload = {
      assignment_id: id,
      student_id: me.id,
      drive_file_id: driveId,
      comment: form.comment || null,
    };
    const { error } = submission
      ? await supabase.from('submissions').update({ drive_file_id: driveId, comment: form.comment || null }).eq('id', submission.id)
      : await supabase.from('submissions').insert(payload);

    if (error) alert('Error: ' + error.message);
    setSaving(false);
    load();
  }

  if (!assignment) return <p className="text-sm text-slate-400">Cargando…</p>;

  const totalScore = grades.reduce((s, g) => s + (g.points_awarded || 0), 0);
  const passed = grades.length > 0 && totalScore >= assignment.pass_score;
  const isGraded = grades.length > 0;

  return (
    <div className="max-w-2xl">
      <Link href={`/programa/${assignment.modules?.programs?.slug}`}
        className="text-sm text-brand-600 hover:underline">
        ← {assignment.modules?.programs?.title}
      </Link>

      <h1 className="mt-2 text-2xl font-bold text-slate-900">{assignment.title}</h1>
      <p className="mt-1 text-sm text-slate-400">
        Módulo: {assignment.modules?.title}
        {due && (
          <span className={overdue ? ' · text-red-500 font-medium' : ''}>
            {' '}· Entrega: {due.toLocaleDateString('es-CL')}
            {overdue && ' (vencida)'}
          </span>
        )}
      </p>

      {assignment.instructions && (
        <div className="card mt-4 p-4 text-sm text-slate-600 whitespace-pre-wrap leading-relaxed">
          <p className="mb-2 font-semibold text-slate-700">Instrucciones</p>
          {assignment.instructions}
        </div>
      )}

      {rubric.length > 0 && (
        <div className="card mt-4 p-4">
          <p className="mb-3 font-semibold text-slate-700 text-sm">Rúbrica de evaluación</p>
          <div className="divide-y divide-slate-100">
            {rubric.map((item) => {
              const grade = grades.find((g) => g.rubric_item_id === item.id);
              return (
                <div key={item.id} className="py-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-700">{item.label}</span>
                    <span className="text-slate-400 tabular-nums">
                      {isGraded
                        ? <b className={grade?.points_awarded > 0 ? 'text-brand-700' : 'text-slate-400'}>{grade?.points_awarded ?? 0}</b>
                        : '–'
                      }
                      /{item.max_points} pts
                    </span>
                  </div>
                  {grade?.feedback && (
                    <p className="mt-1 text-xs text-slate-400 italic">{grade.feedback}</p>
                  )}
                </div>
              );
            })}
          </div>
          {isGraded && (
            <div className={`mt-3 rounded-lg p-3 text-center text-sm font-bold ${passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
              {passed ? '✅ Aprobado' : '❌ Reprobado'} — {totalScore}/{assignment.max_score} puntos
            </div>
          )}
        </div>
      )}

      {/* Entrega */}
      <div className="card mt-6 p-5">
        <h2 className="font-semibold text-slate-800">
          {submission ? 'Tu entrega' : 'Entregar tarea'}
        </h2>

        {submission && (
          <p className="mt-1 text-xs text-slate-400">
            Entregado el {new Date(submission.submitted_at).toLocaleString('es-CL')}
            {isGraded ? '' : ' · Pendiente de calificación'}
          </p>
        )}

        <form onSubmit={submit} className="mt-4 space-y-3">
          <div>
            <label className="label">Enlace de Google Drive (archivo o carpeta)</label>
            <input className="input" value={form.driveUrl}
              defaultValue={submission?.drive_file_id
                ? `https://drive.google.com/file/d/${submission.drive_file_id}/view`
                : ''}
              onChange={(e) => setForm({ ...form, driveUrl: e.target.value })}
              placeholder="https://drive.google.com/file/d/XXXXX/view" />
            <p className="mt-1 text-xs text-slate-400">
              Comparte el archivo con tu docente antes de entregar.
            </p>
          </div>
          <div>
            <label className="label">Comentario para el docente (opcional)</label>
            <textarea className="input" rows={3} value={form.comment}
              defaultValue={submission?.comment || ''}
              onChange={(e) => setForm({ ...form, comment: e.target.value })} />
          </div>
          <button className="btn-primary" disabled={saving || (overdue && !submission)}>
            {saving ? 'Guardando…' : submission ? 'Actualizar entrega' : 'Entregar'}
          </button>
          {overdue && !submission && (
            <p className="text-xs text-red-500">El plazo de entrega ha vencido.</p>
          )}
        </form>
      </div>
    </div>
  );
}
