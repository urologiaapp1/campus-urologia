import './globals.css';
import Nav from '@/components/Nav';
import { getSessionProfile } from '@/lib/supabase/server';

export const metadata = {
  title: 'Campus Urología Sur',
  description: 'Plataforma de diplomados y magíster en salud — Urología Sur',
  manifest: '/manifest.json',
  icons: { icon: '/icon.svg' },
};

export const viewport = {
  themeColor: '#0c647c',
};

export const dynamic = 'force-dynamic';

export default async function RootLayout({ children }) {
  const { user, profile } = await getSessionProfile();
  return (
    <html lang="es">
      <body>
        <Nav user={user ? { email: user.email } : null} profile={profile} />
        <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
        <footer className="border-t border-slate-200 py-6 text-center text-xs text-slate-400">
          © {new Date().getFullYear()} Urología Sur — Campus Virtual
        </footer>
      </body>
    </html>
  );
}
