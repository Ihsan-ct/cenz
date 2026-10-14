import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
  const user = await prisma.user.findFirst({ where: { email: session.user.email || undefined }, include: { subscription: true } });
  if (!user) return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 });
  return NextResponse.json({ subscription: user.subscription });
}
