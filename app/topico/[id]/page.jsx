'use client';
import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import DriveViewer from '@/components/DriveViewer';
import StarRating from '@/components/StarRating';
import RichTextEditor from '@/components/RichTextEditor';
import RichTextViewer from '@/components/RichTextViewer';

const IS_STAFF = (role) => ['admin', 'editor'].includes(role);

/* ── Componente para crear un subtema o tip ─────────────────── */
function InlineForm({ label, placeholder, onSubmit, onCancel }) {
  const [html, setHtml]   = useState('');
  const [title, setTitle] = useState('');
  const [saving, setSaving] = useState(false);

  async function submit(e) {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    await onSubmit({ title: title.trim(), body: html });
    setTitle(''); setHtml(''); setSaving(false);
  }

  return (
    <form onSubmit={submit} className="card mt-3 space-y-3 p-5">
      <div>
        <label className="label">Título del {label}</label>
        <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} required
          placeholder={placeholder} />
      </div>
      <div>
        <label className="label">Contenido (opcional)</label>
        <RichTextEditor content={html} onChange={setHtml} placeholder="Descripción, imágenes, videos…" />
      </div>
      <div className="flex gap-2">
        <button className="btn-primary text-sm" disabled={saving}>{saving ? 'Guardando…' : `Publicar ${label}`}</button>
        <button type="button" onClick={onCancel} className="btn-secondary text-sm">Cancelar</button>
      </div>
    </form>
  );
}

/* ── Tip individual ─────────────────────────────────────────── */
function TipCard({ tip, me, myRole, onDelete }) {
  const isHtml = tip.body?.startsWith('<');
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-600 dark:text-brand-400">Tip</p>
          <p className="mt-0.5 font-semibold text-[var(--text-1)]">{tip.title}</p>
          <p className="mt-0.5 text-[11px] text-[var(--text-3)]">
            {tip.profiles?.full_name || 'participante'} · {new Date(tip.created_at).toLocaleDateString('es-CL')}
          </p>
        </div>
        {me && (tip.author_id === me.id || IS_STAFF(myRole)) && (
          <button onClick={() => onDelete(tip.id)} className="text-xs text-red-500 hover:text-red-700">Eliminar</button>
        )}
      </div>
      {tip.body && (
        <div className="mt-3">
          {isHtml ? <RichTextViewer html={tip.body} /> : <p className="text-sm text-[var(--text-2)]">{tip.body}</p>}
        </div>
      )}
    </div>
  );
}

/* ── Subtema con sus tips ───────────────────────────────────── */
function SubtopicCard({ sub, me, myRole, supabase, onDeleted }) {
  const [tips, setTips]       = useState(null);
  const [open, setOpen]       = useState(false);
  const [addingTip, setAddingTip] = useState(false);
  const isHtml = sub.body?.startsWith('<');

  async function loadTips() {
    const { data } = await supabase
      .from('topics')
      .select('id, title, body, author_id, created_at, profiles(full_name)')
      .eq('parent_id', sub.id)
      .eq('kind', 'tip')
      .order('created_at');
    setTips(data || []);
  }

  async function toggle() {
    if (!open && tips === null) await loadTips();
    setOpen((v) => !v);
  }

  async function addTip({ title, body }) {
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('topics').insert({
      parent_id: sub.id,
      module_id:  sub.module_id,
      author_id:  user.id,
      title,
      body: body || null,
      kind: 'tip',
    });
    setAddingTip(false);
    await loadTips();
  }

  async function deleteTip(id) {
    if (!confirm('¿Eliminar tip?')) return;
    await supabase.from('topics').delete().eq('id', id);
    setTips((prev) => prev.filter((t) => t.id !== id));
  }

  async function deleteThis() {
    if (!confirm('¿Eliminar este subtema y sus tips?')) return;
    await supabase.from('topics').delete().eq('id', sub.id);
    onDeleted(sub.id);
  }

  return (
    <div className="card overflow-hidden">
      {/* Header del subtema */}
      <div className="flex items-start justify-between gap-3 p-5">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="badge badge-brand text-[10px]">Subtema</span>
            <p className="text-[11px] text-[var(--text-3)]">
              {sub.profiles?.full_name || 'participante'} · {new Date(sub.created_at).toLocaleDateString('es-CL')}
            </p>
          </div>
          <h3 className="mt-1 font-bold text-[var(--text-1)]">{sub.title}</h3>
          {sub.body && (
            <div className="mt-2">
              {isHtml ? <RichTextViewer html={sub.body} /> : <p className="text-sm text-[var(--text-2)]">{sub.body}</p>}
            </div>
          )}
        </div>
        {me && (sub.author_id === me.id || IS_STAFF(myRole)) && (
          <button onClick={deleteThis} className="shrink-0 text-xs text-red-500 hover:text-red-700">Eliminar</button>
        )}
      </div>

      {/* Pie: toggle tips */}
      <div className="border-t border-[var(--border)] px-5 py-3">
        <button onClick={toggle} className="text-xs font-semibold text-brand-600 hover:underline dark:text-brand-400">
          {open ? '▲ Ocultar tips' : `▶ Ver tips${tips !== null ? ` (${tips.length})` : ''}`}
        </button>
        {me && open && (
          <button onClick={() => setAddingTip((v) => !v)}
            className="ml-4 text-xs text-[var(--text-2)] hover:text-[var(--text-1)]">
            {addingTip ? '✕ Cancelar' : '+ Agregar tip'}
          </button>
        )}
      </div>

      {open && (
        <div className="space-y-2 px-5 pb-5">
          {tips?.map((t) => (
            <TipCard key={t.id} tip={t} me={me} myRole={myRole} onDelete={deleteTip} />
          ))}
          {tips?.length === 0 && !addingTip && (
            <p className="text-xs text-[var(--text-3)]">Sin tips aún. ¡Agrega el primero!</p>
          )}
          {addingTip && (
            <InlineForm label="tip" placeholder="Nombre del tip o consejo específico"
              onSubmit={addTip} onCancel={() => setAddingTip(false)} />
          )}
        </div>
      )}
    </div>
  );
}

