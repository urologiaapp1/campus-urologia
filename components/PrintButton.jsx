'use client';

export default function PrintButton() {
  return (
    <button onClick={() => window.print()} className="btn-secondary">
      🖨 Imprimir / guardar PDF
    </button>
  );
}
