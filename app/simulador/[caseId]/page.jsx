'use client';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

const BADGE = {
  básico:     'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  intermedio: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  avanzado:   'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

const STARTERS = [
  'Buenos días, ¿en qué le puedo ayudar hoy?',
  '¿Cuál es el motivo de su consulta?',
  'Cuénteme qué le trae por acá.',
];

export default function SimuladorSessionPage() {
  const { caseId } = useParams();
  const supabase = createClient();

  const [clinicalCase, setClinicalCase] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [result, setResult] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  // Cargar caso y sesión existente
  useEffect(() => {
    async function init() {
      const { data: c } = await supabase
        .from('clinical_cases')
        .select('id, title, specialty, difficulty, learning_objectives')
        .eq('id', caseId)
        .single();
      setClinicalCase(c);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: session } = await supabase
        .from('simulation_sessions')
        .select('id, messages, status, score, feedback')
        .eq('user_id', user.id)
        .eq('case_id', caseId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (session) {
        setSessionId(session.id);
        setMessages(session.messages || []);
        if (session.status === 'completed' && session.score !== null) {
          setResult({ score: session.score, feedback: session.feedback });
        }
      }
    }
    init();
  }, [caseId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function sendMessage(text) {
    const userText = (text ?? input).trim();
    if (!userText || loading || result) return;

    setInput('');
    setLoading(true);

    const newMessages = [...messages, { role: 'user', content: userText }];
    setMessages(newMessages);
    setMessages((prev) => [...prev, { role: 'assistant', content: '', streaming: true }]);

    try {
      const res = await fetch('/api/simulator/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ case_id: caseId, messages: newMessages }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Error del simulador');
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let assistantText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        for (const line of decoder.decode(value, { stream: true }).split('\n')) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6);
          if (data === '[DONE]') continue;
          try {
            const event = JSON.parse(data);
            if (event.session_id) setSessionId(event.session_id);
            if (event.text) {
              assistantText += event.text;
              setMessages((prev) =>
                prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantText } : m)
              );
            }
          } catch { }
        }
      }

      setMessages((prev) =>
        prev.map((m, i) => i === prev.length - 1 ? { ...m, streaming: false } : m)
      );
    } catch (err) {
      setMessages((prev) =>
        prev.map((m, i) =>
          i === prev.length - 1
            ? { role: 'assistant', content: `❌ ${err.message}`, streaming: false }
            : m
        )
      );
    } finally {
      setLoading(false);
    }
  }

  async function evaluate() {
    if (!sessionId || evaluating) return;
    if (!confirm('¿Finalizar la consulta y recibir evaluación de tu razonamiento clínico?')) return;
    setEvaluating(true);
    try {
      const res = await fetch('/api/simulator/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResult({ score: data.score, feedback: data.feedback });
    } catch (err) {
      alert('Error al evaluar: ' + err.message);
    } finally {
      setEvaluating(false);
    }
  }

  if (!clinicalCase) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-[var(--text-3)]">Cargando caso…</p>
      </div>
    );
  }

  const scoreColor = result
    ? result.score >= 80 ? 'text-green-600' : result.score >= 60 ? 'text-yellow-600' : 'text-red-600'
    : '';

  return (
    <div className="mx-auto flex h-[calc(100vh-5rem)] max-w-3xl flex-col">
      {/* Cabecera */}
      <div className="shrink-0 border-b border-[var(--border)] pb-3">
        <Link href="/simulador" className="text-sm text-brand-600 hover:underline">← Casos</Link>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <h1 className="text-base font-bold text-[var(--text-1)]">{clinicalCase.title}</h1>
          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${BADGE[clinicalCase.difficulty]}`}>
            {clinicalCase.difficulty}
          </span>
          <span className="text-xs text-[var(--text-3)]">{clinicalCase.specialty}</span>
        </div>
        {clinicalCase.learning_objectives && (
          <p className="mt-0.5 text-xs text-[var(--text-3)]">{clinicalCase.learning_objectives}</p>
        )}
      </div>

      {/* Panel de resultado */}
      {result && (
        <div className="my-3 shrink-0 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
          <div className="flex items-center gap-3">
            <span className={`text-3xl font-bold ${scoreColor}`}>{result.score}/100</span>
            <div>
              <p className="font-semibold text-[var(--text-1)]">Evaluación completada</p>
              <p className="text-xs text-[var(--text-3)]">Retroalimentación clínica</p>
            </div>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-[var(--text-2)]">{result.feedback}</p>
          <Link href="/simulador" className="btn-secondary mt-3 inline-block text-sm">
            Volver a casos
          </Link>
        </div>
      )}

      {/* Mensajes */}
      <div className="flex-1 overflow-y-auto py-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center">
            <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-3xl">
              🧑‍⚕️
            </div>
            <p className="text-sm text-slate-500">El paciente está esperando. Inicia la consulta.</p>
            <div className="mt-4 flex flex-col items-center gap-2">
              {STARTERS.map((q) => (
                <button key={q} onClick={() => sendMessage(q)}
                  className="rounded-lg border border-brand-200 bg-brand-50 px-4 py-2 text-sm text-brand-700 transition-colors hover:bg-brand-100">
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm ${
              m.role === 'user' ? 'bg-brand-600 text-white' : 'bg-[var(--surface-2)] text-[var(--text-2)]'
            }`}>
              {m.role === 'user' ? '👨‍⚕️' : '🧑‍⚕️'}
            </div>
            <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
              m.role === 'user'
                ? 'rounded-tr-sm bg-brand-600 text-white'
                : 'rounded-tl-sm border border-[var(--border)] bg-[var(--surface)] text-[var(--text-1)]'
            }`}>
              {m.content || (m.streaming && <span className="animate-pulse">▋</span>)}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      {!result && (
        <div className="shrink-0 space-y-2 border-t border-[var(--border)] pt-3">
          <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }} className="flex gap-2">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escribe tu pregunta al paciente…"
              disabled={loading}
              className="flex-1 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-4 py-2.5 text-sm text-[var(--text-1)] outline-none placeholder:text-[var(--text-3)] focus:border-brand-400 focus:ring-2 focus:ring-brand-100 disabled:opacity-50"
            />
            <button type="submit" disabled={loading || !input.trim()}
              className="rounded-xl bg-brand-600 px-4 py-2.5 text-white transition-colors hover:bg-brand-700 disabled:opacity-40">
              {loading
                ? <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                : '↑'}
            </button>
          </form>
          {messages.length >= 4 && (
            <button onClick={evaluate} disabled={evaluating}
              className="w-full rounded-xl border border-[var(--border)] py-2 text-sm text-[var(--text-2)] transition-colors hover:border-brand-300 hover:text-brand-600 disabled:opacity-50">
              {evaluating ? '⏳ Evaluando razonamiento clínico…' : '📋 Finalizar consulta y recibir evaluación'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
