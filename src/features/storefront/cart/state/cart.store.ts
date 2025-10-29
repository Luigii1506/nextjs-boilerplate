/**
 * 🛒 CART STORE (Zustand)
 * ======================
 *
 * Client-side cart state orchestrator.
 * Replaces CartContext while leveraging existing server actions.
 *
 * Features:
 * - Metadata (cartId, sessionId, timestamps)
 * - Items, summary, loading/error flags
 * - Async actions calling Next.js server actions
 * - Session resolution (guest vs authenticated)
 * - Guest→user sync helper
 *
 * React 19 compatible: action objects memoized via useMemo selectors.
 */

"use client";

import { useCallback, useEffect, useMemo } from "react";
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import {
  addToCartAction,
  updateCartItemAction,
  removeFromCartAction,
  getCartAction,
  clearCartAction,
  syncGuestCartToUserAction,
} from "../server";
import type {
  CartWithItems,
  CartItemWithProduct,
  CartSummary,
} from "../types";
import { formatPrice as formatCurrency } from "@/features/storefront/utils/pricing.helpers";
import { useAuth } from "@/shared/hooks/useAuth";

interface CartMetadata {
  cartId: string | null;
  sessionId: string | null;
  userId: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  expiresAt: Date | null;
}

interface CartStoreState {
  cart: CartWithItems | null;
  summary: CartSummary | null;
  metadata: CartMetadata;

  items: CartItemWithProduct[];
  itemCount: number;
  totalAmount: number;

  clientSessionId: string | null;
  isInitialized: boolean;
  isLoading: boolean;
  isError: boolean;

  setClientSessionId: (sessionId: string | null) => void;
  setStateFromCart: (
    cart: CartWithItems | null,
    summaryOverride?: CartSummary | null
  ) => void;
  setLoading: (value: boolean) => void;
  setError: (value: boolean) => void;
}

const SESSION_STORAGE_KEY = "cart-session-id";
const STORE_NAME = "Storefront-Cart-Store";

const initialMetadata: CartMetadata = {
  cartId: null,
  sessionId: null,
  userId: null,
  createdAt: null,
  updatedAt: null,
  expiresAt: null,
};

const buildSummaryFromCart = (cartData: CartWithItems): CartSummary => ({
  itemCount: cartData.items.reduce((sum, item) => sum + item.quantity, 0),
  uniqueItems: cartData.items.length,
  subtotal: Number(cartData.subtotal ?? 0),
  taxAmount: Number(cartData.taxAmount ?? 0),
  shippingAmount: 0,
  discountAmount: 0,
  total: Number(cartData.total ?? cartData.subtotal ?? 0),
});

const extractMetadata = (cartData: CartWithItems | null): CartMetadata => {
  if (!cartData) {
    return initialMetadata;
  }

  const castDate = (value: Date | string | null | undefined): Date | null => {
    if (!value) return null;
    return value instanceof Date ? value : new Date(value);
  };

  return {
    cartId: cartData.id ?? null,
    sessionId: cartData.sessionId ?? null,
    userId: cartData.userId ?? null,
    createdAt: castDate(cartData.createdAt),
    updatedAt: castDate(cartData.updatedAt),
    expiresAt: castDate(cartData.expiresAt),
  };
};

export const useCartStore = create<CartStoreState>()(
  devtools(
    (set, get) => ({
      cart: null,
      summary: null,
      metadata: initialMetadata,

      items: [],
      itemCount: 0,
      totalAmount: 0,

      clientSessionId: null,
      isInitialized: false,
      isLoading: true,
      isError: false,

      setClientSessionId: (sessionId) =>
        set(() => ({
          clientSessionId: sessionId,
        })),

      setStateFromCart: (cartData, summaryOverride) =>
        set(() => {
          if (!cartData) {
            return {
              cart: null,
              summary: null,
              metadata: initialMetadata,
              items: [],
              itemCount: 0,
              totalAmount: 0,
              isInitialized: true,
            };
          }

          const summary = summaryOverride ?? buildSummaryFromCart(cartData);
          return {
            cart: cartData,
            summary,
            metadata: extractMetadata(cartData),
            items: cartData.items ?? [],
            itemCount: summary.itemCount,
            totalAmount: summary.total,
            isInitialized: true,
          };
        }),

      setLoading: (value) =>
        set(() => ({
          isLoading: value,
        })),

      setError: (value) =>
        set(() => ({
          isError: value,
        })),
    }),
    { name: STORE_NAME }
  )
);

// -----------------------------
// INTERNAL HOOKS / UTILITIES
// -----------------------------

