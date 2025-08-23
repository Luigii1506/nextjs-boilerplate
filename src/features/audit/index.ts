/**
 * ⚡ AUDIT TRAIL MODULE - TANSTACK QUERY OPTIMIZED
 * ===============================================
 *
 * Módulo completo de audit trail súper optimizado con TanStack Query.
 * Performance enterprise, cache inteligente, zero legacy code.
 *
 * Enterprise: 2025-01-17 - Zero legacy code, TanStack Query only
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

// 🖥️ UI Routes (TanStack Query Optimized only)
export { AuditDashboard } from "./ui/routes";

// 🚀 Server Actions (used by TanStack Query)
export {
  getAuditEventsAction,
  getAuditStatsAction,
  createAuditEventAction,
  exportAuditEventsAction,
  getAuditEventAction,
} from "./server/actions";
