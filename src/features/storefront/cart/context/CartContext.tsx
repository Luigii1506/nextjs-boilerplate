"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
} from "react";
import { useAuth } from "@/shared/hooks/useAuth";
import {
  addToCartAction,
  updateCartItemAction,
  removeFromCartAction,
  getCartAction,
  clearCartAction,
} from "../server";
import type { CartItem, CartSummary, CartItemWithProduct } from "../types";

interface CartContextType {
  // 🛒 Cart Data
  items: CartItemWithProduct[];
  summary: CartSummary | null;
  itemCount: number;
  totalAmount: number;

  // 🎛️ State
  isLoading: boolean;
  isError: boolean;

  // ⚡ Actions - Direct & Simple
  addToCart: (productId: string, quantity: number) => Promise<void>;
  updateQuantity: (cartItemId: string, quantity: number) => Promise<void>;
  removeItem: (cartItemId: string) => Promise<void>;
  refreshCart: () => Promise<void>;

  // 🧮 Utilities
  formatPrice: (amount: number) => string;
}

const CartContext = createContext<CartContextType | null>(null);

export function useCartContext() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCartContext must be used within CartProvider");
  }
  return context;
}

interface CartProviderProps {
  children: React.ReactNode;
}

export function CartProvider({ children }: CartProviderProps) {
  const { user, isAuthenticated } = useAuth();

  // 🆔 Session Management - SUPER FAST
  const [sessionId] = useState(() => {
    // Generate or get session ID for non-authenticated users
    if (typeof window !== "undefined") {
      let sessionId = localStorage.getItem("cart-session-id");
      if (!sessionId) {
        sessionId = `session_${Date.now()}_${Math.random()
          .toString(36)
          .substr(2, 9)}`;
        localStorage.setItem("cart-session-id", sessionId);
      }
      return sessionId;
    }
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  });

  // 🛒 Cart State - Simple
  const [items, setItems] = useState<CartItemWithProduct[]>([]);
  const [summary, setSummary] = useState<CartSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // 📊 Computed Values - Use summary as source of truth, fallback to calculation
  const itemCount = useMemo(() => {
    // CRITICAL FIX: Don't compute if not initialized - prevents flash of stale data
    if (!isInitialized) {
      return 0;
    }

    // Prefer summary if available (avoids recalculation)
    if (summary?.itemCount !== undefined) {
      return summary.itemCount;
    }
    // Fallback: calculate from items during loading
    return items.reduce((count, item) => count + item.quantity, 0);
  }, [items, summary, isInitialized]);

  const totalAmount = useMemo(() => {
    // CRITICAL FIX: Don't compute if not initialized - prevents flash of stale data
    if (!isInitialized) {
      return 0;
    }
    // Prefer summary if available
    if (summary?.total !== undefined) {
      return summary.total;
    }
    // Fallback: calculate from items during loading
    return items.reduce((total, item) => total + item.total, 0);
  }, [items, summary, isInitialized]);

  // 🔄 Load Cart Data
  const loadCart = useCallback(async () => {
    try {
      setIsLoading(true);
      setIsError(false);

      const result = await getCartAction({
        userId: user?.id,
        sessionId: !user?.id ? sessionId : undefined,
      });

      if (result.success && result.data) {
        const cartData = result.data;
        setItems(cartData.items || []);

        // Generate summary locally since getCartAction doesn't return it
        const calculatedSummary: CartSummary = {
          itemCount: (cartData.items || []).reduce(
            (sum, item) => sum + item.quantity,
            0
          ),
          uniqueItems: (cartData.items || []).length,
          subtotal: cartData.subtotal || 0,
          taxAmount: cartData.taxAmount || 0,
          shippingAmount: 0,
          discountAmount: 0,
          total: cartData.total || 0,
        };
        setSummary(calculatedSummary);
      } else {
        // Empty cart
        setItems([]);
        setSummary(null);
      }
    } catch (error) {
      console.error("❌ [CART] Failed to load cart:", error);
      setIsError(true);
      setItems([]);
      setSummary(null);
    } finally {
      setIsLoading(false);
      setIsInitialized(true);
    }
  }, [user?.id, isAuthenticated, sessionId]);

  // 🚀 Initial Load + Auth Changes - OPTIMIZED
  useEffect(() => {
    loadCart();
  }, [user?.id, isAuthenticated, sessionId]); // Direct deps - avoid loadCart in deps

  // ➕ Add to Cart - Direct & Simple
  const addToCart = useCallback(
    async (productId: string, quantity: number) => {
      try {
        const result = await addToCartAction({
          productId,
          quantity,
          userId: user?.id,
          sessionId: !user?.id ? sessionId : undefined,
        });

        if (!result.success || !result.data) {
          throw new Error(result.error || "Failed to add to cart");
        }

        // Update state with fresh data from server
        setItems(result.data.cart.items || []);
        setSummary(result.data.summary || null);
      } catch (error) {
        console.error("❌ [CART] Add to cart failed:", error);
        throw error;
      }
    },
    [user?.id, sessionId]
  );

  // 🔄 Update Quantity - Direct & Simple
  const updateQuantity = useCallback(
    async (cartItemId: string, quantity: number) => {
      try {
        if (quantity === 0) {
          // Remove item if quantity is 0
          await removeItem(cartItemId);
          return;
        }

        const result = await updateCartItemAction({
          cartItemId,
          quantity,
          userId: user?.id,
          sessionId: !user?.id ? sessionId : undefined,
        });

        if (!result.success || !result.data) {
          throw new Error(result.error || "Failed to update quantity");
        }

        // Update state with fresh data from server
        setItems(result.data.cart.items || []);
        setSummary(result.data.summary || null);
      } catch (error) {
        console.error("❌ [CART] Update quantity failed:", error);
        throw error;
      }
    },
    [user?.id, sessionId]
  );

  // 🗑️ Remove Item - Direct & Simple
  const removeItem = useCallback(
    async (cartItemId: string) => {
      try {
        const result = await removeFromCartAction({
          cartItemId,
          userId: user?.id,
          sessionId: !user?.id ? sessionId : undefined,
        });

        if (!result.success || !result.data) {
          throw new Error(result.error || "Failed to remove item");
        }

        // Update state with fresh data from server
        const updatedItems = result.data.cart.items || [];
        setItems(updatedItems);
        setSummary(result.data.summary || null);

        // 🧹 AUTO-CLEANUP: If cart is now empty, clean it from database
        if (updatedItems.length === 0) {
          try {
            await clearCartAction({
              userId: user?.id,
              sessionId: !user?.id ? sessionId : undefined,
            });
          } catch (cleanupError) {
            console.warn("⚠️ [CART] Failed to cleanup empty cart:", cleanupError);
            // Don't throw - cleanup failure shouldn't block the user
          }
        }
      } catch (error) {
        console.error("❌ [CART] Remove item failed:", error);
        throw error;
      }
    },
    [user?.id, sessionId]
  );

  // 🔄 Refresh Cart - STABLE + DIRECT
  const refreshCart = useCallback(async () => {
    try {
      setIsLoading(true);
      setIsError(false);

      const result = await getCartAction({
        userId: user?.id,
        sessionId: !user?.id ? sessionId : undefined,
      });

      if (result.success && result.data) {
        const cartData = result.data;
        setItems(cartData.items || []);

        // Generate summary locally since getCartAction doesn't return it
        const calculatedSummary: CartSummary = {
          itemCount: (cartData.items || []).reduce(
            (sum, item) => sum + item.quantity,
            0
          ),
          uniqueItems: (cartData.items || []).length,
          subtotal: cartData.subtotal || 0,
          taxAmount: cartData.taxAmount || 0,
          shippingAmount: 0,
          discountAmount: 0,
          total: cartData.total || 0,
        };
        setSummary(calculatedSummary);
      } else {
        setItems([]);
        setSummary(null);
      }
    } catch (error) {
      console.error("❌ [CART] Failed to refresh cart:", error);
      setIsError(true);
      setItems([]);
      setSummary(null);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, sessionId]); // Stable deps - no loadCart reference

  // 🧮 Format Price - Simple & Direct
  const formatPrice = useCallback((amount: number): string => {
      if (amount == null || isNaN(Number(amount))) {
        return "Precio no disponible";
      }

    return new Intl.NumberFormat("en-US", {
        style: "currency",
      currency: "USD",
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(amount / 100); // Assuming amount is in cents
  }, []);

  // 🎯 Context Value - OPTIMIZED (no function dependencies)
  const contextValue = useMemo(() => {
    return {
      // Data
      items,
      summary,
      itemCount,
      totalAmount,

      // State
      isLoading,
      isError,

      // Actions - Stable useCallback functions (no need to include in deps)
      addToCart,
      updateQuantity,
      removeItem,
      refreshCart,

      // Utilities
      formatPrice,
    };
  }, [
    // Only include primitive values and objects that change
    items,
    summary,
    itemCount,
    totalAmount,
    isLoading,
    isError,
    // Functions omitted - they're stable useCallback
  ]);

  return (
    <CartContext.Provider value={contextValue}>{children}</CartContext.Provider>
  );
}

export { CartProvider as default };
