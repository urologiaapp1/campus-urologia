import { createAdminClient } from '@/lib/supabase/admin';
import PrintButton from '@/components/PrintButton';

export const dynamic = 'force-dynamic';

const KIND_LABEL = { diplomado: 'Diplomado', magister: 'Magíster', curso: 'Curso' };

/**
 * Página pública de certificado + verificación.
 * El QR impreso en el certificado apunta a esta misma URL.
 */
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
          <p className="mt-2 text-sm text-slate-500">
            El código <b>{params.code}</b> no corresponde a ningún certificado emitido
            por Urología Sur.
          </p>
        </div>
      </div>
    );
  }

  const url = `${process.env.NEXT_PUBLIC_SITE_URL || ''}/certificado/${cert.code}`;
  const qr = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(url)}`;
  const date = new Date(cert.issued_at).toLocaleDateString('es-CL', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-4 flex items-center justify-between rounded-lg bg-green-50 px-4 py-3 text-sm font-semibold text-green-700 print:hidden">
        ✓ Certificado verificado — emitido por Urología Sur
        <PrintButton />
      </div>

      <div className="card relative overflow-hidden border-2 border-brand-200 p-12 text-center">
        <div className="absolute inset-x-0 top-0 h-2 bg-gradient-to-r from-brand-500 to-brand-900" />
        <p className="font-bold tracking-widest text-brand-600">UROLOGÍA SUR</p>
        <p className="mt-1 text-xs uppercase tracking-wide text-slate-400">Campus Virtual — Formación de Postgrado en Salud</p>

        <p className="mt-10 text-sm text-slate-500">Se certifica que</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">{cert.profiles?.full_name}</h1>
        {(cert.profiles?.specialty || cert.profiles?.institution) && (
          <p className="mt-1 text-sm text-slate-500">
            {[cert.profiles?.specialty, cert.profiles?.institution, cert.profiles?.country]
              .filter(Boolean).join(' · ')}
          </p>
        )}

        <p className="mt-8 text-sm text-slate-500">completó y aprobó satisfactoriamente el programa</p>
        <h2 className="mt-2 text-xl font-bold text-brand-800">
          {KIND_LABEL[cert.programs?.kind] || ''}: {cert.programs?.title}
        </h2>
        {cert.avg_score !== null && (
          <p className="mt-2 text-sm text-slate-500">
            Promedio de evaluaciones: <b>{cert.avg_score}%</b>
          </p>
        )}

        <div className="mt-12 flex items-end justify-between text-left">
          <div className="text-xs text-slate-400">
            <p>Emitido el {date}</p>
            <p className="mt-1">Código de verificación: <b className="text-slate-600">{cert.code}</b></p>
            <p className="mt-1">Verificable en línea escaneando el código QR</p>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qr} alt="Código QR de verificación" width={120} height={120} />
        </div>
      </div>
    </div>
  );
}
