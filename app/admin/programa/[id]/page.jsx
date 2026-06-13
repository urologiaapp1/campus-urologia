'use client';
import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { extractDriveId } from '@/lib/drive';

export default function AdminProgramContent() {
  const { id } = useParams();
  const supabase = createClient();
  const [program, setProgram] = useState(null);
  const [modules, setModules] = useState([]);
  const [newModule, setNewModule] = useState('');
  const [desc, setDesc] = useState('');

  const load = useCallback(async () => {
    const { data: p } = await supabase.from('programs').select('*').eq('id', id).single();
    setProgram(p);
    setDesc(p?.description || '');
    const { data: m } = await supabase
      .from('modules')
      .select('id, title, position, lessons(id, title, kind, drive_file_id, duration_min, position, quizzes(id))')
      .eq('program_id', id)
      .order('position');
    setModules(m || []);
  }, [id]);
  useEffect(() => { load(); }, [load]);

  async function saveDescription() {
    await supabase.from('programs').update({ description: desc }).eq('id', id);
    alert('Descripción guardada');
  }

  async function addModule(e) {
    e.preventDefault();
    await supabase.from('modules').insert({
      program_id: id,
      title: newModule,
      position: modules.length,
    });
    setNewModule('');
    load();
  }

  async function removeModule(m) {
    if (!confirm(`¿Eliminar el tema "${m.title}" y sus contenidos?`)) return;
    await supabase.from('modules').delete().eq('id', m.id);
    load();
  }

  async function addLesson(moduleId, form) {
    const driveId = extractDriveId(form.driveUrl);
    if (form.kind !== 'texto' && !driveId) {
      alert('Enlace de Drive no válido. Pega el enlace de compartir del archivo.');
      return;
    }
    const mod = modules.find((m) => m.id === moduleId);
    await supabase.from('lessons').insert({
      module_id: moduleId,
      title: form.title,
      kind: form.kind,
      drive_file_id: driveId,
      body: form.kind === 'texto' ? form.body : null,
      duration_min: form.duration ? parseInt(form.duration) : null,
      position: mod?.lessons?.length || 0,
    });
    load();
  }

  async function removeLesson(l) {
    if (!confirm(`¿Eliminar "${l.title}"?`)) return;
    await supabase.from('lessons').delete().eq('id', l.id);
    load();
  }

  if (!program) return <p className="text-sm text-slate-400">Cargando…</p>;

  return (
    <div>
      <Link href="/admin" className="text-sm text-brand-600 hover:underline">← Programas</Link>
      <div className="mt-1 flex items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-slate-900">{program.title}</h1>
        <div className="flex gap-2">
          <Link href={`/admin/programa/${program.id}/precios`} className="btn-secondary text-sm">
            💳 Precios
          </Link>
          <Link href={`/admin/programa/${program.id}/anuncios`} className="btn-secondary text-sm">
            📢 Anuncios
          </Link>
          <Link href={`/admin/programa/${program.id}/casos`} className="btn-secondary text-sm">
            🩺 Casos clínicos
          </Link>
          <Link href={`/admin/programa/${program.id}/tutor`} className="btn-secondary text-sm">
            🤖 Tutor IA
          </Link>
          <Link href={`/admin/estadisticas/${program.id}`} className="btn-secondary text-sm">
            📊 Estadísticas
          </Link>
        </div>
      </div>

      <div className="card mt-4 p-4">
        <label className="label">Descripción del programa</label>
        <textarea className="input" rows={3} value={desc} onChange={(e) => setDesc(e.target.value)} />
        <button onClick={saveDescription} className="btn-secondary mt-2">Guardar descripción</button>
      </div>

      <form onSubmit={addModule} className="card mt-6 flex items-end gap-3 p-4">
        <div className="grow">
          <label className="label">Nuevo tema</label>
          <input className="input" value={newModule} onChange={(e) => setNewModule(e.target.value)}
            placeholder="Tema 1: Anatomía del aparato urinario" required />
        </div>
        <button className="btn-primary">Agregar tema</button>
      </form>

      <div className="mt-6 space-y-6">
        {modules.map((m, i) => (
          <ModuleCard key={m.id} module={m} index={i}
            onAddLesson={addLesson} onRemoveLesson={removeLesson} onRemoveModule={removeModule} />
        ))}
      </div>
    </div>
  );
}

