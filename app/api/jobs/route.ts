import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getQueue } from "@/lib/queue";
import { parseSourceUrl } from "@/lib/sources";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PLANS = {
  free: { daily: 3, maxDuration: 300 },
  paid: { daily: 50, maxDuration: 600 },
};
const MAX_ACTIVE = 2;

const clamp = (n: number, lo: number, hi: number, d: number) =>
  Number.isFinite(n) ? Math.min(hi, Math.max(lo, n)) : d;

export async function POST(req: Request) {
  const session = await auth();
  const uid = (session?.user as any)?.id as string | undefined;
  if (!uid) return Response.json({ error: "unauthorized" }, { status: 401 });

  let body: any;
  try { body = await req.json(); } catch { body = null; }
  const src = parseSourceUrl(body?.sourceUrl);
  if (!src) return Response.json({ error: "invalid_url" }, { status: 400 });

  const speed = clamp(Number(body?.speed ?? 1), 0.5, 2, 1);
  const amplify = clamp(Number(body?.amplify ?? 0), 0, 15, 0);

  const sub = await prisma.subscription.findUnique({ where: { userId: uid } });
  const paid = !!sub && sub.active && (!sub.expiresAt || sub.expiresAt > new Date());
  const plan = paid ? PLANS.paid : PLANS.free;

  const since = new Date(Date.now() - 24 * 3600 * 1000);
  const [today, active] = await Promise.all([
    prisma.job.count({ where: { userId: uid, createdAt: { gte: since }, status: { not: "FAILED" } } }),
    prisma.job.count({ where: { userId: uid, status: { in: ["QUEUED", "PROCESSING"] } } }),
  ]);
  if (active >= MAX_ACTIVE) return Response.json({ error: "too_many_active" }, { status: 429 });
  if (today >= plan.daily) return Response.json({ error: "quota_exceeded", limit: plan.daily }, { status: 429 });

  const job = await prisma.job.create({
    data: {
      userId: uid,
      sourceUrl: src.url,
      sourceType: src.type,
      speed,
      amplify,
      maxDuration: plan.maxDuration,
    },
  });

  try {
    await getQueue().add("convert", { jobId: job.id }, { jobId: job.id });
  } catch (e) {
    console.error("[jobs] enqueue failed:", e);
    await prisma.job.update({
      where: { id: job.id },
      data: { status: "FAILED", errorMessage: "Antrean tidak tersedia" },
    });
    return Response.json({ error: "queue_unavailable" }, { status: 503 });
  }

  return Response.json({ id: job.id, status: job.status }, { status: 201 });
}
