/**
 * 📋 CART TYPES - MAIN EXPORTS
 * =============================
 *
 * Central export point for all Cart feature types.
 * Following Feature-First v3.0.0 barrel export pattern.
 *
 * @version 1.0.0 - Cart Feature
 */

// 🛒 Core Models
export type {
  Cart,
  CartItem,
  CartItemWithProduct,
  CartWithItems,
  CartSummary,
  CartPriceBreakdown,
  AddToCartInput,
  UpdateCartItemInput,
  RemoveFromCartInput,
  CartLoadingStates,
  CartErrorStates,
  CartValidationResult,
  CartValidationError,
  CartValidationWarning,
  CartPersistenceConfig,
  LocalCartData,
  CartAbandonmentData,
  CartPreferences,
} from "./models";

// 🔌 API Types
export type {
  ApiResponse,
  GetCartRequest,
  GetCartResponse,
  AddToCartRequest,
  AddToCartResponse,
  UpdateCartItemRequest,
  UpdateCartItemResponse,
  RemoveFromCartRequest,
  RemoveFromCartResponse,
  ClearCartRequest,
  ClearCartResponse,
  ValidateCartRequest,
  ValidateCartResponse,
  SyncCartRequest,
  SyncCartResponse,
  CartAnalyticsRequest,
  CartAnalyticsResponse,
  CartMutationVariables,
  CartMutationResponses,
  CartApiError,
  CartErrorResponse,
  OptimisticCartUpdate,
  OptimisticUpdateResult,
} from "./api";

// 🪝 Hook Types
export type {
  UseCartStateProps,
  CartState,
  CartStateAction,
  UseCartStateReturn,
  UseCartLogicProps,
  UseCartLogicReturn,
  UseCartActionsProps,
  UseCartActionsReturn,
  UseCartPersistenceProps,
  UseCartPersistenceReturn,
  UseCartCalculationsProps,
  UseCartCalculationsReturn,
} from "./hooks";

// 🎯 Query Keys (re-export for convenience)
export { CART_QUERY_KEYS } from "./api";

// 🏷️ TYPE GUARDS
// ================

/**
 * Type guard for Cart with items
 */
export function isCartWithItems(
  cart: Cart | CartWithItems
): cart is CartWithItems {
  return cart.items.length > 0 && "product" in cart.items[0];
}

/**
 * Type guard for CartItem with product
 */
export function isCartItemWithProduct(
  item: CartItem | CartItemWithProduct
): item is CartItemWithProduct {
  return "product" in item;
}

/**
 * Type guard for API error response
 */
export function isCartErrorResponse(
  response: any
): response is CartErrorResponse {
  return (
    response &&
    typeof response === "object" &&
    response.success === false &&
    "error" in response
  );
}

// 🎨 UTILITY TYPES
// =================

/**
 * Partial cart for optimistic updates
 */
export type PartialCart = Partial<CartWithItems> & {
  id: string;
  items: CartItemWithProduct[];
};

/**
 * Cart item input for forms
 */
export type CartItemInput = Pick<CartItem, "productId" | "quantity">;

/**
 * Cart item update input
 */
export type CartItemUpdateInput = Pick<CartItem, "id" | "quantity">;

/**
 * Cart summary display
 */
export type CartSummaryDisplay = Pick<
  CartSummary,
  "itemCount" | "subtotal" | "taxAmount" | "total"
> & {
  formattedSubtotal: string;
  formattedTaxAmount: string;
  formattedTotal: string;
};

// 🎯 COMMON PATTERNS
// ==================

/**
 * Cart operation result
 */
export interface CartOperationResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  validationResult?: CartValidationResult;
}

/**
 * Cart mutation result
 */
export type CartMutationResult<T = CartWithItems> = CartOperationResult<T>;

/**
 * Cart query result
 */
export interface CartQueryResult {
  cart: CartWithItems | null;
  isLoading: boolean;
  error: string | null;
  isError: boolean;
  refetch: () => void;
}

export default {};

