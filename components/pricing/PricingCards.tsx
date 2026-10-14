import Link from 'next/link';
import { PLANS } from '@/lib/tripay';
import { formatIDR } from '@/lib/utils';

const TESTIMONIALS = [
  {
    name: 'Rizky',
    role: 'Game Dev · 12 map',
    avatar: 'R',
    text: 'Convert 30 lagu dalam sehari, upload langsung ke Roblox. Gak balik lagi ke manual.',
  },
  {
    name: 'Andin',
    role: 'Creator · 8k visits',
    avatar: 'A',
    text: 'Preset Lofi-nya juara. Audio lolos moderasi lebih sering dibanding cara lain.',
  },
  {
    name: 'Bagas',
    role: 'Studio Owner',
    avatar: 'B',
    text: 'Tim gue 5 orang pake NakaTune. Hemat waktu setup audio sampe 80%.',
  },
];

export default function PricingCards({ locale = 'id' }: { locale?: string }) {
  const isID = locale === 'id';

  const plans = [
    {
      id: 'free',
      name: isID ? 'Gratis' : 'Free',
      price: 0,
      priceLabel: isID ? 'Rp 0' : 'Free',
      unit: isID ? 'selamanya' : 'forever',
      features: [
        isID ? '2 konversi / jam' : '2 converts / hour',
        isID ? 'Durasi maks 10 menit' : 'Max 10 min duration',
        isID ? 'Kecepatan & amplifikasi' : 'Speed & amplify',
        isID ? 'Upload ke Roblox' : 'Upload to Roblox',
      ],
      cta: isID ? 'Mulai Gratis' : 'Start Free',
      href: `/${locale}/dashboard`,
      variant: 'outline' as const,
    },
    {
      id: 'weekly',
      name: isID ? '7 Hari' : '7 Days',
      price: PLANS.weekly.price,
      priceLabel: formatIDR(PLANS.weekly.price),
      unit: isID ? 'per minggu' : 'per week',
      features: [
        isID ? 'Konversi TANPA BATAS' : 'UNLIMITED convert',
        isID ? 'Upload otomatis ke Roblox' : 'Auto upload to Roblox',
        isID ? 'Semua preset (Lofi, Nightcore, dll)' : 'All presets (Lofi, Nightcore…)',
        isID ? 'Pantau status moderasi realtime' : 'Track moderation realtime',
        isID ? 'Dukungan prioritas Discord' : 'Priority Discord support',
      ],
      cta: isID ? 'Pilih Paket' : 'Choose Plan',
      href: `/${locale}/subscription`,
      variant: 'outline' as const,
    },
    {
      id: 'monthly',
      name: isID ? '30 Hari' : '30 Days',
      price: PLANS.monthly.price,
      priceLabel: formatIDR(PLANS.monthly.price),
      unit: isID ? 'per bulan' : 'per month',
      features: [
        isID ? 'Semua fitur 7 Hari' : 'Everything in 7 Days',
        isID ? 'Batch 5 lagu sekali kirim' : 'Batch 5 songs at once',
        isID ? 'Lebih hemat 30%' : 'Save 30% vs weekly',
        isID ? 'API access (soon)' : 'API access (soon)',
        isID ? 'Garansi refund 3 hari' : '3-day refund guarantee',
      ],
      cta: isID ? 'Beli Sekarang' : 'Buy Now',
      href: `/${locale}/subscription`,
      variant: 'gradient' as const,
      popular: true,
      save: isID ? 'Hemat 30%' : 'Save 30%',
    },
  ];

  return (
    <section className="relative mx-auto max-w-6xl px-6 py-24">
      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
          <span className="neon-text">{isID ? 'Pilih Paket' : 'Choose a Plan'}</span>
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-neutral-400">
          {isID
            ? 'Mulai gratis. Upgrade kapan aja. Batalkan kapan aja.'
            : 'Start free. Upgrade anytime. Cancel anytime.'}
        </p>
      </div>

      <div className="mt-16 grid gap-6 lg:grid-cols-3">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`glow-card relative rounded-3xl p-8 ${
              plan.popular ? 'border-fuchsia-500/50 ring-2 ring-fuchsia-500/20' : ''
            }`}
          >
            {plan.popular && (
              <>
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="rounded-full bg-gradient-to-r from-cyan-400 to-fuchsia-500 px-4 py-1 text-xs font-semibold text-black">
                    ⭐ {isID ? 'PALING POPULER' : 'MOST POPULAR'}
                  </span>
                </div>
                {plan.save && (
                  <div className="absolute -top-3 right-6">
                    <span className="rounded-full bg-emerald-500 px-3 py-1 text-xs font-semibold text-black">
                      {plan.save}
                    </span>
                  </div>
                )}
              </>
            )}

            <h3 className="text-xl font-semibold text-white">{plan.name}</h3>
            <div className="mt-4 flex items-baseline gap-2">
              <span
                className={`text-4xl font-bold ${
                  plan.popular ? 'neon-text' : 'text-white'
                }`}
              >
                {plan.priceLabel}
              </span>
              <span className="text-sm text-neutral-500">{plan.unit}</span>
            </div>

            {plan.id === 'monthly' && (
              <div className="mt-2 text-xs text-emerald-400">
                {isID ? '≈ Rp 6.000/hari, lebih murah dari kopi' : '≈ Rp 6k/day, cheaper than coffee'}
              </div>
            )}

            <ul className="mt-8 space-y-3">
              {plan.features.map((f, i) => (
                <li key={i} className="flex items-start gap-3 text-sm">
                  <svg
                    className={`mt-0.5 h-4 w-4 shrink-0 ${
                      plan.popular ? 'text-fuchsia-400' : 'text-cyan-400'
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-neutral-300">{f}</span>
                </li>
              ))}
            </ul>

            <Link
              href={plan.href}
              className={`mt-8 block w-full rounded-full py-3 text-center text-sm font-semibold transition-all hover:scale-[1.02] ${
                plan.variant === 'gradient'
                  ? 'bg-gradient-to-r from-cyan-400 to-fuchsia-500 text-black shadow-lg shadow-fuchsia-500/20'
                  : 'border border-neutral-700 bg-neutral-900/50 text-white hover:border-cyan-500/50'
              }`}
            >
              {plan.cta}
            </Link>
          </div>
        ))}
      </div>

      {/* trust badges */}
      <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs text-neutral-500">
        <div className="flex items-center gap-2">
          <svg className="h-4 w-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          {isID ? 'Pembayaran aman via QRIS' : 'Secure QRIS payment'}
        </div>
        <div className="flex items-center gap-2">
          <svg className="h-4 w-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {isID ? 'Aktivasi instan' : 'Instant activation'}
        </div>
        <div className="flex items-center gap-2">
          <svg className="h-4 w-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          {isID ? 'Support 24/7 via Discord' : '24/7 Discord support'}
        </div>
      </div>

      {/* testimonials */}
      <div className="mt-20">
        <h3 className="text-center text-2xl font-bold">
          <span className="neon-text">{isID ? 'Kata Mereka' : 'What Users Say'}</span>
        </h3>
        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <div key={i} className="glow-card rounded-2xl p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-fuchsia-500 font-bold text-black">
                  {t.avatar}
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">{t.name}</div>
                  <div className="text-xs text-neutral-500">{t.role}</div>
                </div>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-neutral-400">
                &ldquo;{t.text}&rdquo;
              </p>
              <div className="mt-4 flex gap-0.5">
                {Array.from({ length: 5 }).map((_, j) => (
                  <span key={j} className="text-sm text-yellow-400">★</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
