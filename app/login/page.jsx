'use client';
import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';


const FEATURES = [
  { icon: '🔬', label: 'Contenido clínico especializado' },
  { icon: '✅', label: 'Evaluaciones seguras en servidor' },
  { icon: '🤖', label: 'Tutor IA 24/7' },
  { icon: '🏆', label: 'Certificados verificables con QR' },
];

/* ── Formulario ───────────────────────────────────────────────── */
function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

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
    /* ── Layout pantalla completa ────────────────────────────── */
    <div className="fixed inset-0 z-50 flex">

      {/* ── Panel izquierdo (branding) ──────────────────────── */}
      <div className="relative hidden w-[45%] flex-col justify-between overflow-hidden bg-gradient-to-br from-brand-900 via-brand-800 to-cyan-900 p-12 lg:flex">

        {/* Orbes decorativos */}
        <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-white/5 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 left-1/4 h-64 w-64 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="pointer-events-none absolute right-1/3 top-1/2 h-40 w-40 rounded-full bg-white/5 blur-2xl" />

        {/* Logo */}
        <div className="relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <div className="inline-block rounded-2xl bg-white px-4 py-2 shadow-lg">
            <img src="/logo.png" alt="Campus Urología Chile" style={{ height: '36px', width: 'auto', display: 'block' }} />
          </div>
        </div>

        {/* Copy central */}
        <div className="relative">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-300">
            Formación de posgrado
          </p>
          <h2 className="mt-3 text-4xl font-black leading-tight tracking-tight text-white">
            Especialízate<br />
            <span className="text-brand-300">en urología.</span>
          </h2>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-brand-200">
            Diplomados, magísteres y cursos diseñados por especialistas,
            con evaluaciones seguras y tutor IA disponible las 24 horas.
          </p>

          <ul className="mt-8 space-y-3">
            {FEATURES.map((f) => (
              <li key={f.label} className="flex items-center gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/10 text-sm backdrop-blur">
                  {f.icon}
                </span>
                <span className="text-sm text-brand-100">{f.label}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Footer */}
        <p className="relative text-[11px] text-brand-400">
          © {new Date().getFullYear()} Campus Urología Chile · info@urologiasur.cl
        </p>
      </div>

      {/* ── Panel derecho (formulario) ───────────────────────── */}
      <div className="flex flex-1 flex-col items-center justify-center overflow-y-auto bg-[var(--bg)] px-6 py-12">

        {/* Logo visible solo en móvil */}
        <div className="mb-8 lg:hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Campus Urología Chile" style={{ height: '40px', width: 'auto', display: 'block' }} />
        </div>

        <div className="w-full max-w-sm">
          {/* Título */}
          <div className="mb-8">
            <h1 className="text-2xl font-black tracking-tight text-[var(--text-1)]">
              Accede a tu cuenta
            </h1>
            <p className="mt-1.5 text-sm text-[var(--text-2)]">
              Las cuentas son creadas por la coordinación del programa.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="email" className="label">
                Correo electrónico
              </label>
              <input
                id="email"
                className="input"
                type="email"
                autoComplete="email"
                autoFocus
                value={email}
                required
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="label">
                  Contraseña
                </label>
                <Link
                  href="/recuperar"
                  className="text-[11px] font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              <input
                id="password"
                className="input"
                type="password"
                autoComplete="current-password"
                value={password}
                required
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 dark:border-red-900/40 dark:bg-red-900/20">
                <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center py-2.5 text-sm"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Ingresando…
                </span>
              ) : (
                'Ingresar'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-8 flex items-center gap-3">
            <div className="h-px flex-1 bg-[var(--border)]" />
            <span className="text-[11px] font-medium uppercase tracking-wider text-[var(--text-3)]">o</span>
            <div className="h-px flex-1 bg-[var(--border)]" />
          </div>

          {/* Código de acceso */}
          <Link
            href="/#codigo"
            className="btn-secondary w-full justify-center py-2.5 text-sm"
          >
            Tengo un código de acceso
          </Link>

          <p className="mt-6 text-center text-xs text-[var(--text-3)]">
            ¿Necesitas acceso?{' '}
            <a href="mailto:info@urologiasur.cl" className="font-medium text-brand-600 hover:underline dark:text-brand-400">
              Contáctanos
            </a>
          </p>
        </div>
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
