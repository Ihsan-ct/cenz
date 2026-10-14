import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const schema = z.object({ code: z.string().min(1).max(32) });

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ valid: false, error: 'INVALID' }, { status: 400 });

  const code = parsed.data.code.trim().toUpperCase();
  const coupon = await prisma.coupon.findUnique({ where: { code } });
  if (!coupon || !coupon.active) return NextResponse.json({ valid: false, error: 'NOT_FOUND' });
  if (coupon.expiresAt && coupon.expiresAt < new Date()) return NextResponse.json({ valid: false, error: 'EXPIRED' });
  if (coupon.usedCount >= coupon.maxUses) return NextResponse.json({ valid: false, error: 'USED_UP' });

  return NextResponse.json({ valid: true, discountPct: coupon.discountPct });
}
