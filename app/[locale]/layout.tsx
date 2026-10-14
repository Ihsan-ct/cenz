import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import Header from '@/components/header/Header';
import OnboardingModal from '@/components/onboarding/OnboardingModal';
import { ToastProvider } from '@/components/notifications/Toast';

const locales = ['id', 'en'];

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  if (!locales.includes(locale)) notFound();
  setRequestLocale(locale);
  const messages = await getMessages();
  return (
    <html lang={locale}>
      <body className="min-h-screen bg-neutral-950 text-neutral-50 antialiased">
        <NextIntlClientProvider messages={messages}>
          <ToastProvider>
          <div className="flex min-h-screen flex-col">
            <Header locale={locale} />
            {children}
            <script dangerouslySetInnerHTML={{__html:'if("serviceWorker" in navigator){window.addEventListener("load",()=>navigator.serviceWorker.register("/sw.js").catch(()=>{}))}'}} />
            <OnboardingModal locale={locale} />
          </div>
        </ToastProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
