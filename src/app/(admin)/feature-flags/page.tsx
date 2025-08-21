export const runtime = "nodejs";

import FeatureFlagsAdmin from "@/features/admin/feature-flags/page";
// Si quieres un gate adicional por rol en esta página (además del layout):
// import { requireAuth } from "@/core/auth/server";
// import { ROLE_HIERARCHY } from "@/core/auth/config/permissions";
// import { redirect } from "next/navigation";

export default async function FeatureFlagsPage() {
  // Gate opcional por rol (el layout ya bloquea el resto del área)
  // const session = await requireAuth();
  // const role = (session.user.role ?? "user") as keyof typeof ROLE_HIERARCHY;
  // if ((ROLE_HIERARCHY[role] ?? 0) < ROLE_HIERARCHY.admin) redirect("/unauthorized");

  return <FeatureFlagsAdmin />;
}
