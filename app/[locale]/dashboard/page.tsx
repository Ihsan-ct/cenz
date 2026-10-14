import Link from 'next/link';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { redirect } from 'next/navigation';

const STATUS_COLOR: Record<string, string> = {
  QUEUED: 'text-yellow-400 bg-yellow-500/10',
  DOWNLOADING: 'text-blue-400 bg-blue-500/10',
  PROCESSING: 'text-purple-400 bg-purple-500/10',
  UPLOADING: 'text-cyan-400 bg-cyan-500/10',
  UPLOADED: 'text-emerald-400 bg-emerald-500/10',
  COMPLETED: 'text-emerald-400 bg-emerald-500/10',
  FAILED: 'text-red-400 bg-red-500/10',
  UPLOAD_FAILED: 'text-red-400 bg-red-500/10',
};

const STATUS_LABEL_ID: Record<string, string> = {
  QUEUED: 'Antri',
  DOWNLOADING: 'Download',
  PROCESSING: 'Konversi',
  UPLOADING: 'Upload',
  UPLOADED: 'Terkirim',
  COMPLETED: 'Selesai',
  FAILED: 'Gagal',
  UPLOAD_FAILED: 'Gagal Upload',
};

export default async function Dashboard({ params: { locale } }: { params: { locale: string } }) {
  const session = await auth();
  if (!session?.user) redirect(`/${locale}/login`);

  const uid = (session.user as any)?.id as string | undefined;
  if (!uid) redirect(`/${locale}/login`);

  const isID = locale === 'id';

  const [user, jobsAll, jobsWeek, recent] = await Promise.all([
    prisma.user.findUnique({
      where: { id: uid },
      include: { subscription: true, robloxAccount: true },
    }),
    prisma.job.count({ where: { userId: uid } }),
    prisma.job.count({
      where: { userId: uid, createdAt: { gte: new Date(Date.now() - 7 * 86400000) } },
    }),
    prisma.job.findMany({
      where: { userId: uid },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
  ]);

  const uploaded = await prisma.job.count({
    where: { userId: uid, status: { in: ['COMPLETED', 'UPLOADED'] } },
  });

  const isPro = user?.subscription?.active && (!user.subscription.expiresAt || user.subscription.expiresAt > new Date());
  const subDays = user?.subscription?.expiresAt
    ? Math.max(0, Math.ceil((user.subscription.expiresAt.getTime() - Date.now()) / 86400000))
    : 0;

  // chart 7 hari
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(Date.now() - (6 - i) * 86400000);
    return { date: d, key: d.toISOString().slice(0, 10) };
  });
  const weekBuckets = await Promise.all(
    days.map(async (d) => {
      const start = new Date(d.date); start.setHours(0, 0, 0, 0);
      const end = new Date(d.date); end.setHours(23, 59, 59, 999);
      const count = await prisma.job.count({
        where: { userId: uid, createdAt: { gte: start, lte: end } },
      });
      return { ...d, count };
    })
  );
  const maxCount = Math.max(1, ...weekBuckets.map((b) => b.count));

  const greeting = isID ? `Selamat datang` : `Welcome`;
  const name = user?.username || session.user.name || 'creator';

  return (
    <main className="relative mx-auto max-w-6xl px-6 py-12">
      <div className="gradient-bg" />

      {/* HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {user?.avatar && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.avatar}
              alt={name}
              className="h-14 w-14 rounded-full border-2 border-cyan-500/30"
            />
          )}
          <div>
            <div className="text-xs uppercase tracking-wider text-neutral-500">{greeting}</div>
            <h1 className="text-2xl font-bold sm:text-3xl">
              <span className="neon-text">{name}</span>
            </h1>
          </div>
        </div>
        <Link
          href={`/${locale}/convert`}
          className="pulse-ring inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-400 to-fuchsia-500 px-6 py-3 text-sm font-semibold text-black transition-transform hover:scale-105"
        >
          ⚡ {isID ? 'Konversi Baru' : 'New Convert'}
        </Link>
      </div>

      {/* STATS GRID */}
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: isID ? 'Total Convert' : 'Total Convert',
            value: jobsAll,
            accent: 'from-cyan-400 to-blue-500',
          },
          {
            label: isID ? 'Terkirim ke Roblox' : 'Sent to Roblox',
            value: uploaded,
            accent: 'from-emerald-400 to-teal-500',
          },
          {
            label: isID ? '7 Hari Terakhir' : 'Last 7 days',
            value: jobsWeek,
            accent: 'from-fuchsia-400 to-purple-500',
          },
          {
            label: isID ? 'Status Akses' : 'Access Status',
            value: isPro ? `Pro · ${subDays}d` : (isID ? 'Free' : 'Free'),
            accent: isPro ? 'from-yellow-400 to-orange-500' : 'from-neutral-500 to-neutral-700',
            isText: true,
          },
        ].map((s, i) => (
          <div key={i} className="glow-card rounded-2xl p-5">
            <div className="text-xs uppercase tracking-wider text-neutral-500">{s.label}</div>
            <div
              className={`mt-2 bg-gradient-to-r ${s.accent} bg-clip-text text-3xl font-bold text-transparent`}
            >
              {s.isText ? s.value : s.value.toLocaleString()}
            </div>
          </div>
        ))}
      </div>

      {/* CHART */}
      <div className="glow-card mt-6 rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">{isID ? 'Aktivitas 7 Hari' : '7-Day Activity'}</h2>
            <p className="text-xs text-neutral-500">{isID ? 'Job per hari' : 'Jobs per day'}</p>
          </div>
          <div className="text-sm text-neutral-500">
            {jobsWeek} {isID ? 'total' : 'total'}
          </div>
        </div>
        <div className="mt-6 flex h-32 items-end gap-2">
          {weekBuckets.map((b, i) => {
            const h = (b.count / maxCount) * 100;
            const dayName = b.date.toLocaleDateString(isID ? 'id-ID' : 'en-US', { weekday: 'short' });
            return (
              <div key={i} className="flex flex-1 flex-col items-center gap-2">
                <div className="flex w-full flex-1 items-end">
                  <div
                    className="w-full rounded-t-md bg-gradient-to-t from-cyan-500/80 to-fuchsia-500/80 transition-all hover:from-cyan-400 hover:to-fuchsia-400"
                    style={{ height: `${Math.max(4, h)}%` }}
                    title={`${b.count} jobs`}
                  />
                </div>
                <span className="text-xs text-neutral-500">{dayName}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ROBLOX + SUBSCRIPTION */}
      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <div className="glow-card rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">{isID ? 'Akun Roblox' : 'Roblox Account'}</h2>
            <span className={`rounded-full px-2 py-0.5 text-xs ${user?.robloxAccount?.verified ? 'bg-emerald-500/10 text-emerald-400' : 'bg-neutral-700/30 text-neutral-500'}`}>
              {user?.robloxAccount?.verified ? (isID ? 'Terhubung' : 'Linked') : (isID ? 'Belum' : 'Not linked')}
            </span>
          </div>
          {user?.robloxAccount?.verified ? (
            <div className="mt-4">
              <div className="text-2xl font-bold text-white">{user.robloxAccount.robloxUsername || user.robloxAccount.robloxUserId}</div>
              <div className="mt-1 text-xs text-neutral-500">ID: {user.robloxAccount.robloxUserId}</div>
            </div>
          ) : (
            <Link href={`/${locale}/roblox`} className="mt-4 inline-block text-sm text-cyan-400 hover:underline">
              → {isID ? 'Hubungkan sekarang' : 'Link now'}
            </Link>
          )}
        </div>

        <div className="glow-card rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">{isID ? 'Paket' : 'Plan'}</h2>
            <span className={`rounded-full px-2 py-0.5 text-xs ${isPro ? 'bg-yellow-500/10 text-yellow-400' : 'bg-neutral-700/30 text-neutral-500'}`}>
              {isPro ? 'PRO' : 'FREE'}
            </span>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold text-white">
              {user?.subscription?.plan === 'monthly' ? (isID ? '30 Hari' : '30 Days') : user?.subscription?.plan === 'weekly' ? (isID ? '7 Hari' : '7 Days') : (isID ? 'Gratis' : 'Free')}
            </div>
            {isPro && subDays > 0 && (
              <div className="mt-1 text-xs text-neutral-500">
                {isID ? `Berakhir dalam ${subDays} hari` : `${subDays} days remaining`}
              </div>
            )}
          </div>
          {!isPro && (
            <Link href={`/${locale}/subscription`} className="mt-4 inline-block text-sm text-cyan-400 hover:underline">
              → {isID ? 'Upgrade sekarang' : 'Upgrade now'}
            </Link>
          )}
        </div>
      </div>

      {/* RECENT JOBS */}
      <div className="glow-card mt-6 rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">{isID ? 'Aktivitas Terbaru' : 'Recent Activity'}</h2>
          <Link href={`/${locale}/history`} className="text-sm text-cyan-400 hover:underline">
            {isID ? 'Lihat semua' : 'View all'} →
          </Link>
        </div>
        {recent.length === 0 ? (
          <div className="mt-6 text-center text-sm text-neutral-500">
            {isID ? 'Belum ada konversi. Mulai sekarang!' : 'No conversions yet. Start now!'}
          </div>
        ) : (
          <div className="mt-4 divide-y divide-neutral-800">
            {recent.map((j) => (
              <div key={j.id} className="flex items-center justify-between gap-4 py-3">
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium text-neutral-200">
                    {j.sourceUrl || j.fileName || j.id.slice(0, 12)}
                  </div>
                  <div className="mt-0.5 text-xs text-neutral-500">
                    {new Date(j.createdAt).toLocaleString(isID ? 'id-ID' : 'en-US')}
                  </div>
                </div>
                <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${STATUS_COLOR[j.status] || 'text-neutral-400 bg-neutral-800'}`}>
                  {isID ? (STATUS_LABEL_ID[j.status] || j.status) : j.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
