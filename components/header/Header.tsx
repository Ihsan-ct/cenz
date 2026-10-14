import Link from 'next/link';
import { auth } from '@/lib/auth';
import { SignInButton, SignOutButton } from './AuthButtons';

export default async function Header({ locale = 'id' }: { locale?: string }) {
  const session = await auth();
  const isId = locale === 'id';
  return (
    <header className="sticky top-0 z-50 w-full border-b border-cyan-500/10 bg-black/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href={`/${locale}`} className="flex items-center gap-3">
          <span className="text-base font-bold uppercase tracking-wider neon-text">CENZ</span>
        </Link>
        <nav className="flex items-center gap-6 text-sm">
          {session?.user ? (
            <>
              <Link href={`/${locale}/dashboard`} className="hover:text-cyan-400">Dashboard</Link>
              <Link href={`/${locale}/convert`} className="hover:text-cyan-400">Convert</Link>
              <Link href={`/${locale}/history`} className="hover:text-cyan-400">History</Link>
              <Link href={`/${locale}/roblox`} className="hover:text-cyan-400">Roblox</Link>
              <SignOutButton locale={locale} label={isId ? 'Keluar' : 'Logout'} />
            </>
          ) : (
            <SignInButton locale={locale} label={isId ? 'Masuk dengan Discord' : 'Sign in with Discord'} />
          )}
        </nav>
      </div>
    </header>
  );
}
