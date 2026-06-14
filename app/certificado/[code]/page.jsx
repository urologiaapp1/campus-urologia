import { createAdminClient } from '@/lib/supabase/admin';
import Image from 'next/image';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

const KIND_LABEL = { diplomado: 'Diplomado', magister: 'Magíster', curso: 'Curso' };

export default async function CertificatePage({ params }) {
  const admin = createAdminClient();
  const { data: cert } = await admin
    .from('certificates')
    .select('code, avg_score, issued_at, profiles(full_name, specialty, institution, country), programs(title, kind)')
    .eq('code', params.code)
    .maybeSingle();

  if (!cert) {
    return (
      <div className="mx-auto mt-16 max-w-md text-center">
        <div className="card p-8">
          <p className="text-4xl">✕</p>
          <h1 className="mt-2 text-xl font-bold text-red-700">Certificado no válido</h1>
          <p className="mt-2 text-sm text-[var(--text-3)]">
            El código <b>{params.code}</b> no corresponde a ningún certificado emitido
            por Campus Urología Chile.
          </p>
        </div>
      </div>
    );
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://campus-urologiasur-cyan.vercel.app';
  const verifyUrl = `${siteUrl}/certificado/${cert.code}`;
  const qr = `https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(verifyUrl)}&bgcolor=ffffff&color=083f52&qzone=1`;

  const date = new Date(cert.issued_at).toLocaleDateString('es-CL', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  const meta = [cert.profiles?.specialty, cert.profiles?.institution, cert.profiles?.country]
    .filter(Boolean).join(' · ');

  return (
    <div className="mx-auto max-w-3xl">

      {/* Barra de acciones */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-3 dark:border-emerald-900/40 dark:bg-emerald-900/10">
        <div className="flex items-center gap-2 text-sm font-semibold text-emerald-700 dark:text-emerald-400">
          <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 12l2 2 4-4"/><circle cx="10" cy="10" r="8"/>
          </svg>
          Certificado verificado — emitido por Campus Urología Chile
        </div>
        <a
          href={`/certificado/${params.code}/imprimir`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary text-sm"
        >
          ↓ Descargar PDF
        </a>
      </div>

      {/* Certificado */}
      <div className="relative overflow-hidden rounded-2xl border-2 border-brand-200 bg-white shadow-elev-2">
        {/* Barra superior */}
        <div className="h-2 bg-gradient-to-r from-brand-800 via-brand-500 to-cyan-400" />

        <div className="p-10">
          {/* Header: logo + institución */}
          <div className="flex items-start justify-between">
            <Image src="/logo.png" alt="Campus Urología Chile" width={180} height={60} className="object-contain" />
            <div className="text-right">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                Formación de Postgrado en Salud
              </p>
            </div>
          </div>

          {/* Título */}
          <div className="mt-8 text-center">
            <div className="inline-block border-y border-brand-500 px-8 py-2">
              <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-brand-600">
                Certificado de Aprobación
              </p>
            </div>
          </div>

          {/* Cuerpo */}
          <div className="mt-8 text-center">
            <p className="text-sm text-slate-500">Se certifica que</p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-900">{cert.profiles?.full_name}</h1>
            {meta && <p className="mt-1.5 text-sm text-slate-500">{meta}</p>}

            <div className="mx-auto mt-2 h-0.5 w-48 bg-gradient-to-r from-transparent via-brand-400 to-transparent" />

            <p className="mt-7 text-sm text-slate-500">completó y aprobó satisfactoriamente el programa</p>
            <h2 className="mt-2 text-xl font-bold text-brand-800">
              {KIND_LABEL[cert.programs?.kind] || ''}: {cert.programs?.title}
            </h2>
            {cert.avg_score !== null && (
              <p className="mt-2 text-sm text-slate-500">
                Promedio de evaluaciones: <b className="text-slate-700">{cert.avg_score}%</b>
              </p>
            )}
          </div>

          {/* Footer */}
          <div className="mt-12 flex items-end justify-between">
            <div>
              <p className="text-xs text-slate-400">Emitido el {date}</p>
              <p className="mt-1 text-xs text-slate-400">
                Código: <span className="font-mono font-bold text-brand-600 tracking-widest">{cert.code}</span>
              </p>
              <p className="mt-1 text-xs text-slate-400">Verificable escaneando el código QR</p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-2 w-36 border-t border-brand-300" />
              <p className="text-xs text-slate-500">Director Académico</p>
              <p className="text-xs text-slate-400">Campus Urología Chile</p>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qr} alt="Código QR de verificación" width={100} height={100} className="rounded-lg" />
          </div>
        </div>

        {/* Barra inferior */}
        <div className="h-1.5 bg-gradient-to-r from-cyan-400 via-brand-500 to-brand-800" />
      </div>

      {/* Instrucción PDF */}
      <p className="mt-4 text-center text-xs text-[var(--text-3)]">
        El botón "Descargar PDF" abre una versión optimizada para imprimir en hoja carta horizontal.
        En el diálogo de impresión elige "Guardar como PDF".
      </p>
    </div>
  );
}
