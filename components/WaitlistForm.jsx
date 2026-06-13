'use client';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function WaitlistForm({ programId }) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [msg, setMsg] = useState('');
  const supabase = createClient();

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus('loading');

    const { error } = await supabase.from('program_waitlist').upsert(
      { program_id: programId, email: email.trim().toLowerCase(), full_name: name.trim() || null },
      { onConflict: 'program_id,email' }
    );

    if (error) {
      setStatus('error');
      setMsg('Error al registrarse. Intenta de nuevo.');
    } else {
      setStatus('success');
      setMsg('¡Registrado! Te avisaremos cuando se abran las inscripciones.');
    }
  }

  if (status === 'success') {
    return <p className="text-sm font-medium text-green-700">✓ {msg}</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <div className="flex gap-2">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Tu email"
          className="input flex-1 text-sm py-1.5"
        />
        <button type="submit" disabled={status === 'loading'} className="btn-primary text-sm shrink-0 py-1.5">
          {status === 'loading' ? '…' : 'Avisarme'}
        </button>
      </div>
      {status === 'error' && <p className="text-xs text-red-500">{msg}</p>}
    </form>
  );
}
