import crypto from 'crypto';

const BASE = process.env.TRIPAY_MODE === 'production'
  ? 'https://tripay.co.id/api'
  : 'https://tripay.co.id/api-sandbox';

export const PLANS = {
  weekly:  { name: 'Paket 7 Hari',  price: 85000,  days: 7  },
  monthly: { name: 'Paket 30 Hari', price: 180000, days: 30 },
} as const;

export type PlanKey = keyof typeof PLANS;

export async function createTripayTransaction(params: {
  merchantRef: string;
  amount: number;
  plan: PlanKey;
  customerName: string;
  customerEmail: string;
}) {
  const signature = crypto
    .createHmac('sha256', process.env.TRIPAY_PRIVATE_KEY!)
    .update(`${process.env.TRIPAY_MERCHANT_CODE}${params.merchantRef}${params.amount}`)
    .digest('hex');

  const body = {
    method: 'QRIS',
    merchant_ref: params.merchantRef,
    amount: params.amount,
    customer_name: params.customerName,
    customer_email: params.customerEmail,
    order_items: [{ name: PLANS[params.plan].name, price: params.amount, quantity: 1 }],
    return_url: process.env.TRIPAY_RETURN_URL,
    signature,
  };

  const res = await fetch(`${BASE}/transaction/create`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.TRIPAY_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Tripay error: ${res.status} ${await res.text()}`);
  return res.json();
}

export function verifyTripayCallback(rawBody: string, signature: string) {
  const hmac = crypto
    .createHmac('sha256', process.env.TRIPAY_PRIVATE_KEY!)
    .update(rawBody)
    .digest('hex');
  return hmac === signature;
}
