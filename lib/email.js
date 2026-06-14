/**
 * Envío de emails con Resend (https://resend.com — gratis 3.000/mes).
 * Si RESEND_API_KEY no está configurada, no hace nada (la plataforma
 * funciona igual, solo sin notificaciones).
 * Sin SDK: se usa la API HTTP directamente para no agregar dependencias.
 */
export async function sendEmail({ to, subject, html }) {
  const key = process.env.RESEND_API_KEY;
  if (!key) return { skipped: true };
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM || 'Campus Urología Chile <onboarding@resend.dev>',
        to,
        subject,
        html,
      }),
    });
    return { ok: res.ok };
  } catch {
    return { ok: false };
  }
}
