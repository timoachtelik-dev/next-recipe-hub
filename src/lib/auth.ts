import type { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./db";
import EmailProvider from "next-auth/providers/email";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    EmailProvider({
      server: process.env.EMAIL_SERVER
        ? {
            host: process.env.EMAIL_SERVER_HOST,
            port: parseInt(process.env.EMAIL_SERVER_PORT || "587"),
            auth: {
              user: process.env.EMAIL_SERVER_USER,
              pass: process.env.EMAIL_SERVER_PASSWORD,
            },
          }
        : undefined,
      from: process.env.EMAIL_FROM || "noreply@localhost",
      // For development: log the sign-in link to console
      async sendVerificationRequest({ identifier: email, url }) {
        console.log("\n\n📧 SIGN IN LINK FOR:", email);
        console.log("🔗 Copy this URL to sign in:");
        console.log("\n", url, "\n\n");
        
        // In production, send an actual email here
        // For now, just log it to console
      },
    }),
  ],
  pages: {
    signIn: "/auth/signin",
  },
  callbacks: {
    session: ({ session, user }) => ({
      ...session,
      user: {
        ...session.user,
        id: user.id,
      },
    }),
  },
  secret: process.env.NEXTAUTH_SECRET,
};