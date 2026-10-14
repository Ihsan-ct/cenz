import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  const uid = (session?.user as any)?.id as string | undefined;
  if (!uid) return Response.json({ error: "unauthorized" }, { status: 401 });

  const job = await prisma.job.findFirst({
    where: { id: params.id, userId: uid },
    select: {
      id: true, status: true, errorMessage: true, moderation: true,
      assetId: true, r2Key: true, createdAt: true, completedAt: true,
    },
  });
  if (!job) return Response.json({ error: "not_found" }, { status: 404 });

  // r2Key dipakai sebagai key untuk /api/storage/download?key=...
  return Response.json({ ...job, downloadKey: job.status === "READY" ? job.r2Key : null });
}
