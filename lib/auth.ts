import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import prisma from "@/lib/prisma";
import { PrismaAdapter } from "@next-auth/prisma-adapter";

if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  throw new Error("Missing Google OAuth credentials in environment variables");
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      // Initial sign in
      if (account && user) {
        console.log("🔑 Setting initial JWT token:", { user, account });
        return {
          ...token,
          userId: user.id,
          accessToken: account.access_token,
        };
      }
      console.log("♻️ Reusing existing JWT token:", token);
      return token;
    },
    async session({ session, token, user }) {
      console.log("📝 Setting session from token:", { token, user });
      if (session.user) {
        session.user.id = token.userId;
        session.accessToken = token.accessToken as string;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      console.log("🔄 Redirect callback:", { url, baseUrl });
      // After sign in, go to dashboard/stats
      if (url.startsWith(baseUrl)) {
        return `${baseUrl}/dashboard/stats`;
      }
      return baseUrl;
    },
  },
  debug: process.env.NODE_ENV === "development", // Enable debug logs in development
  session: {
    strategy: "jwt",
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
