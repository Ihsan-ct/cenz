'use client';

import { useEffect, useRef, useState } from 'react';

type JobStatus = 'QUEUED' | 'PROCESSING' | 'READY' | 'FAILED';

type Job = {
  id: string;
  status: JobStatus;
  errorMessage: string | null;
  assetId: string | null;
  r2Key: string | null;
  createdAt: string;
  completedAt: string | null;
};

const STATUS_LABEL: Record<JobStatus, { id: string; en: string }> = {
  QUEUED: { id: 'Menunggu', en: 'Queued' },
  PROCESSING: { id: 'Memproses', en: 'Processing' },
  READY: { id: 'Selesai', en: 'Ready' },
  FAILED: { id: 'Gagal', en: 'Failed' },
};

export default function ConvertForm({
  locale,
  isPaid,
  initialJobs,
}: {
  locale: string;
  isPaid: boolean;
  initialJobs: Job[];
}) {
  const isID = locale === 'id';

  const [url, setUrl] = useState('');
  const [speed, setSpeed] = useState(1.0);
  const [amplify, setAmplify] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [jobs, setJobs] = useState<Job[]>(initialJobs);
  const pollRefs = useRef<Record<string, ReturnType<typeof setInterval>>>({});

  useEffect(() => {
    // lanjutin polling buat job yang masih aktif pas page di-reload
    for (const job of initialJobs) {
      if (job.status === 'QUEUED' || job.status === 'PROCESSING') {
        startPolling(job.id);
      }
    }
    return () => {
      Object.values(pollRefs.current).forEach(clearInterval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function startPolling(jobId: string) {
    if (pollRefs.current[jobId]) return;
    pollRefs.current[jobId] = setInterval(async () => {
      try {
        const res = await fetch(`/api/jobs/${jobId}`);
        if (!res.ok) return;
        const data: Job & { downloadKey: string | null } = await res.json();
        setJobs((prev) => prev.map((j) => (j.id === jobId ? { ...j, ...data } : j)));
        if (data.status === 'READY' || data.status === 'FAILED') {
          clearInterval(pollRefs.current[jobId]);
          delete pollRefs.current[jobId];
        }
      } catch {
        // biar aja, coba lagi di interval berikutnya
      }
    }, 3000);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    if (!url.trim()) {
      setFormError(isID ? 'Masukkan link dulu' : 'Enter a link first');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/convert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim(), speed, amplify }),
      });
      const data = await res.json();

      if (!res.ok) {
        setFormError(mapError(data, isID));
        return;
      }

      const newJob: Job = {
        id: data.jobId,
        status: data.status,
        errorMessage: null,
        assetId: null,
        r2Key: null,
        createdAt: new Date().toISOString(),
        completedAt: null,
      };
      setJobs((prev) => [newJob, ...prev].slice(0, 5));
      startPolling(data.jobId);
      setUrl('');
    } catch {
      setFormError(isID ? 'Gagal menghubungi server' : 'Failed to reach server');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDownload(job: Job) {
    if (!job.r2Key) return;
    try {
      const res = await fetch(`/api/storage/download?key=${encodeURIComponent(job.r2Key)}`);
      if (!res.ok) return;
      const data = await res.json();
      window.open(data.url, '_blank');
    } catch {
      // diem aja, user bisa coba lagi
    }
  }

  return (
    <div className="mt-10 space-y-8">
      <form
        onSubmit={handleSubmit}
        className="rounded-xl border border-neutral-800 bg-neutral-950 p-6 space-y-5"
      >
        <h2 className="text-xl font-semibold">{isID ? 'Konversi Audio' : 'Convert Audio'}</h2>

        <div>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder={isID ? 'Tempel link YouTube atau SoundCloud...' : 'Paste a YouTube or SoundCloud link...'}
            className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-4 py-2.5 text-sm outline-none focus:border-neutral-500"
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="flex justify-between text-sm text-neutral-400">
              <span>{isID ? 'Kecepatan' : 'Speed'}</span>
              <span>{speed.toFixed(1)}x</span>
            </label>
            <input
              type="range"
              min={0.5}
              max={3}
              step={0.1}
              value={speed}
              onChange={(e) => setSpeed(parseFloat(e.target.value))}
              className="mt-2 w-full"
            />
          </div>
          <div>
            <label className="flex justify-between text-sm text-neutral-400">
              <span>{isID ? 'Amplifikasi' : 'Amplify'}</span>
              <span>{amplify > 0 ? `+${amplify}` : amplify} dB</span>
            </label>
            <input
              type="range"
              min={-10}
              max={10}
              step={1}
              value={amplify}
              onChange={(e) => setAmplify(parseInt(e.target.value, 10))}
              className="mt-2 w-full"
            />
          </div>
        </div>

        <p className="text-xs text-neutral-500">
          {isID ? 'Durasi maksimum' : 'Max duration'}: {isPaid ? '600s' : '300s'}
        </p>

        {formError && <p className="text-sm text-red-400">{formError}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-white px-5 py-2.5 text-sm font-medium text-black disabled:opacity-50"
        >
          {submitting ? (isID ? 'Sedang memproses...' : 'Processing...') : (isID ? 'Konversi Audio' : 'Convert Audio')}
        </button>
      </form>

      <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-6">
        <h2 className="text-xl font-semibold">{isID ? 'Riwayat Konversi' : 'Conversion History'}</h2>
        {jobs.length === 0 ? (
          <p className="mt-4 text-sm text-neutral-500">{isID ? 'Belum ada riwayat' : 'No history yet'}</p>
        ) : (
          <ul className="mt-4 divide-y divide-neutral-800">
            {jobs.map((job) => (
              <li key={job.id} className="flex items-center justify-between py-3 text-sm">
                <div>
                  <div className="font-medium">{STATUS_LABEL[job.status][isID ? 'id' : 'en']}</div>
                  {job.status === 'FAILED' && job.errorMessage && (
                    <div className="text-xs text-red-400">{job.errorMessage}</div>
                  )}
                  <div className="text-xs text-neutral-500">
                    {new Date(job.createdAt).toLocaleString(isID ? 'id-ID' : 'en-US')}
                  </div>
                </div>
                {job.status === 'READY' && job.r2Key && (
                  <button
                    onClick={() => handleDownload(job)}
                    className="rounded-lg border border-neutral-700 px-3 py-1.5 text-xs hover:border-neutral-500"
                  >
                    {isID ? 'Unduh' : 'Download'}
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function mapError(data: { error?: string; resetIn?: number }, isID: boolean): string {
  switch (data.error) {
    case 'INVALID_URL':
      return isID ? 'Link tidak valid. Gunakan link YouTube atau SoundCloud.' : 'Invalid link. Use a YouTube or SoundCloud link.';
    case 'TOO_MANY_ACTIVE':
      return isID ? 'Kamu masih punya proses yang berjalan. Tunggu sampai selesai.' : 'You still have an active job. Wait for it to finish.';
    case 'RATE_LIMIT': {
      const mins = data.resetIn ? Math.ceil(data.resetIn / 60) : null;
      return isID
        ? `Batas konversi tercapai.${mins ? ` Coba lagi dalam ${mins} menit.` : ''}`
        : `Conversion limit reached.${mins ? ` Try again in ${mins} minutes.` : ''}`;
    }
    case 'QUEUE_UNAVAILABLE':
      return isID ? 'Antrean sedang tidak tersedia. Coba lagi sebentar lagi.' : 'Queue is unavailable right now. Try again shortly.';
    case 'UNAUTHORIZED':
      return isID ? 'Sesi kamu habis, silakan login ulang.' : 'Your session expired, please log in again.';
    default:
      return isID ? 'Terjadi kesalahan. Coba lagi.' : 'Something went wrong. Please try again.';
  }
}
