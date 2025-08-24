import { type ReactNode } from "react";
import { redirect } from "next/navigation";
import { requireAuth } from "@/core/auth/server";
import { ROLE_INFO } from "@/core/auth/permissions";
import type { SessionUser } from "@/shared/types/user";
import AdminLayout from "@/shared/ui/layouts/AdminLayout";

export const runtime = "nodejs";

/**
 * 🏛️ SELF-CONTAINED ADMIN LAYOUT 
 * ===============================
 *
 * Arquitectura ultra-simple (2 capas):
 * 1. Server: Auth verification + Role gate (THIS FILE)
 * 2. Client: Self-contained reactive UI (AdminLayout)
 *
 * ✅ Server solo maneja seguridad y autorización  
 * ✅ AdminLayout maneja TODO su estado interno
 * ✅ useAdminLayoutNavigation integrado automáticamente
 * ✅ Sin props innecesarios - solo user data
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

  // ✅ AdminLayout is fully self-contained:
  // - Manages sidebar state internally
  // - Handles dark mode detection
  // - Uses useAdminLayoutNavigation for all header functions
  // - Auto-setup event listeners
  return (
    <AdminLayout user={user} isAdmin={isAdmin} isSuperAdmin={isSuperAdmin}>
      {children}
    </AdminLayout>
  );
}
