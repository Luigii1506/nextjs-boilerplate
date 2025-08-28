/**
 * ⚡ USE PRODUCTS ACTIONS HOOK
 * ===========================
 *
 * Hook especializado para todas las acciones de negocio del ProductsTab.
 * Incluye wishlist, carrito, quick view, navegación y coordinación UI.
 *
 * 📍 Nueva ubicación: /hooks/products/ (Fase Futura - Organización por Feature)
 *
 * @version 3.0.0 - Feature-First Architecture
 */

"use client";

import { useCallback, useState } from "react";
import { useStorefrontContext } from "@/features/storefront/context";
import { useCartContext } from "@/features/cart";
import { useNotifications } from "@/shared/hooks/useNotifications";
import { ProductForCustomer } from "@/features/storefront/types";

// 🎯 MAIN HOOK
export function useProductsActions() {
  const { toggleWishlist, openProductQuickView, setGlobalSearchTerm } =
    useStorefrontContext();

  // 🛒 CART CONTEXT
  const { addToCart: cartAddToCart } = useCartContext();

  // 🔔 NOTIFICATIONS
  const { success, error } = useNotifications();

  // 🔄 LOADING STATES - Track individual products being added to cart
  const [addingToCartProducts, setAddingToCartProducts] = useState<Set<string>>(
    new Set()
  );

  // 💖 WISHLIST ACTIONS
  const onAddToWishlist = useCallback(
    async (
      product: ProductForCustomer
    ): Promise<{ success: boolean; message: string }> => {
      console.log("❤️ [useProductsActions] onAddToWishlist:", {
        productId: product.id,
        productName: product.name,
        isWishlisted: product.isWishlisted,
      });

      const result = await toggleWishlist(product);

      console.log("❤️ [useProductsActions] toggleWishlist result:", result);

      return result;
    },
    [toggleWishlist]
  );

  // 🛒 CART ACTIONS
  const onAddToCart = useCallback(
    async (product: ProductForCustomer) => {
      // Avoid adding if already in progress
      if (addingToCartProducts.has(product.id)) {
        console.log(
          "🔄 [useProductsActions] Product already being added:",
          product.name
        );
        return false;
      }

      console.log("🛒 [useProductsActions] onAddToCart:", {
        productId: product.id,
        productName: product.name,
      });

      // Set loading state
      setAddingToCartProducts((prev) => new Set([...prev, product.id]));

      try {
        const isSuccess = await cartAddToCart(product.id, 1);

        if (isSuccess) {
          console.log(
            "✅ [useProductsActions] Product added to cart successfully"
          );
          success(`¡${product.name} agregado al carrito!`);
        } else {
          console.error(
            "❌ [useProductsActions] Failed to add product to cart"
          );
          error(`No se pudo agregar ${product.name} al carrito`);
        }

        return isSuccess;
      } catch (err) {
        console.error("❌ [useProductsActions] Error adding to cart:", err);
        error(`Error al agregar ${product.name} al carrito`);
        return false;
      } finally {
        // Clear loading state
        setAddingToCartProducts((prev) => {
          const next = new Set(prev);
          next.delete(product.id);
          return next;
        });
      }
    },
    [cartAddToCart, success, error, addingToCartProducts]
  );

  // 👁️ QUICK VIEW ACTIONS
  const onQuickView = useCallback(
    (product: ProductForCustomer) => {
      console.log("👁️ [useProductsActions] onQuickView:", {
        productId: product.id,
        productName: product.name,
      });

      // ✅ No auto-close for ProductsTab (different from WishlistTab)
      openProductQuickView(product, false);
    },
    [openProductQuickView]
  );

  // 📄 PAGINATION ACTIONS
  const onPageChange = useCallback((page: number) => {
    console.log("📄 [useProductsActions] onPageChange:", { page });

    // Smooth scroll to top of products grid
    document.getElementById("products-grid")?.scrollIntoView({
      behavior: "smooth",
    });
  }, []);

  // 🔍 SEARCH ACTIONS
  const onGlobalSearchChange = useCallback(
    (term: string) => {
      console.log("🔍 [useProductsActions] onGlobalSearchChange:", { term });
      setGlobalSearchTerm(term);
    },
    [setGlobalSearchTerm]
  );

  // 🔧 FILTER ACTIONS
  const onClearAllFilters = useCallback(
    (resetLocalSearch: () => void) => {
      console.log("🔧 [useProductsActions] onClearAllFilters");
      resetLocalSearch();
      setGlobalSearchTerm("");
    },
    [setGlobalSearchTerm]
  );

  // 📊 VIEW ACTIONS
  const onViewModeChange = useCallback((mode: "grid" | "list") => {
    console.log("📊 [useProductsActions] onViewModeChange:", { mode });
    // Mode change is handled by state hook
  }, []);

  // 🔄 SORT ACTIONS
  const onSortChange = useCallback((sortBy: string) => {
    console.log("🔄 [useProductsActions] onSortChange:", { sortBy });
    // Sort change is handled by state hook
  }, []);

  // 🎯 FILTER ACTIONS
  const onFilterToggle = useCallback(() => {
    console.log("🎯 [useProductsActions] onFilterToggle");
    // Filter toggle is handled by state hook
  }, []);

  // 📊 UTILITY FUNCTIONS
  const isAddingToCart = useCallback(
    (productId: string) => {
      return addingToCartProducts.has(productId);
    },
    [addingToCartProducts]
  );

  return {
    // Primary business actions
    onAddToWishlist,
    onAddToCart,
    onQuickView,

    // Navigation actions
    onPageChange,

    // Search & Filters
    onGlobalSearchChange,
    onClearAllFilters,

    // UI actions
    onViewModeChange,
    onSortChange,
    onFilterToggle,

    // State utilities
    isAddingToCart,
  };
}

export default useProductsActions;
