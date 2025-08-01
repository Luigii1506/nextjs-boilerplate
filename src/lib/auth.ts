import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { google } from "better-auth/providers/google";
import { email } from "better-auth/providers/email";
import { prisma } from "./prisma";

export const auth = betterAuth({
  adapter: prismaAdapter(prisma),
  providers: [
    google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    email({})
  ],
  emails: {
    send: async () => {
      // Integrate with email provider to send verification and reset emails
    }
  },
  session: {
    strategy: "jwt"
  }
});
