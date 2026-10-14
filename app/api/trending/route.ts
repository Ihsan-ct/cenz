import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';

export const revalidate = 300;

export async function GET() {
  // jobs 7 hari terakhir, group by sourceUrl, count
  const since = new Date(Date.now() - 7 * 86400000);
  const jobs = await prisma.job.findMany({
    where: { createdAt: { gte: since }, status: { in: ['COMPLETED', 'UPLOADED'] } },
    select: { sourceUrl: true, fileName: true },
    take: 500,
  });

  const counts = new Map<string, number>();
  for (const j of jobs) {
    const key = j.sourceUrl || j.fileName;
    if (!key) continue;
    counts.set(key, (counts.get(key) || 0) + 1);
  }

  const trending = Array.from(counts.entries())
    .map(([url, count]) => ({ url, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return NextResponse.json({ trending });
}
