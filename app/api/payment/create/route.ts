import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { createTripayTransaction, PLANS, type PlanKey } from '@/lib/tripay';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
  const user = await prisma.user.findUnique({ where: { id: (session.user as { id?: string }).id ?? "" } });
  if (!user) return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 });

  const form = await req.formData().catch(() => null);
  const plan = (form?.get('plan') as PlanKey) || 'weekly';
  if (!PLANS[plan]) return NextResponse.json({ error: 'INVALID_PLAN' }, { status: 400 });

  const merchantRef = `NakaTune-${user.id.slice(0, 8)}-${Date.now()}`;
  const tripay = await createTripayTransaction({
    merchantRef,
    amount: PLANS[plan].price,
    plan,
    customerName: user.username,
    customerEmail: user.email || 'noreply@example.com',
  });

  await prisma.payment.create({
    data: {
      userId: user.id,
      provider: 'tripay',
      reference: tripay.data.reference,
      merchantRef,
      amount: PLANS[plan].price,
      plan,
      status: 'PENDING',
    },
  });

  return NextResponse.redirect(tripay.data.checkout_url, 303);
}
