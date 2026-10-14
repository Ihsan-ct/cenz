'use client';
import { signIn } from 'next-auth/react';

export default function LoginButton({ locale, label }: { locale: string; label: string }) {
  return (
    <button
      onClick={() => signIn('discord', { callbackUrl: `/${locale}/dashboard` })}
      className="w-full rounded-full bg-cyan-500 py-3 font-medium text-black hover:bg-cyan-400"
    >
      {label}
    </button>
  );
}