const useCartSession = () => {
  const { user, isAuthenticated } = useAuth();
  const clientSessionId = useCartStore((state) => state.clientSessionId);
  const setClientSessionId = useCartStore((state) => state.setClientSessionId);

  const generateSessionId = useCallback((): string => {
    return `session_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
  }, []);

  const resolveSessionId = useCallback((): string | undefined => {
    if (user?.id) {
      return undefined;
    }

    if (clientSessionId) {
      return clientSessionId;
    }

    const fallback = generateSessionId();
    if (typeof window !== "undefined") {
      window.localStorage.setItem(SESSION_STORAGE_KEY, fallback);
    }
    setClientSessionId(fallback);
    return fallback;
  }, [clientSessionId, generateSessionId, setClientSessionId, user?.id]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (clientSessionId) {
      return;
    }

    const stored = window.localStorage.getItem(SESSION_STORAGE_KEY);
    if (stored) {
      setClientSessionId(stored);
      return;
    }

    if (isAuthenticated) {
      setClientSessionId(null);
      return;
    }

    const generated = generateSessionId();
    window.localStorage.setItem(SESSION_STORAGE_KEY, generated);
    setClientSessionId(generated);
  }, [
    clientSessionId,
    generateSessionId,
    isAuthenticated,
    setClientSessionId,
  ]);

  return { user, isAuthenticated, resolveSessionId };
};

// -----------------------------
// PUBLIC ACTION HOOKS
// -----------------------------

export const useCartActions = () => {
  const { user, isAuthenticated, resolveSessionId } = useCartSession();
  const setStateFromCart = useCartStore((state) => state.setStateFromCart);
  const setLoading = useCartStore((state) => state.setLoading);
  const setError = useCartStore((state) => state.setError);
  const setClientSessionId = useCartStore((state) => state.setClientSessionId);

  const refreshCart = useCallback(async () => {
    const sessionId = resolveSessionId();
    try {
      setLoading(true);
      setError(false);

      const result = await getCartAction({
        userId: user?.id,
        sessionId: user?.id ? undefined : sessionId,
      });

      if (result.success && result.data) {
        setStateFromCart(result.data);
      } else {
        setStateFromCart(null);
      }
    } catch (error) {
      console.error("❌ [CART STORE] Failed to refresh cart:", error);
      setError(true);
      setStateFromCart(null);
    } finally {
      setLoading(false);
    }
  }, [resolveSessionId, setError, setLoading, setStateFromCart, user?.id]);

  const addToCart = useCallback(
    async (productId: string, quantity: number) => {
      const sessionId = resolveSessionId();

      try {
        const result = await addToCartAction({
          productId,
          quantity,
          userId: user?.id,
          sessionId: user?.id ? undefined : sessionId,
        });

        if (!result.success || !result.data) {
          throw new Error(result.error || "Failed to add to cart");
        }

        setStateFromCart(result.data.cart, result.data.summary);
      } catch (error) {
        console.error("❌ [CART STORE] Add to cart failed:", error);
        throw error;
      }
    },
    [resolveSessionId, setStateFromCart, user?.id]
  );

  const removeItem = useCallback(
    async (cartItemId: string) => {
      const sessionId = resolveSessionId();
      try {
        const result = await removeFromCartAction({
          cartItemId,
          userId: user?.id,
          sessionId: user?.id ? undefined : sessionId,
        });

        if (!result.success || !result.data) {
          throw new Error(result.error || "Failed to remove item");
        }

        const updatedItems = result.data.cart.items || [];
        setStateFromCart(result.data.cart, result.data.summary);

        if (updatedItems.length === 0) {
          try {
            await clearCartAction({
              userId: user?.id,
              sessionId: user?.id ? undefined : sessionId,
            });
          } catch (cleanupError) {
            console.warn("⚠️ [CART STORE] Failed to cleanup empty cart:", cleanupError);
          }
        }
      } catch (error) {
        console.error("❌ [CART STORE] Remove item failed:", error);
        throw error;
      }
    },
    [resolveSessionId, setStateFromCart, user?.id]
  );

  const updateQuantity = useCallback(
    async (cartItemId: string, quantity: number) => {
      if (quantity === 0) {
        await removeItem(cartItemId);
        return;
      }

      const sessionId = resolveSessionId();

      try {
        const result = await updateCartItemAction({
          cartItemId,
          quantity,
          userId: user?.id,
          sessionId: user?.id ? undefined : sessionId,
        });

        if (!result.success || !result.data) {
          throw new Error(result.error || "Failed to update quantity");
        }

        setStateFromCart(result.data.cart, result.data.summary);
      } catch (error) {
        console.error("❌ [CART STORE] Update quantity failed:", error);
        throw error;
      }
    },
    [removeItem, resolveSessionId, setStateFromCart, user?.id]
  );

  const clearCart = useCallback(async () => {
    const sessionId = resolveSessionId();

    try {
      const result = await clearCartAction({
        userId: user?.id ?? undefined,
        sessionId: user?.id ? undefined : sessionId,
      });

      if (!result.success || !result.data) {
        throw new Error(result.error || "Failed to clear cart");
      }

      setStateFromCart(result.data.cart, result.data.cart ? buildSummaryFromCart(result.data.cart) : null);
    } catch (error) {
      console.error("❌ [CART STORE] Clear cart failed:", error);
      throw error;
    }
  }, [resolveSessionId, setStateFromCart, user?.id]);

  const syncGuestCartToUser = useCallback(async () => {
    if (!isAuthenticated || !user?.id) {
      return;
    }

    const guestSessionId = resolveSessionId();
    if (!guestSessionId) {
      return;
    }

    try {
      const result = await syncGuestCartToUserAction({
        guestSessionId,
        userId: user.id,
        mergeStrategy: "merge",
      });

        if (result.success) {
          if (typeof window !== "undefined") {
            window.localStorage.removeItem(SESSION_STORAGE_KEY);
          }
          setClientSessionId(null);
          await refreshCart();
        } else {
        console.warn("⚠️ [CART STORE] Guest cart sync failed:", result.error);
      }
    } catch (error) {
      console.error("❌ [CART STORE] Guest cart sync error:", error);
    }
  }, [isAuthenticated, refreshCart, resolveSessionId, user?.id]);

  const formatPrice = useCallback((amount: number): string => {
    if (amount == null || Number.isNaN(Number(amount))) {
      return "Precio no disponible";
    }
    return formatCurrency(amount);
  }, []);

  return useMemo(
    () => ({
      refreshCart,
      addToCart,
      updateQuantity,
      removeItem,
      clearCart,
      syncGuestCartToUser,
      formatPrice,
    }),
    [
      addToCart,
      clearCart,
      formatPrice,
      refreshCart,
      removeItem,
      syncGuestCartToUser,
      updateQuantity,
    ]
  );
};

// -----------------------------
// PUBLIC SELECTOR HOOKS
// -----------------------------

export const useCartSummary = () =>
  useCartStore((state) => ({
    summary: state.summary,
    itemCount: state.itemCount,
    totalAmount: state.totalAmount,
  }));

export const useCartItems = () => useCartStore((state) => state.items);

export const useCartMetadata = () => useCartStore((state) => state.metadata);

export const useCartStatus = () =>
  useCartStore((state) => ({
    isLoading: state.isLoading,
    isInitialized: state.isInitialized,
    isError: state.isError,
  }));

export const useCart = () => {
  const cart = useCartStore((state) => state.cart);
  const items = useCartStore((state) => state.items);
  const summary = useCartStore((state) => state.summary);
  const metadata = useCartStore((state) => state.metadata);
  const itemCount = useCartStore((state) => state.itemCount);
  const totalAmount = useCartStore((state) => state.totalAmount);
  const status = useCartStatus();
  const actions = useCartActions();

  return useMemo(
    () => ({
      cart,
      items,
      summary,
      metadata,
      itemCount,
      totalAmount,
      ...status,
      ...actions,
    }),
    [actions, cart, itemCount, items, metadata, status, summary, totalAmount]
  );
};

/**
 * Cart bootstrap hook.
 * Ensures cart data loads on session changes and guest carts merge on login.
 */
export const useCartInitializer = () => {
  const { user, isAuthenticated } = useAuth();
  const clientSessionId = useCartStore((state) => state.clientSessionId);
  const { refreshCart, syncGuestCartToUser } = useCartActions();

  useEffect(() => {
    if (!isAuthenticated && !clientSessionId) {
      return;
    }

    refreshCart().catch((error) => {
      console.error("❌ [CART STORE] Initial refresh failed:", error);
    });
  }, [clientSessionId, isAuthenticated, refreshCart, user?.id]);

  useEffect(() => {
    if (!isAuthenticated || !user?.id || !clientSessionId) {
      return;
    }

    syncGuestCartToUser().catch((error) => {
      console.error("❌ [CART STORE] Sync guest cart failed:", error);
    });
  }, [clientSessionId, isAuthenticated, syncGuestCartToUser, user?.id]);
};
