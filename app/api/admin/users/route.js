import { NextResponse } from 'next/server';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';

/**
 * Crea un usuario (alumno, editor o admin). Solo accesible para admins.
 * Usa la service role key, por eso vive en el servidor.
 */
export async function POST(request) {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Solo administradores' }, { status: 403 });
  }

  const { email, password, full_name, role } = await request.json();
  if (!email || !password || password.length < 8) {
    return NextResponse.json({ error: 'Email y contraseña (mínimo 8 caracteres) son obligatorios' }, { status: 400 });
  }
  if (!['admin', 'editor', 'student'].includes(role)) {
    return NextResponse.json({ error: 'Rol inválido' }, { status: 400 });
  }

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: full_name || '', role },
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ id: data.user.id });
}
