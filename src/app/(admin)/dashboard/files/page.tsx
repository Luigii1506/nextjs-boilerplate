export const runtime = "nodejs";

import { notFound } from "next/navigation";
import { isFeatureEnabled } from "@/core/admin/feature-flags/server";
import FilesView from "@/modules/file-upload/pages/admin/dashboard/files.page";

export default async function FilesPage() {
  const enabled = await isFeatureEnabled("fileUpload");
  if (!enabled) notFound(); // o redirect("/unauthorized")
  return <FilesView />;
}
