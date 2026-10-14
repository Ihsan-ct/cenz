import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import Header from '@/components/header/Header';

const locales = ['id', 'en'];

export default async function LocaleLayout({
  children,
  params: { locale },
}: { children: React.ReactNode; params: { locale: string } }) {
  if (!locales.includes(locale)) notFound();
  const messages = await getMessages();
  return (
    <NextIntlClientProvider messages={messages}>
      <div className="flex min-h-screen flex-col">
        <Header />
        {children}
      </div>
    </NextIntlClientProvider>
  );
}
