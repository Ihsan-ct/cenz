'use client';
import { useState } from 'react';

interface Props {
  locale?: string;
  isPro: boolean;
}

export default function BatchConvert({ locale = 'id', isPro }: Props) {
  const isID = locale === 'id';
  const [links, setLinks] = useState<string[]>(['']);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{ url: string; jobId?: string; error?: string }[]>([]);

  function update(i: number, v: string) {
    const next = [...links];
    next[i] = v;
    setLinks(next);
  }

  function add() {
    if (links.length < 5) setLinks([...links, '']);
  }

  function remove(i: number) {
    setLinks(links.filter((_, j) => j !== i));
  }

  async function submit() {
    if (!isPro) return;
    setLoading(true);
    setResults([]);
    const out: typeof results = [];
    for (const url of links.filter((l) => l.trim())) {
      try {
        const res = await fetch('/api/convert', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url, speed: 1, amplify: 0, maxDuration: 600 }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed');
        out.push({ url, jobId: data.jobId });
      } catch (err: any) {
        out.push({ url, error: err.message });
      }
    }
    setResults(out);
    setLoading(false);
  }

  if (!isPro) {
    return (
      <div className="glow-card rounded-2xl p-6 border-yellow-500/30">
        <div className="flex items-start gap-3">
          <div className="text-2xl">💎</div>
          <div>
            <div className="font-semibold text-white">
              {isID ? 'Batch Convert — Fitur Pro' : 'Batch Convert — Pro Feature'}
            </div>
            <p className="mt-1 text-sm text-neutral-400">
              {isID
                ? 'Konversi sampai 5 lagu sekaligus dengan paket 30 Hari.'
                : 'Convert up to 5 songs at once with the 30-day plan.'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="glow-card rounded-2xl p-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-white">
          ⚡ {isID ? 'Batch Convert' : 'Batch Convert'}
        </h3>
        <span className="rounded-full bg-yellow-500/20 px-2.5 py-0.5 text-xs text-yellow-400">PRO</span>
      </div>

      <div className="mt-4 space-y-2">
        {links.map((l, i) => (
          <div key={i} className="flex gap-2">
            <input
              value={l}
              onChange={(e) => update(i, e.target.value)}
              placeholder={`${isID ? 'Link' : 'Link'} ${i + 1}`}
              className="flex-1 rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none"
            />
            {links.length > 1 && (
              <button type="button" onClick={() => remove(i)} className="rounded-lg border border-red-500/30 px-3 text-red-400">
                ✕
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="mt-3 flex gap-2">
        {links.length < 5 && (
          <button type="button" onClick={add} className="rounded-lg border border-neutral-800 px-3 py-1.5 text-xs text-neutral-400 hover:border-cyan-500/40">
            + {isID ? 'Tambah' : 'Add'}
          </button>
        )}
      </div>

      <button
        type="button"
        onClick={submit}
        disabled={loading || links.every((l) => !l.trim())}
        className="mt-4 w-full rounded-full bg-gradient-to-r from-cyan-400 to-fuchsia-500 py-2.5 text-sm font-semibold text-black disabled:opacity-40"
      >
        {loading ? '...' : (isID ? `Konversi ${links.filter((l) => l.trim()).length} Lagu` : `Convert ${links.filter((l) => l.trim()).length} Songs`)}
      </button>

      {results.length > 0 && (
        <div className="mt-4 space-y-2">
          {results.map((r, i) => (
            <div key={i} className={`rounded-lg border px-3 py-2 text-xs ${r.error ? 'border-red-500/30 text-red-400' : 'border-emerald-500/30 text-emerald-400'}`}>
              {r.error ? `✗ ${r.url.slice(0, 40)}: ${r.error}` : `✓ ${r.url.slice(0, 40)} → ${r.jobId?.slice(0, 8)}`}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
