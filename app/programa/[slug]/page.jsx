import Link from 'next/link';
import { redirect, notFound } from 'next/navigation';
import { getSessionProfile } from '@/lib/supabase/server';
import CertificateButton from '@/components/CertificateButton';

export const dynamic = 'force-dynamic';

const KIND_ICON = { video: '▶', documento: '📄', texto: '✎' };

export default async function ProgramPage({ params }) {
  const { user, supabase } = await getSessionProfile();
  if (!user) redirect('/login');

  const { data: program } = await supabase
    .from('programs')
    .select('id, title, description, kind')
    .eq('slug', params.slug)
    .single();
  if (!program) notFound(); // RLS: solo visible si está matriculado o es staff

  const { data: modules } = await supabase
    .from('modules')
    .select('id, title, position, lessons(id, title, kind, duration_min, position), topics(id), assignments(id), live_sessions(id), flashcards(id)')
    .eq('program_id', program.id)
    .order('position');

  // Anuncios del programa (fijados primero, luego por fecha)
  const { data: announcements } = await supabase
    .from('announcements')
    .select('id, title, body, pinned, created_at')
    .eq('program_id', program.id)
    .order('pinned', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(3);

  const lessonIds = (modules || []).flatMap((m) => (m.lessons || []).map((l) => l.id));
  let completed = new Set();
  if (lessonIds.length) {
    const { data: prog } = await supabase
      .from('lesson_progress')
      .select('lesson_id')
      .eq('user_id', user.id)
      .in('lesson_id', lessonIds);
    completed = new Set((prog || []).map((r) => r.lesson_id));
  }

  const allDone = lessonIds.length > 0 && completed.size === lessonIds.length;
  let existingCert = null;
  if (allDone) {
    const { data: cert } = await supabase
      .from('certificates')
      .select('code')
      .eq('user_id', user.id)
      .eq('program_id', program.id)
      .maybeSingle();
    existingCert = cert?.code || null;
  }

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">{program.kind}</p>
      <h1 className="text-2xl font-bold text-slate-900">{program.title}</h1>
      <p className="mt-2 max-w-2xl text-sm text-slate-500">{program.description}</p>

      {/* Anuncios */}
      {(announcements || []).length > 0 && (
        <div className="mt-6 space-y-2">
          {(announcements || []).map((a) => (
            <div key={a.id} className={`rounded-xl border px-5 py-3 ${a.pinned ? 'border-amber-200 bg-amber-50' : 'border-slate-200 bg-slate-50'}`}>
              <div className="flex items-center gap-2">
                {a.pinned && <span className="text-amber-500">📌</span>}
                <p className="text-sm font-semibold text-slate-800">{a.title}</p>
                <span className="text-xs text-slate-400">{new Date(a.created_at).toLocaleDateString('es-CL')}</span>
              </div>
              <p className="mt-1 text-sm text-slate-600 line-clamp-2">{a.body}</p>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 space-y-6">
        {(modules || []).map((m, i) => (
          <div key={m.id} className="card overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 bg-slate-50 px-5 py-3">
              <h2 className="font-bold text-slate-800">
                Tema {i + 1}: {m.title}
              </h2>
              <div className="flex flex-wrap items-center gap-1.5">
                {(m.live_sessions || []).length > 0 && (
                  <Link href={`/tema/${m.id}/clases`}
                    className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700 hover:bg-green-500 hover:text-white">
                    🎥 Clases ({(m.live_sessions || []).length})
                  </Link>
                )}
                {(m.flashcards || []).length > 0 && (
                  <Link href={`/tema/${m.id}/flashcards`}
                    className="rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700 hover:bg-purple-500 hover:text-white">
                    🃏 Flashcards ({(m.flashcards || []).length})
                  </Link>
                )}
                {(m.assignments || []).length > 0 && (
                  <Link href={`/tema/${m.id}/tareas`}
                    className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700 hover:bg-amber-500 hover:text-white">
                    📝 Tareas ({(m.assignments || []).length})
                  </Link>
                )}
                <Link href={`/tema/${m.id}/topicos`}
                  className="rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold text-brand-700 hover:bg-brand-500 hover:text-white">
                  💬 Tópicos ({(m.topics || []).length})
                </Link>
              </div>
            </div>
            <ul className="divide-y divide-slate-100">
              {(m.lessons || [])
                .sort((a, b) => a.position - b.position)
                .map((l) => (
                  <li key={l.id}>
                    <Link
                      href={`/leccion/${l.id}`}
                      className="flex items-center justify-between px-5 py-3 hover:bg-brand-50/50"
                    >
                      <span className="flex items-center gap-3 text-sm">
                        <span className="text-brand-600">{KIND_ICON[l.kind] || '•'}</span>
                        <span className={completed.has(l.id) ? 'text-slate-400 line-through' : 'text-slate-700'}>
                          {l.title}
                        </span>
                      </span>
                      <span className="flex items-center gap-3 text-xs text-slate-400">
                        {l.duration_min ? `${l.duration_min} min` : ''}
                        {completed.has(l.id) && <span className="text-green-600">✓ completada</span>}
                      </span>
                    </Link>
                  </li>
                ))}
              {(!m.lessons || m.lessons.length === 0) && (
                <li className="px-5 py-3 text-sm text-slate-400">Sin contenidos aún.</li>
              )}
            </ul>
          </div>
        ))}
        {(!modules || modules.length === 0) && (
          <p className="text-sm text-slate-500">Este programa aún no tiene temas.</p>
        )}
      </div>

      {allDone && (
        <div className="card mt-8 flex flex-wrap items-center justify-between gap-3 border-brand-200 bg-brand-50/50 p-5">
          <div>
            <p className="font-bold text-brand-800">¡Completaste todas las lecciones!</p>
            <p className="text-sm text-slate-500">
              Si además aprobaste todas las evaluaciones, puedes obtener tu certificado verificable.
            </p>
          </div>
          <CertificateButton programId={program.id} existingCode={existingCert} />
        </div>
      )}
    </div>
  );
}
