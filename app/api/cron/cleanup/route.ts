import { prisma } from "@/lib/prisma";
import { BUCKET, removeObjects } from "@/lib/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const secret = (process.env.CRON_SECRET ?? "").trim();
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  const rows = await prisma.$queryRaw<{ name: string }[]>`
    select name from storage.objects
    where bucket_id = ${BUCKET}
      and created_at < now() - interval '24 hours'
    limit 500`;

  const names = rows.map((r) => r.name);
  await removeObjects(names); // lewat API, bukan delete SQL, supaya file fisik ikut terhapus
  return Response.json({ deleted: names.length });
}
