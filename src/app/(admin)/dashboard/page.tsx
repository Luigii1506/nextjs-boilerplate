export const runtime = "nodejs";

import DashboardView from "@/core/admin/dashboard/components/DashboardView";

export default async function Page() {
  return <DashboardView />;
}
