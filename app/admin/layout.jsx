import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSessionProfile } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

const navItem = 'rounded-lg px-3 py-2 font-medium text-slate-600 hover:bg-brand-50 hover:text-brand-700';

export default async function AdminLayout({ children }) {
  const { user, profile } = await getSessionProfile();
  if (!user) redirect('/login');
  if (!profile || !['admin', 'editor'].includes(profile.role)) redirect('/dashboard');

  return (
    <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
      <aside>
        <p className="label">Contenido</p>
        <nav className="mt-2 flex flex-col gap-1 text-sm">
          <Link href="/admin" className={navItem}>Programas</Link>
          <Link href="/admin/banco" className={navItem}>Banco de preguntas</Link>
        </nav>

        <p className="label mt-5">Alumnos</p>
        <nav className="mt-2 flex flex-col gap-1 text-sm">
          <Link href="/admin/cohortes" className={navItem}>Cohortes</Link>
          <Link href="/admin/tareas" className={navItem}>Tareas</Link>
          {profile.role === 'admin' && (
            <Link href="/admin/usuarios" className={navItem}>Usuarios y matrículas</Link>
          )}
        </nav>

        <p className="label mt-5">Analítica</p>
        <nav className="mt-2 flex flex-col gap-1 text-sm">
          <Link href="/admin/notas" className={navItem}>Libro de notas</Link>
        </nav>

        <p className="label mt-5">Comercial</p>
        <nav className="mt-2 flex flex-col gap-1 text-sm">
          <Link href="/admin/waitlist" className={navItem}>Lista de espera</Link>
        </nav>

        <p className="mt-6 px-3 text-xs text-slate-400">
          Rol: <b>{profile.role}</b>
        </p>
      </aside>
      <div>{children}</div>
    </div>
  );
}
