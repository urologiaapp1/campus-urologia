'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function NotificationBell() {
  const supabase = createClient();
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  async function load() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from('notifications')
      .select('id, type, title, body, link, read, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20);
    setNotifications(data || []);
  }

  useEffect(() => {
    load();
    // Polling cada 60 segundos
    const interval = setInterval(load, 60000);
    return () => clearInterval(interval);
  }, []);

  // Cerrar al hacer clic fuera
  useEffect(() => {
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  async function markAllRead() {
    const unreadIds = notifications.filter((n) => !n.read).map((n) => n.id);
    if (!unreadIds.length) return;
    await supabase.from('notifications').update({ read: true }).in('id', unreadIds);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  async function markRead(id) {
    await supabase.from('notifications').update({ read: true }).eq('id', id);
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
  }

  const unreadCount = notifications.filter((n) => !n.read).length;

  const typeIcon = {
    nueva_insignia: '🏅',
    tarea_calificada: '📝',
    nuevo_comentario: '💬',
    anuncio: '📢',
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => { setOpen(!open); if (!open) markAllRead(); }}
        className="relative flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
        title="Notificaciones"
      >
        🔔
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-11 z-50 w-80 rounded-xl border border-slate-200 bg-white shadow-lg">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-2">
            <p className="text-sm font-semibold text-slate-800">Notificaciones</p>
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="text-xs text-brand-600 hover:underline">
                Marcar todo leído
              </button>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto divide-y divide-slate-50">
            {notifications.length === 0 && (
              <p className="px-4 py-6 text-center text-sm text-slate-400">Sin notificaciones.</p>
            )}
            {notifications.map((n) => {
              const content = (
                <div className={`flex gap-3 px-4 py-3 text-sm ${n.read ? '' : 'bg-brand-50'}`}>
                  <span className="text-lg shrink-0">{typeIcon[n.type] || '🔔'}</span>
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium leading-snug ${n.read ? 'text-slate-600' : 'text-slate-800'}`}>
                      {n.title}
                    </p>
                    {n.body && <p className="mt-0.5 truncate text-xs text-slate-400">{n.body}</p>}
                    <p className="mt-0.5 text-xs text-slate-300">
                      {new Date(n.created_at).toLocaleString('es-CL')}
                    </p>
                  </div>
                </div>
              );
              return n.link ? (
                <Link key={n.id} href={n.link} onClick={() => { markRead(n.id); setOpen(false); }}>
                  {content}
                </Link>
              ) : (
                <div key={n.id} onClick={() => markRead(n.id)}>
                  {content}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
