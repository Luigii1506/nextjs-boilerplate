/**
 * 🌍 CART CONTEXT
 * ================
 *
 * Global state context for Cart feature.
 * Manages cart state across the entire application.
 * Following Feature-First v3.0.0 patterns.
 *
 * @version 1.0.0 - Cart Feature
 */

"use client";

import React, {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useState,
  useMemo,
} from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/shared/hooks/useAuth";
import { useCartState, useCartLogic, useCartActions } from "../hooks";
import { getCartAction } from "../server";
import type {
  CartProviderProps,
  CartContextValue,
  CartWithItems,
  CartSummary,
  CartLoadingStates,
  CartErrorStates,
} from "../types";

// 🌍 CONTEXT CREATION
// ===================

const CartContext = createContext<CartContextValue | undefined>(undefined);

/**
 * Hook to access cart context - throws if used outside provider
 */
export function useCartContext(): CartContextValue {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error(
      "useCartContext must be used within a CartProvider. " +
        "Make sure your component is wrapped in <CartProvider>."
    );
  }
  return context;
}

// 🎯 QUERY KEYS
// =============

// Import the canonical CART_QUERY_KEYS from types
import { CART_QUERY_KEYS } from "../types/api";

// 🎁 PROVIDER COMPONENT
// =====================

/**
 * CartProvider - Provides cart context to all children
 */
