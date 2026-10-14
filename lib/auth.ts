import NextAuth from 'next-auth';
import Discord from 'next-auth/providers/discord';
import { prisma } from './db';

const secret = (process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || '').trim();
const authUrl = (process.env.AUTH_URL || process.env.NEXTAUTH_URL || '').trim();

console.log('[auth] boot', {
  hasSecret: secret.length > 0,
  secretLen: secret.length,
  hasDiscordId: !!process.env.DISCORD_CLIENT_ID,
  hasDiscordSecret: !!process.env.DISCORD_CLIENT_SECRET,
  authUrl,
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret,
  trustHost: true,
  providers: [
    Discord({
      clientId: (process.env.DISCORD_CLIENT_ID || '').trim(),
      clientSecret: (process.env.DISCORD_CLIENT_SECRET || '').trim(),
      authorization: { params: { scope: 'identify email' } },
    }),
  ],
  callbacks: {
    async signIn({ user, profile }) {
      if (!profile?.id) return false;
      try {
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
      } catch (err) {
        console.error('[auth] prisma error:', err);
        return false;
      }
    },
    async session({ session, token }) {
      try {
        const u = await prisma.user.findUnique({ where: { discordId: token.sub! } });
        if (u) (session.user as any).id = u.id;
      } catch (err) {
        console.error('[auth] session error:', err);
      }
      return session;
    },
  },
  pages: { signIn: '/id/login' },
});
