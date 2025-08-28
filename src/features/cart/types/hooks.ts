/**
 * 🪝 CART HOOKS TYPES
 * ===================
 *
 * TypeScript types for Cart hooks parameters and return values.
 * Following Feature-First v3.0.0 hook patterns.
 *
 * @version 1.0.0 - Cart Feature
 */

import type {
  Cart,
  CartWithItems,
  CartItem,
  CartItemWithProduct,
  CartSummary,
  CartPriceBreakdown,
  CartLoadingStates,
  CartErrorStates,
  CartValidationResult,
  CartPersistenceConfig,
  AddToCartInput,
  UpdateCartItemInput,
  RemoveFromCartInput,
} from "./models";

import type { OptimisticCartUpdate, OptimisticUpdateResult } from "./api";

// 🔄 CART STATE HOOK
// ==================

/**
 * useCartState hook parameters
 */
export interface UseCartStateProps {
  userId?: string;
  sessionId?: string;

  // Animation settings
  enableAnimations?: boolean;
  animationDuration?: number;

  // Persistence settings
  persistenceConfig?: Partial<CartPersistenceConfig>;
}

/**
 * Cart state managed by reducer
 */
export interface CartState {
  // Core data
  cart: CartWithItems | null;
  summary: CartSummary | null;

  // UI states
  loading: CartLoadingStates;
  errors: CartErrorStates;

  // Optimistic updates
  optimisticUpdates: OptimisticCartUpdate[];

  // Animation states
  isFirstRender: boolean;
  animatingItems: string[]; // Cart item IDs being animated
  lastAction?: {
    type: "ADD" | "UPDATE" | "REMOVE";
    itemId?: string;
    timestamp: Date;
  };

  // Persistence
  lastSynced?: Date;
  hasPendingChanges: boolean;
}

/**
 * Cart reducer actions
 */
export type CartStateAction =
  | { type: "SET_CART"; payload: CartWithItems }
  | { type: "SET_LOADING"; payload: Partial<CartLoadingStates> }
  | { type: "SET_ERROR"; payload: Partial<CartErrorStates> }
  | { type: "ADD_OPTIMISTIC_UPDATE"; payload: OptimisticCartUpdate }
  | { type: "REMOVE_OPTIMISTIC_UPDATE"; payload: string }
  | { type: "CLEAR_OPTIMISTIC_UPDATES" }
  | { type: "START_ANIMATION"; payload: string }
  | { type: "END_ANIMATION"; payload: string }
  | { type: "SET_FIRST_RENDER"; payload: boolean }
  | { type: "SET_LAST_ACTION"; payload: CartState["lastAction"] }
  | { type: "SET_LAST_SYNCED"; payload: Date }
  | { type: "SET_PENDING_CHANGES"; payload: boolean }
  | { type: "RESET_STATE" };

/**
 * useCartState hook return value
 */
export interface UseCartStateReturn {
  // State
  state: CartState;

  // Dispatch
  dispatch: React.Dispatch<CartStateAction>;

  // Computed values
  isEmpty: boolean;
  itemCount: number;
  uniqueItemCount: number;
  totalAmount: number;

  // Quick accessors
  isLoading: boolean;
  hasErrors: boolean;
  isOptimistic: boolean;
}

// 🧠 CART LOGIC HOOK
// ==================

/**
 * useCartLogic hook parameters
 */
export interface UseCartLogicProps {
  cart: CartWithItems | null;

  // Calculation settings
  taxRate?: number;
  shippingCalculator?: (cart: CartWithItems) => Promise<number>;
  discountCalculator?: (cart: CartWithItems) => Promise<number>;

  // Formatting settings
  currency?: string;
  locale?: string;
}

/**
 * useCartLogic hook return value
 */
export interface UseCartLogicReturn {
  // Calculations
  summary: CartSummary;
  priceBreakdown: CartPriceBreakdown;

  // Validations
  validateCart: () => Promise<CartValidationResult>;
  validateItem: (cartItem: CartItemWithProduct) => CartValidationResult;
  isValidQuantity: (quantity: number, maxStock: number) => boolean;

  // Formatters
  formatPrice: (amount: number) => string;
  formatQuantity: (quantity: number, unit: string) => string;

  // Item finders
  findItem: (productId: string) => CartItemWithProduct | undefined;
  findItemIndex: (productId: string) => number;
  getItemQuantity: (productId: string) => number;

  // Comparisons
  hasChanged: (previousCart: CartWithItems | null) => boolean;
  getItemChanges: (previousCart: CartWithItems | null) => {
    added: CartItemWithProduct[];
    updated: CartItemWithProduct[];
    removed: CartItemWithProduct[];
  };
}

// ⚡ CART ACTIONS HOOK
// ===================

/**
 * useCartActions hook parameters
 */
export interface UseCartActionsProps {
  userId?: string;
  sessionId?: string;

