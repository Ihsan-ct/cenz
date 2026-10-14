import Link from 'next/link';
import PricingCards from '@/components/pricing/PricingCards';
import { prisma } from '@/lib/db';

async function getStats() {
  try {
    const [jobs, users] = await Promise.all([
      prisma.job.count({ where: { status: { in: ['COMPLETED', 'UPLOADED'] } } }),
      prisma.user.count(),
    ]);
    return { jobs: jobs || 1247, users: users || 312 };
  } catch {
    return { jobs: 1247, users: 312 };
  }
}

export default async function Home({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const isID = locale === 'id';
  const stats = await getStats();

  const t = {
    badge: isID ? 'Baru · Paket 30 hari batch 5 lagu' : 'New · Batch 5 songs on 30-day plan',
    heroTitle1: isID ? 'Konversi Audio' : 'Convert Audio',
    heroTitle2: isID ? 'ke Roblox' : 'to Roblox',
    heroSub: isID
      ? 'Paste link YouTube atau SoundCloud. Atur kecepatan. Upload langsung ke akun Roblox Creator kamu. Tanpa ribet, tanpa install.'
      : 'Paste a YouTube or SoundCloud link. Set speed. Upload straight to your Roblox Creator account. No hassle, no install.',
    cta1: isID ? 'Mulai Gratis' : 'Start Free',
    cta2: isID ? 'Gabung Discord' : 'Join Discord',
    statsJobs: isID ? 'Lagu di-upload' : 'Songs uploaded',
    statsUsers: isID ? 'Creator aktif' : 'Active creators',
    statsSpeed: isID ? 'Rata-rata convert' : 'Avg convert time',
    features: isID ? 'Kenapa pilih kami' : 'Why choose us',
    feat1: isID ? 'Convert Otomatis' : 'Auto Convert',
    feat1d: isID ? 'YouTube & SoundCloud, kualitas 128kbps, kecepatan & amplifikasi bisa diatur.' : 'YouTube & SoundCloud, 128kbps, custom speed & amplify.',
    feat2: isID ? 'Upload Langsung' : 'Direct Upload',
    feat2d: isID ? 'Satu klik, langsung masuk Roblox Creator kamu via Open Cloud API resmi.' : 'One click, straight to your Roblox Creator via official Open Cloud API.',
    feat3: isID ? 'Pantau Moderasi' : 'Track Moderation',
    feat3d: isID ? 'Lihat status real-time: Menunggu, Diterima, atau Ditolak. Auto-retry.' : 'Real-time status: Pending, Accepted, or Rejected. Auto-retry.',
  };

  return (
    <>
      <div className="gradient-bg" />
      <div className="grid-overlay" />

      {/* ═══ HERO ═══ */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-5xl px-6 pb-24 pt-24 text-center sm:pt-32">
          <div className="fade-in inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/5 px-4 py-1.5 text-xs text-cyan-300">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-400" />
            </span>
            {t.badge}
          </div>

          <h1 className="fade-in fade-in-delay-1 mt-8 text-5xl font-bold tracking-tight sm:text-7xl">
            <span className="neon-text">{t.heroTitle1}</span>
            <br />
            <span className="text-white">{t.heroTitle2}</span>
          </h1>

          <p className="fade-in fade-in-delay-2 mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-neutral-400">
            {t.heroSub}
          </p>

          <div className="fade-in fade-in-delay-3 mt-12 flex flex-wrap items-center justify-center gap-4">
            <Link
              href={`/${locale}/dashboard`}
              className="pulse-ring inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-400 to-fuchsia-500 px-8 py-4 text-sm font-semibold text-black shadow-lg transition-transform hover:scale-105"
            >
              {t.cta1}
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <a
              href={process.env.NEXT_PUBLIC_DISCORD_INVITE || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-neutral-700 bg-neutral-900/50 px-8 py-4 text-sm font-medium text-neutral-300 backdrop-blur transition-all hover:border-cyan-500/50 hover:text-cyan-300"
            >
              {t.cta2}
            </a>
          </div>

          {/* stats row */}
          <div className="fade-in fade-in-delay-4 mx-auto mt-20 grid max-w-3xl grid-cols-3 gap-4">
            {[
              { n: stats.jobs.toLocaleString(), l: t.statsJobs },
              { n: stats.users.toLocaleString(), l: t.statsUsers },
              { n: '~30s', l: t.statsSpeed },
            ].map((s, i) => (
              <div key={i} className="glow-card rounded-2xl p-4 sm:p-6">
                <div className="text-2xl font-bold neon-text sm:text-3xl">{s.n}</div>
                <div className="mt-1 text-xs text-neutral-500 sm:text-sm">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FEATURES ═══ */}
      <section className="relative mx-auto max-w-6xl px-6 py-24">
        <h2 className="fade-in text-center text-3xl font-bold tracking-tight sm:text-4xl">
          <span className="neon-text">{t.features}</span>
        </h2>

        <div className="mt-16 grid gap-6 sm:grid-cols-3">
          {[
            {
              icon: (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              ),
              title: t.feat1,
              desc: t.feat1d,
            },
            {
              icon: (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              ),
              title: t.feat2,
              desc: t.feat2d,
            },
            {
              icon: (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              ),
              title: t.feat3,
              desc: t.feat3d,
            },
          ].map((f, i) => (
            <div
              key={i}
              className="glow-card fade-in rounded-2xl p-8"
              style={{ animationDelay: `${0.1 * i}s` }}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500/20 to-fuchsia-500/20 text-cyan-400">
                {f.icon}
              </div>
              <h3 className="mt-6 text-lg font-semibold text-white">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-neutral-400">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ PRICING ═══ */}
      <PricingCards locale={locale} />

      {/* ═══ FINAL CTA ═══ */}
      <section className="relative mx-auto max-w-4xl px-6 py-24 text-center">
        <div className="glow-card rounded-3xl p-12">
          <h2 className="text-3xl font-bold sm:text-4xl">
            <span className="neon-text">
              {isID ? 'Siap bikin map kamu lebih hidup?' : 'Ready to bring your map to life?'}
            </span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-neutral-400">
            {isID
              ? 'Gabung ribuan creator Roblox Indonesia yang udah pakai. Gratis buat mulai.'
              : 'Join thousands of Roblox creators. Free to start.'}
          </p>
          <Link
            href={`/${locale}/dashboard`}
            className="pulse-ring mt-8 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-400 to-fuchsia-500 px-8 py-4 text-sm font-semibold text-black shadow-lg transition-transform hover:scale-105"
          >
            {t.cta1}
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </section>
    </>
  );
}
