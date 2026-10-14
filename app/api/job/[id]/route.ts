import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
  const user = await prisma.user.findFirst({ where: { email: session.user.email || undefined } });
  if (!user) return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 });
  const job = await prisma.job.findFirst({ where: { id: params.id, userId: user.id } });
  if (!job) return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 });
  return NextResponse.json({ job });
}
