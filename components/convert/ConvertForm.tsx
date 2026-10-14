'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

interface Props {
  locale?: string;
}

const PRESETS = [
  { id: 'default',  label: 'Default',    speed: 1.0,  amplify: 0  },
  { id: 'lofi',     label: 'Lofi',       speed: 0.85, amplify: -2 },
  { id: 'slowed',   label: 'Slowed',     speed: 0.75, amplify: 0  },
  { id: 'nightcore',label: 'Nightcore',  speed: 1.25, amplify: 1  },
  { id: 'daycore',  label: 'Daycore',    speed: 0.9,  amplify: -3 },
  { id: 'reverb',   label: 'Slow Reverb',speed: 0.8,  amplify: 2  },
  { id: '432hz',    label: '432 Hz',     speed: 1.0,  amplify: 1  },
  { id: 'ultra',    label: 'Ultra Slow', speed: 0.5,  amplify: -1 },
];

const TIPS = [
  'Pake preset Lofi biar moderasi lolos lebih cepet.',
  'Speed ideal buat Roblox: 0.43 di playback (audio lo 2.32x).',
  'Link playlist gak didukung — paste satu lagu aja.',
  'Kalo ditolak moderasi, coba preset Slow Reverb.',
  'Durasi maks 10 menit untuk paket gratis.',
  'Setelah selesai, copy Asset ID ke Roblox Studio langsung.',
];

