export const runtime = "nodejs";

import { notFound } from "next/navigation";
import { isServerFeatureEnabled } from "@/features/feature-flags";
import { AdminFilesScreen } from "@/modules/file-upload";

export default async function FilesPage() {
  const enabled = await isServerFeatureEnabled("fileUpload");
  if (!enabled) notFound(); // o redirect("/unauthorized")
  return <AdminFilesScreen />;
}
