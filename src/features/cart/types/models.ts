/**
 * 🛒 CART MODELS & TYPES
 * ======================
 *
 * Core cart types aligned with Prisma schema.
 * Independent feature following Feature-First v3.0.0 architecture.
 *
 * @version 1.0.0 - Cart Feature
 */

import type { ProductForCustomer } from "@/features/storefront/types";

// 🛒 CORE CART MODELS
// ====================

/**
 * Cart entity - matches Prisma Cart model
 */
export interface Cart {
  id: string;
  sessionId?: string | null; // For guest users
  userId?: string | null; // For authenticated users

  // 📊 Calculated totals
  subtotal: number; // Items subtotal
  taxAmount: number; // Tax amount
  total: number; // Final total

  // 📅 Timestamps
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date; // Auto-cleanup expired carts

  // 🔗 Relations
  items: CartItem[];
}

/**
 * CartItem entity - matches Prisma CartItem model
 */
export interface CartItem {
  id: string;
  cartId: string;
  productId: string;
  quantity: number;

  // 💰 Price snapshot (frozen at add time)
  unitPrice: number;
  total: number;

  // 📅 Timestamps
  createdAt: Date;
  updatedAt: Date;
}

// 🔗 ENHANCED RELATIONS
// =====================

/**
 * CartItem with complete product data
 */
export interface CartItemWithProduct extends CartItem {
  product: ProductForCustomer;
}

/**
 * Cart with items and complete product data
 */
export interface CartWithItems extends Cart {
  items: CartItemWithProduct[];
}

// 🧮 CART CALCULATIONS
// ====================

/**
 * Cart summary calculations
 */
export interface CartSummary {
  itemCount: number; // Total items in cart
  uniqueItems: number; // Unique products in cart
  subtotal: number; // Pre-tax subtotal
  taxAmount: number; // Calculated tax
  shippingAmount: number; // Shipping cost (future)
  discountAmount: number; // Discounts applied (future)
  total: number; // Final total

  // 🎯 Quick stats
  heaviestItem?: CartItemWithProduct;
  mostExpensiveItem?: CartItemWithProduct;
}

/**
 * Price breakdown for display
 */
export interface CartPriceBreakdown {
  subtotal: {
    amount: number;
    formatted: string;
  };
  tax: {
    amount: number;
    rate: number; // Tax percentage
    formatted: string;
  };
  shipping: {
    amount: number;
    method?: string; // Future: shipping method
    formatted: string;
  };
  discounts: {
    amount: number;
    codes: string[]; // Future: applied coupon codes
    formatted: string;
  };
  total: {
    amount: number;
    formatted: string;
  };
}

// ⚡ CART OPERATIONS
// ==================

/**
 * Add to cart operation input
 */
export interface AddToCartInput {
  productId: string;
  quantity?: number; // Default: 1
  userId?: string; // For authenticated users
  sessionId?: string; // For guest users
}

/**
 * Update cart item operation input
 */
export interface UpdateCartItemInput {
  cartItemId: string;
  quantity: number;
  userId?: string;
  sessionId?: string;
}

/**
 * Remove from cart operation input
 */
export interface RemoveFromCartInput {
  cartItemId: string;
  userId?: string;
  sessionId?: string;
}

// 🎯 CART STATES
// ==============

/**
 * Cart loading states for UI
 */
export interface CartLoadingStates {
  isLoading: boolean; // General loading
  isAdding: boolean; // Adding item to cart
  isUpdating: boolean; // Updating item quantity
  isRemoving: boolean; // Removing item
  isSyncing: boolean; // Syncing with server
}

/**
 * Cart error states
 */
export interface CartErrorStates {
  generalError?: string;
  addError?: string;
  updateError?: string;
  removeError?: string;
  syncError?: string;
}

// 🔄 CART PERSISTENCE
// ===================

/**
 * Cart persistence configuration
 */
export interface CartPersistenceConfig {
  enableLocalStorage: boolean;
  enableServerSync: boolean;
  syncInterval: number; // ms
  maxRetries: number;
  retryDelay: number; // ms
}

/**
 * Local cart data for persistence
 */
export interface LocalCartData {
  items: CartItem[];
  lastUpdated: Date;
  sessionId?: string;
  userId?: string;
}

// 🚨 CART VALIDATION
// ==================

/**
 * Cart validation result
 */
export interface CartValidationResult {
  isValid: boolean;
  errors: CartValidationError[];
  warnings: CartValidationWarning[];
}

/**
 * Cart validation error
 */
export interface CartValidationError {
  type:
    | "OUT_OF_STOCK"
    | "INVALID_QUANTITY"
    | "PRODUCT_NOT_FOUND"
    | "EXPIRED_CART";
  productId?: string;
  cartItemId?: string;
  message: string;
  suggestedAction?: string;
}

/**
 * Cart validation warning
 */
export interface CartValidationWarning {
  type: "LOW_STOCK" | "PRICE_CHANGED" | "PRODUCT_INACTIVE";
  productId?: string;
  cartItemId?: string;
  message: string;
  oldValue?: number;
  newValue?: number;
}

// 📊 CART ANALYTICS (Future)
// ==========================

/**
 * Cart abandonment data
 */
export interface CartAbandonmentData {
  cartId: string;
  userId?: string;
  sessionId?: string;
  itemCount: number;
  totalValue: number;
  lastActivity: Date;
  daysSinceLastActivity: number;

  // Recovery suggestions
  recoveryEmails: number;
  isRecoverable: boolean;
}

// 🎁 CART PREFERENCES (Future)
// ============================

/**
 * User cart preferences
 */
export interface CartPreferences {
  userId: string;

  // Behavior preferences
  saveCartForLater: boolean;
  autoRemoveOldItems: boolean;
  maxItemsInCart: number;

  // Notification preferences
  notifyPriceChanges: boolean;
  notifyLowStock: boolean;
  notifyCartAbandonment: boolean;
}

export default {};


