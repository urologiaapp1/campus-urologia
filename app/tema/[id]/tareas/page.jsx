import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSessionProfile } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function TareasModuloPage({ params }) {
  const { user, supabase } = await getSessionProfile();
  if (!user) redirect('/login');

  const { data: module_ } = await supabase
    .from('modules')
    .select('id, title, programs(slug, title)')
    .eq('id', params.id)
    .single();

  if (!module_) redirect('/dashboard');

  const { data: assignments } = await supabase
    .from('assignments')
    .select('id, title, due_at, max_score, pass_score')
    .eq('module_id', params.id)
    .order('due_at', { ascending: true });

  // Entregas del alumno
  const assignmentIds = (assignments || []).map((a) => a.id);
  let submissionMap = {};
  if (assignmentIds.length) {
    const { data: subs } = await supabase
      .from('submissions')
      .select('id, assignment_id, submitted_at, submission_grades(points_awarded)')
      .eq('student_id', user.id)
      .in('assignment_id', assignmentIds);
    (subs || []).forEach((s) => {
      submissionMap[s.assignment_id] = s;
    });
  }

  const now = new Date();

  return (
    <div>
      <Link href={`/programa/${module_.programs?.slug}`} className="text-sm text-brand-600 hover:underline">
        ← {module_.programs?.title}
      </Link>
      <h1 className="mt-1 text-2xl font-bold text-slate-900">Tareas: {module_.title}</h1>

      <div className="card mt-6 divide-y divide-slate-100">
        {(assignments || []).map((a) => {
          const sub = submissionMap[a.id];
          const due = a.due_at ? new Date(a.due_at) : null;
          const overdue = due && now > due && !sub;
          const grades = sub?.submission_grades || [];
          const scored = grades.reduce((s, g) => s + (g.points_awarded || 0), 0);
          const isGraded = grades.length > 0;
          const passed = isGraded && scored >= a.pass_score;

          return (
            <Link key={a.id} href={`/tarea/${a.id}`}
              className="flex flex-wrap items-center justify-between gap-2 px-5 py-4 hover:bg-brand-50/40">
              <div>
                <p className="font-semibold text-slate-800">{a.title}</p>
                <p className="mt-0.5 text-xs text-slate-400">
                  {due && `Entrega: ${due.toLocaleDateString('es-CL')}`}
                  {overdue && <span className="ml-1 text-red-500 font-medium">· Vencida</span>}
                </p>
              </div>
              <div>
                {isGraded ? (
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                    {passed ? '✅ Aprobado' : '❌ Reprobado'} · {scored}/{a.max_score}
                  </span>
                ) : sub ? (
                  <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700">
                    ⏳ Entregado — pendiente calificación
                  </span>
                ) : (
                  <span className={`rounded-full px-3 py-1 text-xs font-medium ${overdue ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-500'}`}>
                    {overdue ? 'Vencida' : 'Pendiente'}
                  </span>
                )}
              </div>
            </Link>
          );
        })}
        {(assignments || []).length === 0 && (
          <p className="px-5 py-8 text-center text-sm text-slate-400">
            No hay tareas asignadas en este módulo.
          </p>
        )}
      </div>
    </div>
  );
}
