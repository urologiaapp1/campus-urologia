import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendEmail } from '@/lib/email';

/** Notifica por email al autor de un tópico cuando alguien comenta. */
export async function POST(request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

  const { topic_id } = await request.json();
  const admin = createAdminClient();

  const { data: topic } = await admin
    .from('topics')
    .select('id, title, author_id')
    .eq('id', topic_id)
    .maybeSingle();
  if (!topic || topic.author_id === user.id) return NextResponse.json({ ok: true });

  const { data: commenter } = await admin
    .from('profiles').select('full_name').eq('id', user.id).single();
  const { data: authUser } = await admin.auth.admin.getUserById(topic.author_id);
  const email = authUser?.user?.email;
  if (!email) return NextResponse.json({ ok: true });

  const url = `${process.env.NEXT_PUBLIC_SITE_URL || ''}/topico/${topic.id}`;
  await sendEmail({
    to: email,
    subject: `Nueva opinión en tu tópico: ${topic.title}`,
    html: `<p><b>${commenter?.full_name || 'Un participante'}</b> opinó en tu tópico
           "<b>${topic.title}</b>" en el Campus Urología Sur.</p>
           <p><a href="${url}">Ver la discusión →</a></p>`,
  });

  return NextResponse.json({ ok: true });
}
