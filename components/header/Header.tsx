import Link from 'next/link';
import { auth, signIn, signOut } from '@/lib/auth';

export default async function Header() {
  const session = await auth();
  return (
    <header className="sticky top-0 z-50 w-full border-b border-cyan-500/10 bg-black/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/id" className="flex items-center gap-3">
          <span className="text-base font-bold uppercase tracking-wider neon-text">CENZ</span>
        </Link>
        <nav className="flex items-center gap-6 text-sm">
          {session?.user ? (
            <>
              <Link href="/id/dashboard" className="hover:text-cyan-400">Dashboard</Link>
              <Link href="/id/convert" className="hover:text-cyan-400">Convert</Link>
              <Link href="/id/history" className="hover:text-cyan-400">History</Link>
              <Link href="/id/roblox" className="hover:text-cyan-400">Roblox</Link>
              <form action={async () => { 'use server'; await signOut({ redirectTo: '/id' }); }}>
                <button className="rounded-full border border-cyan-500/30 px-4 py-1.5 text-xs hover:bg-cyan-500/10">Logout</button>
              </form>
            </>
          ) : (
            <form action={async () => { 'use server'; await signIn('discord', { redirectTo: '/id/dashboard' }); }}>
              <button className="rounded-full bg-cyan-500 px-5 py-1.5 text-xs font-medium text-black hover:bg-cyan-400">Sign in with Discord</button>
            </form>
          )}
        </nav>
      </div>
    </header>
  );
}
