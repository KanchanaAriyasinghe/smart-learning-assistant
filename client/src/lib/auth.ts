import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from './prisma';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Email & Password',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'you@example.com' },
        name: { label: 'Your Name', type: 'text', placeholder: 'John Doe' },
      },
      async authorize(credentials) {
        if (!credentials?.email) return null;

        // Upsert user in DB
        const user = await prisma.user.upsert({
          where: { email: credentials.email },
          update: { name: credentials.name || undefined },
          create: {
            email: credentials.email,
            name: credentials.name || credentials.email.split('@')[0],
          },
        });

        return {
          id: user.id,
          email: user.email,
          name: user.name,
        };
      },
    }),
  ],
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/',
    error: '/',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};