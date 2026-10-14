import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { enqueueConvert } from '@/lib/queue';
import { checkRateLimit } from '@/lib/ratelimit';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const schema = z.object({
  url: z.string().url().optional(),
  fileName: z.string().optional(),
  r2Key: z.string().optional(),
  speed: z.number().min(0.5).max(3).default(1.0),
  amplify: z.number().min(-10).max(10).default(0),
  maxDuration: z.number().int().min(1).max(3600).default(600),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });

  const user = await prisma.user.findFirst({ where: { email: session.user.email || undefined }, include: { subscription: true, robloxAccount: true } });
  if (!user) return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 });

  const isPaid = user.subscription?.active && (!user.subscription.expiresAt || user.subscription.expiresAt > new Date());
  const rl = await checkRateLimit(user.id, isPaid ? 999 : 2);
  if (!rl.ok) return NextResponse.json({ error: 'RATE_LIMIT', remaining: rl.remaining, resetIn: rl.resetIn }, { status: 429 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'INVALID_INPUT', details: parsed.error.flatten() }, { status: 400 });
  if (!parsed.data.url && !parsed.data.r2Key) return NextResponse.json({ error: 'MISSING_SOURCE' }, { status: 400 });

  const job = await prisma.job.create({
    data: {
      userId: user.id,
      sourceUrl: parsed.data.url,
      sourceType: parsed.data.url ? (parsed.data.url.includes('youtube') ? 'youtube' : 'soundcloud') : 'upload',
      fileName: parsed.data.fileName,
      r2Key: parsed.data.r2Key,
      speed: parsed.data.speed,
      amplify: parsed.data.amplify,
      maxDuration: parsed.data.maxDuration,
      status: 'QUEUED',
    },
  });

  await enqueueConvert({
    jobId: job.id,
    userId: user.id,
    sourceUrl: parsed.data.url,
    r2Key: parsed.data.r2Key,
    speed: parsed.data.speed,
    amplify: parsed.data.amplify,
    maxDuration: parsed.data.maxDuration,
  });

  return NextResponse.json({ jobId: job.id, status: job.status });
}
