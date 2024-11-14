import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import prisma from "@/lib/prisma";
import type { Account, JWT, Profile, Session } from "next-auth";
import { AdapterUser } from "next-auth/adapters";

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    email?: string;
    sub?: string;
    name?: string;
    picture?: string;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({
      account,
      profile,
    }: {
      account: Account | null;
      profile?: Profile;
    }) {
      if (account?.provider === "google" && profile?.sub) {
        try {
          if (!profile.email) {
            return false; // Exit if no email is provided
          }

          const user = await prisma.user.upsert({
            where: { email: profile.email },
            update: {
              id: profile.sub,
              name: profile.name,
              image: profile.image ?? null,
            },
            create: {
              id: profile.sub,
              email: profile.email,
              name: profile.name,
              image: profile.image ?? null,
              username:
                profile.name || profile.email.split("@")[0] || profile.sub,
            },
          });
          return true;
        } catch (error) {
          console.error("Error in signIn callback:", error);
          return false;
        }
      }
      return true;
    },

    async session({
      session,
      token,
    }: {
      session: Session;
      token: JWT;
      user: AdapterUser;
    }) {
      // @ts-ignore
      if (session?.user && token.id) {
        session.user.id = token.id;
      }
      return session;
    },

    async jwt({
      token,
      account,
      profile,
    }: {
      token: JWT;
      user: AdapterUser | null;
      account: Account | null;
      profile?: Profile;
    }) {
      if (profile) {
        token.id = profile.sub;
      }
      return token;
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error", // Add error page
  },
  session: {
    strategy: "jwt",
  },
  debug: process.env.NODE_ENV === "development",
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
