/**
 * Extrae el ID de un archivo de Google Drive desde cualquier formato de enlace:
 *  - https://drive.google.com/file/d/ID/view?usp=sharing
 *  - https://drive.google.com/open?id=ID
 *  - https://docs.google.com/document/d/ID/edit
 *  - o el ID directamente.
 */
export function extractDriveId(input) {
  if (!input) return null;
  const s = input.trim();
  const patterns = [
    /\/(?:file|document|presentation|spreadsheets)\/d\/([a-zA-Z0-9_-]{20,})/,
    /[?&]id=([a-zA-Z0-9_-]{20,})/,
    /^([a-zA-Z0-9_-]{20,})$/,
  ];
  for (const re of patterns) {
    const m = s.match(re);
    if (m) return m[1];
  }
  return null;
}

export function drivePreviewUrl(fileId) {
  return `https://drive.google.com/file/d/${fileId}/preview`;
}