export default function ConvertForm({ locale = 'id' }: Props) {
  const isID = locale === 'id';
  const [url, setUrl] = useState('');
  const [speed, setSpeed] = useState(1.0);
  const [amplify, setAmplify] = useState(0);
  const [presetId, setPresetId] = useState('default');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [jobId, setJobId] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<string>('');
  const [progress, setProgress] = useState(0);
  const [tipIdx, setTipIdx] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const router = useRouter();
  const pollRef = useRef<any>(null);

  // rotate tips
  useEffect(() => {
    const t = setInterval(() => setTipIdx((i) => (i + 1) % TIPS.length), 5000);
    return () => clearInterval(t);
  }, []);

  // cleanup polling
  useEffect(() => {
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, []);

  function applyPreset(p: typeof PRESETS[0]) {
    setPresetId(p.id);
    setSpeed(p.speed);
    setAmplify(p.amplify);
  }

  function statusProgress(s: string) {
    switch (s) {
      case 'QUEUED':      return 10;
      case 'DOWNLOADING': return 30;
      case 'PROCESSING':  return 55;
      case 'UPLOADING':   return 80;
      case 'UPLOADED':    return 100;
      case 'COMPLETED':   return 100;
      case 'FAILED':      return 100;
      case 'UPLOAD_FAILED': return 100;
      default:            return 5;
    }
  }

  function statusLabel(s: string) {
    const m: Record<string, string> = {
      QUEUED:          isID ? 'Antri…' : 'Queued…',
      DOWNLOADING:     isID ? 'Download audio…' : 'Downloading…',
      PROCESSING:      isID ? 'Konversi…' : 'Converting…',
      UPLOADING:       isID ? 'Upload ke Roblox…' : 'Uploading…',
      UPLOADED:        isID ? 'Terkirim! Menunggu moderasi.' : 'Sent! Pending moderation.',
      COMPLETED:       isID ? 'Selesai!' : 'Done!',
      FAILED:          isID ? 'Gagal.' : 'Failed.',
      UPLOAD_FAILED:   isID ? 'Upload gagal.' : 'Upload failed.',
    };
    return m[s] || s;
  }

  async function pollJob(id: string) {
    const res = await fetch(`/api/jobs/${id}`, { cache: 'no-store' });
    if (!res.ok) return;
    const data = await res.json();
    setJobStatus(data.status);
    setProgress(statusProgress(data.status));
    if (['COMPLETED', 'UPLOADED', 'FAILED', 'UPLOAD_FAILED'].includes(data.status)) {
      if (pollRef.current) clearInterval(pollRef.current);
      setLoading(false);
      setTimeout(() => router.push(`/${locale}/history`), 2000);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setJobId(null);
    setProgress(5);
    setJobStatus('QUEUED');

    try {
      const res = await fetch('/api/convert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, speed, amplify, maxDuration: 600 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');

      setJobId(data.jobId);
      pollRef.current = setInterval(() => pollJob(data.jobId), 2500);
      pollJob(data.jobId);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  }

  const showProgress = loading || jobId;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* ── TIPS ROTATING ── */}
      <div className="glow-card rounded-2xl p-4">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cyan-500/20 text-xs text-cyan-300">
            💡
          </div>
          <p className="text-sm text-neutral-400 transition-opacity duration-500">
            {TIPS[tipIdx]}
          </p>
        </div>
      </div>

      {/* ── PROGRESS BAR ── */}
      {showProgress && (
        <div className="glow-card rounded-2xl p-6">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-cyan-300">{statusLabel(jobStatus)}</span>
            <span className="text-neutral-500">{progress}%</span>
          </div>
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-neutral-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-fuchsia-500 transition-all duration-700 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="mt-4 flex gap-1.5">
            {['QUEUED', 'DOWNLOADING', 'PROCESSING', 'UPLOADING', 'UPLOADED'].map((s, i) => {
              const order = ['QUEUED', 'DOWNLOADING', 'PROCESSING', 'UPLOADING', 'UPLOADED'];
              const cur = order.indexOf(jobStatus);
              const done = i <= cur;
              return (
                <div
                  key={s}
                  className={`h-1 flex-1 rounded-full transition-colors ${
                    done ? 'bg-cyan-400' : 'bg-neutral-800'
                  }`}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* ── FORM ── */}
      {!showProgress && (
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* url input */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              const text = e.dataTransfer.getData('text/plain');
              if (text) setUrl(text);
            }}
            className={`glow-card rounded-2xl p-4 transition-colors ${
              dragOver ? 'border-cyan-400 bg-cyan-500/5' : ''
            }`}
          >
            <label className="text-xs uppercase tracking-wider text-neutral-500">
              {isID ? 'Link YouTube / SoundCloud' : 'YouTube / SoundCloud Link'}
            </label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder={isID ? 'https://youtube.com/watch?v=...' : 'https://youtube.com/watch?v=...'}
              className="mt-2 w-full bg-transparent text-lg text-white placeholder:text-neutral-600 focus:outline-none"
              required
            />
            <p className="mt-2 text-xs text-neutral-600">
              {isID ? 'Atau drag-drop link ke sini' : 'Or drag-drop a link here'}
            </p>
          </div>

          {/* presets */}
          <div>
            <label className="text-xs uppercase tracking-wider text-neutral-500">
              {isID ? 'Preset Cepat' : 'Quick Presets'}
            </label>
            <div className="mt-3 grid grid-cols-4 gap-2">
              {PRESETS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => applyPreset(p)}
                  className={`rounded-xl border px-3 py-2.5 text-xs font-medium transition-all ${
                    presetId === p.id
                      ? 'border-cyan-400 bg-cyan-500/10 text-cyan-300'
                      : 'border-neutral-800 bg-neutral-900/40 text-neutral-400 hover:border-cyan-500/40 hover:text-cyan-300'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* fine tune */}
          <div className="glow-card rounded-2xl p-5">
            <details>
              <summary className="cursor-pointer text-sm font-medium text-neutral-400 hover:text-cyan-300">
                {isID ? 'Atur manual (advanced)' : 'Advanced settings'}
              </summary>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <label className="text-sm">
                  <span className="text-xs uppercase tracking-wider text-neutral-500">
                    {isID ? 'Kecepatan' : 'Speed'} · {speed.toFixed(2)}x
                  </span>
                  <input
                    type="range"
                    min="0.5"
                    max="2.5"
                    step="0.01"
                    value={speed}
                    onChange={(e) => { setSpeed(parseFloat(e.target.value)); setPresetId('custom'); }}
                    className="mt-3 w-full accent-cyan-400"
                  />
                </label>
                <label className="text-sm">
                  <span className="text-xs uppercase tracking-wider text-neutral-500">
                    {isID ? 'Amplifikasi' : 'Amplify'} · {amplify > 0 ? '+' : ''}{amplify} dB
                  </span>
                  <input
                    type="range"
                    min="-10"
                    max="10"
                    step="0.5"
                    value={amplify}
                    onChange={(e) => { setAmplify(parseFloat(e.target.value)); setPresetId('custom'); }}
                    className="mt-3 w-full accent-cyan-400"
                  />
                </label>
              </div>
            </details>
          </div>

          {error && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-4 text-sm text-red-400">
              ⚠ {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="pulse-ring w-full rounded-full bg-gradient-to-r from-cyan-400 to-fuchsia-500 py-4 text-sm font-semibold text-black transition-transform hover:scale-[1.01] disabled:opacity-50"
          >
            {loading ? (isID ? 'Sedang memproses…' : 'Processing…') : (isID ? '⚡ Konversi & Upload ke Roblox' : '⚡ Convert & Upload to Roblox')}
          </button>

          <p className="text-center text-xs text-neutral-600">
            {isID
              ? 'Konversi + upload otomatis. Hasil muncul di Riwayat.'
              : 'Auto convert + upload. Results appear in History.'}
          </p>
        </form>
      )}
    </div>
  );
}
