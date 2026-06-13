'use client';
/**
 * TutorChat — Asistente IA por lección con streaming
 * Se muestra como panel colapsable en la página de lección.
 */
import { useState, useRef, useEffect } from 'react';

const SUGGESTED_QUESTIONS = [
  '¿Puedes resumir los puntos clave de esta lección?',
  '¿Qué aspectos clínicos debo recordar?',
  '¿Cómo se aplica esto en la práctica?',
];

export default function TutorChat({ lessonId, lessonTitle }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus();
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function sendMessage(text) {
    const userText = (text || input).trim();
    if (!userText || loading) return;

    setInput('');
    setLoading(true);

    const newMessages = [...messages, { role: 'user', content: userText }];
    setMessages(newMessages);

    // Añadir placeholder de respuesta del asistente
    setMessages((prev) => [...prev, { role: 'assistant', content: '', streaming: true }]);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lesson_id: lessonId,
          message: userText,
          history: newMessages.slice(-6),
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Error del tutor');
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let assistantText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6);
          if (data === '[DONE]') continue;

          try {
            const event = JSON.parse(data);
            if (event.text) {
              assistantText += event.text;
              setMessages((prev) =>
                prev.map((m, i) =>
                  i === prev.length - 1 ? { ...m, content: assistantText } : m
                )
              );
            }
          } catch {
            // ignorar
          }
        }
      }

      // Finalizar streaming
      setMessages((prev) =>
        prev.map((m, i) => (i === prev.length - 1 ? { ...m, streaming: false } : m))
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

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2">
      {/* Panel de chat */}
      {open && (
        <div className="flex flex-col w-80 sm:w-96 h-[480px] rounded-2xl shadow-2xl border border-slate-200 bg-white overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between bg-brand-700 px-4 py-3 shrink-0">
            <div>
              <p className="text-sm font-bold text-white">🤖 Tutor IA</p>
              <p className="text-xs text-brand-200 truncate max-w-[220px]">{lessonTitle}</p>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-brand-200 hover:text-white text-lg leading-none"
              aria-label="Cerrar tutor"
            >
              ✕
            </button>
          </div>

          {/* Mensajes */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 && (
              <div className="space-y-2">
                <p className="text-xs text-slate-400 text-center">
                  Hola, soy tu tutor IA. Pregúntame sobre el contenido de esta lección.
                </p>
                <div className="space-y-1.5 mt-3">
                  {SUGGESTED_QUESTIONS.map((q) => (
                    <button
                      key={q}
                      onClick={() => sendMessage(q)}
                      className="w-full text-left text-xs rounded-lg border border-brand-200 bg-brand-50 px-3 py-2 text-brand-700 hover:bg-brand-100 transition-colors"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-brand-600 text-white rounded-br-sm'
                      : 'bg-slate-100 text-slate-800 rounded-bl-sm'
                  }`}
                >
                  {m.content || (m.streaming && <span className="animate-pulse">▋</span>)}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <form
            onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
            className="flex gap-2 border-t border-slate-100 p-3 shrink-0"
          >
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escribe tu pregunta…"
              disabled={loading}
              className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="rounded-xl bg-brand-600 px-3 py-2 text-white disabled:opacity-40 hover:bg-brand-700 transition-colors"
              aria-label="Enviar"
            >
              {loading ? (
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                '↑'
              )}
            </button>
          </form>
        </div>
      )}

      {/* Botón flotante */}
      <button
        onClick={() => setOpen((v) => !v)}
        className={`flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all ${
          open
            ? 'bg-slate-700 text-white'
            : 'bg-brand-600 text-white hover:bg-brand-700 hover:scale-105'
        }`}
        title="Tutor IA"
      >
        {open ? '✕' : '🤖'}
      </button>
    </div>
  );
}
