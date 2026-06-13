'use client';
import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import nextDynamic from 'next/dynamic';
import { extractDriveId } from '@/lib/drive';

const RichTextEditor = nextDynamic(() => import('@/components/RichTextEditor'), { ssr: false });

const KINDS = [
  { value: 'texto', label: '📝 Texto enriquecido' },
  { value: 'video', label: '🎬 Video (Drive)' },
  { value: 'documento', label: '📄 Documento (Drive)' },
];

export default function LessonEditorPage() {
  const { id } = useParams();
  const router = useRouter();
  const supabase = createClient();

  const [lesson, setLesson] = useState(null);
  const [programId, setProgramId] = useState(null);
  const [form, setForm] = useState({ title: '', kind: 'texto', body: '', driveUrl: '', duration_min: '' });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const load = useCallback(async () => {
    const { data } = await supabase
      .from('lessons')
      .select('*, modules(id, program_id, programs(id, slug, title))')
      .eq('id', id)
      .single();
    if (!data) return;
    setLesson(data);
    setProgramId(data.modules?.program_id);
    setForm({
      title: data.title || '',
      kind: data.kind || 'texto',
      body: data.body || '',
      driveUrl: data.drive_file_id
        ? `https://drive.google.com/file/d/${data.drive_file_id}/view`
        : '',
      duration_min: data.duration_min || '',
    });
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function save(e) {
    e?.preventDefault();
    setSaving(true);
    const driveId = form.kind !== 'texto' ? extractDriveId(form.driveUrl) : null;
    const { error } = await supabase.from('lessons').update({
      title: form.title,
      kind: form.kind,
      body: form.kind === 'texto' ? form.body : null,
      drive_file_id: driveId,
      duration_min: form.duration_min ? parseInt(form.duration_min) : null,
    }).eq('id', id);

    setSaving(false);
    if (!error) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    }
  }

  if (!lesson) return <p className="text-sm text-slate-400">Cargando…</p>;

  const program = lesson.modules?.programs;

  return (
    <div className="mx-auto max-w-4xl">
      <Link
        href={programId ? `/admin/programa/${programId}` : '/admin'}
        className="text-sm text-brand-600 hover:underline"
      >
        ← {program?.title || 'Programa'}
      </Link>

      <div className="mt-1 flex items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-slate-900">Editar lección</h1>
        <div className="flex gap-2">
          <Link href={`/leccion/${id}`} target="_blank" className="btn-secondary text-sm">
            👁 Ver
          </Link>
          <button onClick={save} disabled={saving} className="btn-primary">
            {saving ? 'Guardando…' : saved ? '✓ Guardado' : 'Guardar'}
          </button>
        </div>
      </div>

      <form onSubmit={save} className="mt-5 space-y-5">
        {/* Título */}
        <div className="card p-4 space-y-4">
          <div>
            <label className="label">Título de la lección</label>
            <input className="input" value={form.title} onChange={set('title')} required />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Tipo de contenido</label>
              <select className="input" value={form.kind} onChange={set('kind')}>
                {KINDS.map((k) => <option key={k.value} value={k.value}>{k.label}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Duración estimada (minutos)</label>
              <input className="input" type="number" min="1" value={form.duration_min}
                onChange={set('duration_min')} placeholder="Ej: 20" />
            </div>
          </div>
        </div>

        {/* Contenido Drive */}
        {form.kind !== 'texto' && (
          <div className="card p-4">
            <label className="label">Enlace de Google Drive</label>
            <p className="mb-2 text-xs text-slate-500">
              Drive → Compartir → Cualquiera con el enlace → Lector → desactivar descarga → copiar enlace.
            </p>
            <input
              className="input font-mono text-xs"
              value={form.driveUrl}
              onChange={set('driveUrl')}
              placeholder="https://drive.google.com/file/d/…/view"
            />
            {form.driveUrl && !extractDriveId(form.driveUrl) && (
              <p className="mt-1 text-xs text-red-500">Enlace de Drive no reconocido.</p>
            )}
          </div>
        )}

        {/* Editor de texto enriquecido */}
        {form.kind === 'texto' && (
          <div>
            <label className="label">Contenido</label>
            <RichTextEditor
              content={form.body}
              onChange={(html) => setForm((f) => ({ ...f, body: html }))}
              placeholder="Escribe el contenido de la lección…"
            />
            <p className="mt-1 text-xs text-slate-400">
              Puedes usar encabezados, listas, colores y adjuntar imágenes con el botón 🖼.
            </p>
          </div>
        )}

        <div className="flex justify-end">
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? 'Guardando…' : saved ? '✓ Guardado' : 'Guardar cambios'}
          </button>
        </div>
      </form>
    </div>
  );
}
