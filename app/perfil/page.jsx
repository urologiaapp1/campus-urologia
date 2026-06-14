'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function ProfilePage() {
  const supabase = createClient();
  const [form, setForm] = useState({ full_name: '', specialty: '', institution: '', country: '' });
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setEmail(user.email);
      const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (p) setForm({
        full_name: p.full_name || '',
        specialty: p.specialty || '',
        institution: p.institution || '',
        country: p.country || '',
      });
    })();
  }, []);

  async function save(e) {
    e.preventDefault();
    setLoading(true);
    setMsg('');
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from('profiles').update(form).eq('id', user.id);
    setMsg(error ? 'Error: ' + error.message : 'Perfil guardado ✓');
    setLoading(false);
  }

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="text-2xl font-black tracking-tight text-[var(--text-1)]">Mi perfil</h1>
      <p className="mt-1 text-sm text-[var(--text-3)]">{email}</p>
      <form onSubmit={save} className="card mt-5 space-y-4 p-6">
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
        <div className="flex items-center gap-3">
          <button className="btn-primary" disabled={loading}>
            {loading ? 'Guardando…' : 'Guardar'}
          </button>
          {msg && <p className="text-sm text-[var(--text-2)]">{msg}</p>}
        </div>
      </form>
    </div>
  );
}
