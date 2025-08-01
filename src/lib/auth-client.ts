import { createAuthClient } from "better-auth/client";
import { adminClient } from "better-auth/client/plugins";
import {
  accessControl,
  superAdminRole,
  adminRole,
  editorRole,
  moderatorRole,
  userRole,
  guestRole,
} from "@/lib/auth/permissions";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:3000",

  // 🔌 CLIENT PLUGINS
  plugins: [
    // 🛡️ Admin Client Plugin with Custom Permissions
    adminClient({
      // 🎯 Use our custom access control system
      ac: accessControl,

      // 👑 Define all available roles (same as server)
      roles: {
        super_admin: superAdminRole,
        admin: adminRole,
        editor: editorRole,
        moderator: moderatorRole,
        user: userRole,
        guest: guestRole,
      },
    }),
  ],
});

// Desestructuras los métodos y hooks que necesitas directamente de 'authClient'
export const { signIn, signOut, useSession, signUp } = authClient;
