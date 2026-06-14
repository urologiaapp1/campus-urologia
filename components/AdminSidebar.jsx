'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const SECTIONS = [
  {
    label: 'Contenido',
    items: [
      { href: '/admin',       icon: '📚', label: 'Programas', exact: true },
      { href: '/admin/banco', icon: '❓', label: 'Banco de preguntas' },
    ],
  },
  {
    label: 'Alumnos',
    items: [
      { href: '/admin/cohortes', icon: '🗓', label: 'Cohortes' },
      { href: '/admin/tareas',   icon: '📝', label: 'Tareas' },
      { href: '/admin/usuarios', icon: '👥', label: 'Usuarios y matrículas', adminOnly: true },
    ],
  },
  {
    label: 'Analítica',
    items: [
      { href: '/admin/notas', icon: '📊', label: 'Libro de notas' },
    ],
  },
  {
    label: 'Comercial',
    items: [
      { href: '/admin/waitlist', icon: '📋', label: 'Lista de espera' },
    ],
  },
];

const ROLE_BADGE = { admin: 'badge-brand', editor: 'badge-slate' };
const ROLE_LABEL = { admin: 'Administrador', editor: 'Editor' };

export default function AdminSidebar({ role }) {
  const pathname = usePathname();

  const isActive = (href, exact) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(href + '/');

  return (
    <aside className="shrink-0">
      {SECTIONS.map((section) => {
        const items = section.items.filter((i) => !i.adminOnly || role === 'admin');
        if (!items.length) return null;
        return (
          <div key={section.label} className="mb-5">
            <p className="label px-2">{section.label}</p>
            <nav className="mt-1 flex flex-col gap-0.5">
              {items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive(item.href, item.exact)
                      ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300'
                      : 'text-[var(--text-2)] hover:bg-[var(--surface-2)] hover:text-[var(--text-1)]'
                  }`}
                >
                  <span className="text-base leading-none">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        );
      })}

      {/* Rol */}
      <div className="mt-4 rounded-lg border border-[var(--border)] px-3 py-2.5">
        <p className="text-xs text-[var(--text-3)] mb-1">Rol actual</p>
        <span className={`badge ${ROLE_BADGE[role] || 'badge-slate'}`}>
          {ROLE_LABEL[role] || role}
        </span>
      </div>
    </aside>
  );
}
