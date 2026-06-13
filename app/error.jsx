'use client';
import { useEffect } from 'react';

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <p className="text-5xl">⚠️</p>
      <h1 className="mt-4 text-xl font-bold text-slate-800">Algo salió mal</h1>
      <p className="mt-2 max-w-sm text-sm text-slate-400">
        Ocurrió un error inesperado. Puedes intentarlo de nuevo o volver al inicio.
      </p>
      <div className="mt-8 flex gap-3">
        <button onClick={reset} className="btn-primary">Reintentar</button>
        <a href="/dashboard" className="btn-secondary">Mis programas</a>
      </div>
    </div>
  );
}
