'use client';
/**
 * /admin/programa/[id]/tutor
 * Configurar el tutor IA por programa e indexar lecciones de texto.
 */
import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function AdminTutorPage() {
  const { id: programId } = useParams();
  const supabase = createClient();

  const [program, setProgram] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [config, setConfig] = useState({ system_prompt: '', enabled: true });
  const [saving, setSaving] = useState(false);
  const [indexing, setIndexing] = useState({});
  const [indexedCounts, setIndexedCounts] = useState({});

  const load = useCallback(async () => {
    const { data: p } = await supabase.from('programs').select('id, title').eq('id', programId).single();
    setProgram(p);

    const { data: mods } = await supabase
      .from('modules')
      .select('id, title, lessons(id, title, kind)')
      .eq('program_id', programId)
      .order('position');

    const allLessons = (mods || []).flatMap((m) =>
      (m.lessons || []).map((l) => ({ ...l, moduleTitle: m.title }))
    );
    setLessons(allLessons);

    // Cargar config del tutor
    const { data: tc } = await supabase
      .from('ai_tutor_config')
      .select('*')
      .eq('program_id', programId)
      .maybeSingle();
    if (tc) setConfig({ system_prompt: tc.system_prompt || '', enabled: tc.enabled });

    // Contar embeddings por lección
    const textLessonIds = allLessons.filter((l) => l.kind === 'texto').map((l) => l.id);
    if (textLessonIds.length) {
      const { data: embedRows } = await supabase
        .from('lesson_embeddings')
        .select('lesson_id')
        .in('lesson_id', textLessonIds);

      const counts = {};
      (embedRows || []).forEach(({ lesson_id }) => {
        counts[lesson_id] = (counts[lesson_id] || 0) + 1;
      });
      setIndexedCounts(counts);
    }
  }, [programId]);

  useEffect(() => { load(); }, [load]);

  async function saveConfig(e) {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase
      .from('ai_tutor_config')
      .upsert({ program_id: programId, ...config, updated_at: new Date().toISOString() },
        { onConflict: 'program_id' });
    setSaving(false);
    if (error) alert('Error: ' + error.message);
    else alert('Configuración guardada');
  }

  async function indexLesson(lessonId) {
    setIndexing((prev) => ({ ...prev, [lessonId]: true }));
    try {
      const res = await fetch('/api/ai/index', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lesson_id: lessonId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setIndexedCounts((prev) => ({ ...prev, [lessonId]: data.indexed }));
      alert(`Indexado: ${data.indexed} chunk${data.indexed !== 1 ? 's' : ''}`);
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setIndexing((prev) => ({ ...prev, [lessonId]: false }));
    }
  }

  async function indexAll() {
    const textLessons = lessons.filter((l) => l.kind === 'texto');
    for (const l of textLessons) {
      await indexLesson(l.id);
    }
    alert('Indexación completa');
  }

  const textLessons = lessons.filter((l) => l.kind === 'texto');

  return (
    <div>
      <Link href={`/admin/programa/${programId}`} className="text-sm text-brand-600 hover:underline">
        ← Contenido del programa
      </Link>
      <h1 className="mt-2 text-2xl font-bold text-slate-900">Tutor IA</h1>
      <p className="mt-1 text-sm text-slate-500">{program?.title}</p>

      {/* Config */}
      <form onSubmit={saveConfig} className="card mt-6 p-5 space-y-4">
        <h2 className="font-bold text-slate-800">Configuración del tutor</h2>

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="enabled"
            checked={config.enabled}
            onChange={(e) => setConfig({ ...config, enabled: e.target.checked })}
            className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
          />
          <label htmlFor="enabled" className="text-sm font-medium text-slate-700">
            Tutor habilitado para este programa
          </label>
        </div>

        <div>
          <label className="label">
            Instrucciones del sistema (opcional)
          </label>
          <textarea
            className="input"
            rows={5}
            value={config.system_prompt}
            onChange={(e) => setConfig({ ...config, system_prompt: e.target.value })}
            placeholder="Eres un tutor especializado en... Responde siempre en español. Enfócate en los aspectos clínicos..."
          />
          <p className="mt-1 text-xs text-slate-400">
            Si se deja vacío, se usa el prompt por defecto orientado a urología.
          </p>
        </div>

        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? 'Guardando…' : 'Guardar configuración'}
        </button>
      </form>

      {/* Indexación de lecciones */}
      <div className="card mt-6 p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-bold text-slate-800">Indexar contenido para RAG</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Solo lecciones de tipo "texto" pueden indexarse. Los videos de Drive no son accesibles al servidor.
            </p>
          </div>
          {textLessons.length > 0 && (
            <button onClick={indexAll} className="btn-secondary text-sm shrink-0">
              ⚡ Indexar todas
            </button>
          )}
        </div>

        {textLessons.length === 0 ? (
          <p className="text-sm text-slate-400">No hay lecciones de tipo "texto" en este programa.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {textLessons.map((l) => (
              <div key={l.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-slate-800">{l.title}</p>
                  <p className="text-xs text-slate-400">{l.moduleTitle}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  {indexedCounts[l.id] ? (
                    <span className="text-xs text-emerald-600">
                      ✓ {indexedCounts[l.id]} chunks
                    </span>
                  ) : (
                    <span className="text-xs text-slate-300">Sin indexar</span>
                  )}
                  <button
                    onClick={() => indexLesson(l.id)}
                    disabled={indexing[l.id]}
                    className="btn-secondary text-xs"
                  >
                    {indexing[l.id] ? '⏳ Indexando…' : indexedCounts[l.id] ? 'Re-indexar' : 'Indexar'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card mt-4 p-4 bg-amber-50 border-amber-200">
        <p className="text-xs text-amber-700">
          <b>Requisito:</b> Configura <code>OPENAI_API_KEY</code> y <code>ANTHROPIC_API_KEY</code> en las variables de entorno.
          La indexación usa <em>text-embedding-3-small</em> de OpenAI (muy económico: ~$0.02/millón tokens).
          Las respuestas del tutor usan <em>claude-haiku-4-5</em> (rápido y económico).
        </p>
      </div>
    </div>
  );
}
