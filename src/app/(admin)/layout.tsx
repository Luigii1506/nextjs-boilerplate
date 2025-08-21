import { type ReactNode } from "react";
import { redirect } from "next/navigation";
import { requireAuth } from "@/core/auth/server";
import { ROLE_INFO } from "@/core/auth/permissions";
import type { SessionUser } from "@/shared/types/user";
import AdminLayout from "@/shared/ui/layouts/AdminLayout";
import { FeatureFlagsProvider } from "@/core/feature-flags";

export const runtime = "nodejs";

/**
 * 🏛️ OPTIMIZED ADMIN LAYOUT
 * ==========================
 *
 * Arquitectura simple y robusta (2 capas):
 * 1. Server: Auth verification + Role gate
 * 2. Client: Reactive UI (AdminLayout maneja su propio estado)
 *
 * ✅ 80% menos código que la versión híbrida
 * ✅ Server-side security + Client-side reactivity
 * ✅ Sin capas innecesarias
 */
export default async function AdminRootLayout({
  children,
}: {
  children: ReactNode;
}) {
  // 🔐 Server-side verification (SECURITY LAYER)
  const session = await requireAuth();
  const user = session!.user as SessionUser;

  // 🛡️ Role-based access gate (AUTHORIZATION LAYER)
  const role = (user.role ?? "user") as keyof typeof ROLE_INFO;
  const isAdmin = role === "admin" || role === "super_admin";
  const isSuperAdmin = role === "super_admin";

  // Hard gate - no access if not admin
  if (!isAdmin) redirect("/unauthorized");

  // ✅ Direct to AdminLayout (handles its own client state)
  return (
    <FeatureFlagsProvider>
      <AdminLayout user={user} isAdmin={isAdmin} isSuperAdmin={isSuperAdmin}>
        {children}
      </AdminLayout>
    </FeatureFlagsProvider>
  );
}
