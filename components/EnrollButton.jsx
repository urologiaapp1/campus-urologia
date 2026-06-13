'use client';
/**
 * Botón de inscripción con pago via Stripe Checkout.
 * Solo se renderiza si el usuario está autenticado.
 */
import { useState } from 'react';

export default function EnrollButton({ programId, priceId }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleCheckout() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/payments/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ program_id: programId, price_id: priceId }),
      });
      const data = await res.json();
      if (!res.ok) {
        // Si ya está matriculado, redirigir al dashboard
        if (res.status === 409) {
          window.location.href = '/dashboard';
          return;
        }
        throw new Error(data.error || 'Error al procesar el pago');
      }
      // Redirigir a Stripe Checkout
      window.location.href = data.url;
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1 shrink-0">
      <button
        onClick={handleCheckout}
        disabled={loading}
        className="btn-primary text-sm"
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
            Procesando…
          </span>
        ) : (
          'Inscribirse →'
        )}
      </button>
      {error && <p className="text-xs text-red-500 max-w-32 text-right">{error}</p>}
    </div>
  );
}
