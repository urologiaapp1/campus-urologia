'use client';
import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';

const ROLE_LABEL = { admin: 'Admin global', editor: 'Editor', student: 'Alumno' };
const ROLE_BADGE = {
  admin: 'bg-purple-50 text-purple-700',
  editor: 'bg-blue-50 text-blue-700',
  student: 'bg-slate-100 text-slate-500',
};

export default function AdminUsers() {
  const supabase = createClient();
  const [profiles, setProfiles] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [programStaff, setProgramStaff] = useState([]);
  const [form, setForm] = useState({ email: '', password: '', full_name: '', role: 'student' });
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    const [{ data: p }, { data: pr }, { data: en }, { data: ps }] = await Promise.all([
      supabase.from('profiles').select('id, full_name, role, created_at').order('created_at'),
      supabase.from('programs').select('id, title').order('created_at'),
      supabase.from('enrollments').select('user_id, program_id'),
      supabase.from('program_staff').select('user_id, program_id'),
    ]);
    setProfiles(p || []);
    setPrograms(pr || []);
    setEnrollments(en || []);
    setProgramStaff(ps || []);
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
      setMsg(`Usuario ${form.email} creado.`);
      setForm({ email: '', password: '', full_name: '', role: 'student' });
    }
    setLoading(false);
    load();
  }

  async function toggleEnrollment(userId, programId, enrolled) {
    if (enrolled) {
      await supabase.from('enrollments').delete().eq('user_id', userId).eq('program_id', programId);
    } else {
      await supabase.from('enrollments').insert({ user_id: userId, program_id: programId });
    }
    load();
  }

  async function toggleProgramStaff(userId, programId, assigned) {
    if (assigned) {
      await supabase.from('program_staff').delete().eq('user_id', userId).eq('program_id', programId);
    } else {
      await supabase.from('program_staff').insert({ user_id: userId, program_id: programId });
    }
    load();
  }

  async function changeRole(userId, newRole) {
    await supabase.from('profiles').update({ role: newRole }).eq('id', userId);
    // Si cambia a student/admin, limpiar asignaciones de programa
    if (newRole !== 'editor') {
      await supabase.from('program_staff').delete().eq('user_id', userId);
    }
    load();
  }

  const isEnrolled = (uid, pid) => enrollments.some((e) => e.user_id === uid && e.program_id === pid);
  const isStaff = (uid, pid) => programStaff.some((s) => s.user_id === uid && s.program_id === pid);

  return (
    <div>
      <h1 className="text-xl font-bold text-slate-900">Usuarios y matrículas</h1>

      {/* Crear usuario */}
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
            <option value="editor">Editor de curso</option>
            <option value="admin">Administrador global</option>
          </select>
        </div>
        <div className="sm:col-span-2 flex items-center gap-3">
          <button className="btn-primary" disabled={loading}>
            {loading ? 'Creando…' : 'Crear usuario'}
          </button>
          {msg && <p className="text-sm text-slate-600">{msg}</p>}
        </div>
      </form>

      {/* Tabla de usuarios */}
      <div className="card mt-6 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left">
              <th className="px-4 py-2 font-semibold text-slate-600">Usuario</th>
              <th className="px-4 py-2 font-semibold text-slate-600">Rol</th>
              {programs.map((p) => (
                <th key={p.id} className="px-4 py-2 text-xs font-semibold text-slate-500 max-w-[120px]">
                  {p.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {profiles.map((u) => (
              <tr key={u.id} className="hover:bg-slate-50">
                <td className="px-4 py-2 font-medium text-slate-800">{u.full_name || '(sin nombre)'}</td>
                <td className="px-4 py-2">
                  <select
                    value={u.role}
                    onChange={(e) => changeRole(u.id, e.target.value)}
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold border-0 cursor-pointer ${ROLE_BADGE[u.role]}`}
                  >
                    <option value="student">Alumno</option>
                    <option value="editor">Editor</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                {programs.map((p) => {
                  const enrolled = isEnrolled(u.id, p.id);
                  const staffed = isStaff(u.id, p.id);

                  if (u.role === 'student') {
                    return (
                      <td key={p.id} className="px-4 py-2">
                        <button
                          onClick={() => toggleEnrollment(u.id, p.id, enrolled)}
                          className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                            enrolled ? 'bg-green-50 text-green-700 hover:bg-red-50 hover:text-red-600'
                                     : 'bg-slate-100 text-slate-400 hover:bg-green-50 hover:text-green-700'
                          }`}
                        >
                          {enrolled ? 'Matriculado ✓' : 'Matricular'}
                        </button>
                      </td>
                    );
                  }

                  if (u.role === 'editor') {
                    return (
                      <td key={p.id} className="px-4 py-2">
                        <button
                          onClick={() => toggleProgramStaff(u.id, p.id, staffed)}
                          className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                            staffed ? 'bg-blue-50 text-blue-700 hover:bg-red-50 hover:text-red-600'
                                    : 'bg-slate-100 text-slate-400 hover:bg-blue-50 hover:text-blue-700'
                          }`}
                        >
                          {staffed ? 'Editor ✓' : 'Asignar'}
                        </button>
                      </td>
                    );
                  }

                  // admin: sin botón (acceso total)
                  return (
                    <td key={p.id} className="px-4 py-2 text-xs text-slate-300">
                      Acceso total
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
        {profiles.length === 0 && (
          <p className="px-5 py-4 text-sm text-slate-400">Sin usuarios.</p>
        )}
      </div>

      <div className="mt-3 text-xs text-slate-400 space-y-0.5">
        <p>• <b>Alumno</b>: puedes matricularlo en cursos individuales.</p>
        <p>• <b>Editor de curso</b>: asígnale los programas que puede gestionar. Solo ve y edita esos programas en /admin.</p>
        <p>• <b>Admin global</b>: acceso total a todos los programas y configuración.</p>
      </div>
    </div>
  );
}
