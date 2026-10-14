'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

const STEPS_ID = [
  {
    icon: '🎵',
    title: 'Selamat datang di NakaTune!',
    desc: 'Cara paling cepet konversi audio YouTube/SoundCloud ke Roblox. 3 langkah, selesai dalam 30 detik.',
  },
  {
    icon: '🔗',
    title: 'Langkah 1: Paste link',
    desc: 'Copy link YouTube atau SoundCloud. Paste di halaman Konversi. Pilih preset (Lofi, Nightcore, dll).',
  },
  {
    icon: '⚡',
    title: 'Langkah 2: Konversi',
    desc: 'Klik "Konversi & Upload". Server download, convert ke MP3, upload ke storage. Bisa pantau progress realtime.',
  },
  {
    icon: '🎮',
    title: 'Langkah 3: Masuk Roblox',
    desc: 'Setelah selesai, copy Asset ID dari Riwayat. Paste ke Roblox Studio di map kamu. Udah!',
  },
];

const STEPS_EN = [
  {
    icon: '🎵',
    title: 'Welcome to NakaTune!',
    desc: 'The fastest way to convert YouTube/SoundCloud audio to Roblox. 3 steps, done in 30 seconds.',
  },
  {
    icon: '🔗',
    title: 'Step 1: Paste link',
    desc: 'Copy a YouTube or SoundCloud link. Paste in the Convert page. Pick a preset (Lofi, Nightcore…).',
  },
  {
    icon: '⚡',
    title: 'Step 2: Convert',
    desc: 'Click "Convert & Upload". Server downloads, converts to MP3, uploads to storage. Realtime progress.',
  },
  {
    icon: '🎮',
    title: 'Step 3: Roblox',
    desc: 'When done, copy Asset ID from History. Paste into Roblox Studio in your map. Done!',
  },
];

export default function OnboardingModal({ locale = 'id' }: { locale?: string }) {
  const isID = locale === 'id';
  const steps = isID ? STEPS_ID : STEPS_EN;
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const seen = localStorage.getItem('nakatune_onboard_v1');
    if (!seen) setOpen(true);
  }, []);

  function close() {
    localStorage.setItem('nakatune_onboard_v1', '1');
    setOpen(false);
  }

  if (!open) return null;

  const s = steps[step];
  const isLast = step === steps.length - 1;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="glow-card relative w-full max-w-md rounded-3xl p-8">
        <button
          onClick={close}
          className="absolute right-4 top-4 text-neutral-500 hover:text-white"
          aria-label="Close"
        >
          ✕
        </button>

        <div className="text-center">
          <div className="text-6xl">{s.icon}</div>
          <h2 className="mt-6 text-2xl font-bold">
            <span className="neon-text">{s.title}</span>
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-neutral-400">{s.desc}</p>
        </div>

        <div className="mt-8 flex justify-center gap-1.5">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i === step ? 'w-8 bg-cyan-400' : 'w-1.5 bg-neutral-700'
              }`}
            />
          ))}
        </div>

        <div className="mt-8 flex gap-3">
          {step > 0 && (
            <button
              onClick={() => setStep(step - 1)}
              className="rounded-full border border-neutral-700 px-5 py-2.5 text-sm text-neutral-400 hover:border-cyan-500/40"
            >
              {isID ? 'Kembali' : 'Back'}
            </button>
          )}
          <button
            onClick={isLast ? close : () => setStep(step + 1)}
            className="flex-1 rounded-full bg-gradient-to-r from-cyan-400 to-fuchsia-500 py-2.5 text-sm font-semibold text-black"
          >
            {isLast ? (isID ? 'Mulai Sekarang' : 'Get Started') : (isID ? 'Lanjut' : 'Next')}
          </button>
        </div>

        {!isLast && (
          <button
            onClick={close}
            className="mt-4 block w-full text-center text-xs text-neutral-600 hover:text-neutral-400"
          >
            {isID ? 'Lewati tutorial' : 'Skip tutorial'}
          </button>
        )}
      </div>
    </div>
  );
}
