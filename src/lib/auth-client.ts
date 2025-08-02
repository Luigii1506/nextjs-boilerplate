import { createAuthClient } from "better-auth/client";
import { adminClient } from "better-auth/client/plugins";
import { ac } from "@/lib/auth/permissions";
import { superAdminRole, adminRole, userRole } from "@/lib/auth/permissions";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL,

  // 🔌 CLIENT PLUGINS
  plugins: [
    // 🛡️ Admin Client Plugin - inherits server config
    adminClient({
      ac,
      roles: {
        super_admin: superAdminRole,
        admin: adminRole,
        user: userRole,
      },
    }),
  ],
});
