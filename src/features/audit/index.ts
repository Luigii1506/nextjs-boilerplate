/**
 * 📊 AUDIT TRAIL MODULE INDEX
 * ===========================
 *
 * Barrel export para el módulo completo de audit trail
 * Siguiendo el patrón de módulos complejos
 */

// 🎯 Types
export type * from "./types";

// 📋 Constants
export * from "./constants";

// 🔧 Utils
export * from "./utils";

// 🪝 Hooks
export * from "./hooks";

// 🎨 UI Components
export { AuditEventCard, AuditStats, AuditEventsList } from "./ui/components";

// 🖥️ UI Routes
export { AuditDashboard } from "./ui/routes";

// 🚀 Server Actions (for external use)
export {
  getAuditEventsAction,
  getAuditStatsAction,
  createAuditEventAction,
  logCreateAction,
  logUpdateAction,
  logDeleteAction,
  logUserActionAction,
} from "./server/actions";
