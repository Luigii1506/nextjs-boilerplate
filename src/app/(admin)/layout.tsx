import { type ReactNode } from "react";
import { redirect } from "next/navigation";
import { requireAuth } from "@/core/auth/server";
import { ROLE_INFO } from "@/core/auth/config/permissions";
import type { SessionUser } from "@/shared/types/user";
import AdminLayout from "@/shared/ui/layouts/AdminLayout";

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

  return (
    <AdminLayout user={user} isAdmin={isAdmin} isSuperAdmin={isSuperAdmin}>
      {children}
    </AdminLayout>
  );
}
