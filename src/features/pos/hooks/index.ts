/**
 * 🎣 POS HOOKS - EXPORTS
 * ======================
 *
 * Barrel export para hooks del módulo POS.
 *
 * @module pos/hooks
 * @version 1.0.0
 */

// ========================================
// QUERY KEYS
// ========================================

export {
  posKeys,
  invalidateAllPOSQueries,
  invalidateSessionQueries,
  invalidateSaleQueries,
  invalidateTransactionQueries,
  invalidateDashboardQueries,
} from "./queryKeys";

// ========================================
// DATA HOOKS
// ========================================

export {
  usePOSData,
  useSearchProducts,
  useCategories,
  useActiveSession,
  useDailyStats,
  useRecentTransactions,
  useTopProducts,
  type UsePOSDataOptions,
} from "./usePOSData";

export { usePOSInvalidations } from "./usePOSInvalidations";

// ========================================
// TRANSACTION HOOKS
// ========================================

export {
  useTransactionDetails,
  useTransactionByNumber,
  useSessionTransactions,
  useVoidTransaction,
  useGenerateSalesReport,
  useTransactionManager,
  useTransactionSearch,
} from "./useTransactions";
