'use client';
import { useState } from 'react';

interface Props {
  url: string;
  locale?: string;
}

export default function AudioPreview({ url, locale = 'id' }: Props) {
  const isID = locale === 'id';
  const [playing, setPlaying] = useState(false);

  if (!url) return null;

  return (
    <button
      type="button"
      onClick={() => setPlaying(!playing)}
      className="mt-3 flex items-center gap-3 rounded-xl border border-neutral-800 bg-neutral-900/30 px-4 py-3 text-sm transition-colors hover:border-cyan-500/40"
    >
      <div className={`flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-fuchsia-500 text-black`}>
        {playing ? '⏸' : '▶'}
      </div>
      <div className="text-left">
        <div className="font-medium text-neutral-200">
          {playing
            ? (isID ? 'Memutar preview…' : 'Playing preview…')
            : (isID ? 'Preview audio' : 'Preview audio')}
        </div>
        <div className="text-xs text-neutral-500">
          {isID ? 'Dengerin dulu, baru convert' : 'Listen first, then convert'}
        </div>
      </div>
      {playing && (
        <div className="ml-auto flex gap-0.5">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-6 w-1 rounded-full bg-cyan-400"
              style={{ animation: `bounce 0.8s ease-in-out ${i * 0.1}s infinite` }}
            />
          ))}
        </div>
      )}
      <style jsx>{`
        @keyframes bounce {
          0%, 100% { transform: scaleY(0.3); }
          50% { transform: scaleY(1); }
        }
      `}</style>
    </button>
  );
}
