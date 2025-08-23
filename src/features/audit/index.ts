/**
 * ⚡ AUDIT TRAIL MODULE - TANSTACK OPTIMIZED
 * =========================================
 *
 * Módulo completo de audit trail súper optimizado con TanStack Query.
 * Performance enterprise, cache inteligente, backward compatibility.
 *
 * Enterprise: 2025-01-17 - TanStack Query optimization
 */

// 🎯 Types
export type * from "./types";

// 📋 Constants
export * from "./constants";

// 🔧 Utils
export * from "./utils";

// ⚡ Optimized Hooks (TanStack Query)
export * from "./hooks";

// 🎨 UI Components
export { AuditEventCard, AuditStats, AuditEventsList } from "./ui/components";

// 🖥️ UI Routes (TanStack Query Optimized)
export { AuditDashboard, AuditDashboardLegacy } from "./ui/routes";

// 🚀 Server Actions (used by TanStack Query)
export {
  getAuditEventsAction,
  getAuditStatsAction,
  createAuditEventAction,
  exportAuditEventsAction,
  getAuditEventAction,
} from "./server/actions";
