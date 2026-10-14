import { prisma } from '@/lib/db';
import { verifyTripayCallback, PLANS, type PlanKey } from '@/lib/tripay';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const raw = await req.text();
  const sig = req.headers.get('x-callback-signature') || '';
  if (!verifyTripayCallback(raw, sig)) {
    return NextResponse.json({ error: 'INVALID_SIGNATURE' }, { status: 401 });
  }
  const data = JSON.parse(raw);
  const ref = data.reference;
  const status = data.status;

  const payment = await prisma.payment.findUnique({ where: { reference: ref } });
  if (!payment) return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 });

  if (status === 'PAID' && payment.status !== 'PAID') {
    const plan = payment.plan as PlanKey;
    const days = PLANS[plan].days;
    const expiresAt = new Date(Date.now() + days * 86400000);

    await prisma.payment.update({ where: { id: payment.id }, data: { status: 'PAID', paidAt: new Date() } });
    await prisma.subscription.upsert({
      where: { userId: payment.userId },
      create: { userId: payment.userId, plan, active: true, expiresAt },
      update: { plan, active: true, startedAt: new Date(), expiresAt },
    });
  }
  return NextResponse.json({ ok: true });
}
