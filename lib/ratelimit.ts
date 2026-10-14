import { prisma } from './db';

export async function checkRateLimit(
  userId: string,
  limit = 2
): Promise<{ ok: boolean; remaining: number; resetIn: number }> {
  const now = new Date();
  const window = now.toISOString().slice(0, 13); // YYYY-MM-DDTHH (per jam, UTC)
  const rec = await prisma.rateLimit.upsert({
    where: { userId_window: { userId, window } },
    create: { userId, window, count: 1 },
    update: { count: { increment: 1 } },
  });
  const next = new Date(now);
  next.setUTCMinutes(60, 0, 0); // awal jam berikutnya
  const resetIn = Math.max(1, Math.ceil((next.getTime() - now.getTime()) / 1000));
  return { ok: rec.count <= limit, remaining: Math.max(0, limit - rec.count), resetIn };
}
