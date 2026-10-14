import { PLANS } from '@/lib/tripay';
import { formatIDR } from '@/lib/utils';

export default function PricingCards({ locale = 'id' }: { locale?: string }) {
  return (
    <section className="mx-auto max-w-5xl px-6 py-24">
      <h2 className="text-center text-3xl font-bold neon-text">
        {locale === 'id' ? 'Pilih Paket' : 'Choose a Plan'}
      </h2>
      <div className="mt-16 grid gap-8 sm:grid-cols-2 max-w-3xl mx-auto">
        <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-8">
          <h3 className="text-lg font-semibold">{locale === 'id' ? '7 Hari' : '7 Days'}</h3>
          <div className="mt-4 text-3xl font-bold">{formatIDR(PLANS.weekly.price)}</div>
          <ul className="mt-8 space-y-3 text-sm text-neutral-400">
            <li>✓ Unlimited convert</li>
            <li>✓ Auto upload to Roblox</li>
            <li>✓ Speed & amplify control</li>
          </ul>
          <form action="/api/payment/create" method="POST" className="mt-8">
            <input type="hidden" name="plan" value="weekly" />
            <button className="w-full rounded-full border border-cyan-500/30 py-2 hover:bg-cyan-500/10">
              {locale === 'id' ? 'Beli Sekarang' : 'Buy Now'}
            </button>
          </form>
        </div>
        <div className="relative rounded-2xl border-2 border-cyan-500/50 bg-neutral-950 p-8">
          <span className="absolute right-4 top-4 rounded-full bg-gradient-to-r from-cyan-400 to-fuchsia-500 px-3 py-1 text-xs text-white">
            {locale === 'id' ? 'Populer' : 'Popular'}
          </span>
          <h3 className="text-lg font-semibold">{locale === 'id' ? '30 Hari' : '30 Days'}</h3>
          <div className="mt-4 text-3xl font-bold">{formatIDR(PLANS.monthly.price)}</div>
          <ul className="mt-8 space-y-3 text-sm text-neutral-400">
            <li>✓ Everything in weekly</li>
            <li>✓ Batch 5 files</li>
            <li>✓ Priority support</li>
          </ul>
          <form action="/api/payment/create" method="POST" className="mt-8">
            <input type="hidden" name="plan" value="monthly" />
            <button className="w-full rounded-full bg-cyan-500 py-2 text-black hover:bg-cyan-400">
              {locale === 'id' ? 'Beli Sekarang' : 'Buy Now'}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
