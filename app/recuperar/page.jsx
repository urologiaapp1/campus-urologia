'use client';
import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function RecoverPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    const supabase = createClient();
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/restablecer`,
    });
    setSent(true);
    setLoading(false);
  }

  return (
    <div className="mx-auto mt-10 max-w-md">
      <div className="card p-8">
        <h1 className="text-xl font-bold text-[var(--text-1)]">Recuperar contraseña</h1>
        {sent ? (
          <p className="mt-4 text-sm text-[var(--text-2)]">
            Si <b>{email}</b> está registrado, recibirás un correo con un enlace para
            crear una nueva contraseña. Revisa también la carpeta de spam.
          </p>
        ) : (
          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div>
              <label className="label">Correo electrónico</label>
              <input className="input" type="email" value={email} required
                onChange={(e) => setEmail(e.target.value)} />
            </div>
            <button className="btn-primary w-full justify-center" disabled={loading}>
              {loading ? 'Enviando…' : 'Enviar enlace de recuperación'}
            </button>
          </form>
        )}
        <Link href="/login" className="mt-4 block text-center text-sm text-brand-600 hover:underline">
          ← Volver al acceso
        </Link>
      </div>
    </div>
  );
}
