import Link from 'next/link';
import { prisma } from '@/lib/db';

export const revalidate = 300;

export default async function TrendingPage({ params: { locale } }: { params: { locale: string } }) {
  const isID = locale === 'id';

  const since = new Date(Date.now() - 7 * 86400000);
  const jobs = await prisma.job.findMany({
    where: { createdAt: { gte: since }, status: { in: ['COMPLETED', 'UPLOADED'] } },
    select: { sourceUrl: true, fileName: true },
    take: 500,
  });

  const counts = new Map<string, number>();
  for (const j of jobs) {
    const key = j.sourceUrl || j.fileName;
    if (!key) continue;
    counts.set(key, (counts.get(key) || 0) + 1);
  }

  const trending = Array.from(counts.entries())
    .map(([url, count]) => ({ url, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 20);

  return (
    <main className="relative mx-auto max-w-3xl px-6 py-12">
      <div className="gradient-bg" />

      <h1 className="text-3xl font-bold text-center">
        <span className="neon-text">🔥 {isID ? 'Trending Minggu Ini' : 'Trending This Week'}</span>
      </h1>
      <p className="mx-auto mt-3 max-w-lg text-center text-sm text-neutral-400">
        {isID
          ? 'Lagu yang paling sering di-convert oleh creator Roblox minggu ini.'
          : 'Most converted tracks by Roblox creators this week.'}
      </p>

      <div className="mt-10 space-y-3">
        {trending.length === 0 ? (
          <div className="glow-card rounded-2xl p-12 text-center text-sm text-neutral-500">
            {isID ? 'Belum ada data. Jadilah yang pertama!' : 'No data yet. Be the first!'}
          </div>
        ) : (
          trending.map((t, i) => (
            <div key={i} className="glow-card flex items-center gap-4 rounded-2xl p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-fuchsia-500 font-bold text-black">
                {i + 1}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium text-neutral-200">{t.url}</div>
                <div className="text-xs text-neutral-500">{t.count}× {isID ? 'convert' : 'converts'}</div>
              </div>
              <Link
                href={`/${locale}/convert?url=${encodeURIComponent(t.url)}`}
                className="shrink-0 rounded-full border border-cyan-500/40 bg-cyan-500/10 px-4 py-1.5 text-xs text-cyan-300 hover:bg-cyan-500/20"
              >
                {isID ? 'Convert' : 'Convert'}
              </Link>
            </div>
          ))
        )}
      </div>
    </main>
  );
}
