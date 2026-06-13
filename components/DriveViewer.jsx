'use client';

/**
 * Visor protegido para archivos de Google Drive (videos y documentos).
 * - Usa el endpoint /preview de Drive (sin botón de descarga si el dueño
 *   desactivó "Los lectores pueden descargar" en el archivo).
 * - Cubre el botón "abrir en ventana nueva" con una capa transparente.
 * - Bloquea clic derecho y selección de texto.
 */
export default function DriveViewer({ fileId, kind = 'video', title = '' }) {
  if (!fileId) {
    return (
      <div className="card flex aspect-video items-center justify-center text-sm text-slate-400">
        Recurso no disponible
      </div>
    );
  }

  const isVideo = kind === 'video';

  return (
    <div
      className={`relative w-full overflow-hidden rounded-xl border border-slate-200 bg-black ${
        isVideo ? 'aspect-video' : ''
      }`}
      style={isVideo ? {} : { height: '75vh' }}
      onContextMenu={(e) => e.preventDefault()}
    >
      <iframe
        src={`https://drive.google.com/file/d/${fileId}/preview`}
        title={title}
        className="h-full w-full"
        allow="autoplay; fullscreen"
        sandbox="allow-scripts allow-same-origin allow-presentation"
        referrerPolicy="no-referrer"
      />
      {/* Capa que cubre el botón "abrir en Drive" (esquina superior derecha) */}
      <div
        className="absolute right-0 top-0 z-10 h-14 w-14"
        onContextMenu={(e) => e.preventDefault()}
        aria-hidden="true"
      />
    </div>
  );
}
