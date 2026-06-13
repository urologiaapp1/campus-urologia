'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

const PROVIDERS = [
  { value: 'gemini', label: 'Google Gemini', hint: 'Gratis en Google AI Studio (aistudio.google.com). Recomendado.' },
  { value: 'groq', label: 'Groq', hint: 'Muy rápido, plan gratuito disponible en console.groq.com.' },
  { value: 'openai', label: 'OpenAI', hint: 'platform.openai.com → API keys. Requiere saldo.' },
  { value: 'anthropic', label: 'Anthropic (Claude)', hint: 'console.anthropic.com → API Keys. Requiere saldo.' },
];

export default function IAKeyPage() {
  const supabase = createClient();
  const [provider, setProvider] = useState('gemini');
  const [apiKey, setApiKey] = useState('');
  const [hasKey, setHasKey] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('user_ai_keys')
      .select('provider')
      .maybeSingle()
      .then(({ data }) => {
        if (data) { setProvider(data.provider); setHasKey(true); }
        setLoading(false);
      });
  }, []);

  async function save(e) {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();

    if (hasKey && !apiKey) {
      // Solo cambio de proveedor — no tocar la key existente
      await supabase
        .from('user_ai_keys')
        .update({ provider, updated_at: new Date().toISOString() })
        .eq('user_id', user.id);
    } else {
      await supabase.from('user_ai_keys').upsert({
        user_id: user.id,
        provider,
        api_key_encrypted: apiKey,
        updated_at: new Date().toISOString(),
      });
    }

    setHasKey(true);
    setApiKey('');
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  async function removeKey() {
    if (!confirm('¿Eliminar tu API key? El simulador usará la clave institucional del campus.')) return;
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('user_ai_keys').delete().eq('user_id', user.id);
    setHasKey(false);
    setProvider('gemini');
  }

  if (loading) return <p className="text-sm text-slate-400">Cargando…</p>;

  const providerInfo = PROVIDERS.find((p) => p.value === provider);

  return (
    <div className="mx-auto max-w-lg">
      <Link href="/perfil" className="text-sm text-brand-600 hover:underline">← Mi perfil</Link>
      <h1 className="mt-2 text-xl font-bold text-slate-900">⚙️ Mi API key de IA</h1>
      <p className="mt-1 text-sm text-slate-500">
        Opcional. El simulador de paciente usa por defecto la clave institucional del campus.
        Si tienes tu propia clave de IA, puedes usarla aquí para no consumir el cupo compartido.
      </p>

      {hasKey && (
        <div className="mt-4 flex items-center justify-between rounded-xl border border-green-200 bg-green-50 px-4 py-3">
          <div>
            <p className="text-sm font-medium text-green-800">API key configurada</p>
            <p className="text-xs text-green-600">
              Proveedor activo: {PROVIDERS.find((p) => p.value === provider)?.label}
            </p>
          </div>
          <button onClick={removeKey} className="btn-danger text-xs">Eliminar</button>
        </div>
      )}

      <form onSubmit={save} className="card mt-4 space-y-4 p-5">
        <div>
          <label className="label">Proveedor</label>
          <select className="input" value={provider} onChange={(e) => setProvider(e.target.value)}>
            {PROVIDERS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
          </select>
          {providerInfo && <p className="mt-1 text-xs text-slate-400">{providerInfo.hint}</p>}
        </div>

        <div>
          <label className="label">API Key</label>
          <input
            type="password"
            className="input font-mono"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder={hasKey ? '••••••••••••••••••• (déjalo vacío para no cambiarla)' : 'Pega tu clave aquí'}
            required={!hasKey}
          />
        </div>

        <button type="submit" className="btn-primary" disabled={!apiKey && !hasKey}>
          {saved ? '✓ Guardada' : hasKey ? 'Actualizar clave' : 'Guardar clave'}
        </button>
      </form>

      <div className="mt-4 space-y-1 rounded-xl border border-slate-100 bg-slate-50 p-4 text-xs text-slate-500">
        <p>🔒 Tu clave se almacena en la base de datos protegida por Row Level Security — solo tú puedes verla o modificarla.</p>
        <p>🆓 Para obtener una clave gratuita de Gemini: <strong>aistudio.google.com</strong> → Get API key → Create API key.</p>
        <p>ℹ️ Si eliminas tu clave, el simulador seguirá funcionando usando la clave institucional del campus.</p>
      </div>
    </div>
  );
}
