export const runtime = "nodejs";

import { notFound } from "next/navigation";
import { isFeatureEnabled } from "@/core/feature-flags/server";
import { FilesView } from "@/modules/file-upload/components";

export default async function FilesPage() {
  const enabled = await isFeatureEnabled("fileUpload");
  if (!enabled) notFound(); // o redirect("/unauthorized")
  return <FilesView />;
}
