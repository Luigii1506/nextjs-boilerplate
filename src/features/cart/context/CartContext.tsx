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

  // 📊 Computed Values
  const itemCount = useMemo(() => {
    return items.reduce((count, item) => count + item.quantity, 0);
  }, [items]);

  const totalAmount = useMemo(() => {
    return items.reduce((total, item) => total + item.total, 0);
  }, [items]);

  // 🔄 Load Cart Data
  const loadCart = useCallback(async () => {
    try {
      setIsLoading(true);
      setIsError(false);

      console.log("🔄 [CART] Loading cart data...", {
        isAuthenticated,
        userId: user?.id,
        sessionId,
      });

      const result = await getCartAction({
        userId: user?.id,
        sessionId: !user?.id ? sessionId : undefined,
      });

      if (result.success && result.data) {
        const cartData = result.data;

        console.log("🚀 [CART LOAD] Server returned cart data:", {
          hasItems: !!cartData.items,
          serverItemsCount: (cartData.items || []).length,
          serverItems: (cartData.items || []).map((item) => ({
            id: item.id,
            productName: item.product?.name,
            quantity: item.quantity,
            total: item.total,
          })),
          serverTotal: cartData.total || 0,
          serverSubtotal: cartData.subtotal || 0,
          serverTaxAmount: cartData.taxAmount || 0,
        });

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

        console.log("✅ [CART LOAD] Frontend state updated:", {
          frontendItemsCount: calculatedSummary.itemCount,
          frontendUniqueItems: calculatedSummary.uniqueItems,
          frontendTotal: calculatedSummary.total,
          serverVsFrontendMatch: {
            itemsMatch:
              (cartData.items || []).length === calculatedSummary.uniqueItems,
            totalMatch: (cartData.total || 0) === calculatedSummary.total,
          },
        });
      } else {
        // Empty cart
        setItems([]);
        setSummary(null);
        console.log("📭 [CART] Empty cart");
      }
    } catch (error) {
      console.error("❌ [CART] Failed to load cart:", error);
      setIsError(true);
      setItems([]);
      setSummary(null);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, isAuthenticated, sessionId]);

  // 🚀 Initial Load + Auth Changes - OPTIMIZED
  useEffect(() => {
    loadCart();
  }, [user?.id, isAuthenticated, sessionId]); // Direct deps - avoid loadCart in deps

  // ➕ Add to Cart - Direct & Simple
  const addToCart = useCallback(
    async (productId: string, quantity: number) => {
      const timestamp = Date.now();
      console.log("🎬 [CART CONTEXT] === ADD TO CART START ===", {
        productId,
        quantity,
        userId: user?.id,
        sessionId: !user?.id ? sessionId : undefined,
        timestamp,
        currentFrontendItemsCount: items.length,
        currentFrontendTotal: summary?.total || 0,
        stackTrace: new Error().stack?.split("\n").slice(0, 5),
      });

      try {
        console.log("📡 [CART CONTEXT] Calling server action...");

        const result = await addToCartAction({
          productId,
          quantity,
          userId: user?.id,
          sessionId: !user?.id ? sessionId : undefined,
        });

        console.log("📡 [CART CONTEXT] Server action response:", {
          success: result.success,
          hasData: !!result.data,
          hasCart: !!result.data?.cart,
          serverItemsCount: result.data?.cart?.items?.length || 0,
          serverTotal: result.data?.summary?.total || 0,
          beforeUpdateFrontendCount: items.length,
          beforeUpdateFrontendTotal: summary?.total || 0,
        });

        if (!result.success || !result.data) {
          throw new Error(result.error || "Failed to add to cart");
        }

        console.log("🔄 [CART CONTEXT] Updating frontend state...");
        console.log("🔍 [CART CONTEXT] Server data structure:", {
          hasCartItems: !!result.data.cart.items,
          serverItems:
            result.data.cart.items?.map((item) => ({
              id: item.id,
              productId: item.productId,
              productName: item.product?.name,
              quantity: item.quantity,
              total: item.total,
            })) || [],
          hasSummary: !!result.data.summary,
          serverSummary: result.data.summary,
        });

        // Update state with fresh data from server - FIX: Usar estructura correcta
        const newItems = result.data.cart.items || [];
        const newSummary = result.data.summary || null;

        setItems(newItems);
        setSummary(newSummary);

        console.log("✅ [CART CONTEXT] === ADD TO CART END ===", {
          serverReturnedItemsCount: result.data.cart.items?.length || 0,
          serverReturnedTotal: result.data.summary?.total || 0,
          newFrontendItemsCount: newItems.length,
          newFrontendTotal: newSummary?.total || 0,
          timestamp,
          duration: Date.now() - timestamp,
        });
      } catch (error) {
        console.error("❌ [CART CONTEXT] Add to cart failed:", error);
        throw error;
      }
    },
    [user?.id, sessionId]
  );

  // 🔄 Update Quantity - Direct & Simple
  const updateQuantity = useCallback(
    async (cartItemId: string, quantity: number) => {
      try {
        console.log("🔄 [CART] Updating quantity:", {
          cartItemId,
          quantity,
          userId: user?.id,
          sessionId: !user?.id ? sessionId : undefined,
        });

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

        console.log("📡 [CART] updateCartItemAction result:", {
          success: result.success,
          hasData: !!result.data,
          error: result.error,
          fullResult: result,
        });

        if (!result.success || !result.data) {
          console.error("❌ [CART] updateCartItemAction failed:", {
            success: result.success,
            data: result.data,
            error: result.error,
            cartItemId,
            quantity,
            userId: user?.id,
            sessionId: !user?.id ? sessionId : undefined,
          });
          throw new Error(result.error || "Failed to update quantity");
        }

        // Update state with fresh data from server - FIX: updateCartItemAction structure
        setItems(result.data.cart.items || []);
        setSummary(result.data.summary || null);

        console.log("✅ [CART] Quantity updated successfully");
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
        console.log("🗑️ [CART] Removing item:", {
          cartItemId,
          userId: user?.id,
          sessionId: !user?.id ? sessionId : undefined,
        });

        const result = await removeFromCartAction({
          cartItemId,
          userId: user?.id,
          sessionId: !user?.id ? sessionId : undefined,
        });

        if (!result.success || !result.data) {
          throw new Error(result.error || "Failed to remove item");
        }

        // Update state with fresh data from server - FIX: removeFromCartAction structure
        setItems(result.data.cart.items || []);
        setSummary(result.data.summary || null);

        console.log("✅ [CART] Item removed successfully");
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

        console.log("✅ [CART] Manual refresh completed");
      } else {
        setItems([]);
        setSummary(null);
        console.log("📭 [CART] Empty cart after refresh");
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
    console.log("🔄 [CART CONTEXT] Context value updated:", {
      itemsCount: items.length,
      totalItemCount: itemCount,
      totalAmount,
      isLoading,
      isError,
      contextRebuildTimestamp: Date.now(),
      detailedItems: items.map((item) => ({
        id: item.id.substring(0, 8),
        productName: item.product?.name,
        quantity: item.quantity,
        total: item.total,
      })),
    });

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
