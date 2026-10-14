import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { redirect } from 'next/navigation';

export default async function ReferralPage({ params: { locale } }: { params: { locale: string } }) {
  const session = await auth();
  if (!session?.user) redirect(`/${locale}/login`);

  const uid = (session.user as any)?.id;
  const user = uid ? await prisma.user.findUnique({ where: { id: uid } }) : null;
  if (!user) redirect(`/${locale}/login`);

  const isID = locale === 'id';
  const code = user.referralCode || user.id.slice(0, 8).toUpperCase();
  const refs = await prisma.referral.findMany({ where: { ownerId: user.id } });
  const accepted = refs.filter((r) => r.usedBy).length;
  const url = `${process.env.NEXT_PUBLIC_APP_URL || ''}/${locale}/login?ref=${code}`;

  return (
    <main className="relative mx-auto max-w-3xl px-6 py-12">
      <div className="gradient-bg" />

      <h1 className="text-3xl font-bold text-center">
        <span className="neon-text">{isID ? 'Ajak Teman, Dapet Gratis' : 'Invite Friends, Get Free'}</span>
      </h1>
      <p className="mx-auto mt-3 max-w-lg text-center text-sm text-neutral-400">
        {isID
          ? 'Bagikan kode referral. Temanmu daftar pakai kode kamu → dua-duanya dapet 3 hari Pro gratis.'
          : 'Share your referral code. Friend signs up with it → both get 3 days Pro free.'}
      </p>

      <div className="glow-card mt-10 rounded-3xl p-8 text-center">
        <div className="text-xs uppercase tracking-wider text-neutral-500">
          {isID ? 'Kode Referral Kamu' : 'Your Referral Code'}
        </div>
        <div className="mt-4 font-mono text-4xl font-bold neon-text tracking-widest">
          {code}
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <input
            readOnly
            value={url}
            className="rounded-full border border-neutral-800 bg-neutral-950 px-4 py-2.5 text-center text-xs text-neutral-400"
          />
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/30 p-4">
            <div className="text-3xl font-bold neon-text">{refs.length}</div>
            <div className="mt-1 text-xs text-neutral-500">
              {isID ? 'Total diklik' : 'Total clicks'}
            </div>
          </div>
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/30 p-4">
            <div className="text-3xl font-bold neon-text">{accepted}</div>
            <div className="mt-1 text-xs text-neutral-500">
              {isID ? 'Berhasil daftar' : 'Successful signups'}
            </div>
          </div>
        </div>
      </div>

      <div className="glow-card mt-8 rounded-2xl p-6">
        <h2 className="text-sm font-semibold text-white">
          {isID ? '🎁 Cara dapet bonus' : '🎁 How to earn'}
        </h2>
        <ul className="mt-4 space-y-3 text-sm text-neutral-400">
          <li className="flex gap-3">
            <span className="text-cyan-400">1.</span>
            {isID ? 'Share kode / link kamu ke teman' : 'Share your code / link with friends'}
          </li>
          <li className="flex gap-3">
            <span className="text-cyan-400">2.</span>
            {isID ? 'Teman daftar NakaTune pake kode kamu' : 'Friend signs up with your code'}
          </li>
          <li className="flex gap-3">
            <span className="text-cyan-400">3.</span>
            {isID ? 'Kamu + teman dapet 3 hari Pro gratis' : 'You + friend get 3 days Pro free'}
          </li>
        </ul>
      </div>
    </main>
  );
}
