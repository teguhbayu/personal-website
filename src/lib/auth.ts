import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { prisma } from "@/lib/prisma";
import { isAllowedOwnerEmail } from "@/lib/owner-email";

export const auth = betterAuth({
  emailAndPassword: {
    enabled: false,
  },
  database: prismaAdapter(prisma, {
    provider: "mysql",
  }),
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      prompt: "select_account",
    },
  },
  onAPIError: {
    errorURL: "/login",
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          if (!isAllowedOwnerEmail(user.email)) {
            return false;
          }
        },
      },
    },
    session: {
      create: {
        before: async (session) => {
          const user = await prisma.user.findUnique({
            where: { id: session.userId },
            select: { email: true },
          });
          if (!isAllowedOwnerEmail(user?.email)) {
            return false;
          }
        },
      },
    },
  },
  plugins: [nextCookies()],
});
