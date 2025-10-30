/**
 * 🛍️ POS SALE SUB-FEATURE - EXPORTS
 * ==================================
 *
 * Barrel export para el sub-feature de venta POS.
 * Similar al patrón de cart/ en storefront.
 *
 * @module pos/sale
 * @version 1.0.0
 */

// ========================================
// TYPES
// ========================================

export type {
  POSSaleItem,
  POSSaleItemWithProduct,
  POSSaleSummary,
  POSSaleAdjustment,
  POSSaleState,
} from "./types";

// ========================================
// SERVER ACTIONS
// ========================================

export {
  getActiveSaleAction,
  addToSaleAction,
  updateSaleQuantityAction,
  removeFromSaleAction,
  clearSaleAction,
  applyDiscountAction,
  validateSaleForCheckoutAction,
} from "./server/actions";

// ========================================
// NOTE: Server queries and service are internal
// Use server actions instead for client-side operations
// Direct imports only for server-side usage:
// - import { ... } from "./server/queries"
// - import { ... } from "./server/service"
// ========================================
