export const runtime = "nodejs";

import { notFound } from "next/navigation";
import { featureFlagService } from "@/features/admin/feature-flags/server/services";
import FilesView from "@/modules/file-upload/pages/admin/dashboard/files.page";

export default async function FilesPage() {
  const enabled = await featureFlagService.isEnabled("fileUpload");
  if (!enabled) notFound(); // o redirect("/unauthorized")
  return <FilesView />;
}
