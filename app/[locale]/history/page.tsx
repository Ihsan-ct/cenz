'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Job {
  id: string;
  sourceUrl: string | null;
  fileName: string | null;
  status: string;
  moderation: string | null;
  assetId: string | null;
  r2Key: string | null;
  errorMessage: string | null;
  createdAt: string;
}

const STATUS_COLOR: Record<string, string> = {
  QUEUED: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
  DOWNLOADING: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
  PROCESSING: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
  UPLOADING: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
  UPLOADED: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  COMPLETED: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  FAILED: 'text-red-400 bg-red-500/10 border-red-500/30',
  UPLOAD_FAILED: 'text-red-400 bg-red-500/10 border-red-500/30',
};

export default function HistoryPage({ params: { locale } }: { params: { locale: string } }) {
  const isID = locale === 'id';
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'done' | 'pending' | 'failed'>('all');
  const [query, setQuery] = useState('');
  const [copied, setCopied] = useState<string | null>(null);

  async function load() {
    const res = await fetch('/api/history', { cache: 'no-store' });
    if (!res.ok) return;
    const data = await res.json();
    setJobs(data.jobs || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleDelete(id: string) {
    if (!confirm(isID ? 'Hapus job ini?' : 'Delete this job?')) return;
    await fetch(`/api/jobs/${id}`, { method: 'DELETE' });
    setJobs((j) => j.filter((x) => x.id !== id));
  }

  async function handleRetry(id: string) {
    await fetch(`/api/jobs/${id}/retry`, { method: 'POST' });
    load();
  }

  function copyAsset(id: string, assetId: string) {
    navigator.clipboard.writeText(assetId);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  }

  const filtered = jobs.filter((j) => {
    if (filter === 'done' && !['COMPLETED', 'UPLOADED'].includes(j.status)) return false;
    if (filter === 'pending' && !['QUEUED', 'DOWNLOADING', 'PROCESSING', 'UPLOADING'].includes(j.status)) return false;
    if (filter === 'failed' && !['FAILED', 'UPLOAD_FAILED'].includes(j.status)) return false;
    if (query) {
      const q = query.toLowerCase();
      const hay = `${j.sourceUrl || ''}${j.fileName || ''}${j.assetId || ''}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  return (
    <main className="relative mx-auto max-w-5xl px-6 py-12">
      <div className="gradient-bg" />

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">
            <span className="neon-text">{isID ? 'Riwayat Konversi' : 'Conversion History'}</span>
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            {jobs.length} {isID ? 'total job' : 'total jobs'}
          </p>
        </div>
        <Link
          href={`/${locale}/convert`}
          className="rounded-full bg-gradient-to-r from-cyan-400 to-fuchsia-500 px-5 py-2.5 text-sm font-semibold text-black"
        >
          + {isID ? 'Konversi Baru' : 'New Convert'}
        </Link>
      </div>

      {/* filters + search */}
      <div className="mt-8 flex flex-wrap items-center gap-3">
        <div className="flex gap-1 rounded-full border border-neutral-800 bg-neutral-950 p-1">
          {[
            { id: 'all', label: isID ? 'Semua' : 'All' },
            { id: 'done', label: isID ? 'Selesai' : 'Done' },
            { id: 'pending', label: isID ? 'Proses' : 'Pending' },
            { id: 'failed', label: isID ? 'Gagal' : 'Failed' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id as any)}
              className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
                filter === f.id
                  ? 'bg-cyan-500 text-black'
                  : 'text-neutral-400 hover:text-cyan-300'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={isID ? 'Cari link / asset ID…' : 'Search link / asset ID…'}
          className="flex-1 min-w-[200px] rounded-full border border-neutral-800 bg-neutral-950 px-4 py-2 text-sm text-white placeholder:text-neutral-600 focus:border-cyan-500 focus:outline-none"
        />
      </div>

      {/* list */}
      <div className="mt-8 space-y-3">
        {loading ? (
          <div className="glow-card rounded-2xl p-8 text-center text-sm text-neutral-500">
            {isID ? 'Memuat…' : 'Loading…'}
          </div>
        ) : filtered.length === 0 ? (
          <div className="glow-card rounded-2xl p-12 text-center">
            <div className="text-4xl">🎵</div>
            <div className="mt-4 text-sm text-neutral-500">
              {isID ? 'Belum ada riwayat. Mulai konversi sekarang!' : 'No history yet. Start converting!'}
            </div>
            <Link
              href={`/${locale}/convert`}
              className="mt-6 inline-block rounded-full bg-cyan-500 px-6 py-2.5 text-sm font-semibold text-black"
            >
              {isID ? 'Mulai Konversi' : 'Start Convert'}
            </Link>
          </div>
        ) : (
          filtered.map((j) => (
            <div key={j.id} className="glow-card rounded-2xl p-5">
              <div className="flex flex-wrap items-start gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-medium ${STATUS_COLOR[j.status] || 'text-neutral-400 bg-neutral-800 border-neutral-700'}`}>
                      {j.status}
                    </span>
                    {j.moderation && (
                      <span className={`inline-block rounded-full border px-2.5 py-0.5 text-xs ${
                        j.moderation === 'ACCEPTED' ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' :
                        j.moderation === 'REJECTED' ? 'text-red-400 border-red-500/30 bg-red-500/10' :
                        'text-yellow-400 border-yellow-500/30 bg-yellow-500/10'
                      }`}>
                        {j.moderation}
                      </span>
                    )}
                  </div>
                  <div className="mt-2 truncate text-sm font-medium text-neutral-200">
                    {j.sourceUrl || j.fileName || j.id.slice(0, 12)}
                  </div>
                  <div className="mt-1 text-xs text-neutral-500">
                    {new Date(j.createdAt).toLocaleString(isID ? 'id-ID' : 'en-US')}
                  </div>
                  {j.errorMessage && (
                    <div className="mt-2 rounded-lg border border-red-500/30 bg-red-500/5 px-3 py-2 text-xs text-red-400">
                      {j.errorMessage}
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {j.assetId && (
                    <button
                      onClick={() => copyAsset(j.id, j.assetId!)}
                      className="rounded-full border border-neutral-700 px-3 py-1.5 text-xs text-neutral-300 hover:border-cyan-500/50 hover:text-cyan-300"
                    >
                      {copied === j.id ? '✓ Copied' : `📋 ${j.assetId.slice(0, 8)}…`}
                    </button>
                  )}
                  {j.r2Key && (
                    <a
                      href={`/api/storage/download?key=${encodeURIComponent(j.r2Key)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-full border border-neutral-700 px-3 py-1.5 text-xs text-neutral-300 hover:border-cyan-500/50 hover:text-cyan-300"
                    >
                      ⬇ {isID ? 'Unduh' : 'Download'}
                    </a>
                  )}
                  {['FAILED', 'UPLOAD_FAILED'].includes(j.status) && (
                    <button
                      onClick={() => handleRetry(j.id)}
                      className="rounded-full border border-yellow-500/30 bg-yellow-500/10 px-3 py-1.5 text-xs text-yellow-400 hover:bg-yellow-500/20"
                    >
                      ↻ {isID ? 'Coba Lagi' : 'Retry'}
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(j.id)}
                    className="rounded-full border border-red-500/30 px-3 py-1.5 text-xs text-red-400 hover:bg-red-500/10"
                  >
                    🗑
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </main>
  );
}
