/**
 * 🔌 CART API TYPES
 * ==================
 *
 * Request/response types for Cart API operations.
 * Aligned with server actions and TanStack Query.
 *
 * @version 1.0.0 - Cart Feature
 */

import type {
  Cart,
  CartWithItems,
  CartItem,
  CartSummary,
  CartValidationResult,
  AddToCartInput,
  UpdateCartItemInput,
  RemoveFromCartInput,
} from "./models";

// 📤 API RESPONSE WRAPPER
// =======================

/**
 * Standard API response format (matches storefront pattern)
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message: string;
  error?: string;
  timestamp?: Date;
}

// 🛒 CART API OPERATIONS
// ======================

// GET CART
export interface GetCartRequest {
  userId?: string;
  sessionId?: string;
}

export interface GetCartResponse extends ApiResponse<CartWithItems> {
  data: CartWithItems;
}

// ADD TO CART
export interface AddToCartRequest extends AddToCartInput {}

export interface AddToCartResponse
  extends ApiResponse<{
    cart: CartWithItems;
    addedItem: CartItem;
    summary: CartSummary;
  }> {}

// UPDATE CART ITEM
export interface UpdateCartItemRequest extends UpdateCartItemInput {}

export interface UpdateCartItemResponse
  extends ApiResponse<{
    cart: CartWithItems;
    updatedItem: CartItem;
    summary: CartSummary;
  }> {}

// REMOVE FROM CART
export interface RemoveFromCartRequest extends RemoveFromCartInput {}

export interface RemoveFromCartResponse
  extends ApiResponse<{
    cart: CartWithItems;
    removedItemId: string;
    summary: CartSummary;
  }> {}

// CLEAR CART
export interface ClearCartRequest {
  userId?: string;
  sessionId?: string;
}

export interface ClearCartResponse
  extends ApiResponse<{
    cart: Cart;
    removedCount: number;
  }> {}

// VALIDATE CART
export interface ValidateCartRequest {
  cartId: string;
  userId?: string;
  sessionId?: string;
}

export interface ValidateCartResponse
  extends ApiResponse<CartValidationResult> {
  data: CartValidationResult;
}

// SYNC CART (Guest to User)
export interface SyncCartRequest {
  guestSessionId: string;
  userId: string;
  mergeStrategy: "replace" | "merge" | "keep_latest";
}

export interface SyncCartResponse
  extends ApiResponse<{
    cart: CartWithItems;
    mergedItems: number;
    replacedItems: number;
  }> {}

// 📊 CART ANALYTICS API (Future)
// ==============================

export interface CartAnalyticsRequest {
  userId?: string;
  sessionId?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

export interface CartAnalyticsResponse
  extends ApiResponse<{
    totalCarts: number;
    abandonedCarts: number;
    conversionRate: number;
    averageCartValue: number;
    topProducts: Array<{
      productId: string;
      productName: string;
      timesAdded: number;
    }>;
  }> {}

// 🔄 MUTATION INPUTS
// ==================

/**
 * TanStack Query mutation inputs
 */
export interface CartMutationVariables {
  addToCart: AddToCartRequest;
  updateCartItem: UpdateCartItemRequest;
  removeFromCart: RemoveFromCartRequest;
  clearCart: ClearCartRequest;
  syncCart: SyncCartRequest;
}

/**
 * TanStack Query mutation responses
 */
export interface CartMutationResponses {
  addToCart: AddToCartResponse;
  updateCartItem: UpdateCartItemResponse;
  removeFromCart: RemoveFromCartResponse;
  clearCart: ClearCartResponse;
  syncCart: SyncCartResponse;
}

// 🎯 QUERY KEYS
// =============

/**
 * TanStack Query keys for Cart
 */
export const CART_QUERY_KEYS = {
  all: ["cart"] as const,
  byUser: (userId: string) => ["cart", "user", userId] as const,
  bySession: (sessionId: string) => ["cart", "session", sessionId] as const,
  summary: (cartId: string) => ["cart", "summary", cartId] as const,
  validation: (cartId: string) => ["cart", "validation", cartId] as const,
  analytics: (userId?: string, sessionId?: string) =>
    ["cart", "analytics", { userId, sessionId }] as const,
} as const;

// 🚨 API ERROR TYPES
// ==================

/**
 * Cart-specific API errors
 */
export interface CartApiError {
  code:
    | "CART_NOT_FOUND"
    | "PRODUCT_NOT_FOUND"
    | "INSUFFICIENT_STOCK"
    | "INVALID_QUANTITY"
    | "CART_EXPIRED"
    | "UNAUTHORIZED"
    | "VALIDATION_ERROR"
    | "SYNC_CONFLICT"
    | "SERVER_ERROR";
  message: string;
  details?: Record<string, unknown>;
  productId?: string;
  cartItemId?: string;
  cartId?: string;
}

/**
 * Cart API error response
 */
export interface CartErrorResponse extends ApiResponse {
  success: false;
  error: string;
  details?: CartApiError;
}

// 🎨 UI OPTIMISTIC UPDATES
// ========================

/**
 * Optimistic update context for UI
 */
export interface OptimisticCartUpdate {
  type: "ADD" | "UPDATE" | "REMOVE" | "CLEAR";
  cartItemId?: string;
  productId?: string;
  quantity?: number;
  timestamp: Date;

  // For rollback on error
  previousState?: CartWithItems;
}

/**
 * Optimistic update result
 */
export interface OptimisticUpdateResult {
  cart: CartWithItems;
  update: OptimisticCartUpdate;
  isOptimistic: boolean;
}

export default {};