export function CartProvider({ children, ...config }: CartProviderProps) {
  const {
    userId: propUserId,
    sessionId: propSessionId,
    config: {
      enablePersistence = true,
      enableOptimisticUpdates = true,
      enableAnimations = true,
      taxRate = 0.0875,
      currency = "USD",
      locale = "en-US",
    } = {},
  } = config;

  // 🔐 AUTH STATE
  const { isAuthenticated, user, isLoading: isAuthLoading } = useAuth();
  const userId = propUserId || user?.id;

  // 🎬 GENERATE SESSION ID - SINGLE SOURCE OF TRUTH
  const [guestSessionId, setGuestSessionId] = useState<string>();

  useEffect(() => {
    if (!userId && typeof window !== "undefined") {
      let currentSessionId = window.sessionStorage.getItem("cart-session-id");
      if (!currentSessionId) {
        currentSessionId = generateSessionId();
        window.sessionStorage.setItem("cart-session-id", currentSessionId);
        console.log(
          "🆔 [CART CONTEXT] Generated new sessionId:",
          currentSessionId
        );
      } else {
        console.log(
          "🆔 [CART CONTEXT] Using existing sessionId:",
          currentSessionId
        );
      }
      setGuestSessionId(currentSessionId);
    }
  }, [userId]);

  const effectiveSessionId = propSessionId || guestSessionId;

  console.log("🌍 [CART CONTEXT] Provider initialized:", {
    isAuthenticated,
    userId,
    hasSessionId: !!effectiveSessionId,
    isAuthLoading,
    enableOptimisticUpdates,
  });

  // 🪝 CART HOOKS
  // =============

  const cartState = useCartState({
    userId,
    sessionId: effectiveSessionId,
    enableAnimations,
    persistenceConfig: {
      enableLocalStorage: enablePersistence,
      enableServerSync: true,
      syncInterval: 30000, // 30s
      maxRetries: 3,
      retryDelay: 1000,
    },
  });

  const cartLogic = useCartLogic({
    cart: cartState.state.cart,
    taxRate,
    currency,
    locale,
  });

  // 🔍 DEBUG: Check values being passed to useCartActions
  console.log("🔧 [CART CONTEXT] Passing to useCartActions:", {
    userId,
    sessionId: effectiveSessionId,
    hasUserId: !!userId,
    hasSessionId: !!effectiveSessionId,
    userIdType: typeof userId,
    sessionIdType: typeof effectiveSessionId,
  });

  const cartActions = useCartActions({
    userId,
    sessionId: effectiveSessionId,
    enableOptimisticUpdates,
    onCartChange: useCallback(
      (cart: CartWithItems) => {
        cartState.dispatch({ type: "SET_CART", payload: cart });
        console.log("🔄 [CART CONTEXT] Cart updated:", {
          itemsCount: cart.items.length,
          total: cart.total,
        });
      },
      [] // ✅ dispatch is stable, no dependency needed
    ),
    onItemAdded: useCallback(
      (item: any) => {
        if (enableAnimations && item.productId && cartState.startAnimation) {
          cartState.startAnimation(item.productId);
        }
        console.log("➕ [CART CONTEXT] Item added:", item.product?.name);
      },
      [enableAnimations, cartState.startAnimation] // ✅ startAnimation is stable from useCallback
    ),
    onItemUpdated: useCallback(
      (item: any) => {
        if (enableAnimations && item.productId && cartState.startAnimation) {
          cartState.startAnimation(item.productId);
        }
        console.log("🔄 [CART CONTEXT] Item updated:", item.product?.name);
      },
      [enableAnimations, cartState.startAnimation] // ✅ startAnimation is stable from useCallback
    ),
    onItemRemoved: useCallback((itemId: string) => {
      console.log("🗑️ [CART CONTEXT] Item removed:", itemId);
    }, []),
    onError: useCallback(
      (error: string) => {
        cartState.dispatch({
          type: "SET_ERROR",
          payload: { generalError: error },
        });
        console.error("❌ [CART CONTEXT] Error:", error);
      },
      [cartState.dispatch] // ✅ dispatch reference is stable but needed for access
    ),
  });

  // 📤 CART DATA QUERY
  // ==================

  const cartQuery = useQuery({
    queryKey: CART_QUERY_KEYS.current(userId, effectiveSessionId),
    queryFn: async () => {
      console.log("📤 [CART CONTEXT] Fetching cart data:", {
        userId,
        sessionId: effectiveSessionId,
      });

      const result = await getCartAction({
        userId,
        sessionId: effectiveSessionId,
      });

      if (result.success && result.data) {
        return result.data;
      }

      throw new Error(result.message || "Failed to fetch cart");
    },
    enabled: !isAuthLoading && (!!userId || !!effectiveSessionId),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
    retry: 2,
    refetchOnWindowFocus: false, // ✅ Prevent excessive refetches
    refetchOnMount: false, // ✅ Only fetch once on mount
  });

  // 🔄 SYNC CART DATA WITH STATE
  // ============================

  useEffect(() => {
    if (cartQuery.data && !cartQuery.isLoading) {
      console.log("✅ [CART CONTEXT] Cart data synced:", {
        itemsCount: cartQuery.data.items.length,
        total: cartQuery.data.total,
      });

      cartState.dispatch({ type: "SET_CART", payload: cartQuery.data });
      cartState.dispatch({
        type: "SET_LOADING",
        payload: { isLoading: false },
      });
    }
  }, [cartQuery.data, cartQuery.isLoading]); // ✅ dispatch is stable, no dependency needed

  // Handle loading state
  useEffect(() => {
    cartState.dispatch({
      type: "SET_LOADING",
      payload: { isLoading: cartQuery.isLoading },
    });
  }, [cartQuery.isLoading]); // ✅ dispatch is stable, no dependency needed

  // Handle error state
  useEffect(() => {
    if (cartQuery.error) {
      cartState.dispatch({
        type: "SET_ERROR",
        payload: {
          generalError: cartQuery.error.message,
        },
      });
    }
  }, [cartQuery.error?.message]); // ✅ dispatch is stable, no dependency needed

  // 🔄 GUEST CART MIGRATION
  // =======================

  const [hasMigrated, setHasMigrated] = useState(false);

  // Reset migration flag when user logs out
  useEffect(() => {
    if (!isAuthenticated) {
      setHasMigrated(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    // When user logs in and we have a guest session, migrate cart
    if (
      isAuthenticated &&
      userId &&
      effectiveSessionId &&
      !isAuthLoading &&
      !hasMigrated
    ) {
      const hasGuestCart = effectiveSessionId !== userId;

      if (hasGuestCart) {
        console.log("🔄 [CART CONTEXT] User logged in, migrating guest cart");
        setHasMigrated(true); // Prevent multiple migrations

        cartActions.migrateGuestCart(userId).then((success) => {
          if (success) {
            console.log("✅ [CART CONTEXT] Guest cart migrated successfully");
            // Clear guest session
            if (typeof window !== "undefined") {
              window.sessionStorage.removeItem("cart-session-id");
            }
            setGuestSessionId(undefined);
          } else {
            setHasMigrated(false); // Allow retry on failure
          }
        });
      }
    }
  }, [
    isAuthenticated,
    userId,
    effectiveSessionId,
    isAuthLoading,
    hasMigrated,
    // cartActions.migrateGuestCart, // ✅ Stable method, not needed in deps
  ]);

  // 🎯 SIMPLIFIED CART ACTIONS
  // ==========================

  /**
   * Simplified add to cart (just product ID and quantity)
   */
  const addToCart = useCallback(
    async (productId: string, quantity: number = 1): Promise<boolean> => {
      console.log("🛒 [CART CONTEXT] addToCart called:", {
        productId,
        quantity,
        contextUserId: userId,
        contextSessionId: effectiveSessionId,
        hasContextUserId: !!userId,
        hasContextSessionId: !!effectiveSessionId,
      });

      const result = await cartActions.addToCart({ productId, quantity });

      console.log("🛒 [CART CONTEXT] addToCart result:", result);

      return result;
    },
    [cartActions.addToCart, userId, effectiveSessionId] // ✅ Added dependencies to track values
  );

  /**
   * Update item quantity by product ID
   */
  const updateItem = useCallback(
    async (productId: string, quantity: number): Promise<boolean> => {
      return await cartActions.setItemQuantity(productId, quantity);
    },
    [] // ✅ cartActions methods are stable, no dependency needed
  );

  /**
   * Remove item by product ID
   */
  const removeItem = useCallback(
    async (productId: string): Promise<boolean> => {
      return await cartActions.removeItem(productId);
    },
    [] // ✅ cartActions methods are stable, no dependency needed
  );

  /**
   * Clear entire cart
   */
  const clearCart = useCallback(async (): Promise<boolean> => {
    return await cartActions.clearCart();
  }, []); // ✅ cartActions methods are stable

  // 🛠️ UTILITY FUNCTIONS
  // ====================

  /**
   * Get item quantity by product ID
   */
  const getItemQuantity = useCallback(
    (productId: string): number => {
      return cartLogic.getItemQuantity(productId);
    },
    [cartLogic.getItemQuantity]
  );

  /**
   * Check if product is in cart
   */
  const hasItem = useCallback(
    (productId: string): boolean => {
      return getItemQuantity(productId) > 0;
    },
    [getItemQuantity]
  );

  /**
   * Format price with current currency - SAFE VERSION
   * No depende de cartLogic para evitar problemas de inicialización
   */
  const formatPrice = useCallback(
    (amount: number): string => {
      // 🛡️ SAFE FORMATTING - No dependency on cartLogic
      if (amount == null || isNaN(Number(amount))) {
        return "Precio no disponible";
      }

      return new Intl.NumberFormat(locale, {
        style: "currency",
        currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }).format(Number(amount));
    },
    [currency, locale]
  );

  // 🧮 COMPUTED VALUES
  // ==================

  const isEmpty = cartState.isEmpty;
  const itemCount = cartState.itemCount;
  const totalAmount = cartState.totalAmount;
  const isProcessing = cartActions.isProcessing || cartQuery.isLoading;

  // 📤 CONTEXT VALUE
  // ================

  const contextValue: CartContextValue = useMemo(
    () => ({
      // State
      cart: cartState.state.cart,
      summary: cartLogic.summary,
      loading: cartState.state.loading,
      errors: cartState.state.errors,

      // Actions
      addToCart,
      updateItem,
      removeItem,
      clearCart,

      // Utilities
      getItemQuantity,
      hasItem,
      formatPrice,

      // Status
      isEmpty,
      itemCount,
      totalAmount,
      isProcessing,
    }),
    [
      // ✅ SIMPLIFIED: Only primitive values to prevent infinite loops
      isEmpty,
      itemCount,
      totalAmount,
      isProcessing,
    ]
  );

  return (
    <CartContext.Provider value={contextValue}>{children}</CartContext.Provider>
  );
}

// 🛠️ UTILITY FUNCTIONS
// ====================

/**
 * Generate unique session ID for guest users
 */
function generateSessionId(): string {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2);
  return `cart-${timestamp}-${randomPart}`;
}

export default CartProvider;
