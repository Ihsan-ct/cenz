import { prisma } from './db';

export async function checkRateLimit(userId: string, limit = 2): Promise<{ ok: boolean; remaining: number; resetIn: number }> {
  const now = new Date();
  const window = `${now.toISOString().slice(0, 13)}`; // YYYY-MM-DDTHH
  const rec = await prisma.rateLimit.upsert({
    where: { userId_window: { userId, window } },
    create: { userId, window, count: 1 },
    update: { count: { increment: 1 } },
  });
  const remaining = Math.max(0, limit - rec.count);
  return { ok: rec.count <= limit, remaining, resetIn: 3600 };
}
