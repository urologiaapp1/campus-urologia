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

export default function TopicPage() {
  const { id } = useParams();
  const router = useRouter();
  const supabase = createClient();

  const [me, setMe]           = useState(null);
  const [myRole, setMyRole]   = useState('student');
  const [topic, setTopic]     = useState(null);
  const [comments, setComments] = useState([]);
  const [ratings, setRatings] = useState([]);
  const [commentHtml, setCommentHtml] = useState('');
  const [loading, setLoading] = useState(false);
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
      .select('id, title, body, drive_file_id, drive_kind, created_at, author_id, profiles(full_name), modules(id, title)')
      .eq('id', id)
      .single();
    setTopic(t);

    const { data: c } = await supabase
      .from('topic_comments')
      .select('id, body, created_at, author_id, profiles(full_name)')
      .eq('topic_id', id)
      .order('created_at');
    setComments(c || []);

    const { data: r } = await supabase
      .from('topic_ratings')
      .select('user_id, stars')
      .eq('topic_id', id);
    setRatings(r || []);
  }, [id]);

  useEffect(() => { load(); }, [load]);

  async function addComment(e) {
    e.preventDefault();
    const stripped = commentHtml.replace(/<[^>]*>/g, '').trim();
    if (!stripped) return;
    setLoading(true);
    await supabase.from('topic_comments').insert({
      topic_id: id,
      author_id: me.id,
      body: commentHtml,
    });
    fetch('/api/notify/comment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic_id: id }),
    }).catch(() => {});
    setCommentHtml('');
    setLoading(false);
    load();
  }

  async function rate(stars) {
    await supabase.from('topic_ratings').upsert({ topic_id: id, user_id: me.id, stars });
    load();
  }

  async function removeComment(c) {
    if (!confirm('¿Eliminar este comentario?')) return;
    setDeleting(c.id);
    await supabase.from('topic_comments').delete().eq('id', c.id);
    setDeleting(null);
    load();
  }

  async function removeTopic() {
    if (!confirm('¿Eliminar este tópico con sus comentarios y calificaciones?')) return;
    await supabase.from('topics').delete().eq('id', id);
    router.push(`/tema/${topic.modules?.id}/topicos`);
  }

  if (!topic) return <p className="text-sm text-[var(--text-3)]">Cargando…</p>;

  const avg      = ratings.length ? ratings.reduce((a, b) => a + b.stars, 0) / ratings.length : 0;
  const myRating = ratings.find((r) => r.user_id === me?.id)?.stars || null;
  const canDeleteTopic = me && (topic.author_id === me.id || IS_STAFF(myRole));

  return (
    <div>
      <Link href={`/tema/${topic.modules?.id}/topicos`} className="text-sm text-brand-600 hover:underline">
        ← Tópicos de {topic.modules?.title}
      </Link>

      {/* Encabezado */}
      <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-[var(--text-1)]">{topic.title}</h1>
          <p className="mt-1 text-xs text-[var(--text-3)]">
            por <b>{topic.profiles?.full_name || 'participante'}</b> ·{' '}
            {new Date(topic.created_at).toLocaleDateString('es-CL')}
          </p>
        </div>
        {canDeleteTopic && (
          <button onClick={removeTopic} className="btn-danger text-sm">
            Eliminar tópico
          </button>
        )}
      </div>

      {/* Cuerpo del tópico */}
      <div className="card mt-4 p-6">
        <RichTextViewer html={topic.body} />
      </div>

      {/* Adjunto Drive */}
      {topic.drive_file_id && (
        <div className="mt-4">
          <DriveViewer fileId={topic.drive_file_id} kind={topic.drive_kind || 'video'} title={topic.title} />
        </div>
      )}

      {/* Calificaciones */}
      <div className="card mt-6 flex flex-wrap items-center justify-between gap-3 p-5">
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

      {/* Lista de comentarios */}
      <div className="mt-8 flex items-baseline justify-between">
        <h2 className="text-lg font-bold text-[var(--text-1)]">
          Comentarios
          <span className="ml-2 text-sm font-normal text-[var(--text-3)]">({comments.length})</span>
        </h2>
      </div>

      <div className="mt-3 space-y-3">
        {comments.length === 0 && (
          <div className="card p-8 text-center">
            <p className="text-sm text-[var(--text-3)]">Sin comentarios aún. ¡Sé el primero!</p>
          </div>
        )}
        {comments.map((c) => {
          const canDelete = me && (c.author_id === me.id || IS_STAFF(myRole));
          const isHtml = c.body?.startsWith('<');
          return (
            <div key={c.id} className="card p-5">
              <div className="flex items-start justify-between gap-3">
                {/* Avatar + nombre */}
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700 dark:bg-brand-900/40 dark:text-brand-300">
                    {(c.profiles?.full_name || 'P').split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[var(--text-1)]">
                      {c.profiles?.full_name || 'Participante'}
                    </p>
                    <p className="text-[11px] text-[var(--text-3)]">
                      {new Date(c.created_at).toLocaleString('es-CL', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>

                {/* Botón eliminar */}
                {canDelete && (
                  <button
                    onClick={() => removeComment(c)}
                    disabled={deleting === c.id}
                    className="shrink-0 rounded-lg px-2.5 py-1 text-xs font-medium text-red-500 transition-colors hover:bg-red-50 hover:text-red-700 disabled:opacity-40 dark:hover:bg-red-900/20"
                  >
                    {deleting === c.id ? '…' : 'Eliminar'}
                  </button>
                )}
              </div>

              {/* Contenido del comentario */}
              <div className="mt-3">
                {isHtml
                  ? <RichTextViewer html={c.body} />
                  : <p className="whitespace-pre-wrap text-sm text-[var(--text-2)]">{c.body}</p>
                }
              </div>
            </div>
          );
        })}
      </div>

      {/* Formulario de comentario */}
      {me ? (
        <form onSubmit={addComment} className="card mt-4 p-5">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.15em] text-[var(--text-3)]">
            Tu comentario
          </p>
          <RichTextEditor
            content={commentHtml}
            onChange={setCommentHtml}
            placeholder="Escribe tu opinión, duda o aporte clínico…"
          />
          <div className="mt-3 flex items-center gap-3">
            <button
              type="submit"
              className="btn-primary"
              disabled={loading || !commentHtml.replace(/<[^>]*>/g, '').trim()}
            >
              {loading ? 'Publicando…' : 'Publicar comentario'}
            </button>
            <p className="text-xs text-[var(--text-3)]">
              Puedes incluir imágenes, videos y formato enriquecido.
            </p>
          </div>
        </form>
      ) : (
        <div className="card mt-4 p-6 text-center">
          <p className="text-sm text-[var(--text-2)]">
            <Link href="/login" className="font-semibold text-brand-600 hover:underline">Inicia sesión</Link>{' '}
            para dejar un comentario.
          </p>
        </div>
      )}
    </div>
  );
}
