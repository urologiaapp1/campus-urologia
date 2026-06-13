'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import NotificationBell from '@/components/NotificationBell';

export default function Nav({ user, profile }) {
  const router = useRouter();
  const isStaff = profile && ['admin', 'editor'].includes(profile.role);

  async function logout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 font-bold text-white">US</span>
          <span className="font-bold text-brand-900">Campus Urología Sur</span>
        </Link>
        <nav className="flex items-center gap-3 text-sm">
          {user ? (
            <>
              <Link href="/dashboard" className="font-medium text-slate-600 hover:text-brand-600">Mis programas</Link>
              <Link href="/simulador" className="hidden font-medium text-slate-600 hover:text-brand-600 sm:inline">Simulador</Link>
              <Link href="/buscar" className="hidden font-medium text-slate-600 hover:text-brand-600 sm:inline">Buscar</Link>
              <Link href="/ranking" className="hidden font-medium text-slate-600 hover:text-brand-600 sm:inline">Ranking</Link>
              {isStaff && (
                <Link href="/admin" className="font-medium text-slate-600 hover:text-brand-600">Administración</Link>
              )}
              <NotificationBell />
              <Link href="/perfil" className="hidden text-xs text-slate-400 hover:text-brand-600 sm:inline" title="Mi perfil">
                {user.email}
              </Link>
              <button onClick={logout} className="btn-secondary">Salir</button>
            </>
          ) : (
            <Link href="/login" className="btn-primary">Ingresar</Link>
          )}
        </nav>
      </div>
    </header>
  );
}
