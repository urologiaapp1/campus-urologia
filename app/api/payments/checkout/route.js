/**
 * POST /api/payments/checkout
 * Crea una sesión de Stripe Checkout para un programa.
 * Redirige al usuario a Stripe para completar el pago.
 *
 * Body: { program_id: string, price_id: string }
 */

import { createAdminClient } from '@/lib/supabase/admin';
import { getSessionProfile } from '@/lib/supabase/server';
import { rateLimit } from '@/lib/ratelimit';

export async function POST(request) {
  const rl = rateLimit(request, { max: 10, windowMs: 60_000 });
  if (!rl.ok) {
    return Response.json({ error: 'Límite de peticiones alcanzado' }, {
      status: 429,
      headers: { 'Retry-After': rl.retryAfter },
    });
  }

  const { user, profile } = await getSessionProfile();
  if (!user || !profile) {
    return Response.json({ error: 'No autenticado' }, { status: 401 });
  }

  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) {
    return Response.json({ error: 'Stripe no configurado' }, { status: 500 });
  }

  const { program_id, price_id } = await request.json();
  if (!program_id || !price_id) {
    return Response.json({ error: 'program_id y price_id requeridos' }, { status: 400 });
  }

  const admin = createAdminClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  // Verificar que el programa y precio existen
  const { data: price } = await admin
    .from('program_prices')
    .select('id, program_id, amount_clp, stripe_price_id, programs(title, slug)')
    .eq('id', price_id)
    .eq('program_id', program_id)
    .eq('is_active', true)
    .maybeSingle();

  if (!price) {
    return Response.json({ error: 'Precio no encontrado o inactivo' }, { status: 404 });
  }

  // Verificar que no esté ya matriculado
  const { data: existing } = await admin
    .from('enrollments')
    .select('id')
    .eq('user_id', user.id)
    .eq('program_id', program_id)
    .maybeSingle();

  if (existing) {
    return Response.json({ error: 'Ya estás matriculado en este programa' }, { status: 409 });
  }

  // Crear orden en BD
  const { data: order, error: orderErr } = await admin
    .from('payment_orders')
    .insert({
      user_id: user.id,
      program_id,
      price_id,
      amount_clp: price.amount_clp,
      status: 'pending',
    })
    .select('id')
    .single();

  if (orderErr) {
    return Response.json({ error: 'Error creando orden' }, { status: 500 });
  }

  // Crear sesión de Stripe
  let lineItems;
  if (price.stripe_price_id) {
    // Precio preconfigurado en Stripe (más flexible para upgrades)
    lineItems = [{ price: price.stripe_price_id, quantity: 1 }];
  } else {
    // Precio dinámico (más simple, sin necesidad de configurar en Stripe Dashboard)
    lineItems = [{
      price_data: {
        currency: 'clp',
        unit_amount: price.amount_clp,
        product_data: {
          name: price.programs?.title || 'Programa médico',
          description: 'Campus Urología Chile — Matrícula',
        },
      },
      quantity: 1,
    }];
  }

  const stripeBody = {
    mode: 'payment',
    line_items: lineItems,
    customer_email: user.email,
    client_reference_id: order.id,
    metadata: {
      order_id: order.id,
      user_id: user.id,
      program_id,
    },
    success_url: `${siteUrl}/pago/exitoso?order_id=${order.id}`,
    cancel_url: `${siteUrl}/programa/${price.programs?.slug || program_id}`,
    locale: 'es',
  };

  const stripeRes = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${stripeKey}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams(
      // Stripe usa form-encoded anidado
      flattenObject(stripeBody)
    ),
  });

  const session = await stripeRes.json();
  if (!stripeRes.ok) {
    return Response.json({ error: session.error?.message || 'Error de Stripe' }, { status: 500 });
  }

  // Guardar el session ID de Stripe en la orden
  await admin
    .from('payment_orders')
    .update({ stripe_session_id: session.id })
    .eq('id', order.id);

  return Response.json({ url: session.url });
}

/**
 * Aplana objeto anidado para form-encoding de Stripe.
 * { line_items: [{price: 'x', quantity: 1}] }
 * → { 'line_items[0][price]': 'x', 'line_items[0][quantity]': 1 }
 */
function flattenObject(obj, prefix = '') {
  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}[${key}]` : key;
    if (Array.isArray(value)) {
      value.forEach((item, i) => {
        if (typeof item === 'object' && item !== null) {
          Object.assign(result, flattenObject(item, `${fullKey}[${i}]`));
        } else {
          result[`${fullKey}[${i}]`] = item;
        }
      });
    } else if (typeof value === 'object' && value !== null) {
      Object.assign(result, flattenObject(value, fullKey));
    } else if (value !== undefined && value !== null) {
      result[fullKey] = value;
    }
  }
  return result;
}
