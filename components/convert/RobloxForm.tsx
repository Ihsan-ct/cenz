'use client';
import { useState } from 'react';

interface Existing {
  userId: string;
  username: string | null;
}

export default function RobloxForm({
  existing,
  locale = 'id',
}: {
  existing: Existing | null;
  locale?: string;
}) {
  const [userId, setUserId] = useState(existing?.userId || '');
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const isID = locale === 'id';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErr('');
    setMsg('');
    try {
      const res = await fetch('/api/roblox', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, apiKey }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setMsg(isID ? `Berhasil dihubungkan ke ${data.username}!` : `Linked to ${data.username}!`);
      setApiKey('');
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleUnlink() {
    if (!confirm(isID ? 'Putuskan koneksi Roblox?' : 'Unlink Roblox account?')) return;
    setLoading(true);
    try {
      const res = await fetch('/api/roblox', { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed');
      setMsg(isID ? 'Terputus.' : 'Unlinked.');
      setUserId('');
      setApiKey('');
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-5">
      {existing?.username && (
        <div className="rounded-lg border border-cyan-500/30 bg-cyan-500/5 p-4 text-sm">
          <div className="text-neutral-400">
            {isID ? 'Terhubung sebagai' : 'Linked as'}
          </div>
          <div className="mt-1 font-medium text-cyan-400">{existing.username}</div>
        </div>
      )}

      <label className="block text-sm">
        <span className="text-neutral-400">
          {isID ? 'Roblox User ID' : 'Roblox User ID'}
        </span>
        <input
          type="text"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          placeholder="9217554647"
          className="mt-2 w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm focus:border-cyan-500 focus:outline-none"
          required
        />
      </label>

      <label className="block text-sm">
        <span className="text-neutral-400">
          {isID ? 'API Key (Assets:Read + Write)' : 'API Key (Assets:Read + Write)'}
        </span>
        <input
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder={existing ? (isID ? 'Kosongkan jika tidak ingin ubah' : 'Leave blank to keep') : 'api-key-xxxxx'}
          className="mt-2 w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm focus:border-cyan-500 focus:outline-none"
          required={!existing}
        />
        <p className="mt-1 text-xs text-neutral-500">
          {isID
            ? 'API key dienkripsi AES-256-GCM. Tidak pernah dibagikan.'
            : 'API key encrypted with AES-256-GCM. Never shared.'}
        </p>
      </label>

      {msg && <p className="text-sm text-cyan-400">{msg}</p>}
      {err && <p className="text-sm text-red-400">{err}</p>}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 rounded-full bg-cyan-500 py-2 font-medium text-black hover:bg-cyan-400 disabled:opacity-50"
        >
          {loading ? '...' : (isID ? 'Simpan' : 'Save')}
        </button>
        {existing && (
          <button
            type="button"
            onClick={handleUnlink}
            disabled={loading}
            className="rounded-full border border-red-500/30 px-5 py-2 text-sm text-red-400 hover:bg-red-500/10 disabled:opacity-50"
          >
            {isID ? 'Putuskan' : 'Unlink'}
          </button>
        )}
      </div>
    </form>
  );
}
