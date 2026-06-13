'use client';
import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';

const ROLE_LABEL = { admin: 'Administrador', editor: 'Editor', student: 'Alumno' };

export default function AdminUsers() {
  const supabase = createClient();
  const [profiles, setProfiles] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [form, setForm] = useState({ email: '', password: '', full_name: '', role: 'student' });
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    const [{ data: p }, { data: pr }, { data: en }] = await Promise.all([
      supabase.from('profiles').select('id, full_name, role, created_at').order('created_at'),
      supabase.from('programs').select('id, title').order('created_at'),
      supabase.from('enrollments').select('user_id, program_id'),
    ]);
    setProfiles(p || []);
    setPrograms(pr || []);
    setEnrollments(en || []);
  }, []);
  useEffect(() => { load(); }, [load]);

  async function createUser(e) {
    e.preventDefault();
    setLoading(true);
    setMsg('');
    const res = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const json = await res.json();
    if (!res.ok) {
      setMsg('Error: ' + json.error);
    } else {
      setMsg(`Usuario ${form.email} creado correctamente.`);
      setForm({ email: '', password: '', full_name: '', role: 'student' });
    }
    setLoading(false);
    load();
  }

  async function toggleEnrollment(userId, programId, enrolled) {
    if (enrolled) {
      await supabase.from('enrollments').delete()
        .eq('user_id', userId).eq('program_id', programId);
    } else {
      await supabase.from('enrollments').insert({ user_id: userId, program_id: programId });
    }
    load();
  }

  const isEnrolled = (u, p) =>
    enrollments.some((e) => e.user_id === u && e.program_id === p);

  return (
    <div>
      <h1 className="text-xl font-bold text-slate-900">Usuarios y matrículas</h1>

      <form onSubmit={createUser} className="card mt-4 grid gap-3 p-4 sm:grid-cols-2">
        <div>
          <label className="label">Nombre completo</label>
          <input className="input" value={form.full_name}
            onChange={(e) => setForm({ ...form, full_name: e.target.value })} required />
        </div>
        <div>
          <label className="label">Email</label>
          <input className="input" type="email" value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        </div>
        <div>
          <label className="label">Contraseña inicial (mín. 8 caracteres)</label>
          <input className="input" type="text" value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={8} />
        </div>
        <div>
          <label className="label">Rol</label>
          <select className="input" value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}>
            <option value="student">Alumno</option>
            <option value="editor">Editor de contenido</option>
            <option value="admin">Administrador</option>
          </select>
        </div>
        <div className="sm:col-span-2 flex items-center gap-3">
          <button className="btn-primary" disabled={loading}>
            {loading ? 'Creando…' : 'Crear usuario'}
          </button>
          {msg && <p className="text-sm text-slate-600">{msg}</p>}
        </div>
      </form>

      <div className="card mt-6 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left">
              <th className="px-4 py-2 font-semibold text-slate-600">Usuario</th>
              <th className="px-4 py-2 font-semibold text-slate-600">Rol</th>
              {programs.map((p) => (
                <th key={p.id} className="px-4 py-2 font-semibold text-slate-600">{p.title}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {profiles.map((u) => (
              <tr key={u.id}>
                <td className="px-4 py-2 font-medium text-slate-800">{u.full_name || '(sin nombre)'}</td>
                <td className="px-4 py-2 text-slate-500">{ROLE_LABEL[u.role]}</td>
                {programs.map((p) => {
                  const en = isEnrolled(u.id, p.id);
                  return (
                    <td key={p.id} className="px-4 py-2">
                      {u.role === 'student' && (
                        <button
                          onClick={() => toggleEnrollment(u.id, p.id, en)}
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            en ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-400'
                          }`}
                        >
                          {en ? 'Matriculado ✓' : 'Matricular'}
                        </button>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
