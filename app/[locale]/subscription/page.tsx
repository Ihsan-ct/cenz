import PricingCards from '@/components/pricing/PricingCards';
export default function SubscriptionPage({ params: { locale } }: { params: { locale: string } }) {
  return <PricingCards locale={locale} />;
}
