/**
 * 🛒 CART STATE HOOK
 * ==================
 *
 * Hook para manejo de estado local del Cart con reducer pattern.
 * Feature-First v3.0.0: Estado + Reducer + Animations
 *
 * @version 1.0.0 - Cart Feature
 */

"use client";

import { useReducer, useEffect, useCallback, useMemo } from "react";
import type {
  CartState,
  CartStateAction,
  UseCartStateProps,
  UseCartStateReturn,
  CartWithItems,
  CartSummary,
  CartLoadingStates,
  CartErrorStates,
  OptimisticCartUpdate,
} from "../../types";

// 🔄 CART STATE REDUCER
// =====================

/**
 * Cart state reducer - maneja todas las transiciones de estado
 */
function cartStateReducer(
  state: CartState,
  action: CartStateAction
): CartState {
  switch (action.type) {
    case "SET_CART":
      return {
        ...state,
        cart: action.payload,
        summary: generateQuickSummary(action.payload),
      };

    case "SET_LOADING":
      return {
        ...state,
        loading: { ...state.loading, ...action.payload },
      };

    case "SET_ERROR":
      return {
        ...state,
        errors: { ...state.errors, ...action.payload },
      };

    case "ADD_OPTIMISTIC_UPDATE":
      return {
        ...state,
        optimisticUpdates: [...state.optimisticUpdates, action.payload],
        hasPendingChanges: true,
      };

    case "REMOVE_OPTIMISTIC_UPDATE":
      return {
        ...state,
        optimisticUpdates: state.optimisticUpdates.filter(
          (update) => update.timestamp.getTime() !== parseFloat(action.payload)
        ),
        hasPendingChanges: state.optimisticUpdates.length > 1,
      };

    case "CLEAR_OPTIMISTIC_UPDATES":
      return {
        ...state,
        optimisticUpdates: [],
        hasPendingChanges: false,
      };

    case "START_ANIMATION":
      return {
        ...state,
        animatingItems: [...state.animatingItems, action.payload],
      };

    case "END_ANIMATION":
      return {
        ...state,
        animatingItems: state.animatingItems.filter(
          (itemId) => itemId !== action.payload
        ),
      };

    case "SET_FIRST_RENDER":
      return {
        ...state,
        isFirstRender: action.payload,
      };

    case "SET_LAST_ACTION":
      return {
        ...state,
        lastAction: action.payload,
      };

    case "SET_LAST_SYNCED":
      return {
        ...state,
        lastSynced: action.payload,
        hasPendingChanges: false,
      };

    case "SET_PENDING_CHANGES":
      return {
        ...state,
        hasPendingChanges: action.payload,
      };

    case "RESET_STATE":
      return createInitialCartState();

    default:
      console.warn(
        "🛒 [CART STATE] Unknown action type:",
        (action as any).type
      );
      return state;
  }
}

/**
 * Crear estado inicial del cart
 */
function createInitialCartState(): CartState {
  return {
    cart: null,
    summary: null,

    // UI states
    loading: {
      isLoading: false,
      isAdding: false,
      isUpdating: false,
      isRemoving: false,
      isSyncing: false,
    },
    errors: {
      generalError: undefined,
      addError: undefined,
      updateError: undefined,
      removeError: undefined,
      syncError: undefined,
    },

    // Optimistic updates
    optimisticUpdates: [],

    // Animation states
    isFirstRender: true,
    animatingItems: [],
    lastAction: undefined,

    // Persistence
    lastSynced: undefined,
    hasPendingChanges: false,
  };
}

/**
 * Generar summary rápido del cart (sin cálculos complejos)
 */
function generateQuickSummary(cart: CartWithItems | null): CartSummary | null {
  if (!cart || !cart.items || cart.items.length === 0) {
    return null;
  }

  return {
    itemCount: cart.items.reduce((sum, item) => sum + item.quantity, 0),
    uniqueItems: cart.items.length,
    subtotal: cart.subtotal,
    taxAmount: cart.taxAmount,
    shippingAmount: 0, // TODO: Implement shipping
    discountAmount: 0, // TODO: Implement discounts
    total: cart.total,

    // Quick stats
    heaviestItem:
      cart.items.length > 0
        ? cart.items.reduce((heaviest, current) =>
            current.quantity > heaviest.quantity ? current : heaviest
          )
        : undefined,

    mostExpensiveItem:
      cart.items.length > 0
        ? cart.items.reduce((expensive, current) =>
            current.total > expensive.total ? current : expensive
          )
        : undefined,
  };
}

