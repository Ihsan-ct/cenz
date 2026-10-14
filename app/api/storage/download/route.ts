import { auth } from "@/lib/auth";
import { createDownloadUrl, userPrefix } from "@/lib/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const session = await auth();
  const uid = (session?.user as any)?.id as string | undefined;
  if (!uid) return Response.json({ error: "unauthorized" }, { status: 401 });

  const key = new URL(req.url).searchParams.get("key") ?? "";
  // Hanya boleh mengambil file milik sendiri, dan blokir path traversal
  if (!key.startsWith(userPrefix(uid)) || key.includes("..")) {
    return Response.json({ error: "forbidden" }, { status: 403 });
  }

  try {
    const url = await createDownloadUrl(key, 300);
    return Response.json({ url, expiresIn: 300 });
  } catch {
    return Response.json({ error: "not_found" }, { status: 404 });
  }
}
