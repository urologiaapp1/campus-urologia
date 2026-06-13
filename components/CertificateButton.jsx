'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

// Cargado dinámicamente para no bloquear el bundle principal
const NpsModal = dynamic(() => import('@/components/NpsModal'), { ssr: false });

export default function CertificateButton({ programId, existingCode }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showNps, setShowNps] = useState(false);
  const [certCode, setCertCode] = useState(existingCode || null);

  if (certCode) {
    return (
      <>
        <a href={`/certificado/${certCode}`} className="btn-primary">
          🎓 Ver mi certificado
        </a>
        {showNps && (
          <NpsModal programId={programId} onClose={() => setShowNps(false)} />
        )}
      </>
    );
  }

  async function issue() {
    setLoading(true);
    const res = await fetch('/api/certificates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ program_id: programId }),
    });
    const json = await res.json();
    setLoading(false);
    if (!res.ok) {
      alert(json.error || 'No se pudo emitir el certificado');
      return;
    }
    setCertCode(json.code);
    // Mostrar encuesta NPS solo si es la primera vez (certificado recién emitido)
    if (json.new) setShowNps(true);
    else router.push(`/certificado/${json.code}`);
  }

  return (
    <>
      <button onClick={issue} disabled={loading} className="btn-primary">
        {loading ? 'Verificando requisitos…' : '🎓 Obtener mi certificado'}
      </button>
      {showNps && (
        <NpsModal programId={programId} onClose={() => {
          setShowNps(false);
          router.push(`/certificado/${certCode}`);
        }} />
      )}
    </>
  );
}
