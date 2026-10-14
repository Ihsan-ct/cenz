import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { encrypt } from '@/lib/crypto';
import { getRobloxUser } from '@/lib/roblox';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const schema = z.object({
  userId: z.string().min(1),
  apiKey: z.string().min(20),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
  const user = await prisma.user.findFirst({ where: { email: session.user.email || undefined } });
  if (!user) return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'INVALID_INPUT' }, { status: 400 });

  const roblox = await getRobloxUser(parsed.data.apiKey, parsed.data.userId);
  if (!roblox) return NextResponse.json({ error: 'INVALID_KEY' }, { status: 400 });

  const { enc, iv, tag } = encrypt(parsed.data.apiKey);
  await prisma.robloxAccount.upsert({
    where: { userId: user.id },
    create: { userId: user.id, robloxUserId: parsed.data.userId, robloxUsername: roblox.name || roblox.displayName, apiKeyEnc: enc, apiKeyIv: iv, apiKeyTag: tag, verified: true },
    update: { robloxUserId: parsed.data.userId, robloxUsername: roblox.name || roblox.displayName, apiKeyEnc: enc, apiKeyIv: iv, apiKeyTag: tag, verified: true },
  });
  return NextResponse.json({ ok: true, username: roblox.name });
}

export async function DELETE() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
  const user = await prisma.user.findFirst({ where: { email: session.user.email || undefined } });
  if (!user) return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 });
  await prisma.robloxAccount.deleteMany({ where: { userId: user.id } });
  return NextResponse.json({ ok: true });
}