/* ── Página principal ───────────────────────────────────────── */
export default function TopicPage() {
  const { id } = useParams();
  const router = useRouter();
  const supabase = createClient();

  const [me, setMe]             = useState(null);
  const [myRole, setMyRole]     = useState('student');
  const [topic, setTopic]       = useState(null);
  const [subtopics, setSubtopics] = useState([]);
  const [comments, setComments] = useState([]);
  const [ratings, setRatings]   = useState([]);
  const [commentHtml, setCommentHtml] = useState('');
  const [addingSub, setAddingSub] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [deleting, setDeleting] = useState(null);

  const load = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setMe(user);
    if (user) {
      const { data: prof } = await supabase.from('profiles').select('role').eq('id', user.id).single();
      setMyRole(prof?.role || 'student');
    }
    const { data: t } = await supabase
      .from('topics')
      .select('id, title, body, drive_file_id, drive_kind, created_at, author_id, module_id, profiles(full_name), modules(id, title)')
      .eq('id', id).single();
    setTopic(t);

    const { data: subs } = await supabase
      .from('topics')
      .select('id, title, body, author_id, created_at, module_id, profiles(full_name)')
      .eq('parent_id', id).eq('kind', 'subtopic').order('created_at');
    setSubtopics(subs || []);

    const { data: c } = await supabase
      .from('topic_comments')
      .select('id, body, created_at, author_id, profiles(full_name)')
      .eq('topic_id', id).order('created_at');
    setComments(c || []);

    const { data: r } = await supabase.from('topic_ratings').select('user_id, stars').eq('topic_id', id);
    setRatings(r || []);
  }, [id]);

  useEffect(() => { load(); }, [load]);

  async function addComment(e) {
    e.preventDefault();
    if (!commentHtml.replace(/<[^>]*>/g, '').trim()) return;
    setLoading(true);
    await supabase.from('topic_comments').insert({ topic_id: id, author_id: me.id, body: commentHtml });
    fetch('/api/notify/comment', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ topic_id: id }) }).catch(() => {});
    setCommentHtml('');
    setLoading(false);
    load();
  }

  async function rate(stars) {
    await supabase.from('topic_ratings').upsert({ topic_id: id, user_id: me.id, stars });
    load();
  }

  async function removeComment(c) {
    if (!confirm('¿Eliminar comentario?')) return;
    setDeleting(c.id);
    await supabase.from('topic_comments').delete().eq('id', c.id);
    setDeleting(null);
    load();
  }

  async function removeTopic() {
    if (!confirm('¿Eliminar este tópico con subtemas y comentarios?')) return;
    await supabase.from('topics').delete().eq('id', id);
    router.push(`/tema/${topic.modules?.id}/topicos`);
  }

  async function addSubtopic({ title, body }) {
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('topics').insert({
      parent_id: id,
      module_id:  topic.module_id,
      author_id:  user.id,
      title,
      body: body || null,
      kind: 'subtopic',
    });
    setAddingSub(false);
    load();
  }

  function removeSubtopic(subId) {
    setSubtopics((prev) => prev.filter((s) => s.id !== subId));
  }

  if (!topic) return <p className="text-sm text-[var(--text-3)]">Cargando…</p>;

  const avg      = ratings.length ? ratings.reduce((a, b) => a + b.stars, 0) / ratings.length : 0;
  const myRating = ratings.find((r) => r.user_id === me?.id)?.stars || null;
  const canDeleteTopic = me && (topic.author_id === me.id || IS_STAFF(myRole));

  return (
    <div className="space-y-8">
      {/* Breadcrumb */}
      <Link href={`/tema/${topic.modules?.id}/topicos`} className="text-sm text-brand-600 hover:underline">
        ← Tópicos de {topic.modules?.title}
      </Link>

      {/* Encabezado */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-[var(--text-1)]">{topic.title}</h1>
          <p className="mt-1 text-xs text-[var(--text-3)]">
            por <b>{topic.profiles?.full_name || 'participante'}</b> · {new Date(topic.created_at).toLocaleDateString('es-CL')}
          </p>
        </div>
        {canDeleteTopic && <button onClick={removeTopic} className="btn-danger text-sm">Eliminar tópico</button>}
      </div>

      {/* Cuerpo */}
      <div className="card p-6"><RichTextViewer html={topic.body} /></div>

      {/* Adjunto Drive */}
      {topic.drive_file_id && (
        <DriveViewer fileId={topic.drive_file_id} kind={topic.drive_kind || 'video'} title={topic.title} />
      )}

      {/* Calificaciones */}
      <div className="card flex flex-wrap items-center justify-between gap-3 p-5">
        <div>
          <p className="text-sm font-semibold text-[var(--text-1)]">Calificación de la comunidad</p>
          <StarRating value={avg} count={ratings.length} />
        </div>
        {me && (
          <div className="text-right">
            <p className="text-sm font-semibold text-[var(--text-1)]">Tu calificación</p>
            <StarRating myRating={myRating} onRate={rate} />
          </div>
        )}
      </div>

      {/* ── Subtemas ─────────────────────────────────────────── */}
      <section>
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-[var(--text-1)]">
            Subtemas
            <span className="ml-2 text-sm font-normal text-[var(--text-3)]">({subtopics.length})</span>
          </h2>
          {me && (
            <button onClick={() => setAddingSub((v) => !v)}
              className="btn-secondary text-sm">
              {addingSub ? '✕ Cancelar' : '+ Agregar subtema'}
            </button>
          )}
        </div>

        {addingSub && (
          <InlineForm label="subtema" placeholder="Ej: Técnica quirúrgica en uretroplastia"
            onSubmit={addSubtopic} onCancel={() => setAddingSub(false)} />
        )}

        <div className="mt-4 space-y-3">
          {subtopics.map((s) => (
            <SubtopicCard key={s.id} sub={s} me={me} myRole={myRole} supabase={supabase} onDeleted={removeSubtopic} />
          ))}
          {subtopics.length === 0 && !addingSub && (
            <div className="rounded-2xl border border-dashed border-[var(--border-2)] p-8 text-center">
              <p className="text-sm text-[var(--text-3)]">Sin subtemas aún. ¡Profundiza el tópico creando el primero!</p>
            </div>
          )}
        </div>
      </section>

      {/* ── Comentarios ──────────────────────────────────────── */}
      <section>
        <h2 className="text-lg font-bold text-[var(--text-1)]">
          Comentarios
          <span className="ml-2 text-sm font-normal text-[var(--text-3)]">({comments.length})</span>
        </h2>

        <div className="mt-3 space-y-3">
          {comments.length === 0 && <div className="card p-8 text-center"><p className="text-sm text-[var(--text-3)]">Sin comentarios aún.</p></div>}
          {comments.map((c) => {
            const canDelete = me && (c.author_id === me.id || IS_STAFF(myRole));
            const isHtml = c.body?.startsWith('<');
            return (
              <div key={c.id} className="card p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700 dark:bg-brand-900/40 dark:text-brand-300">
                      {(c.profiles?.full_name || 'P').split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[var(--text-1)]">{c.profiles?.full_name || 'Participante'}</p>
                      <p className="text-[11px] text-[var(--text-3)]">{new Date(c.created_at).toLocaleString('es-CL', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  </div>
                  {canDelete && (
                    <button onClick={() => removeComment(c)} disabled={deleting === c.id}
                      className="shrink-0 rounded-lg border border-red-200 px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-40 dark:border-red-900/40 dark:hover:bg-red-900/20">
                      {deleting === c.id ? '…' : 'Eliminar'}
                    </button>
                  )}
                </div>
                <div className="mt-3">
                  {isHtml ? <RichTextViewer html={c.body} /> : <p className="whitespace-pre-wrap text-sm text-[var(--text-2)]">{c.body}</p>}
                </div>
              </div>
            );
          })}
        </div>

        {me ? (
          <form onSubmit={addComment} className="card mt-4 p-5">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.15em] text-[var(--text-3)]">Tu comentario</p>
            <RichTextEditor content={commentHtml} onChange={setCommentHtml} placeholder="Escribe tu opinión, duda o aporte clínico…" />
            <div className="mt-3 flex items-center gap-3">
              <button type="submit" className="btn-primary" disabled={loading || !commentHtml.replace(/<[^>]*>/g, '').trim()}>
                {loading ? 'Publicando…' : 'Publicar comentario'}
              </button>
            </div>
          </form>
        ) : (
          <div className="card mt-4 p-6 text-center">
            <p className="text-sm text-[var(--text-2)]">
              <Link href="/login" className="font-semibold text-brand-600 hover:underline">Inicia sesión</Link>{' '}para comentar.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
