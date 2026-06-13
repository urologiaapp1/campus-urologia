'use client';
import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { extractDriveId } from '@/lib/drive';
import StarRating from '@/components/StarRating';

export default function ModuleTopics() {
  const { id: moduleId } = useParams();
  const supabase = createClient();
  const [module_, setModule] = useState(null);
  const [topics, setTopics] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: '', body: '', driveUrl: '', driveKind: 'video' });
  const [anonimizado, setAnonimizado] = useState(false);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    const { data: m } = await supabase
      .from('modules')
      .select('id, title, programs(slug, title)')
      .eq('id', moduleId)
      .single();
    setModule(m);
    const { data: t } = await supabase
      .from('topics')
      .select('id, title, created_at, drive_file_id, profiles(full_name), topic_ratings(stars), topic_comments(id)')
      .eq('module_id', moduleId)
      .order('created_at', { ascending: false });
    setTopics(t || []);
  }, [moduleId]);
  useEffect(() => { load(); }, [load]);

  async function createTopic(e) {
    e.preventDefault();
    if (!anonimizado) {
      alert('Debes confirmar que el caso está completamente anonimizado.');
      return;
    }
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    const driveId = form.driveUrl ? extractDriveId(form.driveUrl) : null;
    if (form.driveUrl && !driveId) {
      alert('El enlace de Drive no es válido.');
      setLoading(false);
      return;
    }
    const { error } = await supabase.from('topics').insert({
      module_id: moduleId,
      author_id: user.id,
      title: form.title,
      body: form.body,
      drive_file_id: driveId,
      drive_kind: driveId ? form.driveKind : null,
    });
    if (error) alert('Error: ' + error.message);
    setForm({ title: '', body: '', driveUrl: '', driveKind: 'video' });
    setOpen(false);
    setLoading(false);
    load();
  }

  const avg = (t) => {
    const r = t.topic_ratings || [];
    return r.length ? r.reduce((a, b) => a + b.stars, 0) / r.length : 0;
  };

  if (!module_) return <p className="text-sm text-slate-400">Cargando…</p>;

  return (
    <div>
      <Link href={`/programa/${module_.programs?.slug}`} className="text-sm text-brand-600 hover:underline">
        ← {module_.programs?.title}
      </Link>
      <h1 className="mt-1 text-2xl font-bold text-slate-900">Tópicos: {module_.title}</h1>
      <p className="mt-1 text-sm text-slate-500">
        Subtemas creados por la comunidad. Cualquier participante puede aportar, opinar y calificar.
      </p>

      <div className="mt-5">
        {!open ? (
          <button onClick={() => setOpen(true)} className="btn-primary">+ Crear tópico</button>
        ) : (
          <form onSubmit={createTopic} className="card space-y-3 p-5">
            <div>
              <label className="label">Título del tópico</label>
              <input className="input" value={form.title} required
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Ej: Uretroplastia con injerto bucal dorsal: caso y técnica" />
            </div>
            <div>
              <label className="label">Desarrollo / presentación del caso</label>
              <textarea className="input" rows={5} value={form.body} required
                onChange={(e) => setForm({ ...form, body: e.target.value })} />
            </div>
            <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
              <div>
                <label className="label">Adjunto de Google Drive (opcional: video o documento)</label>
                <input className="input" value={form.driveUrl}
                  onChange={(e) => setForm({ ...form, driveUrl: e.target.value })}
                  placeholder="https://drive.google.com/file/d/XXXXX/view" />
              </div>
              <div>
                <label className="label">Tipo</label>
                <select className="input" value={form.driveKind}
                  onChange={(e) => setForm({ ...form, driveKind: e.target.value })}>
                  <option value="video">Video</option>
                  <option value="documento">Documento</option>
                </select>
              </div>
            </div>
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
              <p className="font-bold">⚕️ Confidencialidad del paciente — verifica antes de publicar:</p>
              <ul className="mt-1 list-disc pl-4">
                <li>Sin nombre, iniciales identificables, RUT/DNI ni fecha de nacimiento exacta.</li>
                <li>Imágenes y videos sin datos del paciente visibles (recortar encabezados del PACS/ficha).</li>
                <li>Sin rostros ni tatuajes/señas identificatorias.</li>
                <li>El paciente autorizó el uso docente del material cuando corresponda.</li>
              </ul>
              <label className="mt-2 flex cursor-pointer items-center gap-2 font-semibold">
                <input type="checkbox" checked={anonimizado}
                  onChange={(e) => setAnonimizado(e.target.checked)} required />
                Confirmo que el caso está completamente anonimizado
              </label>
            </div>
            <div className="flex gap-3">
              <button className="btn-primary" disabled={loading}>Publicar</button>
              <button type="button" onClick={() => setOpen(false)} className="btn-secondary">Cancelar</button>
            </div>
          </form>
        )}
      </div>

      <div className="card mt-6 divide-y divide-slate-100">
        {topics.map((t) => (
          <Link key={t.id} href={`/topico/${t.id}`}
            className="flex flex-wrap items-center justify-between gap-2 px-5 py-3 hover:bg-brand-50/50">
            <div>
              <p className="font-semibold text-slate-800">
                {t.drive_file_id && <span className="mr-1 text-brand-600">📎</span>}
                {t.title}
              </p>
              <p className="text-xs text-slate-400">
                por {t.profiles?.full_name || 'participante'} · {new Date(t.created_at).toLocaleDateString('es-CL')}
                {' · '}{(t.topic_comments || []).length} comentario{(t.topic_comments || []).length !== 1 && 's'}
              </p>
            </div>
            <StarRating value={avg(t)} count={(t.topic_ratings || []).length} />
          </Link>
        ))}
        {topics.length === 0 && (
          <p className="px-5 py-6 text-sm text-slate-400">
            Aún no hay tópicos en este tema. ¡Sé el primero en crear uno!
          </p>
        )}
      </div>
    </div>
  );
}
