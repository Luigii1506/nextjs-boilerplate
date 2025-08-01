import { createAuthClient } from "better-auth/react";
import { adminClient } from "better-auth/client/plugins";

// Llamas a createAuthClient una sola vez
export const authClient = createAuthClient({
  /** La URL base del servidor es opcional si el cliente y el servidor están en el mismo dominio */
  baseURL: "http://localhost:3000",
  plugins: [adminClient()],
});

// Desestructuras los métodos y hooks que necesitas directamente de 'authClient'
export const { signIn, signOut, useSession, signUp } = authClient;
