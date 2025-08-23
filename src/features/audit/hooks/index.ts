/**
 * ⚡ AUDIT TRAIL HOOKS - TANSTACK OPTIMIZED EXPORTS
 * ================================================
 *
 * Hooks optimizados con TanStack Query para performance enterprise.
 * Incluye backward compatibility y hooks avanzados.
 *
 * Enterprise: 2025-01-17 - TanStack Query optimization
 */

// ⚡ TanStack Query Optimized Hooks
export { useAuditQuery, auditQueryUtils } from "./useAuditQuery";
export { useAuditDashboard } from "./useAuditDashboard";

// 🔄 Compatibility Hooks (maintains original API with TanStack Query internally)
export {
  useAuditTrail,
  useAuditStats,
  useAuditFilters,
} from "./useAuditCompatibility";

// 🎯 Legacy/Specialized Hooks (still available)
export { useAuditCapture } from "./useAuditCapture";
