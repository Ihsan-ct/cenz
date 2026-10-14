import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { redirect } from 'next/navigation';

export default async function HistoryPage({ params: { locale } }: { params: { locale: string } }) {
  const session = await auth();
  if (!session?.user) redirect(`/${locale}/login`);
  const user = await prisma.user.findFirst({ where: { email: session.user.email || undefined } });
  const jobs = user ? await prisma.job.findMany({ where: { userId: user.id }, orderBy: { createdAt: 'desc' }, take: 50 }) : [];
  const isID = locale === 'id';

  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="text-3xl font-bold">{isID ? 'Riwayat Konversi' : 'History'}</h1>
      {jobs.length === 0 ? (
        <p className="mt-8 text-neutral-400">{isID ? 'Belum ada riwayat' : 'No history'}</p>
      ) : (
        <div className="mt-8 space-y-3">
          {jobs.map((j) => (
            <div key={j.id} className="flex items-center justify-between rounded-xl border border-neutral-800 bg-neutral-950 p-4">
              <div className="text-sm">
                <div className="font-medium">{j.sourceUrl || j.fileName || j.id}</div>
                <div className="text-xs text-neutral-500">{j.createdAt.toISOString()}</div>
              </div>
              <div className="text-sm">
                <span className="rounded-full bg-neutral-800 px-3 py-1 text-xs">{j.status}</span>
                {j.assetId && <span className="ml-3 text-xs text-neutral-400">Asset: {j.assetId}</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
