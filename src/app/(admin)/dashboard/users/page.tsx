export const runtime = "nodejs";

import { UsersView } from "@/core/admin/users/components";

export default async function UsersPage() {
  return <UsersView />;
}
