'use client';
import { signIn, signOut } from 'next-auth/react';

export function SignInButton({ locale, label }: { locale: string; label: string }) {
  return (
    <button
      onClick={() => signIn('discord', { callbackUrl: `/${locale}/dashboard` })}
      className="rounded-full bg-cyan-500 px-5 py-1.5 text-xs font-medium text-black hover:bg-cyan-400"
    >
      {label}
    </button>
  );
}

export function SignOutButton({ locale, label }: { locale: string; label: string }) {
  return (
    <button
      onClick={() => signOut({ callbackUrl: `/${locale}` })}
      className="rounded-full border border-cyan-500/30 px-4 py-1.5 text-xs hover:bg-cyan-500/10"
    >
      {label}
    </button>
  );
}
