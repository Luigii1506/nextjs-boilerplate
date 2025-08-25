/**
 * 👥 USERS PAGE
 * =============
 *
 * Next.js App Router page para el módulo de users
 * Página principal del dashboard de usuarios
 */

import { Metadata } from "next";
import UsersSPAScreen from "@/features/admin/users/ui/routes/users.spa.screen";

export const metadata: Metadata = {
  title: "Usuarios | Dashboard",
  description:
    "Gestiona usuarios, administradores y permisos de forma eficiente",
};

export default function UsersPage() {
  return <UsersSPAScreen />;
}
