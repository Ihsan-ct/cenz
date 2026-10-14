'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ConvertForm({ locale = 'id' }: { locale?: string }) {
  const [url, setUrl] = useState('');
  const [speed, setSpeed] = useState(1.0);
  const [amplify, setAmplify] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/convert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, speed, amplify, maxDuration: 600 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      router.push(`/id/history`);
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-2xl space-y-6">
      <input
        type="text" value={url} onChange={(e) => setUrl(e.target.value)}
        placeholder={locale === 'id' ? 'Tempel link YouTube atau SoundCloud...' : 'Paste YouTube or SoundCloud link...'}
        className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm focus:border-cyan-500 focus:outline-none"
        required
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm">
          <span className="text-neutral-400">{locale === 'id' ? 'Kecepatan' : 'Speed'}</span>
          <input type="number" step="0.01" min="0.5" max="3" value={speed}
            onChange={(e) => setSpeed(parseFloat(e.target.value))}
            className="mt-2 w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm" />
        </label>
        <label className="text-sm">
          <span className="text-neutral-400">{locale === 'id' ? 'Amplifikasi (dB)' : 'Amplify (dB)'}</span>
          <input type="number" step="0.5" min="-10" max="10" value={amplify}
            onChange={(e) => setAmplify(parseFloat(e.target.value))}
            className="mt-2 w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm" />
        </label>
      </div>
      {error && <p className="text-sm text-red-400">{error}</p>}
      <button disabled={loading}
        className="w-full rounded-full bg-cyan-500 py-3 font-medium text-black hover:bg-cyan-400 disabled:opacity-50">
        {loading ? (locale === 'id' ? 'Sedang memproses...' : 'Processing...') : (locale === 'id' ? 'Konversi Audio' : 'Convert Audio')}
      </button>
    </form>
  );
}
