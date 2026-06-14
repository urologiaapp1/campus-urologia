'use client';
import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { extractDriveId } from '@/lib/drive';

/* ── Generador de código ────────────────────────────────────── */
function mkCode() {
  const c = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 8 }, () => c[Math.floor(Math.random() * c.length)]).join('');
}

/* ── Panel de códigos de acceso ─────────────────────────────── */
function AccessCodesPanel({ programId }) {
  const supabase = createClient();
  const [codes,   setCodes]   = useState([]);
  const [loading, setLoading] = useState(false);
  const [copied,  setCopied]  = useState(null);

  const loadCodes = useCallback(async () => {
    const { data } = await supabase
      .from('program_access_codes')
      .select('*')
      .eq('program_id', programId)
      .order('created_at', { ascending: false });
    setCodes(data || []);
  }, [programId]);

  useEffect(() => { loadCodes(); }, [loadCodes]);

  async function generate(kind) {
    setLoading(true);
    const code = mkCode();
    const { error } = await supabase.from('program_access_codes').insert({
      program_id: programId, code, kind,
    });
    if (error) alert('Error: ' + error.message);
    else loadCodes();
    setLoading(false);
  }

  async function toggle(id, current) {
    await supabase.from('program_access_codes').update({ is_active: !current }).eq('id', id);
    loadCodes();
  }

  async function remove(id) {
    if (!confirm('¿Eliminar este código?')) return;
    await supabase.from('program_access_codes').delete().eq('id', id);
    loadCodes();
  }

  function copy(code) {
    navigator.clipboard.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(null), 1500);
  }

  const active = codes.filter((c) => c.is_active);
  const used   = codes.filter((c) => !c.is_active || (c.kind === 'single' && c.used_count >= 1));

  return (
    <div className="card mt-4 p-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-[var(--text-1)]">Códigos de acceso</h2>
          <p className="mt-0.5 text-xs text-[var(--text-3)]">
            Los alumnos ingresan el código en la página principal para matricularse.
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => generate('unlimited')} disabled={loading}
            className="btn-primary text-sm">
            + Ilimitado
          </button>
          <button onClick={() => generate('single')} disabled={loading}
            className="btn-secondary text-sm">
            + Uso único
          </button>
        </div>
      </div>

      {codes.length === 0 ? (
        <p className="py-4 text-center text-sm text-[var(--text-3)]">
          Sin códigos. Genera uno con los botones de arriba.
        </p>
      ) : (
        <div className="divide-y divide-[var(--border)]">
          {codes.map((c) => {
            const expired = c.expires_at && new Date(c.expires_at) < new Date();
            const exhausted = c.kind === 'single' && c.used_count >= 1;
            const statusBadge = expired ? 'badge-red' : exhausted ? 'badge-slate'
              : c.is_active ? 'badge-green' : 'badge-slate';
            const statusLabel = expired ? 'Expirado' : exhausted ? 'Usado'
              : c.is_active ? 'Activo' : 'Inactivo';

            return (
              <div key={c.id} className="flex flex-wrap items-center gap-3 py-3">
                {/* Código */}
                <button
                  onClick={() => copy(c.code)}
                  title="Copiar código"
                  className="font-mono text-lg font-black tracking-[0.15em] text-[var(--text-1)] hover:text-brand-600 transition-colors"
                >
                  {copied === c.code ? '✓ copiado' : c.code}
                </button>

                {/* Badges */}
                <span className={`badge ${c.kind === 'unlimited' ? 'badge-brand' : 'badge-amber'}`}>
                  {c.kind === 'unlimited' ? '∞ Ilimitado' : '1x Único'}
                </span>
                <span className={`badge ${statusBadge}`}>{statusLabel}</span>

                {/* Usos */}
                <span className="text-xs text-[var(--text-3)]">
                  {c.used_count} {c.used_count === 1 ? 'uso' : 'usos'}
                </span>

                {/* Fecha */}
                <span className="text-xs text-[var(--text-3)] ml-auto">
                  {new Date(c.created_at).toLocaleDateString('es-CL')}
                </span>

                {/* Acciones */}
                <div className="flex gap-1.5">
                  <button
                    onClick={() => toggle(c.id, c.is_active)}
                    className="rounded-lg border border-[var(--border)] px-2 py-1 text-xs text-[var(--text-2)] hover:bg-[var(--surface-2)] transition-colors"
                  >
                    {c.is_active ? 'Desactivar' : 'Activar'}
                  </button>
                  <button
                    onClick={() => remove(c.id)}
                    className="rounded-lg border border-red-200 px-2 py-1 text-xs text-red-600 hover:bg-red-50 transition-colors dark:border-red-900/40 dark:hover:bg-red-900/20"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Resumen */}
      {codes.length > 0 && (
        <div className="flex gap-4 rounded-xl bg-[var(--surface-2)] px-4 py-2.5 text-xs text-[var(--text-2)]">
          <span><b className="text-[var(--text-1)]">{active.length}</b> activos</span>
          <span><b className="text-[var(--text-1)]">{codes.reduce((s, c) => s + c.used_count, 0)}</b> usos totales</span>
          <span><b className="text-[var(--text-1)]">{codes.filter((c) => c.kind === 'single').length}</b> de uso único</span>
        </div>
      )}
    </div>
  );
}

export default function AdminProgramContent() {
  const { id } = useParams();
  const supabase = createClient();
  const [program, setProgram] = useState(null);
  const [modules, setModules] = useState([]);
  const [newModule, setNewModule] = useState('');
  const [desc, setDesc] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [enrolled, setEnrolled] = useState(false);

  const load = useCallback(async () => {
    const { data: p } = await supabase.from('programs').select('*').eq('id', id).single();
    setProgram(p);
    setDesc(p?.description || '');
    setAccessCode(p?.access_code || '');
    const { data: m } = await supabase
      .from('modules')
      .select('id, title, position, lessons(id, title, kind, drive_file_id, duration_min, position, quizzes(id))')
      .eq('program_id', id)
      .order('position');
    setModules(m || []);

    // Verificar si el usuario actual ya está matriculado
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: en } = await supabase
        .from('enrollments')
        .select('user_id')
        .eq('user_id', user.id)
        .eq('program_id', id)
        .maybeSingle();
      setEnrolled(!!en);
    }
  }, [id]);
  useEffect(() => { load(); }, [load]);

  async function saveDescription() {
    await supabase.from('programs').update({ description: desc }).eq('id', id);
    alert('Descripción guardada');
  }

  async function saveAccessCode() {
    const code = accessCode.trim().toUpperCase() || null;
    const { error } = await supabase.from('programs').update({ access_code: code }).eq('id', id);
    if (error) alert('Error: ' + error.message);
    else alert(code ? `Código guardado: ${code}` : 'Código eliminado.');
    setAccessCode(code || '');
  }

  function generateCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    const code = Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    setAccessCode(code);
  }

  async function toggleSelfEnroll() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    if (enrolled) {
      await supabase.from('enrollments').delete().eq('user_id', user.id).eq('program_id', id);
    } else {
      await supabase.from('enrollments').insert({ user_id: user.id, program_id: id });
    }
    setEnrolled(!enrolled);
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
          <button
            onClick={toggleSelfEnroll}
            className={`btn-secondary text-sm ${enrolled ? 'border-green-300 text-green-700' : ''}`}
            title={enrolled ? 'Ver como alumno / desmatricularse' : 'Matricularme para ver como alumno'}
          >
            {enrolled ? '👁 Matriculado (ver)' : '👁 Matricularme'}
          </button>
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

      {/* Códigos de acceso v2 */}
      <AccessCodesPanel programId={id} />

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
