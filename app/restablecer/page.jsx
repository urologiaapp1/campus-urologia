'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    if (password !== confirm) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    setLoading(true);
    setError('');
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setError('No se pudo actualizar. El enlace puede haber expirado; solicita uno nuevo.');
      setLoading(false);
      return;
    }
    router.push('/dashboard');
    router.refresh();
  }

  return (
    <div className="mx-auto mt-10 max-w-md">
      <div className="card p-8">
        <h1 className="text-xl font-bold text-slate-900">Nueva contraseña</h1>
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <label className="label">Nueva contraseña (mín. 8 caracteres)</label>
            <input className="input" type="password" value={password} required minLength={8}
              onChange={(e) => setPassword(e.target.value)} />
          </div>
          <div>
            <label className="label">Confirmar contraseña</label>
            <input className="input" type="password" value={confirm} required minLength={8}
              onChange={(e) => setConfirm(e.target.value)} />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button className="btn-primary w-full justify-center" disabled={loading}>
            {loading ? 'Guardando…' : 'Guardar contraseña'}
          </button>
        </form>
      </div>
    </div>
  );
}
