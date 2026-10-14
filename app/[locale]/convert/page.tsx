import ConvertForm from '@/components/convert/ConvertForm';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function ConvertPage({ params: { locale } }: { params: { locale: string } }) {
  const session = await auth();
  if (!session?.user) redirect(`/${locale}/login`);
  const isID = locale === 'id';

  return (
    <main className="relative mx-auto max-w-4xl px-6 py-16">
      <div className="gradient-bg" />
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          <span className="neon-text">{isID ? 'Konversi Audio' : 'Convert Audio'}</span>
        </h1>
        <p className="mx-auto mt-4 max-w-lg text-neutral-400">
          {isID
            ? 'Paste link, pilih preset, upload ke Roblox. Selesai dalam ~30 detik.'
            : 'Paste a link, pick a preset, upload to Roblox. Done in ~30s.'}
        </p>
      </div>
      <ConvertForm locale={locale} />
    </main>
  );
}
