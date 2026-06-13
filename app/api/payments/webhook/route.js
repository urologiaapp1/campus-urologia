/**
 * POST /api/payments/webhook
 * Webhook de Stripe para procesar eventos de pago.
 * Configurar en Stripe Dashboard: Webhooks → Add endpoint → /api/payments/webhook
 * Eventos a escuchar: checkout.session.completed, payment_intent.payment_failed
 *
 * ⚠️ Esta ruta NO puede usar middleware de autenticación — Stripe la llama directamente.
 */

import { createAdminClient } from '@/lib/supabase/admin';

// Verificar firma de Stripe usando Web Crypto (sin deps externos)
async function verifyStripeSignature(payload, sigHeader, secret) {
  const parts = sigHeader.split(',');
  const timestamp = parts.find((p) => p.startsWith('t='))?.slice(2);
  const signatures = parts.filter((p) => p.startsWith('v1=')).map((p) => p.slice(3));

  if (!timestamp || !signatures.length) return false;

  const signedPayload = `${timestamp}.${payload}`;
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(signedPayload));
  const expectedSig = Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  // Verificar que al menos una firma coincide
  const valid = signatures.some((sig) => sig === expectedSig);

  // Verificar que el timestamp no sea demasiado antiguo (5 min)
  const tooOld = Math.abs(Date.now() / 1000 - parseInt(timestamp)) > 300;

  return valid && !tooOld;
}

export async function POST(request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return new Response('Webhook secret no configurado', { status: 500 });
  }

  const body = await request.text();
  const sigHeader = request.headers.get('stripe-signature');

  if (!sigHeader) {
    return new Response('Sin firma', { status: 400 });
  }

  const valid = await verifyStripeSignature(body, sigHeader, webhookSecret);
  if (!valid) {
    return new Response('Firma inválida', { status: 400 });
  }

  let event;
  try {
    event = JSON.parse(body);
  } catch {
    return new Response('JSON inválido', { status: 400 });
  }

  const admin = createAdminClient();

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const orderId = session.client_reference_id || session.metadata?.order_id;

    if (!orderId) {
      console.error('Webhook: order_id no encontrado en la sesión', session.id);
      return new Response('OK', { status: 200 });
    }

    // Actualizar orden a pagada (el trigger auto_enroll_on_payment matriculará al usuario)
    const { error } = await admin
      .from('payment_orders')
      .update({
        status: 'paid',
        stripe_payment_intent: session.payment_intent,
        metadata: session.metadata,
        paid_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId)
      .eq('status', 'pending'); // idempotencia: no procesar dos veces

    if (error) {
      console.error('Webhook: error actualizando orden', orderId, error);
      return new Response('Error interno', { status: 500 });
    }
  }

  if (event.type === 'payment_intent.payment_failed') {
    const intent = event.data.object;
    // Buscar orden por payment_intent si existe
    await admin
      .from('payment_orders')
      .update({ status: 'failed', updated_at: new Date().toISOString() })
      .eq('stripe_payment_intent', intent.id)
      .eq('status', 'pending');
  }

  return new Response('OK', { status: 200 });
}
