import type { NextAuthOptions } from "next-auth";
import type { Adapter } from "next-auth/adapters";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./db";
import EmailProvider from "next-auth/providers/email";
import { hashEmail } from "@/lib/email-hash";

const prismaAdapter = PrismaAdapter(prisma);

const maybeHashEmail = (email?: string | null) =>
  email && email.includes("@") ? hashEmail(email) : email || null;

const hashedEmailAdapter: Adapter = {
  ...prismaAdapter,
  createUser: async (data) =>
    prismaAdapter.createUser({
      ...data,
      email: maybeHashEmail(data.email) || "",
    }),
  getUserByEmail: async (email) => prismaAdapter.getUserByEmail(hashEmail(email)),
  updateUser: async (data) =>
    prismaAdapter.updateUser({
      ...data,
      email: maybeHashEmail(data.email),
    }),
  createVerificationToken: async (data) =>
    prismaAdapter.createVerificationToken({
      ...data,
      identifier: hashEmail(data.identifier),
    }),
  useVerificationToken: async (data) =>
    prismaAdapter.useVerificationToken({
      ...data,
      identifier: hashEmail(data.identifier),
    }),
};

export const authOptions: NextAuthOptions = {
  adapter: hashedEmailAdapter,
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
      ...(process.env.NODE_ENV !== "production"
        ? {
            async sendVerificationRequest({ identifier: email, url }) {
              console.log("\n\n📧 SIGN IN LINK FOR:", email);
              console.log("🔗 Copy this URL to sign in:");
              console.log("\n", url, "\n\n");
            },
          }
        : {}),
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
        email: null,
      },
    }),
  },
  secret: process.env.NEXTAUTH_SECRET,
};
