export const runtime = "nodejs";

import OptimizedUsersView from "@/features/admin/users/ui/routes/optimized.screen";

export default async function UsersPage() {
  return <OptimizedUsersView />;
}
