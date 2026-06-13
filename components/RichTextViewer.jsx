'use client';
/**
 * RichTextViewer — renderiza HTML generado por TipTap de forma segura.
 * Estilos de tipografía inline para compatibilidad sin Tailwind Typography plugin.
 */
export default function RichTextViewer({ html }) {
  if (!html) return null;
  return (
    <div
      className="rich-content"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
