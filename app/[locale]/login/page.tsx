import { signIn } from '@/lib/auth';
import Link from 'next/link';

export default function LoginPage({ params: { locale } }: { params: { locale: string } }) {
  const isID = locale === 'id';

  return (
    <main className="relative mx-auto flex min-h-[80vh] max-w-md items-center justify-center px-6">
      <div className="gradient-bg" />

      <div className="w-full">
        <div className="text-center">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/5 px-4 py-1.5 text-xs text-cyan-300">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-400" />
            </span>
            {isID ? 'Login aman via Discord' : 'Secure Discord login'}
          </div>

          <h1 className="mt-6 text-3xl font-bold sm:text-4xl">
            <span className="neon-text">{isID ? 'Masuk ke NakaTune' : 'Sign in to NakaTune'}</span>
          </h1>

          <p className="mx-auto mt-4 text-sm text-neutral-400">
            {isID
              ? 'Satu klik. Gak perlu daftar email atau bikin password baru.'
              : 'One click. No email signup, no new password.'}
          </p>
        </div>

        <form
          action={async () => {
            'use server';
            await signIn('discord', { redirectTo: `/${locale}/dashboard` });
          }}
          className="mt-10"
        >
          <button
            type="submit"
            className="pulse-ring group flex w-full items-center justify-center gap-3 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 py-4 text-sm font-semibold text-white shadow-lg transition-transform hover:scale-[1.02]"
          >
            <svg className="h-5 w-5" viewBox="0 0 71 55" fill="currentColor">
              <path d="M60.1 4.9A58.5 58.5 0 0045.4.2a40 40 0 00-1.9 3.8 54.2 54.2 0 00-16.4 0A40 40 0 0025.2.2 58.4 58.4 0 0010.5 5C1.5 18.3-.9 31.2.3 44a59 59 0 0017.9 9 43.7 43.7 0 003.8-6.2 38 38 0 01-6-2.9c.5-.4 1-.8 1.5-1.2a42 42 0 0036.6 0l1.5 1.2a38 38 0 01-6 2.9 43.5 43.5 0 003.8 6.2 58.8 58.8 0 0017.9-9C72.3 29.2 68.4 16.4 60.1 4.9zM23.7 36.2c-3.5 0-6.4-3.2-6.4-7.2s2.8-7.2 6.4-7.2 6.5 3.3 6.4 7.2c0 4-2.8 7.2-6.4 7.2zm23.6 0c-3.5 0-6.4-3.2-6.4-7.2s2.8-7.2 6.4-7.2 6.5 3.3 6.4 7.2c0 4-2.8 7.2-6.4 7.2z" />
            </svg>
            {isID ? 'Masuk dengan Discord' : 'Sign in with Discord'}
            <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
        </form>

        <div className="mt-8 rounded-2xl border border-neutral-800 bg-neutral-900/30 p-4">
          <div className="text-xs uppercase tracking-wider text-neutral-500">
            {isID ? 'Kenapa Discord?' : 'Why Discord?'}
          </div>
          <ul className="mt-3 space-y-2 text-xs text-neutral-400">
            <li className="flex items-start gap-2">
              <span className="text-cyan-400">✓</span>
              {isID ? 'Gak perlu bikin akun baru — pake akun Discord kamu' : 'No new account — use your Discord'}
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cyan-400">✓</span>
              {isID ? 'Aman: password Discord gak pernah dilihat kami' : 'Secure: we never see your Discord password'}
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cyan-400">✓</span>
              {isID ? 'Support via Discord server langsung' : 'Direct support via Discord server'}
            </li>
          </ul>
        </div>

        <p className="mt-6 text-center text-xs text-neutral-600">
          {isID ? 'Dengan masuk, kamu setuju ' : 'By signing in, you agree to our '}
          <Link href={`/${locale}/terms`} className="text-cyan-400 hover:underline">
            {isID ? 'Syarat' : 'Terms'}
          </Link>
          {' & '}
          <Link href={`/${locale}/privacy`} className="text-cyan-400 hover:underline">
            {isID ? 'Privasi' : 'Privacy'}
          </Link>
        </p>
      </div>
    </main>
  );
}
