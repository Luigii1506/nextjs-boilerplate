export const runtime = "nodejs";

import UsersView from "@/core/admin/pages/dashboard/user.page";

export default async function UsersPage() {
  return <UsersView />;
}
