import { createAuthClient } from "better-auth/client";
import { adminClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  plugins: [adminClient()],
});

// Desestructuras los métodos y hooks que necesitas directamente de 'authClient'
export const { signIn, signOut, useSession, signUp } = authClient;
