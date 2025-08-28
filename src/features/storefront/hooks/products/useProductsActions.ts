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

import { useCallback, useRef } from "react";
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

  // 🔄 LOADING STATES - Track individual products being added to cart (ONLY ref to avoid re-renders)
  const addingToCartProductsRef = useRef<Set<string>>(new Set());
  // ✅ Removed useState to prevent infinite loops from new Set() objects

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
      if (addingToCartProductsRef.current.has(product.id)) {
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

      // Set loading state (only ref to avoid re-renders)
      addingToCartProductsRef.current.add(product.id);

      try {
        console.log("🛒 [useProductsActions] Calling cartAddToCart with:", {
          productId: product.id,
          productName: product.name,
          quantity: 1,
        });

        const isSuccess = await cartAddToCart(product.id, 1);

        console.log("🛒 [useProductsActions] cartAddToCart result:", isSuccess);

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
        // Clear loading state (only ref to avoid re-renders)
        addingToCartProductsRef.current.delete(product.id);
      }
    },
    [cartAddToCart, success, error] // ✅ Removed addingToCartProducts dependency to prevent infinite loop
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
      return addingToCartProductsRef.current.has(productId);
    },
    [] // ✅ No dependencies needed since we use ref
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
