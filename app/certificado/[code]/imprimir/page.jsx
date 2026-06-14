import { createAdminClient } from '@/lib/supabase/admin';
import { notFound } from 'next/navigation';
import AutoPrint from './AutoPrint';

export const dynamic = 'force-dynamic';

const KIND_LABEL = { diplomado: 'Diplomado', magister: 'Magíster', curso: 'Curso' };

export default async function CertificatePrintPage({ params }) {
  const admin = createAdminClient();
  const { data: cert } = await admin
    .from('certificates')
    .select('code, avg_score, issued_at, profiles(full_name, specialty, institution, country), programs(title, kind)')
    .eq('code', params.code)
    .maybeSingle();

  if (!cert) notFound();

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://campus-urologiasur-cyan.vercel.app';
  const verifyUrl = `${siteUrl}/certificado/${cert.code}`;
  const qr = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(verifyUrl)}&bgcolor=ffffff&color=083f52&qzone=1`;

  const date = new Date(cert.issued_at).toLocaleDateString('es-CL', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  const programLabel = [KIND_LABEL[cert.programs?.kind], cert.programs?.title].filter(Boolean).join(': ');
  const meta = [cert.profiles?.specialty, cert.profiles?.institution, cert.profiles?.country].filter(Boolean).join(' · ');

  return (
    <>
      {/* @page rule para hoja carta horizontal */}
      <style dangerouslySetInnerHTML={{ __html: `
        @page {
          size: letter landscape;
          margin: 12mm 18mm;
        }
        * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        body { margin: 0; padding: 0; background: #fff; font-family: Georgia, 'Times New Roman', serif; }
      `}} />

      <AutoPrint />

      {/* ── Certificado ── */}
      <div style={{
        width: '100%', minHeight: '100vh', background: '#ffffff',
        display: 'flex', flexDirection: 'column',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Franja superior petróleo */}
        <div style={{ height: 10, background: 'linear-gradient(90deg, #083f52 0%, #0e7490 60%, #22d3ee 100%)' }} />

        {/* Marca de agua diagonal */}
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%) rotate(-30deg)',
          fontSize: 120, fontWeight: 900, color: '#083f52', opacity: 0.025,
          whiteSpace: 'nowrap', userSelect: 'none', pointerEvents: 'none',
          letterSpacing: 8,
        }}>
          CAMPUS UROLOGÍA CHILE
        </div>

        {/* Contenido principal */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '28px 40px 24px' }}>

          {/* Header: logo izquierda + datos institución derecha */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="Campus Urología Chile" style={{ height: 64, objectFit: 'contain' }} />
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 11, color: '#64748b', letterSpacing: 3, textTransform: 'uppercase', fontFamily: 'Arial, sans-serif' }}>
                Formación de Postgrado en Salud
              </div>
              <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 3, fontFamily: 'Arial, sans-serif' }}>
                campus-urologiasur-cyan.vercel.app
              </div>
            </div>
          </div>

          {/* Título del documento */}
          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            <div style={{
              display: 'inline-block',
              borderTop: '1.5px solid #0e7490', borderBottom: '1.5px solid #0e7490',
              padding: '6px 32px', marginBottom: 8,
            }}>
              <span style={{ fontSize: 13, letterSpacing: 5, color: '#0e7490', fontFamily: 'Arial, sans-serif', fontWeight: 700, textTransform: 'uppercase' }}>
                Certificado de Aprobación
              </span>
            </div>
          </div>

          {/* Cuerpo */}
          <div style={{ textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 8px', fontFamily: 'Arial, sans-serif' }}>
              Campus Urología Chile certifica que
            </p>

            {/* Nombre del participante */}
            <div style={{ position: 'relative', margin: '0 auto 8px', display: 'inline-block' }}>
              <h1 style={{
                fontSize: 38, fontWeight: 700, color: '#0f172a', margin: 0,
                letterSpacing: 1, lineHeight: 1.15,
              }}>
                {cert.profiles?.full_name}
              </h1>
              <div style={{ height: 2, background: 'linear-gradient(90deg, transparent, #0e7490, transparent)', marginTop: 6 }} />
            </div>

            {meta && (
              <p style={{ fontSize: 12, color: '#475569', margin: '4px 0 0', fontFamily: 'Arial, sans-serif' }}>
                {meta}
              </p>
            )}

            <p style={{ fontSize: 13, color: '#64748b', margin: '20px 0 8px', fontFamily: 'Arial, sans-serif' }}>
              completó y aprobó satisfactoriamente el programa de
            </p>

            <h2 style={{
              fontSize: 22, fontWeight: 700, color: '#083f52', margin: '0 auto',
              maxWidth: 560, lineHeight: 1.3,
            }}>
              {programLabel}
            </h2>

            {cert.avg_score !== null && (
              <p style={{ fontSize: 12, color: '#64748b', margin: '10px 0 0', fontFamily: 'Arial, sans-serif' }}>
                Promedio de evaluaciones: <strong style={{ color: '#0f172a' }}>{cert.avg_score}%</strong>
              </p>
            )}
          </div>

          {/* Footer: fecha / firma / QR */}
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 24 }}>

            {/* Fecha */}
            <div style={{ fontFamily: 'Arial, sans-serif' }}>
              <p style={{ fontSize: 11, color: '#94a3b8', margin: '0 0 2px' }}>Fecha de emisión</p>
              <p style={{ fontSize: 13, color: '#0f172a', fontWeight: 600, margin: 0 }}>{date}</p>
              <p style={{ fontSize: 10, color: '#94a3b8', margin: '4px 0 0', letterSpacing: 1 }}>
                Código: <strong style={{ color: '#0e7490', letterSpacing: 2 }}>{cert.code}</strong>
              </p>
            </div>

            {/* Firma */}
            <div style={{ textAlign: 'center', fontFamily: 'Arial, sans-serif' }}>
              <div style={{ width: 200, borderTop: '1px solid #0e7490', marginBottom: 6 }} />
              <p style={{ fontSize: 11, color: '#475569', margin: 0 }}>Director Académico</p>
              <p style={{ fontSize: 11, color: '#475569', margin: '2px 0 0' }}>Campus Urología Chile</p>
            </div>

            {/* QR */}
            <div style={{ textAlign: 'center', fontFamily: 'Arial, sans-serif' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qr} alt="QR de verificación" width={80} height={80} style={{ display: 'block', margin: '0 auto' }} />
              <p style={{ fontSize: 9, color: '#94a3b8', margin: '4px 0 0', maxWidth: 100 }}>
                Escanea para verificar autenticidad
              </p>
            </div>
          </div>
        </div>

        {/* Franja inferior */}
        <div style={{ height: 6, background: 'linear-gradient(90deg, #22d3ee 0%, #0e7490 50%, #083f52 100%)' }} />
      </div>
    </>
  );
}
