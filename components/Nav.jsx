'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useTheme } from '@/components/ThemeProvider';
import NotificationBell from '@/components/NotificationBell';
import Image from 'next/image';

/* ── Íconos SVG ───────────────────────────────────────────────── */
const Icon = {
  Dashboard: (p) => (
    <svg {...p} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="7" height="7" rx="1.5"/>
      <rect x="11" y="2" width="7" height="7" rx="1.5"/>
      <rect x="2" y="11" width="7" height="7" rx="1.5"/>
      <rect x="11" y="11" width="7" height="7" rx="1.5"/>
    </svg>
  ),
  Simulador: (p) => (
    <svg {...p} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="10" cy="7" r="3.5"/>
      <path d="M3 17c0-3.314 3.134-6 7-6s7 2.686 7 6"/>
      <path d="M13.5 4.5 Q16 4.5 16 7 Q16 9.5 13.5 9.5"/>
    </svg>
  ),
  Buscar: (p) => (
    <svg {...p} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8.5" cy="8.5" r="5"/>
      <path d="M12.5 12.5 17 17"/>
    </svg>
  ),
  Ranking: (p) => (
    <svg {...p} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 2 L12.09 7.26 L17.73 7.64 L13.55 11.22 L14.9 16.74 L10 13.77 L5.1 16.74 L6.45 11.22 L2.27 7.64 L7.91 7.26 Z"/>
    </svg>
  ),
  Admin: (p) => (
    <svg {...p} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="10" cy="10" r="2.5"/>
      <path d="M10 2v2M10 16v2M2 10h2M16 10h2M4.22 4.22l1.42 1.42M14.36 14.36l1.42 1.42M4.22 15.78l1.42-1.42M14.36 5.64l1.42-1.42"/>
    </svg>
  ),
  Sun: (p) => (
    <svg {...p} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <circle cx="10" cy="10" r="3.5"/>
      <path d="M10 2v2M10 16v2M2 10h2M16 10h2M4.22 4.22l1.42 1.42M14.36 14.36l1.42 1.42M4.22 15.78l1.42-1.42M14.36 5.64l1.42-1.42"/>
    </svg>
  ),
  Moon: (p) => (
    <svg {...p} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <path d="M17 10.5A7 7 0 019.5 3a7 7 0 000 14 7 7 0 007.5-6.5z"/>
    </svg>
  ),
  User: (p) => (
    <svg {...p} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="10" cy="7" r="3.5"/>
      <path d="M3 17c0-3.314 3.134-6 7-6s7 2.686 7 6"/>
    </svg>
  ),
  Key: (p) => (
    <svg {...p} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="7.5" cy="9.5" r="4"/>
      <path d="M11 9.5h7M15.5 9.5v2.5"/>
    </svg>
  ),
  Logout: (p) => (
    <svg {...p} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 10H3M7 6l-4 4 4 4"/>
      <path d="M9 3h6a2 2 0 012 2v10a2 2 0 01-2 2H9"/>
    </svg>
  ),
};

/* ── Logo CUCh ────────────────────────────────────────────────── */
function LogoUC({ size = 30 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect width="100" height="100" rx="22" fill="#083f52"/>
      <path d="M40 15 Q11 15 11 46 Q11 77 40 77" stroke="#fff" strokeWidth="11" fill="none" strokeLinecap="round"/>
      <rect x="50" y="15" width="10" height="41" rx="3" fill="#fff"/>
      <rect x="73" y="15" width="10" height="41" rx="3" fill="#fff"/>
      <rect x="50" y="48" width="33" height="10" rx="5" fill="#fff"/>
      <path d="M57 74 Q49 74 49 82 Q49 90 57 90" stroke="#22d3ee" strokeWidth="5.5" fill="none" strokeLinecap="round"/>
      <rect x="62" y="70" width="5" height="20" rx="2" fill="#22d3ee"/>
      <path d="M67 80 Q68 75 75 75 L75 90" stroke="#22d3ee" strokeWidth="5" fill="none" strokeLinecap="round"/>
    </svg>
  );
}

