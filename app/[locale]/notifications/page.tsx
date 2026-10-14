'use client';
import { useEffect, useState } from 'react';

interface Notif {
  id: string; type: string; title: string; message: string;
  link: string | null; read: boolean; createdAt: string;
}

const ICON: Record<string, string> = {
  job_done: '✅',
  job_failed: '❌',
  sub_active: '💎',
  sub_expired: '⏰',
  referral: '🎁',
  info: 'ℹ️',
};

export default function NotificationsPage({ params: { locale } }: { params: { locale: string } }) {
  const isID = locale === 'id';
  const [items, setItems] = useState<Notif[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    const res = await fetch('/api/notifications', { cache: 'no-store' });
    if (!res.ok) return;
    const data = await res.json();
    setItems(data.items || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function markAll() {
    await fetch('/api/notifications', { method: 'POST' });
    load();
  }

  return (
    <main className="relative mx-auto max-w-3xl px-6 py-12">
      <div className="gradient-bg" />

      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">
          <span className="neon-text">🔔 {isID ? 'Notifikasi' : 'Notifications'}</span>
        </h1>
        {items.some((i) => !i.read) && (
          <button onClick={markAll} className="rounded-full border border-neutral-800 px-4 py-2 text-xs text-neutral-400 hover:border-cyan-500/40">
            {isID ? 'Tandai semua dibaca' : 'Mark all read'}
          </button>
        )}
      </div>

      <div className="mt-8 space-y-3">
        {loading ? (
          <div className="glow-card rounded-2xl p-8 text-center text-sm text-neutral-500">{isID ? 'Memuat…' : 'Loading…'}</div>
        ) : items.length === 0 ? (
          <div className="glow-card rounded-2xl p-12 text-center">
            <div className="text-4xl">📭</div>
            <div className="mt-4 text-sm text-neutral-500">{isID ? 'Belum ada notifikasi' : 'No notifications yet'}</div>
          </div>
        ) : (
          items.map((n) => (
            <div
              key={n.id}
              className={`glow-card rounded-2xl p-5 ${!n.read ? 'border-cyan-500/40' : ''}`}
            >
              <div className="flex gap-3">
                <div className="text-2xl">{ICON[n.type] || 'ℹ️'}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <div className="font-medium text-white">{n.title}</div>
                    {!n.read && <span className="h-2 w-2 rounded-full bg-cyan-400" />}
                  </div>
                  <div className="mt-1 text-sm text-neutral-400">{n.message}</div>
                  <div className="mt-2 text-xs text-neutral-600">
                    {new Date(n.createdAt).toLocaleString(isID ? 'id-ID' : 'en-US')}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </main>
  );
}
