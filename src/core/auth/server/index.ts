import { auth } from "./auth";

// Re-export auth for direct access
export { auth };

export type SessionUser = {
  id: string;
  email: string;
  name?: string | null;
  role?: string | null;
  permissions?: string[];
};

export type Session = { user: SessionUser } | null;

/**
 * Lee la cookie de sesión desde headers() o cookies() y pide la sesión a Better Auth.
 * Funciona tanto si headers()/cookies() son sync como async (Next 14/15).
 */
export async function getServerSession(): Promise<Session> {
  // Importación dinámica para evitar problemas client-side
  const { headers } = await import("next/headers");
  const { cookies } = await import("next/headers");

  // 1) Intenta obtener la cookie directo de los headers
  const h = await headers(); // si es sync, await lo envuelve sin problema
  let cookieHeader = h.get("cookie") ?? "";

  // 2) Si no hay cookie en headers, arma el header desde cookies()
  if (!cookieHeader) {
    const store = await cookies(); // si es sync, igual funciona con await
    const pairs = store.getAll().map(({ name, value }) => `${name}=${value}`);
    cookieHeader = pairs.join("; ");
  }

  // 3) Construye un Headers estándar para Better Auth (NO objeto plano)
  const requestHeaders = new Headers();
  if (cookieHeader) requestHeaders.set("cookie", cookieHeader);

  const session = await auth.api.getSession({ headers: requestHeaders });
  return (session as Session) ?? null;
}

export async function requireAuth(opts?: { redirectTo?: string }) {
  const session = await getServerSession();
  if (!session?.user) {
    const { redirect } = await import("next/navigation");
    redirect(opts?.redirectTo ?? "/login");
  }
  return session;
}
