'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function ProfilePage() {
  const supabase = createClient();

  // Perfil
  const [form, setForm]       = useState({ full_name: '', specialty: '', institution: '', country: '' });
  const [email, setEmail]     = useState('');
  const [hint, setHint]       = useState('');
  const [profileMsg, setProfileMsg] = useState('');
  const [saving, setSaving]   = useState(false);

  // Contraseña
  const [pwForm, setPwForm]   = useState({ current: '', next: '', confirm: '' });
  const [pwMsg, setPwMsg]     = useState('');
  const [pwLoading, setPwLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setEmail(user.email);
      const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (p) {
        setForm({
          full_name:   p.full_name   || '',
          specialty:   p.specialty   || '',
          institution: p.institution || '',
          country:     p.country     || '',
        });
        setHint(p.password_hint || '');
      }
    })();
  }, []);

  async function saveProfile(e) {
    e.preventDefault();
    setSaving(true);
    setProfileMsg('');
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from('profiles')
      .update({ ...form, password_hint: hint })
      .eq('id', user.id);
    setProfileMsg(error ? 'Error: ' + error.message : 'Perfil guardado ✓');
    setSaving(false);
  }

  async function changePassword(e) {
    e.preventDefault();
    setPwMsg('');
    if (pwForm.next !== pwForm.confirm) { setPwMsg('Las contraseñas nuevas no coinciden.'); return; }
    if (pwForm.next.length < 6)         { setPwMsg('La contraseña debe tener al menos 6 caracteres.'); return; }
    setPwLoading(true);

    // Verificar contraseña actual re-autenticando
    const { error: signInErr } = await supabase.auth.signInWithPassword({
      email, password: pwForm.current,
    });
    if (signInErr) {
      setPwMsg('Contraseña actual incorrecta.');
      setPwLoading(false);
      return;
    }

    // Cambiar contraseña
    const { error } = await supabase.auth.updateUser({ password: pwForm.next });
    if (error) {
      setPwMsg('Error al cambiar contraseña: ' + error.message);
    } else {
      setPwMsg('Contraseña cambiada correctamente ✓');
      setPwForm({ current: '', next: '', confirm: '' });
    }
    setPwLoading(false);
  }

  const set  = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const setPw = (k) => (e) => setPwForm({ ...pwForm, [k]: e.target.value });

  return (
    <div className="mx-auto max-w-xl space-y-8">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-[var(--text-1)]">Mi perfil</h1>
        <p className="mt-1 text-sm text-[var(--text-3)]">{email}</p>
      </div>

      {/* ── Datos personales ─────────────────────────────────── */}
      <form onSubmit={saveProfile} className="card space-y-4 p-6">
        <h2 className="text-xs font-semibold uppercase tracking-[0.15em] text-[var(--text-3)]">
          Datos personales
        </h2>
        <div>
          <label className="label">Nombre completo</label>
          <input className="input" value={form.full_name} onChange={set('full_name')} required />
        </div>
        <div>
          <label className="label">Especialidad</label>
          <input className="input" value={form.specialty} onChange={set('specialty')}
            placeholder="Urología, Cirugía general, Residente…" />
        </div>
        <div>
          <label className="label">Institución</label>
          <input className="input" value={form.institution} onChange={set('institution')} />
        </div>
        <div>
          <label className="label">País</label>
          <input className="input" value={form.country} onChange={set('country')} />
        </div>

        <div className="divider" />

        {/* Recordatorio de contraseña */}
        <div>
          <label className="label">Recordatorio de contraseña</label>
          <input
            className="input"
            value={hint}
            onChange={(e) => setHint(e.target.value)}
            placeholder="Ej: nombre de mi mascota + año"
            maxLength={200}
          />
          <p className="mt-1 text-[11px] text-[var(--text-3)]">
            Una frase personal que te recuerde qué contraseña usaste. Solo tú la puedes ver.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button className="btn-primary" disabled={saving}>
            {saving ? 'Guardando…' : 'Guardar perfil'}
          </button>
          {profileMsg && (
            <p className={`text-sm ${profileMsg.includes('Error') ? 'text-red-600' : 'text-emerald-600'}`}>
              {profileMsg}
            </p>
          )}
        </div>
      </form>

      {/* ── Cambio de contraseña ─────────────────────────────── */}
      <form onSubmit={changePassword} className="card space-y-4 p-6">
        <h2 className="text-xs font-semibold uppercase tracking-[0.15em] text-[var(--text-3)]">
          Cambiar contraseña
        </h2>

        <div>
          <label className="label">Contraseña actual</label>
          <input
            className="input"
            type="password"
            autoComplete="current-password"
            value={pwForm.current}
            onChange={setPw('current')}
            required
          />
        </div>
        <div>
          <label className="label">Nueva contraseña</label>
          <input
            className="input"
            type="password"
            autoComplete="new-password"
            value={pwForm.next}
            onChange={setPw('next')}
            required
            minLength={6}
          />
        </div>
        <div>
          <label className="label">Confirmar nueva contraseña</label>
          <input
            className="input"
            type="password"
            autoComplete="new-password"
            value={pwForm.confirm}
            onChange={setPw('confirm')}
            required
            minLength={6}
          />
        </div>

        {pwMsg && (
          <div className={`rounded-xl px-4 py-2.5 text-sm ${
            pwMsg.includes('✓')
              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400'
              : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'
          }`}>
            {pwMsg}
          </div>
        )}

        <button className="btn-primary" disabled={pwLoading}>
          {pwLoading ? 'Cambiando…' : 'Cambiar contraseña'}
        </button>
      </form>
    </div>
  );
}
