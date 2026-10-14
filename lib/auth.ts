import NextAuth from "next-auth";
import Discord from "next-auth/providers/discord";
import { prisma } from "@/lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.AUTH_SECRET,
  trustHost: true,
  session: { strategy: "jwt" },
  debug: process.env.AUTH_DEBUG === "1",
  logger: {
    error(error) {
      console.error(
        "[auth][error]",
        error.name,
        error.message,
        "input=",
        JSON.stringify((error as any).input ?? (error as any).cause?.input ?? null),
        "\nstack=", error.stack
      );
    },
    warn(code) {
      console.warn("[auth][warn]", code);
    },
  },
  providers: [
    Discord({
      clientId: process.env.DISCORD_CLIENT_ID!.trim(),
      clientSecret: process.env.DISCORD_CLIENT_SECRET!.trim(),
    }),
  ],
  callbacks: {
    async signIn({ account, profile }) {
      const p = profile as any;
      if (account?.provider !== "discord" || !p?.id) return false;
      try {
        const data = {
          username: String(p.global_name ?? p.username ?? "user"),
          discriminator: p.discriminator && p.discriminator !== "0" ? String(p.discriminator) : null,
          email: p.email ? String(p.email) : null,
          avatar: p.avatar ? String(p.avatar) : null,
        };
        await prisma.user.upsert({
          where: { discordId: String(p.id) },
          update: data,
          create: { discordId: String(p.id), ...data },
        });
        return true;
      } catch (e) {
        console.error("[auth] signIn upsert failed:", e);
        return false;
      }
    },
    async jwt({ token, account, profile }) {
      const p = profile as any;
      if (account?.provider === "discord" && p?.id) {
        const u = await prisma.user.findUnique({
          where: { discordId: String(p.id) },
          select: { id: true },
        });
        if (u) token.uid = u.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token.uid) (session.user as any).id = token.uid;
      return session;
    },
  },
});
