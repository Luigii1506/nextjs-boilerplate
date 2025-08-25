export const runtime = "nodejs";

// 🧪 Using working version with fixed tabs
import UsersSPAScreen from "@/features/admin/users/ui/routes/users.spa.screen";

// Debug versions
// import UsersSPADebug from "@/features/admin/users/ui/routes/users.spa.debug";
// import UsersSPAMinimal from "@/features/admin/users/ui/routes/users.spa.minimal";
// import UsersSPASimple from "@/features/admin/users/ui/routes/users.spa.simple";

// Legacy version (backup)
// import UsersView from "@/features/admin/users/ui/routes/users.screen";

export default async function UsersPage() {
  return <UsersSPAScreen />;
}
