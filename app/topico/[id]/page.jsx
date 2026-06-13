'use client';
import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import DriveViewer from '@/components/DriveViewer';
import StarRating from '@/components/StarRating';

export default function TopicPage() {
  const { id } = useParams();
  const router = useRouter();
  const supabase = createClient();
  const [me, setMe] = useState(null);
  const [myRole, setMyRole] = useState('student');
  const [topic, setTopic] = useState(null);
  const [comments, setComments] = useState([]);
  const [ratings, setRatings] = useState([]);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

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
    setLoading(true);
    await supabase.from('topic_comments').insert({
      topic_id: id,
      author_id: me.id,
      body: comment,
    });
    // notificación por email al autor del tópico (no bloquea la UI)
    fetch('/api/notify/comment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic_id: id }),
    }).catch(() => {});
    setComment('');
    setLoading(false);
    load();
  }

  async function rate(stars) {
    await supabase.from('topic_ratings').upsert({ topic_id: id, user_id: me.id, stars });
    load();
  }

  async function removeComment(c) {
    if (!confirm('¿Eliminar comentario?')) return;
    await supabase.from('topic_comments').delete().eq('id', c.id);
    load();
  }

  async function removeTopic() {
    if (!confirm('¿Eliminar este tópico con sus comentarios y calificaciones?')) return;
    await supabase.from('topics').delete().eq('id', id);
    router.push(`/tema/${topic.modules?.id}/topicos`);
  }

  if (!topic) return <p className="text-sm text-slate-400">Cargando…</p>;

  const avg = ratings.length ? ratings.reduce((a, b) => a + b.stars, 0) / ratings.length : 0;
  const myRating = ratings.find((r) => r.user_id === me?.id)?.stars || null;
  const canDelete = me && (topic.author_id === me.id || myRole === 'admin');

  return (
    <div>
      <Link href={`/tema/${topic.modules?.id}/topicos`} className="text-sm text-brand-600 hover:underline">
        ← Tópicos de {topic.modules?.title}
      </Link>

      <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{topic.title}</h1>
          <p className="mt-1 text-xs text-slate-400">
            por <b>{topic.profiles?.full_name || 'participante'}</b> ·{' '}
            {new Date(topic.created_at).toLocaleDateString('es-CL')}
          </p>
        </div>
        {canDelete && <button onClick={removeTopic} className="btn-danger">Eliminar tópico</button>}
      </div>

      <div className="card mt-4 whitespace-pre-wrap p-6 text-sm leading-relaxed text-slate-700">
        {topic.body}
      </div>

      {topic.drive_file_id && (
        <div className="mt-4">
          <DriveViewer fileId={topic.drive_file_id} kind={topic.drive_kind || 'video'} title={topic.title} />
        </div>
      )}

      <div className="card mt-6 flex flex-wrap items-center justify-between gap-3 p-5">
        <div>
          <p className="text-sm font-semibold text-slate-700">Calificación de la comunidad</p>
          <StarRating value={avg} count={ratings.length} />
        </div>
        <div className="text-right">
          <p className="text-sm font-semibold text-slate-700">Tu calificación</p>
          <StarRating myRating={myRating} onRate={rate} />
        </div>
      </div>

      <h2 className="mt-8 text-lg font-bold text-slate-900">
        Opiniones ({comments.length})
      </h2>
      <div className="card mt-3 divide-y divide-slate-100">
        {comments.map((c) => (
          <div key={c.id} className="px-5 py-3">
            <div className="flex items-start justify-between gap-3">
              <p className="text-xs font-semibold text-slate-500">
                {c.profiles?.full_name || 'participante'} ·{' '}
                <span className="font-normal text-slate-400">
                  {new Date(c.created_at).toLocaleString('es-CL')}
                </span>
              </p>
              {me && (c.author_id === me.id || myRole === 'admin') && (
                <button onClick={() => removeComment(c)} className="text-xs text-red-500 hover:underline">
                  eliminar
                </button>
              )}
            </div>
            <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">{c.body}</p>
          </div>
        ))}
        {comments.length === 0 && (
          <p className="px-5 py-4 text-sm text-slate-400">Sin opiniones aún.</p>
        )}
      </div>

      <form onSubmit={addComment} className="card mt-4 p-5">
        <label className="label">Tu opinión</label>
        <textarea className="input" rows={3} value={comment} required
          onChange={(e) => setComment(e.target.value)} />
        <button className="btn-primary mt-3" disabled={loading}>
          {loading ? 'Publicando…' : 'Publicar opinión'}
        </button>
      </form>
    </div>
  );
}
