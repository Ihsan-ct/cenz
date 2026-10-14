'use client';
import { useState, useEffect } from 'react';

interface Preset { name: string; speed: number; amplify: number; }

interface Props {
  locale?: string;
  onSelect: (p: Preset) => void;
  currentSpeed: number;
  currentAmplify: number;
}

export default function CustomPresets({ locale = 'id', onSelect, currentSpeed, currentAmplify }: Props) {
  const isID = locale === 'id';
  const [presets, setPresets] = useState<Preset[]>([]);
  const [name, setName] = useState('');
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem('nakatune_presets');
    if (raw) { try { setPresets(JSON.parse(raw)); } catch {} }
  }, []);

  function save() {
    if (!name.trim()) return;
    const next = [...presets, { name: name.trim(), speed: currentSpeed, amplify: currentAmplify }];
    setPresets(next);
    localStorage.setItem('nakatune_presets', JSON.stringify(next));
    setName('');
  }

  function remove(i: number) {
    const next = presets.filter((_, j) => j !== i);
    setPresets(next);
    localStorage.setItem('nakatune_presets', JSON.stringify(next));
  }

  return (
    <div className="glow-card rounded-2xl p-5">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between text-sm"
      >
        <span className="font-medium text-neutral-300">
          ⭐ {isID ? 'Preset Saya' : 'My Presets'} ({presets.length})
        </span>
        <span className="text-neutral-500">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="mt-4 space-y-3">
          {presets.length === 0 ? (
            <p className="text-xs text-neutral-500">
              {isID ? 'Belum ada preset. Bikin di bawah.' : 'No presets yet. Create below.'}
            </p>
          ) : (
            presets.map((p, i) => (
              <div key={i} className="flex items-center justify-between gap-2 rounded-xl border border-neutral-800 bg-neutral-900/30 px-3 py-2">
                <button
                  type="button"
                  onClick={() => onSelect(p)}
                  className="flex-1 text-left text-sm text-neutral-300 hover:text-cyan-300"
                >
                  {p.name} <span className="text-xs text-neutral-500">· {p.speed.toFixed(2)}x · {p.amplify > 0 ? '+' : ''}{p.amplify}dB</span>
                </button>
                <button
                  type="button"
                  onClick={() => remove(i)}
                  className="text-red-400 hover:text-red-300"
                >
                  🗑
                </button>
              </div>
            ))
          )}

          <div className="flex gap-2">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={isID ? 'Nama preset baru…' : 'New preset name…'}
              className="flex-1 rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none"
            />
            <button
              type="button"
              onClick={save}
              disabled={!name.trim()}
              className="rounded-lg bg-cyan-500 px-4 py-2 text-sm font-medium text-black disabled:opacity-40"
            >
              {isID ? 'Simpan' : 'Save'}
            </button>
          </div>
          <p className="text-xs text-neutral-600">
            {isID ? 'Menyimpan setting speed + amplify saat ini' : 'Saves current speed + amplify'}
          </p>
        </div>
      )}
    </div>
  );
}
