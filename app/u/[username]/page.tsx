import { prisma } from '@/lib/db';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export async function generateMetadata({ params }: { params: { username: string } }) {
  const user = await prisma.user.findUnique({ where: { username: params.username } });
  if (!user) return { title: 'Not found' };
  return {
    title: `${user.username} — NakaTune`,
    description: `${user.username}'s public NakaTune profile`,
  };
}

export default async function PublicProfile({ params }: { params: { username: string } }) {
  const user = await prisma.user.findUnique({
    where: { username: params.username },
    include: { _count: { select: { jobs: true, referrals: true } } },
  });
  if (!user) notFound();

  const recent = await prisma.job.findMany({
    where: { userId: user.id, status: { in: ['COMPLETED', 'UPLOADED'] } },
    orderBy: { createdAt: 'desc' },
    take: 10,
    select: { id: true, sourceUrl: true, assetId: true, createdAt: true },
  });

  return (
    <main className="relative mx-auto max-w-3xl px-6 py-12">
      <div className="gradient-bg" />

      <div className="glow-card rounded-3xl p-8 text-center">
        {user.avatar && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={user.avatar} alt={user.username} className="mx-auto h-24 w-24 rounded-full border-2 border-cyan-500/40" />
        )}
        <h1 className="mt-6 text-3xl font-bold">
          <span className="neon-text">@{user.username}</span>
        </h1>
        <p className="mt-2 text-sm text-neutral-500">
          NakaTune member since {new Date(user.createdAt).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
        </p>

        <div className="mt-8 grid grid-cols-2 gap-4">
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/30 p-4">
            <div className="text-3xl font-bold neon-text">{user._count.jobs}</div>
            <div className="mt-1 text-xs text-neutral-500">Converts</div>
          </div>
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/30 p-4">
            <div className="text-3xl font-bold neon-text">{user._count.referrals}</div>
            <div className="mt-1 text-xs text-neutral-500">Referrals</div>
          </div>
        </div>
      </div>

      {recent.length > 0 && (
        <div className="glow-card mt-6 rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-white">🎵 Recent converts</h2>
          <div className="mt-4 divide-y divide-neutral-800">
            {recent.map((j) => (
              <div key={j.id} className="flex items-center justify-between py-3 text-sm">
                <div className="truncate text-neutral-300">{j.sourceUrl?.slice(0, 60) || j.id.slice(0, 12)}</div>
                {j.assetId && (
                  <span className="shrink-0 rounded-full bg-neutral-800 px-2 py-0.5 text-xs text-neutral-400">
                    {j.assetId.slice(0, 8)}…
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8 text-center">
        <Link href="/id" className="inline-block rounded-full bg-gradient-to-r from-cyan-400 to-fuchsia-500 px-6 py-3 text-sm font-semibold text-black">
          Try NakaTune →
        </Link>
      </div>
    </main>
  );
}
