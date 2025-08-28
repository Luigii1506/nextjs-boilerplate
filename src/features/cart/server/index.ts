/**
 * 🛒 CART SERVER - BARREL EXPORTS
 * ===============================
 *
 * Server layer exports for Cart feature.
 * Following Feature-First v3.0.0 barrel export pattern.
 *
 * @version 1.0.0 - Cart Feature
 */

// 🎬 Server Actions (Next.js 15)
export {
  getCartAction,
  addToCartAction,
  updateCartItemAction,
  removeFromCartAction,
  clearCartAction,
  validateCartAction,
  syncGuestCartToUserAction,
  cleanupExpiredCartsAction,
  incrementCartItemAction,
  decrementCartItemAction,
} from "./actions";

// 🏢 Business Services
export {
  getCartService,
  addToCartService,
  updateCartItemService,
  removeFromCartService,
  clearCartService,
  validateCartService,
  syncGuestCartToUserService,
  cleanupExpiredCartsService,
} from "./service";

// 📤 Database Queries
export {
  getCartQuery,
  addToCartQuery,
  updateCartItemQuery,
  removeFromCartQuery,
  clearCartQuery,
  cleanupExpiredCartsQuery,
} from "./queries";

// 🔄 Data Mappers
export {
  mapRawCartToCart,
  mapRawCartToCartWithItems,
  mapRawCartItemToCartItem,
  mapRawCartItemToCartItemWithProduct,
  generateCartSummary,
  mapRawCartsToCartsArray,
  mapRawCartsToCartsWithItemsArray,
  cartToApiResponse,
} from "./mappers";

// ✅ Validators
export {
  CartValidationError,
  CartAccessError,
  addToCartSchema,
  updateCartItemSchema,
  removeFromCartSchema,
  getCartSchema,
  syncCartSchema,
  validateCartAccess,
  validateCartOwnership,
  validateCartItemInput,
  validateUpdateCartItemInput,
  validateRemoveFromCartInput,
  sessionToPermissionUser,
  sanitizeCartInput,
  isCartExpired,
  generateCartExpiryDate,
  hasValidationErrors,
  hasValidationWarnings,
  getValidationSummaryMessage,
} from "./validators";

// 🏷️ Raw Query Result Types (for advanced usage)
export type { RawCartQueryResult, RawCartItemQueryResult } from "./queries";

export default {};


