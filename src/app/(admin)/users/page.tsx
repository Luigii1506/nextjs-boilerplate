export const runtime = "nodejs";

import UsersView from "@/features/admin/users/ui/routes/index.clean.screen";

export default async function UsersPage() {
  return <UsersView />;
}
