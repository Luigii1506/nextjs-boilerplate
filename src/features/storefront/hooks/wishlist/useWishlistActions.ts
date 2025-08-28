/**
 * ⚡ USE WISHLIST ACTIONS HOOK
 * ===========================
 *
 * Hook especializado para todas las acciones de negocio del WishlistTab.
 * Incluye wishlist management, bulk operations, cart actions y navegación.
 *
 * 📍 Nueva ubicación: /hooks/wishlist/ (Fase Futura - Organización por Feature)
 *
 * @version 3.0.0 - Feature-First Architecture
 */

"use client";

import { useCallback } from "react";
import { useStorefrontContext } from "@/features/storefront/context";
import { useCartContext } from "@/features/cart";
import { ProductForCustomer } from "@/features/storefront/types";

// 🎯 MAIN HOOK
export function useWishlistActions() {
  const {
    toggleWishlist,
    openProductQuickView,
    openLoginModal,
    setGlobalSearchTerm,
  } = useStorefrontContext();

  // 🛒 CART CONTEXT - Use real CartContext instead of mock
  const { addToCart: cartAddToCart } = useCartContext();

  // 💖 WISHLIST ACTIONS
  const onRemoveFromWishlist = useCallback(
    async (
      product: ProductForCustomer
    ): Promise<{ success: boolean; message: string }> => {
      try {
        const result = await toggleWishlist(product);
        return {
          success: result.success,
          message: result.message || "Producto eliminado de favoritos",
        };
      } catch (error) {
        console.error(
          "❌ [useWishlistActions] Remove from wishlist error:",
          error
        );
        return {
          success: false,
          message: "Error al remover producto de favoritos",
        };
      }
    },
    [toggleWishlist]
  );

  // 🛒 CART ACTIONS
  const onAddToCart = useCallback(
    async (
      product: ProductForCustomer
    ): Promise<{ success: boolean; message: string }> => {
      try {
        const isSuccess = await cartAddToCart(product.id, 1);
        return {
          success: isSuccess,
          message: isSuccess
            ? "Producto agregado al carrito"
            : "Error al agregar producto al carrito",
        };
      } catch (error) {
        console.error("❌ [useWishlistActions] Add to cart error:", error);
        return {
          success: false,
          message: "Error al agregar producto al carrito",
        };
      }
    },
    [cartAddToCart]
  );

  const onMoveToCart = useCallback(
    async (
      product: ProductForCustomer
    ): Promise<{ success: boolean; message: string }> => {
      try {
        // Add to cart and remove from wishlist
        const cartSuccess = await cartAddToCart(product.id, 1);
        if (!cartSuccess) {
          return {
            success: false,
            message: "Error al agregar producto al carrito",
          };
        }

        const wishlistResult = await toggleWishlist(product);
        return {
          success: wishlistResult.success && cartSuccess,
          message: "Producto movido al carrito",
        };
      } catch (error) {
        console.error("❌ [useWishlistActions] Move to cart error:", error);
        return {
          success: false,
          message: "Error al mover producto al carrito",
        };
      }
    },
    [cartAddToCart, toggleWishlist]
  );

  // 👁️ QUICK VIEW ACTIONS
  const onQuickView = useCallback(
    (product: ProductForCustomer) => {
      // Auto-close when removing from wishlist in WishlistTab
      openProductQuickView(product, true);
    },
    [openProductQuickView]
  );

  // 🎯 BULK ACTIONS
  const onBulkAddToCart = useCallback(
    async (
      products: ProductForCustomer[],
      selectedItems: Set<string>
    ): Promise<{ success: boolean; message: string; count: number }> => {
      try {
        let successCount = 0;
        for (const product of products) {
          if (selectedItems.has(product.id)) {
            const success = await cartAddToCart(product.id, 1);
            if (success) {
              successCount++;
            }
          }
        }
        return {
          success: true,
          message: `${successCount} productos agregados al carrito`,
          count: successCount,
        };
      } catch (error) {
        console.error("❌ [useWishlistActions] Bulk add to cart error:", error);
        return {
          success: false,
          message: "Error al agregar productos al carrito",
          count: 0,
        };
      }
    },
    [cartAddToCart]
  );

  const onBulkRemoveFromWishlist = useCallback(
    async (
      products: ProductForCustomer[],
      selectedItems: Set<string>
    ): Promise<{ success: boolean; message: string; count: number }> => {
      try {
        let successCount = 0;
        for (const product of products) {
          if (selectedItems.has(product.id)) {
            await toggleWishlist(product);
            successCount++;
          }
        }
        return {
          success: true,
          message: `${successCount} productos eliminados de favoritos`,
          count: successCount,
        };
      } catch (error) {
        console.error(
          "❌ [useWishlistActions] Bulk remove from wishlist error:",
          error
        );
        return {
          success: false,
          message: "Error al eliminar productos de favoritos",
          count: 0,
        };
      }
    },
    [toggleWishlist]
  );

  // 📄 PAGINATION ACTIONS
  const onPageChange = useCallback((page: number) => {
    console.log("📄 [useWishlistActions] onPageChange:", { page });

    // Scroll to top of wishlist
    document.getElementById("wishlist-grid")?.scrollIntoView({
      behavior: "smooth",
    });
  }, []);

  // 🔍 SEARCH ACTIONS
  const onSearchSync = useCallback(
    (searchTerm: string) => {
      console.log("🔍 [useWishlistActions] onSearchSync:", { searchTerm });
      setGlobalSearchTerm(searchTerm);
    },
    [setGlobalSearchTerm]
  );

  // 🔐 AUTHENTICATION ACTIONS
  const onLogin = useCallback(() => {
    console.log("🔐 [useWishlistActions] onLogin triggered");
    openLoginModal();
  }, [openLoginModal]);

  // 📊 VIEW ACTIONS
  const onViewModeChange = useCallback((mode: "grid" | "list") => {
    console.log("📊 [useWishlistActions] onViewModeChange:", { mode });
    // Mode change is handled by state hook
  }, []);

  // 🔄 SORT ACTIONS
  const onSortChange = useCallback((sortBy: string) => {
    console.log("🔄 [useWishlistActions] onSortChange:", { sortBy });
    // Sort change is handled by logic hook
  }, []);

  return {
    // Primary wishlist actions
    onRemoveFromWishlist,

    // Cart actions
    onAddToCart,
    onMoveToCart,

    // UI actions
    onQuickView,
    onViewModeChange,
    onSortChange,

    // Bulk actions
    onBulkAddToCart,
    onBulkRemoveFromWishlist,

    // Navigation actions
    onPageChange,

    // Search & global actions
    onSearchSync,
    onLogin,
  };
}

export default useWishlistActions;
