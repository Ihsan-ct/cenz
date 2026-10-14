import { prisma } from "@/lib/prisma";
import { BUCKET, removeObjects } from "@/lib/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const secret = (process.env.CRON_SECRET ?? "").trim();
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  // 1. file audio > 24 jam
  const rows = await prisma.$queryRaw<{ name: string }[]>`
    select name from storage.objects
    where bucket_id = ${BUCKET}
      and created_at < now() - interval '24 hours'
    limit 500`;
  const names = rows.map((r) => r.name);
  await removeObjects(names);

  // 2. job yang menggantung di PROCESSING
  const stuck = await prisma.job.updateMany({
    where: { status: "PROCESSING", updatedAt: { lt: new Date(Date.now() - 15 * 60 * 1000) } },
    data: { status: "FAILED", errorMessage: "Pemrosesan terhenti. Coba lagi." },
  });

  // 3. catatan rate limit > 48 jam
  const cutoff = new Date(Date.now() - 48 * 3600 * 1000).toISOString().slice(0, 13);
  const oldRl = await prisma.rateLimit.deleteMany({ where: { window: { lt: cutoff } } });

  return Response.json({ files: names.length, stuck: stuck.count, rateLimit: oldRl.count });
}
