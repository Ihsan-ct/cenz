import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { redirect } from 'next/navigation';
import RobloxForm from '@/components/convert/RobloxForm';

export default async function RobloxPage({ params: { locale } }: { params: { locale: string } }) {
  const session = await auth();
  if (!session?.user) redirect(`/${locale}/login`);
  const user = await prisma.user.findUnique({ where: { id: (session.user as { id?: string }).id ?? "" }, include: { robloxAccount: true } });
  const isID = locale === 'id';
  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-3xl font-bold">{isID ? 'Akun Roblox' : 'Roblox Account'}</h1>
      <p className="mt-4 text-sm text-neutral-400">
        {isID
          ? 'Buat API key di Roblox Creator Hub dengan permission Assets:Read + Write.'
          : 'Create an API key in Roblox Creator Hub with Assets:Read + Write permission.'}
      </p>
      <RobloxForm existing={user?.robloxAccount ? { userId: user.robloxAccount.robloxUserId, username: user.robloxAccount.robloxUsername } : null} locale={locale} />
    </main>
  );
}
