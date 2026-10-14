'use client';

import { useEffect, useRef, useState } from 'react';

type Job = {
  id: string;
  status: string;
  errorMessage: string | null;
  downloadKey: string | null;
  createdAt: string;
};

const LIVE_STATUSES = ['QUEUED', 'PROCESSING'];

const STATUS_LABEL: Record<string, { id: string; en: string }> = {
  QUEUED: { id: 'Menunggu', en: 'Queued' },
  PROCESSING: { id: 'Memproses', en: 'Processing' },
  READY: { id: 'Siap diunduh', en: 'Ready' },
  FAILED: { id: 'Gagal', en: 'Failed' },
};

export default function JobRow({
  job: initialJob,
  locale,
}: {
  job: Job;
  locale: string;
}) {
  const [job, setJob] = useState(initialJob);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const isID = locale === 'id';

  useEffect(() => {
    if (!LIVE_STATUSES.includes(job.status)) return;

    timer.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/jobs/${job.id}`, { cache: 'no-store' });
        if (!res.ok) return;
        const data = await res.json();
        setJob(data);
        if (!LIVE_STATUSES.includes(data.status) && timer.current) {
          clearInterval(timer.current);
        }
      } catch {
        // diem aja, coba lagi di tick berikutnya
      }
    }, 3000);

    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [job.status, job.id]);

  async function handleDownload() {
    if (!job.downloadKey) return;
    setDownloading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/storage/download?key=${encodeURIComponent(job.downloadKey)}`
      );
      const data = await res.json();
      if (!res.ok || !data.url) {
        setError(isID ? 'Gagal membuat link unduhan' : 'Failed to get download link');
        return;
      }
      window.open(data.url, '_blank');
    } catch {
      setError(isID ? 'Gagal membuat link unduhan' : 'Failed to get download link');
    } finally {
      setDownloading(false);
    }
  }

  const label = STATUS_LABEL[job.status];
  const badgeColor =
    job.status === 'READY'
      ? 'bg-green-900 text-green-300'
      : job.status === 'FAILED'
      ? 'bg-red-900 text-red-300'
      : 'bg-neutral-800 text-neutral-300';

  return (
    <div className="flex items-center justify-between rounded-lg border border-neutral-800 bg-neutral-950 px-4 py-3">
      <div className="flex flex-col gap-1">
        <span className={`w-fit rounded-full px-2 py-0.5 text-xs ${badgeColor}`}>
          {label ? (isID ? label.id : label.en) : job.status}
        </span>
        <span className="text-xs text-neutral-500">
          {new Date(job.createdAt).toLocaleString(isID ? 'id-ID' : 'en-US')}
        </span>
        {job.status === 'FAILED' && job.errorMessage && (
          <span className="text-xs text-red-400">{job.errorMessage}</span>
        )}
        {error && <span className="text-xs text-red-400">{error}</span>}
      </div>

      {job.status === 'READY' && job.downloadKey && (
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="rounded-md bg-neutral-100 px-3 py-1.5 text-sm font-medium text-neutral-900 disabled:opacity-50"
        >
          {downloading
            ? isID ? 'Memuat...' : 'Loading...'
            : isID ? 'Unduh' : 'Download'}
        </button>
      )}
    </div>
  );
}
