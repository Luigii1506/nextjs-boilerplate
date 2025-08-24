import { redirect } from "next/navigation";
import { requireAuth } from "@/core/auth/server";
import { SettingsScreen } from "@/features/settings";
import type { SettingCategory } from "@/features/settings/types";

export const runtime = "nodejs";

type SettingsPageProps = {
  searchParams: Promise<{ category?: string }>;
};

export default async function SettingsPage({ searchParams }: SettingsPageProps) {
  // Get authenticated user
  const session = await requireAuth();
  const user = session!.user;
  const userRole = user.role || "user";
  const adminRoles = ["admin", "super_admin"];

  if (!adminRoles.includes(userRole)) {
    redirect("/unauthorized");
  }

  // Get initial category from search params
  const searchParamsResolved = await searchParams;
  const initialCategory = (searchParamsResolved.category as SettingCategory) || "app";

  return (
    <SettingsScreen
      initialCategory={initialCategory}
      userId={user.id}
      userRole={userRole}
    />
  );
}
