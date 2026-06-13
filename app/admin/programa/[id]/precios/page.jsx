'use client';
import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function AdminPreciosPage() {
  const { id: programId } = useParams();
  const supabase = createClient();
  const [program, setProgram] = useState(null);
  const [prices, setPrices] = useState([]);
  const [isFree, setIsFree] = useState(false);
  const [form, setForm] = useState({ name: 'Precio estándar', amount_clp: '', stripe_price_id: '', valid_until: '' });
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const { data: p } = await supabase.from('programs').select('id, title, is_free').eq('id', programId).single();
    setProgram(p);
    setIsFree(p?.is_free || false);

    const { data: pr } = await supabase
      .from('program_prices')
      .select('*')
      .eq('program_id', programId)
      .order('created_at');
    setPrices(pr || []);
  }, [programId]);

  useEffect(() => { load(); }, [load]);

  async function saveIsFree() {
    await supabase.from('programs').update({ is_free: isFree }).eq('id', programId);
    alert(isFree ? 'Programa marcado como gratuito' : 'Programa marcado como de pago');
  }

  async function addPrice(e) {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase.from('program_prices').insert({
      program_id: programId,
      name: form.name,
      amount_clp: parseInt(form.amount_clp),
      stripe_price_id: form.stripe_price_id || null,
      valid_until: form.valid_until || null,
    });
    setSaving(false);
    if (error) { alert('Error: ' + error.message); return; }
    setForm({ name: 'Precio estándar', amount_clp: '', stripe_price_id: '', valid_until: '' });
    setOpen(false);
    load();
  }

  async function toggleActive(price) {
    await supabase.from('program_prices').update({ is_active: !price.is_active }).eq('id', price.id);
    load();
  }

  async function deletePrice(id) {
    if (!confirm('¿Eliminar precio?')) return;
    await supabase.from('program_prices').delete().eq('id', id);
    load();
  }

  return (
    <div>
      <Link href={`/admin/programa/${programId}`} className="text-sm text-brand-600 hover:underline">
        ← Contenido del programa
      </Link>
      <h1 className="mt-2 text-2xl font-bold text-slate-900">Precios</h1>
      <p className="mt-1 text-sm text-slate-500">{program?.title}</p>

      {/* Programa gratuito o de pago */}
      <div className="card mt-6 p-5">
        <h2 className="mb-3 font-bold text-slate-800">Tipo de acceso</h2>
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="is_free"
            checked={isFree}
            onChange={(e) => setIsFree(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
          />
          <label htmlFor="is_free" className="text-sm text-slate-700">
            Programa gratuito (los administradores matriculan manualmente)
          </label>
        </div>
        <button onClick={saveIsFree} className="btn-secondary mt-3 text-sm">Guardar</button>
      </div>

      {/* Lista de precios */}
      {!isFree && (
        <div className="card mt-6 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-800">Precios configurados</h2>
            <button onClick={() => setOpen(!open)} className="btn-primary text-sm">
              {open ? '✕ Cancelar' : '+ Agregar precio'}
            </button>
          </div>

          {open && (
            <form onSubmit={addPrice} className="mb-5 space-y-3 rounded-xl border border-brand-100 bg-brand-50 p-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="label">Nombre del precio</label>
                  <input className="input" value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                </div>
                <div>
                  <label className="label">Monto (CLP)</label>
                  <input className="input" type="number" min="0" value={form.amount_clp}
                    onChange={(e) => setForm({ ...form, amount_clp: e.target.value })} required
                    placeholder="150000" />
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="label">Stripe Price ID (opcional)</label>
                  <input className="input" value={form.stripe_price_id}
                    onChange={(e) => setForm({ ...form, stripe_price_id: e.target.value })}
                    placeholder="price_xxxx" />
                </div>
                <div>
                  <label className="label">Válido hasta (opcional)</label>
                  <input className="input" type="date" value={form.valid_until}
                    onChange={(e) => setForm({ ...form, valid_until: e.target.value })} />
                </div>
              </div>
              <button type="submit" className="btn-primary text-sm" disabled={saving}>
                {saving ? 'Guardando…' : 'Agregar precio'}
              </button>
            </form>
          )}

          <div className="divide-y divide-slate-100">
            {prices.map((p) => (
              <div key={p.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-slate-800">{p.name}</p>
                  <p className="text-lg font-black text-brand-700">
                    ${p.amount_clp?.toLocaleString('es-CL')} CLP
                  </p>
                  {p.valid_until && (
                    <p className="text-xs text-slate-400">
                      Hasta: {new Date(p.valid_until).toLocaleDateString('es-CL')}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    p.is_active ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-400'
                  }`}>
                    {p.is_active ? 'Activo' : 'Inactivo'}
                  </span>
                  <button onClick={() => toggleActive(p)} className="btn-secondary text-xs">
                    {p.is_active ? 'Desactivar' : 'Activar'}
                  </button>
                  <button onClick={() => deletePrice(p.id)} className="btn-danger text-xs">
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
            {prices.length === 0 && (
              <p className="py-6 text-center text-sm text-slate-400">No hay precios. Agrega uno.</p>
            )}
          </div>
        </div>
      )}

      <div className="card mt-4 p-4 bg-amber-50 border-amber-200">
        <p className="text-xs text-amber-700">
          <b>Configuración de Stripe:</b> Agrega <code>STRIPE_SECRET_KEY</code> y{' '}
          <code>STRIPE_WEBHOOK_SECRET</code> en las variables de entorno.
          En el Dashboard de Stripe, configura el webhook hacia{' '}
          <code>/api/payments/webhook</code> con los eventos{' '}
          <code>checkout.session.completed</code> y <code>payment_intent.payment_failed</code>.
        </p>
      </div>
    </div>
  );
}
