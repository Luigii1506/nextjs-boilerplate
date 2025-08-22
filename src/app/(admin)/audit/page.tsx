/**
 * 📊 AUDIT TRAIL PAGE
 * ===================
 *
 * Página principal del módulo de auditoría
 */

import { Metadata } from "next";
import { AuditDashboard } from "@/features/audit";

export const metadata: Metadata = {
  title: "Audit Trail | Admin",
  description: "Sistema de auditoría y seguimiento de actividades",
};

export default function AuditPage() {
  return <AuditDashboard />;
}
