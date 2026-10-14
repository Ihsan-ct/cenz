import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
  const user = await prisma.user.findUnique({ where: { id: (session.user as { id?: string }).id ?? "" } });
  if (!user) return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 });
  const jobs = await prisma.job.findMany({ where: { userId: user.id }, orderBy: { createdAt: 'desc' }, take: 50 });
  return NextResponse.json({ jobs });
}
