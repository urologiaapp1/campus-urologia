'use client';
import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError('Credenciales incorrectas. Si no tienes cuenta, contacta a la coordinación.');
      setLoading(false);
      return;
    }
    router.push(params.get('next') || '/dashboard');
    router.refresh();
  }

  return (
    <div className="mx-auto mt-10 max-w-md">
      <div className="card p-8">
        <h1 className="text-xl font-bold text-slate-900">Acceso al campus</h1>
        <p className="mt-1 text-sm text-slate-500">
          Las cuentas son creadas por la coordinación del programa.
        </p>
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <label className="label">Correo electrónico</label>
            <input className="input" type="email" value={email} required
              onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <label className="label">Contraseña</label>
            <input className="input" type="password" value={password} required
              onChange={(e) => setPassword(e.target.value)} />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button className="btn-primary w-full justify-center" disabled={loading}>
            {loading ? 'Ingresando…' : 'Ingresar'}
          </button>
          <a href="/recuperar" className="block text-center text-sm text-brand-600 hover:underline">
            Olvidé mi contraseña
          </a>
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
