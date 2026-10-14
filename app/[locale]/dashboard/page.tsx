import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { redirect } from 'next/navigation';
import ConvertForm from '@/components/ConvertForm';

export default async function Dashboard({ params: { locale } }: { params: { locale: string } }) {
  const session = await auth();
  const uid = (session?.user as any)?.id as string | undefined;
  if (!uid) redirect(`/${locale}/login`);

  const user = await prisma.user.findUnique({
    where: { id: uid },
    include: { subscription: true, robloxAccount: true, jobs: { take: 5, orderBy: { createdAt: 'desc' } } },
  });

  const isID = locale === 'id';
  const isPaid = !!user?.subscription?.active &&
    (!user?.subscription?.expiresAt || user.subscription.expiresAt > new Date());

  const initialJobs = (user?.jobs ?? []).map((j) => ({
    id: j.id,
    status: j.status as 'QUEUED' | 'PROCESSING' | 'READY' | 'FAILED',
    errorMessage: j.errorMessage,
    assetId: j.assetId,
    r2Key: j.r2Key,
    createdAt: j.createdAt.toISOString(),
    completedAt: j.completedAt ? j.completedAt.toISOString() : null,
  }));

  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="text-3xl font-bold">
        {isID ? 'Selamat datang' : 'Welcome'}, {user?.username || session?.user?.name}
      </h1>
      <div className="mt-8 grid gap-6 sm:grid-cols-3">
        <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-6">
          <div className="text-sm text-neutral-400">{isID ? 'Status Akses' : 'Subscription'}</div>
          <div className="mt-2 text-xl font-semibold">{user?.subscription?.plan || 'Free'}</div>
        </div>
        <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-6">
          <div className="text-sm text-neutral-400">{isID ? 'Akun Roblox' : 'Roblox Account'}</div>
          <div className="mt-2 text-xl font-semibold">{user?.robloxAccount?.verified ? user.robloxAccount.robloxUsername : (isID ? 'Belum terhubung' : 'Not linked')}</div>
        </div>
        <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-6">
          <div className="text-sm text-neutral-400">{isID ? 'Total Konversi' : 'Total Jobs'}</div>
          <div className="mt-2 text-xl font-semibold">{user?.jobs?.length || 0}</div>
        </div>
      </div>

      <ConvertForm locale={locale} isPaid={isPaid} initialJobs={initialJobs} />
    </main>
  );
}
