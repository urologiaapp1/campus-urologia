import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSessionProfile } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export default async function PagoExitosoPage({ searchParams }) {
  const { user } = await getSessionProfile();
  if (!user) redirect('/login');

  const orderId = searchParams?.order_id;
  if (!orderId) redirect('/dashboard');

  const admin = createAdminClient();

  // Esperar hasta 10s a que el webhook procese el pago (polling simple)
  let order = null;
  for (let i = 0; i < 5; i++) {
    const { data } = await admin
      .from('payment_orders')
      .select('id, status, amount_clp, program_id, programs(title, slug)')
      .eq('id', orderId)
      .eq('user_id', user.id)
      .single();

    order = data;
    if (order?.status === 'paid') break;
    if (i < 4) await new Promise((r) => setTimeout(r, 2000));
  }

  if (!order) redirect('/dashboard');

  const isPaid = order.status === 'paid';

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <div className="text-6xl mb-4">{isPaid ? '🎉' : '⏳'}</div>
        <h1 className="text-2xl font-bold text-slate-900">
          {isPaid ? '¡Pago confirmado!' : 'Procesando pago…'}
        </h1>
        <p className="mt-3 text-slate-600">
          {isPaid
            ? `Tu matrícula en "${order.programs?.title}" ha sido procesada exitosamente.`
            : 'Estamos confirmando tu pago. Esto puede tomar unos segundos.'}
        </p>

        {isPaid && (
          <>
            <div className="card mt-6 p-4">
              <p className="text-xs text-slate-400">Monto pagado</p>
              <p className="text-2xl font-black text-brand-700">
                ${order.amount_clp?.toLocaleString('es-CL')} CLP
              </p>
              <p className="mt-1 text-xs text-slate-400">{order.programs?.title}</p>
            </div>
            <div className="mt-6 flex flex-col gap-3">
              <Link href={`/programa/${order.programs?.slug}`} className="btn-primary">
                Comenzar el programa →
              </Link>
              <Link href="/dashboard" className="btn-secondary">
                Ir al dashboard
              </Link>
            </div>
          </>
        )}

        {!isPaid && (
          <div className="mt-6">
            <p className="text-sm text-slate-400">
              Si el problema persiste, contacta a{' '}
              <a href="mailto:info@urologiasur.cl" className="text-brand-600 hover:underline">
                info@urologiasur.cl
              </a>
            </p>
            <Link href="/dashboard" className="btn-secondary mt-4 inline-block">
              Volver al dashboard
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
