import { NextRequest } from "next/server";
import { handlers } from "@/lib/auth";

export const runtime = "nodejs";
export const POST = handlers.POST;

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  if (url.pathname.endsWith("/callback/discord") && url.searchParams.has("iss")) {
    console.log("[auth] discord iss =", url.searchParams.get("iss"));
    url.searchParams.delete("iss");
    return handlers.GET(new NextRequest(url, req));
  }
  return handlers.GET(req);
}
