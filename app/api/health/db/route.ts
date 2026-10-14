import { prisma } from "@/lib/prisma";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const t = Date.now();
  try {
    await prisma.$queryRaw`select 1`;
    return Response.json({ ok: true, ms: Date.now() - t });
  } catch (e: any) {
    const msg = String(e?.message ?? "")
      .replace(/postgres(ql)?:\/\/[^\s@]*@/g, "postgresql://***@")
      .split("\n").map((l: string) => l.trim()).filter(Boolean).slice(-3);
    return Response.json(
      { ok: false, ms: Date.now() - t, code: e?.errorCode ?? e?.code, msg },
      { status: 500 }
    );
  }
}