function ModuleCard({ module: m, index, onAddLesson, onRemoveLesson, onRemoveModule }) {
  const [form, setForm] = useState({ title: '', kind: 'video', driveUrl: '', duration: '', body: '' });
  const [open, setOpen] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  return (
    <div className="card overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 bg-slate-50 px-5 py-3">
        <h2 className="font-bold text-slate-800">Tema {index + 1}: {m.title}</h2>
        <div className="flex gap-2">
          <Link href={`/admin/leccion/${m.id}/flashcards`} className="btn-secondary text-xs">🃏 Flashcards</Link>
          <Link href={`/admin/clases/nueva?module_id=${m.id}`} className="btn-secondary text-xs">🎥 + Clase</Link>
          <button onClick={() => onRemoveModule(m)} className="btn-danger text-xs">Eliminar</button>
        </div>
      </div>

      <ul className="divide-y divide-slate-100">
        {(m.lessons || []).sort((a, b) => a.position - b.position).map((l) => (
          <li key={l.id} className="flex items-center justify-between px-5 py-2.5 text-sm">
            <span>
              <b className="mr-2 text-xs uppercase text-brand-600">{l.kind}</b>
              {l.title}
            </span>
            <span className="flex items-center gap-2">
              <Link href={`/admin/leccion/${l.id}/editar`} className="btn-secondary text-xs">
                ✏️ Editar
              </Link>
              <Link href={`/admin/leccion/${l.id}/quiz`} className="btn-secondary text-xs">
                {l.quizzes?.length ? 'Quiz' : '+ Quiz'}
              </Link>
              <button onClick={() => onRemoveLesson(l)} className="btn-danger text-xs">Eliminar</button>
            </span>
          </li>
        ))}
      </ul>

      <div className="border-t border-slate-100 p-4">
        {!open ? (
          <button onClick={() => setOpen(true)} className="btn-secondary">+ Agregar subcontenido</button>
        ) : (
          <form
            onSubmit={(e) => { e.preventDefault(); onAddLesson(m.id, form); setForm({ title: '', kind: 'video', driveUrl: '', duration: '', body: '' }); setOpen(false); }}
            className="space-y-3"
          >
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="sm:col-span-2">
                <label className="label">Título</label>
                <input className="input" value={form.title} onChange={set('title')} required />
              </div>
              <div>
                <label className="label">Tipo</label>
                <select className="input" value={form.kind} onChange={set('kind')}>
                  <option value="video">Video (Drive)</option>
                  <option value="documento">Documento (Drive)</option>
                  <option value="texto">Texto</option>
                </select>
              </div>
            </div>
            {form.kind === 'texto' ? (
              <div>
                <label className="label">Contenido</label>
                <textarea className="input" rows={4} value={form.body} onChange={set('body')} />
              </div>
            ) : (
              <div>
                <label className="label">Enlace de Google Drive (compartir → cualquier persona con el enlace: Lector, sin descarga)</label>
                <input className="input" value={form.driveUrl} onChange={set('driveUrl')}
                  placeholder="https://drive.google.com/file/d/XXXXX/view?usp=sharing" required />
              </div>
            )}
            <div className="flex items-end gap-3">
              <div className="w-32">
                <label className="label">Duración (min)</label>
                <input className="input" type="number" value={form.duration} onChange={set('duration')} />
              </div>
              <button className="btn-primary">Guardar</button>
              <button type="button" onClick={() => setOpen(false)} className="btn-secondary">Cancelar</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
