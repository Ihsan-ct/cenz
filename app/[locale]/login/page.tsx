import LoginButton from '@/components/LoginButton';

export default function LoginPage({ params: { locale } }: { params: { locale: string } }) {
  const isID = locale === 'id';
  return (
    <main className="mx-auto max-w-md px-6 py-24 text-center">
      <h1 className="text-3xl font-bold">{isID ? 'Masuk' : 'Sign in'}</h1>
      <p className="mt-4 text-sm text-neutral-400">
        {isID ? 'Gunakan akun Discord kamu. Kamu harus join server Discord kami.' : 'Use your Discord account. You must join our Discord server.'}
      </p>
      <div className="mt-8">
        <LoginButton locale={locale} label={isID ? 'Masuk dengan Discord' : 'Sign in with Discord'} />
      </div>
    </main>
  );
}
