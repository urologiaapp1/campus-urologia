'use client';
import { useEffect, useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

const DIFFICULTIES = ['básico', 'intermedio', 'avanzado'];
const EMPTY = {
  title: '', specialty: 'Urología', difficulty: 'básico',
  patient_profile: '', learning_objectives: '',
  is_global: false, program_ids: [],
  media_url: '', media_type: '',
};

export default function AdminCasosPage() {
  const supabase = createClient();
  const [role,      setRole]      = useState(null);   // null = cargando
  const [cases,     setCases]     = useState([]);
  const [programs,  setPrograms]  = useState([]);
  const [form,      setForm]      = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);
  const [showForm,  setShowForm]  = useState(false);
  const [saving,    setSaving]    = useState(false);
  const [loadError, setLoadError] = useState('');
  const [mediaFile, setMediaFile] = useState(null);   // { file, preview, type }
  const [mediaUploading, setMediaUploading] = useState(false);
  const fileRef = useRef(null);

  // Verificar rol admin
  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { setRole('none'); return; }
      const { data } = await supabase.from('profiles').select('role').eq('id', user.id).single();
      setRole(data?.role || 'none');
    });
  }, []);

  const load = useCallback(async () => {
    setLoadError('');
    // Query simple sin joins que puedan fallar si las migraciones no corrieron
    const { data: c, error } = await supabase
      .from('clinical_cases')
      .select('id, title, specialty, difficulty, program_id, programs(title)')
      .order('created_at', { ascending: false });
    if (error) {
      setLoadError(error.message);
      return;
    }
    setCases(c || []);
    const { data: p } = await supabase.from('programs').select('id, title').order('title');
    setPrograms(p || []);
  }, []);

  useEffect(() => { if (role === 'admin') load(); }, [role, load]);

  // Acceso denegado para no-admin
  if (role === null) return <p className="text-[var(--text-3)]">Cargando…</p>;
  if (role !== 'admin') return (
    <div className="card p-8 text-center">
      <p className="text-lg font-bold text-[var(--text-1)]">Acceso restringido</p>
      <p className="mt-1 text-sm text-[var(--text-2)]">Solo los administradores pueden gestionar casos clínicos.</p>
      <Link href="/admin" className="btn-secondary mt-4 inline-block text-sm">← Volver</Link>
    </div>
  );

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const toggle = (k) => setForm((f) => ({ ...f, [k]: !f[k] }));

  function toggleProgram(pid) {
    setForm((f) => ({
      ...f,
      program_ids: f.program_ids.includes(pid)
        ? f.program_ids.filter((id) => id !== pid)
        : [...f.program_ids, pid],
    }));
  }

  function handleMediaChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    const type = file.type.startsWith('video/') ? 'video' : 'image';
    setMediaFile({ file, preview: URL.createObjectURL(file), type });
  }

  function removeMedia() {
    setMediaFile(null);
    setForm((f) => ({ ...f, media_url: '', media_type: '' }));
    if (fileRef.current) fileRef.current.value = '';
  }

  async function uploadMedia(file, type) {
    const ext = file.name.split('.').pop().toLowerCase();
    const path = `casos/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage.from('case-media').upload(path, file, { cacheControl: '3600' });
    if (error) throw error;
    const { data: { publicUrl } } = supabase.storage.from('case-media').getPublicUrl(path);
    return { url: publicUrl, type };
  }

  async function submit(e) {
    e.preventDefault();
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();

    let mediaUrl  = form.media_url;
    let mediaType = form.media_type;

    if (mediaFile) {
      setMediaUploading(true);
      try {
        const result = await uploadMedia(mediaFile.file, mediaFile.type);
        mediaUrl  = result.url;
        mediaType = result.type;
      } catch (err) {
        alert('Error al subir archivo: ' + err.message);
        setMediaUploading(false);
        setSaving(false);
        return;
      }
      setMediaUploading(false);
    }

    const payload = {
      title:               form.title,
      specialty:           form.specialty,
      difficulty:          form.difficulty,
      patient_profile:     form.patient_profile,
      learning_objectives: form.learning_objectives,
      is_global:           form.is_global,
      program_id:          form.program_ids.length === 1 ? form.program_ids[0] : null,
      ...(mediaUrl  ? { media_url: mediaUrl }   : {}),
      ...(mediaType ? { media_type: mediaType } : {}),
    };

    let caseId = editingId;
    if (editingId) {
      const { error: uErr } = await supabase.from('clinical_cases').update(payload).eq('id', editingId);
      if (uErr) { alert('Error al guardar: ' + uErr.message); setSaving(false); return; }
    } else {
      const { data: inserted, error: iErr } = await supabase.from('clinical_cases')
        .insert({ ...payload, created_by: user.id }).select('id').single();
      // DIAGNÓSTICO TEMPORAL
      alert('INSERT resultado:\ndata: ' + JSON.stringify(inserted) + '\nerror: ' + JSON.stringify(iErr));
      if (iErr) { setSaving(false); return; }
      caseId = inserted?.id;
    }

    if (caseId && form.program_ids.length > 1) {
      await supabase.from('clinical_case_programs').delete().eq('case_id', caseId);
      await supabase.from('clinical_case_programs').insert(
        form.program_ids.map((pid) => ({ case_id: caseId, program_id: pid }))
      );
    }

    setForm(EMPTY);
    setEditingId(null);
    setShowForm(false);
    setMediaFile(null);
    setSaving(false);
    load();
  }

  async function startEdit(c) {
    const { data } = await supabase.from('clinical_cases').select('*').eq('id', c.id).single();
    const { data: ccp } = await supabase.from('clinical_case_programs').select('program_id').eq('case_id', c.id);
    const assignedIds = (ccp || []).map((r) => r.program_id);
    if (data.program_id && !assignedIds.includes(data.program_id)) assignedIds.push(data.program_id);
    setForm({
      title:               data.title,
      specialty:           data.specialty,
      difficulty:          data.difficulty,
      patient_profile:     data.patient_profile || '',
      learning_objectives: data.learning_objectives || '',
      is_global:           data.is_global || false,
      program_ids:         assignedIds,
      media_url:           data.media_url  || '',
      media_type:          data.media_type || '',
    });
    setMediaFile(null);
    setEditingId(c.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function deleteCase(c) {
    if (!confirm(`¿Eliminar "${c.title}"? Se borrarán las sesiones asociadas.`)) return;
    await supabase.from('clinical_cases').delete().eq('id', c.id);
    load();
  }

  function cancelForm() {
    setForm(EMPTY);
    setEditingId(null);
    setShowForm(false);
    setMediaFile(null);
    if (fileRef.current) fileRef.current.value = '';
  }

  const programLabel = (c) => {
    if (c.is_global) return '🌐 Global';
    return c.programs?.title || '—';
  };

  const previewSrc = mediaFile?.preview || form.media_url || null;
  const previewType = mediaFile?.type || form.media_type || null;

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link href="/admin" className="text-sm text-brand-600 hover:underline">← Administración</Link>
          <h1 className="mt-1 text-xl font-black tracking-tight text-[var(--text-1)]">Casos clínicos</h1>
          <p className="mt-1 text-sm text-[var(--text-2)]">
            Crea casos y asígnalos a programas o actívalos globalmente.
          </p>
        </div>
        <button onClick={() => setShowForm((v) => !v)} className="btn-primary">
          {showForm ? '✕ Cancelar' : '+ Nuevo caso'}
        </button>
      </div>

      {/* Formulario */}
      {showForm && (
        <form onSubmit={submit} className="card mt-6 space-y-4 p-6">
          <h2 className="text-sm font-bold text-[var(--text-1)]">
            {editingId ? 'Editar caso' : 'Nuevo caso clínico'}
          </h2>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="sm:col-span-2">
              <label className="label">Título del caso</label>
              <input className="input" value={form.title} onChange={set('title')} required />
            </div>
            <div>
              <label className="label">Especialidad</label>
              <input className="input" value={form.specialty} onChange={set('specialty')} />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Dificultad</label>
              <select className="input" value={form.difficulty} onChange={set('difficulty')}>
                {DIFFICULTIES.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Objetivos de aprendizaje</label>
              <input className="input" value={form.learning_objectives} onChange={set('learning_objectives')} />
            </div>
          </div>

          <div>
            <label className="label">Perfil del paciente (instrucciones para la IA — no visible para alumnos)</label>
            <textarea className="input" rows={5} value={form.patient_profile} onChange={set('patient_profile')} required
              placeholder="Ej: Varón 65 años, tabaquista, consulta por hematuria macroscópica indolora…" />
          </div>

          {/* Media */}
          <div>
            <label className="label">Imagen o video del caso (opcional)</label>
            {previewSrc && (
              <div className="relative mb-3 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface-2)]">
                {previewType === 'video' ? (
                  <video src={previewSrc} controls className="max-h-56 w-full object-contain" />
                ) : (
                  <img src={previewSrc} alt="Preview" className="max-h-56 w-full object-contain" />
                )}
                <button
                  type="button"
                  onClick={removeMedia}
                  className="absolute right-2 top-2 rounded-full bg-black/60 px-2 py-0.5 text-xs font-medium text-white hover:bg-black/80"
                >
                  Quitar
                </button>
              </div>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime"
              onChange={handleMediaChange}
              className="text-sm text-[var(--text-2)] file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-[var(--surface-2)] file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-[var(--text-1)] hover:file:bg-[var(--border)]"
            />
            <p className="mt-1 text-xs text-[var(--text-3)]">
              JPG, PNG, WebP, GIF, MP4, WebM · máx. 100 MB
            </p>
          </div>

          {/* Visibilidad */}
          <div className="rounded-xl border border-[var(--border)] p-4 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[var(--text-3)]">Visibilidad</p>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.is_global} onChange={() => toggle('is_global')} className="accent-brand-600" />
              <span className="text-sm font-semibold text-[var(--text-1)]">
                🌐 Global — visible para todos los alumnos con alguna matrícula
              </span>
            </label>
            {!form.is_global && (
              <div>
                <p className="mb-2 text-xs text-[var(--text-2)]">O selecciona programas específicos:</p>
                <div className="grid gap-1.5 sm:grid-cols-2">
                  {programs.map((p) => (
                    <label key={p.id} className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-[var(--surface-2)]">
                      <input
                        type="checkbox"
                        checked={form.program_ids.includes(p.id)}
                        onChange={() => toggleProgram(p.id)}
                        className="accent-brand-600"
                      />
                      {p.title}
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <button className="btn-primary" disabled={saving}>
              {mediaUploading ? 'Subiendo archivo…' : saving ? 'Guardando…' : editingId ? 'Actualizar' : 'Crear caso'}
            </button>
            <button type="button" onClick={cancelForm} className="btn-secondary">Cancelar</button>
          </div>
        </form>
      )}

      {/* Error de carga */}
      {loadError && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 dark:border-red-900/40 dark:bg-red-900/20">
          <p className="text-sm font-semibold text-red-700 dark:text-red-400">Error al cargar casos:</p>
          <p className="mt-1 text-xs text-red-600 dark:text-red-300">{loadError}</p>
        </div>
      )}

      {/* Lista */}
      <div className="card mt-6 divide-y divide-[var(--border)]">
        <div className="px-5 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[var(--text-3)]">
            {cases.length} caso{cases.length !== 1 ? 's' : ''}
          </p>
        </div>
        {cases.map((c) => (
          <div key={c.id} className="flex flex-wrap items-start justify-between gap-3 px-5 py-4">
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold text-[var(--text-1)]">{c.title}</span>
                <span className="badge badge-slate text-[10px]">{c.difficulty}</span>
                {c.media_type && (
                  <span className="badge badge-brand text-[10px]">
                    {c.media_type === 'video' ? '🎥 video' : '🖼 imagen'}
                  </span>
                )}
                <span className="text-xs text-[var(--text-3)]">{c.specialty}</span>
              </div>
              <p className="mt-1 text-xs text-[var(--text-3)]">{programLabel(c)}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => startEdit(c)} className="btn-secondary text-xs">Editar</button>
              <button onClick={() => deleteCase(c)} className="btn-danger text-xs">Eliminar</button>
            </div>
          </div>
        ))}
        {cases.length === 0 && (
          <p className="px-5 py-8 text-center text-sm text-[var(--text-3)]">Sin casos. Crea el primero arriba.</p>
        )}
      </div>
    </div>
  );
}
