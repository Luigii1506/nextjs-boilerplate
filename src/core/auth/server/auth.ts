import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { admin } from "better-auth/plugins";
import { prisma } from "@/core/database/prisma";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql", // or "mysql", "sqlite"
  }),

  // 🔐 Secret Configuration
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:3000",

  // 📧 Email and Password Configuration
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
  },

  // 🔌 PLUGINS CONFIGURATION
  plugins: [
    // ��️ Admin Plugin with Basic Configuration
    admin({
      // ⚙️ Admin Plugin Options
      defaultRole: "user",
      adminRoles: ["super_admin", "admin"], // Roles considered as admin

      // 🚫 Ban Settings
      defaultBanReason: "Violación de términos de servicio",
      defaultBanExpiresIn: 60 * 60 * 24 * 7, // 7 days
      bannedUserMessage:
        "Tu cuenta ha sido suspendida. Contacta al soporte si crees que es un error.",

      // 👤 Impersonation Settings
      impersonationSessionDuration: 60 * 60, // 1 hour
    }),
  ],

  // 🎨 Advanced Options
  advanced: {
    database: {
      generateId: false, // Use auto-increment IDs
    },
    crossSubdomainCookies: {
      enabled: false,
    },
  },

  // 🔔 Event Hooks for Auditing
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          // Creating new user
          return { data: user };
        },
        after: async () => {
          // User created successfully
        },
      },
      update: {
        before: async (user) => {
          // Updating user
          return { data: user };
        },
        after: async () => {
          // User updated
        },
      },
    },
    session: {
      create: {
        after: async () => {
          // New session created
        },
      },
    },
  },
});
