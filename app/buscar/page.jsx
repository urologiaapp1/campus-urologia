'use client';
import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function SearchPage() {
  const supabase = createClient();
  const [q, setQ] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  async function search(e) {
    e.preventDefault();
    if (q.trim().length < 3) return;
    setLoading(true);
    const term = `%${q.trim()}%`;
    const [{ data: lessons }, { data: topics }] = await Promise.all([
      supabase.from('lessons')
        .select('id, title, kind, modules(title, programs(title))')
        .ilike('title', term)
        .limit(20),
      supabase.from('topics')
        .select('id, title, body, profiles(full_name), modules(title)')
        .or(`title.ilike.${term},body.ilike.${term}`)
        .limit(20),
    ]);
    setResults({ lessons: lessons || [], topics: topics || [] });
    setLoading(false);
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-black tracking-tight text-[var(--text-1)]">Buscar</h1>
      <form onSubmit={search} className="mt-4 flex gap-2">
        <input className="input" value={q} onChange={(e) => setQ(e.target.value)}
          placeholder="uretroplastia bulbar, PFUI, injerto bucal… (mín. 3 letras)" autoFocus />
        <button className="btn-primary" disabled={loading}>
          {loading ? '…' : 'Buscar'}
        </button>
      </form>

      {results && (
        <div className="mt-8 space-y-8">
          <section>
            <h2 className="label">Lecciones ({results.lessons.length})</h2>
            <div className="card mt-2 divide-y divide-[var(--border)]">
              {results.lessons.map((l) => (
                <Link key={l.id} href={`/leccion/${l.id}`} className="block px-5 py-3 transition-colors hover:bg-[var(--surface-2)]">
                  <p className="font-semibold text-[var(--text-1)]">{l.title}</p>
                  <p className="text-xs text-[var(--text-3)]">
                    {l.modules?.programs?.title} · {l.modules?.title} · {l.kind}
                  </p>
                </Link>
              ))}
              {results.lessons.length === 0 && (
                <p className="px-5 py-3 text-sm text-[var(--text-3)]">Sin resultados.</p>
              )}
            </div>
          </section>

          <section>
            <h2 className="label">Tópicos de la comunidad ({results.topics.length})</h2>
            <div className="card mt-2 divide-y divide-[var(--border)]">
              {results.topics.map((t) => (
                <Link key={t.id} href={`/topico/${t.id}`} className="block px-5 py-3 transition-colors hover:bg-[var(--surface-2)]">
                  <p className="font-semibold text-[var(--text-1)]">{t.title}</p>
                  <p className="line-clamp-2 text-xs text-[var(--text-3)]">{t.body}</p>
                </Link>
              ))}
              {results.topics.length === 0 && (
                <p className="px-5 py-3 text-sm text-[var(--text-3)]">Sin resultados.</p>
              )}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
