import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getSessionProfile } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import GradeSubmissionForm from './GradeSubmissionForm';

export const dynamic = 'force-dynamic';

export default async function TareaDetail({ params }) {
  const { profile } = await getSessionProfile();
  if (!profile || !['admin', 'editor'].includes(profile.role)) redirect('/dashboard');

  const admin = createAdminClient();

  const { data: assignment } = await admin
    .from('assignments')
    .select('id, title, instructions, due_at, max_score, pass_score, modules(title, programs(title))')
    .eq('id', params.id)
    .single();

  if (!assignment) redirect('/admin/tareas');

  const { data: rubric } = await admin
    .from('rubric_items')
    .select('id, label, max_points, position')
    .eq('assignment_id', params.id)
    .order('position');

  const { data: submissions } = await admin
    .from('submissions')
    .select(`
      id, submitted_at, comment, drive_file_id,
      profiles(full_name),
      submission_grades(id, points_awarded, feedback, rubric_item_id)
    `)
    .eq('assignment_id', params.id)
    .order('submitted_at');

  return (
    <div>
      <Link href="/admin/tareas" className="text-sm text-brand-600 hover:underline">← Tareas</Link>
      <h1 className="mt-2 text-2xl font-bold text-slate-900">{assignment.title}</h1>
      <p className="mt-1 text-sm text-slate-500">
        {assignment.modules?.programs?.title} › {assignment.modules?.title}
        {assignment.due_at && ` · Entrega ${new Date(assignment.due_at).toLocaleDateString('es-CL')}`}
        {' · '} Nota mín. {assignment.pass_score}/{assignment.max_score}
      </p>

      {assignment.instructions && (
        <div className="card mt-4 p-4 text-sm text-slate-600 whitespace-pre-wrap">
          {assignment.instructions}
        </div>
      )}

      <h2 className="mt-8 text-lg font-bold text-slate-800">
        Entregas ({(submissions || []).length})
      </h2>

      <div className="mt-3 space-y-4">
        {(submissions || []).map((sub) => {
          const totalGraded = (sub.submission_grades || []).reduce(
            (s, g) => s + (g.points_awarded || 0), 0
          );
          const isGraded = (sub.submission_grades || []).length > 0;
          const passed = isGraded && totalGraded >= assignment.pass_score;

          return (
            <div key={sub.id} className="card p-5">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="font-semibold text-slate-800">
                    {sub.profiles?.full_name || 'Estudiante'}
                  </p>
                  <p className="text-xs text-slate-400">
                    Entregado {new Date(sub.submitted_at).toLocaleString('es-CL')}
                  </p>
                </div>
                {isGraded ? (
                  <span className={`rounded-full px-3 py-1 text-sm font-bold ${
                    passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
                  }`}>
                    {totalGraded}/{assignment.max_score} — {passed ? 'Aprobado' : 'Reprobado'}
                  </span>
                ) : (
                  <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700">
                    Sin calificar
                  </span>
                )}
              </div>

              {sub.comment && (
                <p className="mt-3 rounded bg-slate-50 p-3 text-sm text-slate-600 italic">
                  "{sub.comment}"
                </p>
              )}

              {sub.drive_file_id && (
                <a
                  href={`https://drive.google.com/file/d/${sub.drive_file_id}/view`}
                  target="_blank" rel="noopener noreferrer"
                  className="mt-2 inline-block text-sm text-brand-600 hover:underline"
                >
                  📎 Ver archivo entregado
                </a>
              )}

              <GradeSubmissionForm
                submission={sub}
                rubric={rubric || []}
                maxScore={assignment.max_score}
                existingGrades={sub.submission_grades || []}
              />
            </div>
          );
        })}

        {(submissions || []).length === 0 && (
          <div className="card py-10 text-center text-sm text-slate-400">
            Aún no hay entregas para esta tarea.
          </div>
        )}
      </div>
    </div>
  );
}
