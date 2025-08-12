import { type ReactNode } from "react";
import { redirect } from "next/navigation";
import { requireAuth } from "@/core/auth/server";
import { isFeatureEnabled } from "@/core/admin/feature-flags/server";
import { ROLE_INFO } from "@/core/auth/config/permissions";
import type { SessionUser } from "@/shared/types/user";
import AdminShell from "@/core/layouts/AdminShell";

export const runtime = "nodejs";

export default async function AdminRootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await requireAuth();
  const user = session!.user as SessionUser;

  // Gate por rol (solo admin/super_admin)
  const role = (user.role ?? "user") as keyof typeof ROLE_INFO;
  const isAdmin = role === "admin" || role === "super_admin";
  const isSuperAdmin = role === "super_admin";
  if (!isAdmin) redirect("/unauthorized");

  // Snapshot de feature flags (server)
  const fileUploadEnabled = await isFeatureEnabled("fileUpload");

  return (
    <AdminShell
      user={user}
      isAdmin={isAdmin}
      isSuperAdmin={isSuperAdmin}
      roleInfo={ROLE_INFO[role]}
      fileUploadEnabled={fileUploadEnabled}
    >
      {children}
    </AdminShell>
  );
}
