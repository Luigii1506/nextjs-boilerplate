export const runtime = "nodejs";

import DashboardView from "@/features/admin/dashboard/ui/routes/index.screen";

export default async function Page() {
  return <DashboardView />;
}
