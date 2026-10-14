import ConvertForm from '@/components/convert/ConvertForm';
export default function ConvertPage({ params: { locale } }: { params: { locale: string } }) {
  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="mb-8 text-3xl font-bold">{locale === 'id' ? 'Konversi Audio' : 'Convert Audio'}</h1>
      <ConvertForm locale={locale} />
    </main>
  );
}
