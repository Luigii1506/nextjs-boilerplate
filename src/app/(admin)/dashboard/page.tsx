export const runtime = "nodejs";

import DashboardView from "@/core/admin/pages/dashboard/page";

export default async function Page() {
  return <DashboardView />;
}
