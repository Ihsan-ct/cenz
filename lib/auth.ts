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
      console.error("[auth][error]", error.name, error.message, error.cause ?? "");
    },
    warn(code) {
      console.warn("[auth][warn]", code);
    },
  },
  providers: [
    Discord({
      clientId: process.env.DISCORD_CLIENT_ID!.trim(),
      clientSecret: process.env.DISCORD_CLIENT_SECRET!.trim(),
      authorization: { params: { scope: "identify email" } },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider !== "discord" || !profile?.id) return false;
      try {
        await prisma.user.upsert({
          where: { discordId: String(profile.id) },
          update: { name: user.name, image: user.image, email: user.email },
          create: {
            discordId: String(profile.id),
            name: user.name,
            image: user.image,
            email: user.email,
          },
        });
        return true;
      } catch (e) {
        console.error("[auth] signIn upsert failed:", e);
        return false;
      }
    },
    async jwt({ token, account, profile }) {
      if (account?.provider === "discord" && profile?.id) {
        const u = await prisma.user.findUnique({
          where: { discordId: String(profile.id) },
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
