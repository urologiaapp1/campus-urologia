/**
 * Rate limiter simple en memoria (sin dependencias externas).
 * Usa una Map con ventana deslizante por IP.
 * Apto para Vercel Serverless: cada instancia tiene su propio Map,
 * pero es suficiente para frenar ataques básicos.
 *
 * Uso:
 *   const { ok, retryAfter } = rateLimit(request, { max: 20, windowMs: 60_000 });
 *   if (!ok) return NextResponse.json({ error: 'Too many requests' }, { status: 429, headers: { 'Retry-After': retryAfter } });
 */

const store = new Map(); // ip → [timestamps]

/**
 * @param {Request} request
 * @param {{ max?: number, windowMs?: number }} opts
 * @returns {{ ok: boolean, retryAfter: string }}
 */
export function rateLimit(request, { max = 20, windowMs = 60_000 } = {}) {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown';

  const now = Date.now();
  const key = ip;
  const timestamps = (store.get(key) || []).filter((t) => now - t < windowMs);

  if (timestamps.length >= max) {
    const oldest = timestamps[0];
    const retryAfter = Math.ceil((oldest + windowMs - now) / 1000);
    return { ok: false, retryAfter: String(retryAfter) };
  }

  timestamps.push(now);
  store.set(key, timestamps);

  // Limpiar entries viejos cada 1000 llamadas para no crecer indefinidamente
  if (store.size > 1000) {
    for (const [k, ts] of store) {
      if (ts.every((t) => now - t > windowMs)) store.delete(k);
    }
  }

  return { ok: true, retryAfter: '0' };
}
