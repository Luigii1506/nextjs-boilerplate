/**
 * 🔐 POS SESSION SUB-FEATURE - EXPORTS
 * =====================================
 *
 * Barrel export para el sub-feature de sesión POS.
 * Gestión de apertura/cierre de caja.
 *
 * @module pos/session
 * @version 1.0.0
 */

// ========================================
// SERVER ACTIONS
// ========================================

export {
  getActiveSessionAction,
  getSessionAction,
  getSessionWithSummaryAction,
  openSessionAction,
  closeSessionAction,
  suspendSessionAction,
  resumeSessionAction,
  getSessionHistoryAction,
  getSessionTransactionsAction,
} from "./server/actions";

// ========================================
// NOTE: Server queries are internal
// Use server actions instead for client-side operations
// Direct imports only for server-side usage:
// - import { ... } from "./server/queries"
// ========================================
