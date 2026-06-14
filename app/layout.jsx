import './globals.css';
import { Inter } from 'next/font/google';
import Nav from '@/components/Nav';
import ThemeProvider from '@/components/ThemeProvider';
import { getSessionProfile } from '@/lib/supabase/server';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata = {
  title: {
    default: 'Campus Urología Chile',
    template: '%s · Campus Urología Chile',
  },
  description: 'Plataforma de formación de posgrado en urología — diplomados, magísteres y cursos especializados para médicos.',
  keywords: ['urología', 'posgrado', 'diplomado', 'medicina', 'Chile', 'cirugía uretral'],
  authors: [{ name: 'Campus Urología Chile' }],
  openGraph: {
    title: 'Campus Urología Chile',
    description: 'Formación de posgrado en urología para médicos. Diplomados, magísteres y cursos especializados.',
    siteName: 'Campus Urología Chile',
    locale: 'es_CL',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Campus Urología Chile',
    description: 'Formación de posgrado en urología para médicos.',
  },
  manifest: '/manifest.json',
  icons: { icon: '/icon.svg', apple: '/icon.svg' },
};

export const viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#083f52' },
    { media: '(prefers-color-scheme: dark)',  color: '#0f1923' },
  ],
};

export const dynamic = 'force-dynamic';

export default async function RootLayout({ children }) {
  const { user, profile } = await getSessionProfile();
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans`}>
        <ThemeProvider>
          <Nav user={user ? { email: user.email } : null} profile={profile} />
          <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
          <footer className="mt-16 border-t border-[var(--border)] bg-[var(--surface)]">
            <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-6 text-xs text-[var(--text-3)]">
              <div className="flex items-center gap-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logo.png" alt="CUCh" style={{ height: 28, width: 'auto' }} />
              </div>
              <div className="flex flex-wrap items-center gap-6">
                <span>Formación de postgrado en urología</span>
                <a
                  href="mailto:campusurologiachile@gmail.com"
                  className="font-medium text-brand-600 transition-colors hover:text-brand-700 dark:text-brand-400"
                >
                  campusurologiachile@gmail.com
                </a>
              </div>
              <p>© {new Date().getFullYear()} Campus Urología Chile</p>
            </div>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}
