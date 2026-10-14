import NextAuth from 'next-auth';
import Discord from 'next-auth/providers/discord';
import { prisma } from './db';

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Discord({
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
      authorization: { params: { scope: 'identify email guilds' } },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (!profile?.id) return false;
      // cek membership Discord server (kalo DISCORD_GUILD_ID di-set)
      const guildId = process.env.DISCORD_GUILD_ID;
      if (guildId && process.env.DISCORD_BOT_TOKEN) {
        try {
          const res = await fetch(
            `https://discord.com/api/v10/guilds/${guildId}/members/${profile.id}`,
            { headers: { Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}` } }
          );
          if (!res.ok) return '/id/login?error=not_member';
        } catch { /* allow if API down */ }
      }
      await prisma.user.upsert({
        where: { discordId: profile.id },
        create: {
          discordId: profile.id,
          username: (profile as any).username || user.name || 'unknown',
          discriminator: (profile as any).discriminator,
          email: user.email,
          avatar: user.image,
        },
        update: {
          username: (profile as any).username || user.name || 'unknown',
          avatar: user.image,
        },
      });
      return true;
    },
    async session({ session, token }) {
      const u = await prisma.user.findUnique({ where: { discordId: token.sub! } });
      if (u) (session.user as any).id = u.id;
      return session;
    },
  },
  pages: { signIn: '/id/login' },
});

export async function requireUser() {
  const session = await auth();
  if (!session?.user) throw new Error('UNAUTHORIZED');
  const u = await prisma.user.findUnique({ where: { discordId: (session.user as any).id ? undefined : undefined } });
  return session;
}
