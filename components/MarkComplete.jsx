'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function MarkComplete({ lessonId, initialDone }) {
  const [done, setDone] = useState(initialDone);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function toggle() {
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    if (done) {
      await supabase.from('lesson_progress').delete()
        .eq('user_id', user.id).eq('lesson_id', lessonId);
      setDone(false);
    } else {
      await supabase.from('lesson_progress').insert({ user_id: user.id, lesson_id: lessonId });
      setDone(true);
    }
    setLoading(false);
    router.refresh();
  }

  return (
    <button onClick={toggle} disabled={loading}
      className={done ? 'btn-secondary' : 'btn-primary'}>
      {done ? '✓ Completada (desmarcar)' : 'Marcar como completada'}
    </button>
  );
}
