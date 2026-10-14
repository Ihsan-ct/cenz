import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { redirect } from 'next/navigation';

export default async function Dashboard({ params: { locale } }: { params: { locale: string } }) {
  const session = await auth();
  if (!session?.user) redirect(`/${locale}/login`);
  const user = await prisma.user.findFirst({
    where: { email: session.user.email || undefined },
    include: { subscription: true, robloxAccount: true, jobs: { take: 5, orderBy: { createdAt: 'desc' } } },
  });
  const isID = locale === 'id';

  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="text-3xl font-bold">
        {isID ? 'Selamat datang' : 'Welcome'}, {user?.username || session.user.name}
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
    </main>
  );
}