  // Callbacks
  onCartChange?: (cart: CartWithItems) => void;
  onItemAdded?: (item: CartItemWithProduct) => void;
  onItemUpdated?: (item: CartItemWithProduct) => void;
  onItemRemoved?: (itemId: string) => void;
  onError?: (error: string) => void;

  // Optimistic updates
  enableOptimisticUpdates?: boolean;
}

/**
 * useCartActions hook return value
 */
export interface UseCartActionsReturn {
  // Primary actions
  addToCart: (
    input: Omit<AddToCartInput, "userId" | "sessionId">
  ) => Promise<boolean>;
  updateCartItem: (
    input: Omit<UpdateCartItemInput, "userId" | "sessionId">
  ) => Promise<boolean>;
  removeFromCart: (
    input: Omit<RemoveFromCartInput, "userId" | "sessionId">
  ) => Promise<boolean>;
  clearCart: () => Promise<boolean>;

  // Convenience actions
  incrementItem: (productId: string) => Promise<boolean>;
  decrementItem: (productId: string) => Promise<boolean>;
  setItemQuantity: (productId: string, quantity: number) => Promise<boolean>;
  removeItem: (productId: string) => Promise<boolean>;

  // Bulk actions
  addMultipleItems: (
    items: Omit<AddToCartInput, "userId" | "sessionId">[]
  ) => Promise<boolean>;
  updateMultipleItems: (
    updates: { productId: string; quantity: number }[]
  ) => Promise<boolean>;

  // Cart management
  validateAndFixCart: () => Promise<CartValidationResult>;
  syncCart: () => Promise<boolean>;
  refreshCart: () => Promise<void>;

  // Guest/User transitions
  migrateGuestCart: (newUserId: string) => Promise<boolean>;

  // States
  isProcessing: boolean;
  lastAction?: {
    type: string;
    timestamp: Date;
    success: boolean;
  };
}

// 💾 CART PERSISTENCE HOOK
// ========================

/**
 * useCartPersistence hook parameters
 */
export interface UseCartPersistenceProps {
  cart: CartWithItems | null;
  userId?: string;
  sessionId?: string;
  config?: CartPersistenceConfig;
}

/**
 * useCartPersistence hook return value
 */
export interface UseCartPersistenceReturn {
  // Persistence status
  isSynced: boolean;
  hasPendingChanges: boolean;
  lastSyncTime?: Date;

  // Manual controls
  saveToLocal: () => void;
  loadFromLocal: () => CartWithItems | null;
  syncToServer: () => Promise<boolean>;
  clearLocal: () => void;

  // Automatic sync
  enableAutoSync: () => void;
  disableAutoSync: () => void;

  // Conflict resolution
  resolveConflicts: (
    serverCart: CartWithItems,
    localCart: CartWithItems
  ) => CartWithItems;
}

// 🔧 CART CALCULATIONS HOOK
// =========================

/**
 * useCartCalculations hook parameters
 */
export interface UseCartCalculationsProps {
  cart: CartWithItems | null;
  taxRate?: number;
  shippingRate?: number;
  discountCodes?: string[];
}

/**
 * useCartCalculations hook return value
 */
export interface UseCartCalculationsReturn {
  // Totals
  subtotal: number;
  taxAmount: number;
  shippingAmount: number;
  discountAmount: number;
  total: number;

  // Formatted
  formattedSubtotal: string;
  formattedTaxAmount: string;
  formattedShippingAmount: string;
  formattedDiscountAmount: string;
  formattedTotal: string;

  // Calculations
  calculateTax: (amount: number) => number;
  calculateShipping: () => Promise<number>;
  calculateDiscount: () => Promise<number>;

  // Breakdown
  getDetailedBreakdown: () => CartPriceBreakdown;
}

// 🎯 CART INTEGRATION TYPES
// =========================

/**
 * Cart context provider props
 */
export interface CartProviderProps {
  children: React.ReactNode;
  userId?: string;
  sessionId?: string;
  config?: {
    enablePersistence?: boolean;
    enableOptimisticUpdates?: boolean;
    enableAnimations?: boolean;
    taxRate?: number;
    currency?: string;
    locale?: string;
  };
}

/**
 * Cart context value
 */
export interface CartContextValue {
  // State
  cart: CartWithItems | null;
  summary: CartSummary | null;
  loading: CartLoadingStates;
  errors: CartErrorStates;

  // Actions (simplified interface)
  addToCart: (productId: string, quantity?: number) => Promise<boolean>;
  updateItem: (productId: string, quantity: number) => Promise<boolean>;
  removeItem: (productId: string) => Promise<boolean>;
  clearCart: () => Promise<boolean>;

  // Utilities
  getItemQuantity: (productId: string) => number;
  hasItem: (productId: string) => boolean;
  formatPrice: (amount: number) => string;

  // Status
  isEmpty: boolean;
  itemCount: number;
  totalAmount: number;
  isProcessing: boolean;
}

export default {};


