export const runtime = "nodejs";

import { notFound } from "next/navigation";
import { featureFlagService } from "@/features/admin/feature-flags/server/services";
import { AdminFilesScreen } from "@/modules/file-upload";

export default async function FilesPage() {
  const enabled = await featureFlagService.isEnabled("fileUpload");
  if (!enabled) notFound(); // o redirect("/unauthorized")
  return <AdminFilesScreen />;
}
