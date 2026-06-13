import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <p className="text-7xl font-black text-brand-200">404</p>
      <h1 className="mt-4 text-2xl font-bold text-slate-800">Página no encontrada</h1>
      <p className="mt-2 max-w-sm text-sm text-slate-400">
        La página que buscas no existe o no tienes acceso a ella.
      </p>
      <div className="mt-8 flex gap-3">
        <Link href="/dashboard" className="btn-primary">Ir a mis programas</Link>
        <Link href="/" className="btn-secondary">Inicio</Link>
      </div>
    </div>
  );
}