/* ── Switch modo oscuro ───────────────────────────────────────── */
function DarkModeSwitch() {
  const { theme, toggle } = useTheme();
  return (
    <button
      onClick={toggle}
      role="switch"
      aria-checked={theme === 'dark'}
      className={`relative inline-flex h-5 w-9 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${
        theme === 'dark' ? 'bg-brand-600' : 'bg-slate-200'
      }`}
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform mt-0.5 ${
        theme === 'dark' ? 'translate-x-4 ml-0.5' : 'translate-x-0.5'
      }`} />
    </button>
  );
}

/* ── Botón dark en header ─────────────────────────────────────── */
function DarkToggle() {
  const { theme, toggle } = useTheme();
  return (
    <button
      onClick={toggle}
      aria-label={theme === 'dark' ? 'Activar modo claro' : 'Activar modo oscuro'}
      className="btn-ghost rounded-lg p-2"
    >
      {theme === 'dark'
        ? <Icon.Sun className="h-4 w-4" />
        : <Icon.Moon className="h-4 w-4" />
      }
    </button>
  );
}

/* ── Avatar + menú usuario ────────────────────────────────────── */
function UserMenu({ user, profile, onLogout }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const initials = (profile?.full_name || user.email)
    .split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
  const roleLabel = { admin: 'Administrador', editor: 'Editor', student: 'Alumno' };

  useEffect(() => {
    function handler(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-700 text-xs font-bold text-white ring-2 ring-transparent transition-all hover:ring-brand-300 focus-visible:outline-none focus-visible:ring-brand-500"
        aria-label="Menú de usuario"
        aria-expanded={open}
      >
        {initials}
      </button>

      {open && (
        <div className="absolute right-0 top-10 z-50 w-64 animate-fade-up rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-1.5 shadow-elev-3">
          {/* Info usuario */}
          <div className="px-3 py-2.5">
            <p className="truncate text-sm font-semibold text-[var(--text-1)]">
              {profile?.full_name || 'Usuario'}
            </p>
            <p className="truncate text-xs text-[var(--text-3)]">{user.email}</p>
            {profile?.role && (
              <span className="mt-1.5 badge badge-brand">{roleLabel[profile.role] || profile.role}</span>
            )}
          </div>

          <div className="divider my-1" />

          <Link href="/perfil" onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-[var(--text-2)] transition-colors hover:bg-[var(--surface-2)] hover:text-[var(--text-1)]">
            <Icon.User className="h-4 w-4 shrink-0 text-[var(--text-3)]" />
            Mi perfil
          </Link>
          <Link href="/perfil/ia" onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-[var(--text-2)] transition-colors hover:bg-[var(--surface-2)] hover:text-[var(--text-1)]">
            <Icon.Key className="h-4 w-4 shrink-0 text-[var(--text-3)]" />
            Mi API key de IA
          </Link>

          <div className="divider my-1" />

          <div className="flex items-center justify-between rounded-xl px-3 py-2">
            <span className="text-sm text-[var(--text-2)]">Modo oscuro</span>
            <DarkModeSwitch />
          </div>

          <div className="divider my-1" />

          <button
            onClick={() => { setOpen(false); onLogout(); }}
            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-red-600 transition-colors hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <Icon.Logout className="h-4 w-4 shrink-0" />
            Cerrar sesión
          </button>
        </div>
      )}
    </div>
  );
}

/* ── Nav principal ────────────────────────────────────────────── */
export default function Nav({ user, profile }) {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isStaff = profile && ['admin', 'editor'].includes(profile.role);

  async function logout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  const isActive = (href) => href === '/' ? pathname === '/' : pathname.startsWith(href);

  const isAdmin = profile?.role === 'admin';
  const navLinks = user ? [
    { href: '/dashboard', label: 'Mis programas', Icon: Icon.Dashboard },
    { href: '/simulador', label: 'Simulador',     Icon: Icon.Simulador  },
    { href: '/buscar',    label: 'Buscar',         Icon: Icon.Buscar     },
    ...(isAdmin  ? [{ href: '/ranking', label: 'Ranking', Icon: Icon.Ranking }] : []),
    ...(isStaff  ? [{ href: '/admin',   label: 'Admin',   Icon: Icon.Admin   }] : []),
  ] : [];

  return (
    <>
      {/* Landing (sin sesión): nav oscura que se funde con el hero.
          Páginas interiores: nav blanca/surface normal */}
      <header className={`sticky top-0 z-40 ${
        !user
          ? 'bg-brand-900'
          : 'border-b border-[var(--border)] bg-[var(--surface)]/95 backdrop-blur-xl'
      }`}>
        <div className="mx-auto flex h-[72px] max-w-6xl items-center justify-between gap-4 px-6">

          {/* Logo */}
          <Link href="/" aria-label="Campus Urología Chile" className="group flex shrink-0 items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.png"
              alt="Campus Urología Chile"
              style={{
                height: '36px',
                width: 'auto',
                display: 'block',
                filter: !user ? 'brightness(1.4) drop-shadow(0 1px 3px rgba(0,0,0,0.3))' : undefined,
              }}
              className="transition-opacity duration-150 group-hover:opacity-80 dark:brightness-[1.3]"
            />
          </Link>

          {/* Nav desktop */}
          {user && (
            <nav className="hidden items-center gap-0.5 lg:flex" aria-label="Navegación principal">
              {navLinks.map(({ href, label, Icon: NavIcon }) => {
                const active = isActive(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`group relative flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      active
                        ? 'text-brand-600 dark:text-brand-300'
                        : 'text-[var(--text-2)] hover:text-[var(--text-1)] hover:bg-[var(--surface-2)]'
                    }`}
                  >
                    <NavIcon className={`h-[15px] w-[15px] shrink-0 transition-colors ${
                      active ? 'text-brand-500' : 'text-[var(--text-3)] group-hover:text-[var(--text-2)]'
                    }`} />
                    {label}
                    {/* Indicador activo */}
                    {active && (
                      <span className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-brand-500" />
                    )}
                  </Link>
                );
              })}
            </nav>
          )}

          {/* Acciones */}
          <div className="flex shrink-0 items-center gap-1.5">
            {user ? (
              <>
                <div className="hidden sm:block"><DarkToggle /></div>
                <NotificationBell />
                <UserMenu user={user} profile={profile} onLogout={logout} />
              </>
            ) : (
              <>
                {pathname !== '/login' && (
                  <Link href="/login" className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-brand-900 shadow-sm transition hover:bg-brand-50">
                    Acceder
                  </Link>
                )}
              </>
            )}

            {/* Hamburguesa */}
            {user && (
              <button
                onClick={() => setMobileOpen((v) => !v)}
                className="btn-ghost rounded-lg p-2 lg:hidden"
                aria-label={mobileOpen ? 'Cerrar menú' : 'Abrir menú'}
                aria-expanded={mobileOpen}
              >
                <span className="block w-5 space-y-[5px]">
                  <span className={`block h-0.5 rounded bg-[var(--text-2)] transition-transform duration-200 ${mobileOpen ? 'translate-y-[7px] rotate-45' : ''}`} />
                  <span className={`block h-0.5 rounded bg-[var(--text-2)] transition-opacity duration-200 ${mobileOpen ? 'opacity-0' : ''}`} />
                  <span className={`block h-0.5 rounded bg-[var(--text-2)] transition-transform duration-200 ${mobileOpen ? '-translate-y-[7px] -rotate-45' : ''}`} />
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Menú móvil */}
        {mobileOpen && user && (
          <nav className="animate-fade-in border-t border-[var(--border)] px-3 pb-4 pt-2 lg:hidden">
            {navLinks.map(({ href, label, Icon: NavIcon }) => {
              const active = isActive(href);
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors ${
                    active
                      ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300'
                      : 'text-[var(--text-2)] hover:bg-[var(--surface-2)] hover:text-[var(--text-1)]'
                  }`}
                >
                  <NavIcon className={`h-[18px] w-[18px] shrink-0 ${
                    active ? 'text-brand-500' : 'text-[var(--text-3)]'
                  }`} />
                  {label}
                </Link>
              );
            })}

            <div className="mt-2 flex items-center justify-between rounded-xl px-3 py-2.5">
              <span className="text-sm text-[var(--text-2)]">Modo oscuro</span>
              <DarkModeSwitch />
            </div>
          </nav>
        )}
      </header>
    </>
  );
}