// 🪝 MAIN HOOK
// ============

/**
 * useCartState - Hook principal para estado del cart
 */
export function useCartState(props?: UseCartStateProps): UseCartStateReturn {
  const {
    userId,
    sessionId,
    enableAnimations = true,
    animationDuration = 300,
    persistenceConfig,
  } = props || {};

  // Initialize state with reducer
  const [state, dispatch] = useReducer(
    cartStateReducer,
    createInitialCartState()
  );

  // 🎬 ANIMATION MANAGEMENT
  // =======================

  /**
   * Start item animation
   */
  const startAnimation = useCallback(
    (itemId: string) => {
      if (!enableAnimations) return;

      dispatch({ type: "START_ANIMATION", payload: itemId });

      // Auto-end animation after duration
      setTimeout(() => {
        dispatch({ type: "END_ANIMATION", payload: itemId });
      }, animationDuration);
    },
    [enableAnimations, animationDuration]
  );

  /**
   * Handle first render animation setup
   */
  useEffect(() => {
    if (state.isFirstRender && state.cart) {
      // Set first render to false after initial render
      const timer = setTimeout(() => {
        dispatch({ type: "SET_FIRST_RENDER", payload: false });
      }, 50);

      return () => clearTimeout(timer);
    }
  }, [state.isFirstRender, state.cart]);

  // 🧮 COMPUTED VALUES
  // ==================

  const isEmpty = !state.cart || state.cart.items.length === 0;
  const itemCount = state.summary?.itemCount || 0;
  const uniqueItemCount = state.summary?.uniqueItems || 0;
  const totalAmount = state.summary?.total || 0;

  // Quick accessors
  const isLoading = Object.values(state.loading).some(Boolean);
  const hasErrors = Object.values(state.errors).some(Boolean);
  const isOptimistic = state.optimisticUpdates.length > 0;

  // 📊 DEBUG LOGGING
  // ================

  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.log("🛒 [CART STATE] State updated:", {
        hasCart: !!state.cart,
        itemCount,
        uniqueItemCount,
        totalAmount,
        isLoading,
        hasErrors,
        isOptimistic,
        optimisticUpdatesCount: state.optimisticUpdates.length,
        animatingItemsCount: state.animatingItems.length,
        isFirstRender: state.isFirstRender,
        hasPendingChanges: state.hasPendingChanges,
      });
    }
  }, [
    state.cart,
    itemCount,
    uniqueItemCount,
    totalAmount,
    isLoading,
    hasErrors,
    isOptimistic,
    state.optimisticUpdates.length,
    state.animatingItems.length,
    state.isFirstRender,
    state.hasPendingChanges,
  ]);

  // 📤 RETURN INTERFACE
  // ===================

  return useMemo(
    () => ({
      // State
      state,

      // Dispatch
      dispatch,

      // Computed values
      isEmpty,
      itemCount,
      uniqueItemCount,
      totalAmount,

      // Quick accessors
      isLoading,
      hasErrors,
      isOptimistic,

      // Animation helpers
      startAnimation,
    }),
    [
      state,
      dispatch,
      isEmpty,
      itemCount,
      uniqueItemCount,
      totalAmount,
      isLoading,
      hasErrors,
      isOptimistic,
      startAnimation,
    ]
  );
}

// 🛠️ UTILITY FUNCTIONS
// ====================

/**
 * Create optimistic cart update
 */
export function createOptimisticUpdate(
  type: OptimisticCartUpdate["type"],
  options: {
    cartItemId?: string;
    productId?: string;
    quantity?: number;
    previousState?: CartWithItems;
  }
): OptimisticCartUpdate {
  return {
    type,
    cartItemId: options.cartItemId,
    productId: options.productId,
    quantity: options.quantity,
    timestamp: new Date(),
    previousState: options.previousState,
  };
}

/**
 * Check if item is currently animating
 */
export function useIsItemAnimating(
  itemId: string,
  animatingItems: string[]
): boolean {
  return animatingItems.includes(itemId);
}

export default useCartState;
