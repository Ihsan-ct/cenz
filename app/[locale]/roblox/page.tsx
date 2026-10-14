import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { redirect } from 'next/navigation';
import RobloxForm from '@/components/convert/RobloxForm';

export default async function RobloxPage({ params: { locale } }: { params: { locale: string } }) {
  const session = await auth();
  if (!session?.user) redirect(`/${locale}/login`);
  const uid = (session.user as any)?.id;
  const user = uid ? await prisma.user.findUnique({
    where: { id: uid },
    include: { robloxAccount: true },
  }) : null;

  const isID = locale === 'id';
  const acc = user?.robloxAccount;

  return (
    <main className="relative mx-auto max-w-3xl px-6 py-12">
      <div className="gradient-bg" />

      <div className="text-center">
        <h1 className="text-3xl font-bold sm:text-4xl">
          <span className="neon-text">{isID ? 'Akun Roblox' : 'Roblox Account'}</span>
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sm text-neutral-400">
          {isID
            ? 'Hubungkan akun Roblox Creator kamu biar bisa upload audio langsung ke library map.'
            : 'Link your Roblox Creator account to upload audio straight to your map library.'}
        </p>
      </div>

      {/* status card */}
      <div className={`glow-card mt-10 rounded-2xl p-6 ${acc?.verified ? 'border-emerald-500/30' : 'border-yellow-500/30'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-full ${acc?.verified ? 'bg-emerald-500/20 text-emerald-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
              {acc?.verified ? '✓' : '!'}
            </div>
            <div>
              <div className="text-sm font-medium text-white">
                {acc?.verified
                  ? (isID ? 'Terhubung' : 'Connected')
                  : (isID ? 'Belum terhubung' : 'Not connected')}
              </div>
              {acc?.verified && acc.robloxUsername && (
                <div className="mt-0.5 text-xs text-neutral-500">
                  @{acc.robloxUsername} · ID {acc.robloxUserId}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <RobloxForm
        existing={acc ? { userId: acc.robloxUserId, username: acc.robloxUsername } : null}
        locale={locale}
      />

      {/* tutorial */}
      <div className="glow-card mt-8 rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-white">
          📚 {isID ? 'Cara bikin API Key' : 'How to create API Key'}
        </h2>

        <ol className="mt-6 space-y-4 text-sm">
          {[
            {
              title: isID ? 'Buka Roblox Creator Hub' : 'Open Roblox Creator Hub',
              desc: isID
                ? 'Login ke create.roblox.com, buka Credentials → API Keys.'
                : 'Login to create.roblox.com, open Credentials → API Keys.',
              link: 'https://create.roblox.com/dashboard/credentials',
              linkLabel: 'create.roblox.com',
            },
            {
              title: isID ? 'Bikin API Key baru' : 'Create a new API Key',
              desc: isID
                ? 'Klik "Create API Key". Kasih nama "NakaTune" biar gampang di-track.'
                : 'Click "Create API Key". Name it "NakaTune" for easy tracking.',
            },
            {
              title: isID ? 'Atur permission' : 'Set permissions',
              desc: isID
                ? 'Di "Access Permissions", pilih "Assets", aktifkan Read + Write. Wajib dua-duanya.'
                : 'In "Access Permissions", choose "Assets", enable Read + Write. Both required.',
            },
            {
              title: isID ? 'Save & Generate' : 'Save & Generate',
              desc: isID
                ? 'Klik "Save & Generate Key". API key cuma keliatan SEKALI — langsung copy!'
                : 'Click "Save & Generate Key". The key shows ONCE — copy it now!',
            },
            {
              title: isID ? 'Tempel di form atas' : 'Paste in the form above',
              desc: isID
                ? 'Isi Roblox User ID + API Key di form atas. Klik Simpan.'
                : 'Fill in Roblox User ID + API Key in the form above. Click Save.',
            },
          ].map((s, i) => (
            <li key={i} className="flex gap-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-fuchsia-500 text-sm font-bold text-black">
                {i + 1}
              </div>
              <div>
                <div className="font-medium text-white">{s.title}</div>
                <div className="mt-1 text-neutral-400">{s.desc}</div>
                {s.link && (
                  <a
                    href={s.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 inline-block text-xs text-cyan-400 hover:underline"
                  >
                    ↗ {s.linkLabel}
                  </a>
                )}
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-6 rounded-xl border border-cyan-500/30 bg-cyan-500/5 p-4 text-xs text-cyan-300">
          🔒 {isID
            ? 'API key kamu dienkripsi AES-256-GCM. Kami tidak pernah membagikan data ini. Bisa dicabut kapan aja dari Roblox Creator Hub.'
            : 'Your API key is encrypted with AES-256-GCM. Never shared. Revocable anytime from Roblox Creator Hub.'}
        </div>
      </div>
    </main>
  );
}
