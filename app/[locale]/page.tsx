import Link from 'next/link';
import PricingCards from '@/components/pricing/PricingCards';

export default function Home({ params: { locale } }: { params: { locale: string } }) {
  const isID = locale === 'id';
  return (
    <>
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-4xl px-6 pb-24 pt-32 text-center">
          <h1 className="text-5xl font-bold tracking-tight sm:text-6xl neon-text">
            {isID ? 'Konversi & Upload Audio ke Roblox' : 'Convert & Upload Audio to Roblox'}
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-neutral-400">
            {isID
              ? 'Konversi audio dari YouTube atau SoundCloud dengan kecepatan dan amplifikasi kustom.'
              : 'Convert audio from YouTube or SoundCloud with custom speed and amplification.'}
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link href={`/${locale}/dashboard`} className="rounded-full bg-cyan-500 px-8 py-3 text-sm font-medium text-black hover:bg-cyan-400">
              {isID ? 'Mulai Sekarang' : 'Get Started'}
            </Link>
            <a href={process.env.NEXT_PUBLIC_DISCORD_INVITE} target="_blank" rel="noopener noreferrer"
              className="rounded-full border border-neutral-800 px-8 py-3 text-sm hover:bg-neutral-900">
              {isID ? 'Gabung Discord' : 'Join Discord'}
            </a>
          </div>
        </div>
      </section>
      <PricingCards locale={locale} />
    </>
  );
}
