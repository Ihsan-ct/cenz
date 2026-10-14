import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { enqueueConvert } from '@/lib/queue';
import { checkRateLimit } from '@/lib/ratelimit';
import { parseSourceUrl } from '@/lib/sources';
import { NextResponse } from 'next/server';
import { z } from 'zod';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const schema = z.object({
  url: z.string().max(500),
  speed: z.number().min(0.5).max(3).default(1.0),
  amplify: z.number().min(-10).max(10).default(0),
});

const MAX_DURATION = { free: 300, paid: 600 };
const MAX_ACTIVE = 2;

export async function POST(req: Request) {
  const session = await auth();
  const uid = (session?.user as any)?.id as string | undefined;
  if (!uid) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: uid },
    include: { subscription: true },
  });
  if (!user) return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 });

  const isPaid = !!user.subscription?.active &&
    (!user.subscription.expiresAt || user.subscription.expiresAt > new Date());

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'INVALID_INPUT', details: parsed.error.flatten() }, { status: 400 });
  }
  const src = parseSourceUrl(parsed.data.url);
  if (!src) return NextResponse.json({ error: 'INVALID_URL' }, { status: 400 });

  const active = await prisma.job.count({
    where: { userId: user.id, status: { in: ['QUEUED', 'PROCESSING'] } },
  });
  if (active >= MAX_ACTIVE) return NextResponse.json({ error: 'TOO_MANY_ACTIVE' }, { status: 429 });

  const rl = await checkRateLimit(user.id, isPaid ? 999 : 2);
  if (!rl.ok) {
    return NextResponse.json(
      { error: 'RATE_LIMIT', remaining: rl.remaining, resetIn: rl.resetIn },
      { status: 429 }
    );
  }

  const maxDuration = isPaid ? MAX_DURATION.paid : MAX_DURATION.free;

  const job = await prisma.job.create({
    data: {
      userId: user.id,
      sourceUrl: src.url,
      sourceType: src.type,
      speed: parsed.data.speed,
      amplify: parsed.data.amplify,
      maxDuration,
      status: 'QUEUED',
    },
  });

  try {
    await enqueueConvert({
      jobId: job.id,
      userId: user.id,
      sourceUrl: src.url,
      speed: parsed.data.speed,
      amplify: parsed.data.amplify,
      maxDuration,
    });
  } catch (e) {
    console.error('[convert] enqueue failed:', e);
    await prisma.job.update({
      where: { id: job.id },
      data: { status: 'FAILED', errorMessage: 'Antrean tidak tersedia' },
    });
    return NextResponse.json({ error: 'QUEUE_UNAVAILABLE' }, { status: 503 });
  }

  return NextResponse.json({ jobId: job.id, status: job.status });
}
