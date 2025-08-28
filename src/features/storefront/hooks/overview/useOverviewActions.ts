/**
 * ⚡ USE OVERVIEW ACTIONS HOOK
 * ===========================
 *
 * Hook especializado para todas las acciones de negocio del OverviewTab.
 * Incluye product actions, navigation, search y tab switching.
 *
 * 📍 Nueva ubicación: /hooks/overview/ (Fase Futura - Organización por Feature)
 *
 * @version 3.0.0 - Feature-First Architecture
 */

"use client";

import { useCallback } from "react";
import { useStorefrontContext } from "@/features/storefront/context";
import {
  ProductForCustomer,
  CategoryForCustomer,
} from "@/features/storefront/types";

// 🎯 MAIN HOOK
export function useOverviewActions() {
  const {
    toggleWishlist,
    addToCartOptimistic,
    openProductQuickView,
    setActiveTab,
    setGlobalSearchTerm,
  } = useStorefrontContext();

  // 💖 WISHLIST ACTIONS
  const onAddToWishlist = useCallback(
    async (
      product: ProductForCustomer
    ): Promise<{ success: boolean; message: string }> => {
      try {
        console.log("❤️ [useOverviewActions] onAddToWishlist:", {
          productId: product.id,
          productName: product.name,
          isWishlisted: product.isWishlisted,
        });

        const result = await toggleWishlist(product);

        console.log("❤️ [useOverviewActions] toggleWishlist result:", result);

        return {
          success: result.success,
          message: result.message || "Producto agregado a favoritos",
        };
      } catch (error) {
        console.error("❌ [useOverviewActions] Add to wishlist error:", error);
        return {
          success: false,
          message: "Error al agregar producto a favoritos",
        };
      }
    },
    [toggleWishlist]
  );

  // 🛒 CART ACTIONS
  const onAddToCart = useCallback(
    (product: ProductForCustomer) => {
      console.log("🛒 [useOverviewActions] onAddToCart:", {
        productId: product.id,
        productName: product.name,
      });

      addToCartOptimistic(product, 1);
    },
    [addToCartOptimistic]
  );

  // 👁️ QUICK VIEW ACTIONS
  const onQuickView = useCallback(
    (product: ProductForCustomer) => {
      console.log("👁️ [useOverviewActions] onQuickView:", {
        productId: product.id,
        productName: product.name,
      });

      // Default behavior for OverviewTab (no auto-close)
      openProductQuickView(product);
    },
    [openProductQuickView]
  );

  // 🧭 NAVIGATION ACTIONS
  const onViewAllProducts = useCallback(() => {
    console.log("🧭 [useOverviewActions] onViewAllProducts");
    setActiveTab("products");
  }, [setActiveTab]);

  const onViewAllCategories = useCallback(() => {
    console.log("🧭 [useOverviewActions] onViewAllCategories");
    setActiveTab("categories");
  }, [setActiveTab]);

  const onCategoryClick = useCallback(
    (category: CategoryForCustomer) => {
      console.log("🏷️ [useOverviewActions] onCategoryClick:", {
        categoryId: category.id,
        categoryName: category.name,
      });

      // TODO: Set category filter and switch to products tab
      // For now, just switch to products tab
      setActiveTab("products");
    },
    [setActiveTab]
  );

  const onNavigateToWishlist = useCallback(() => {
    console.log("💖 [useOverviewActions] onNavigateToWishlist");
    setActiveTab("wishlist");
  }, [setActiveTab]);

  // 🔍 SEARCH ACTIONS
  const onSearchChange = useCallback(
    (searchTerm: string) => {
      console.log("🔍 [useOverviewActions] onSearchChange:", { searchTerm });
      setGlobalSearchTerm(searchTerm);
    },
    [setGlobalSearchTerm]
  );

  const onSearchSubmit = useCallback(
    (searchTerm: string) => {
      console.log("🔍 [useOverviewActions] onSearchSubmit:", { searchTerm });
      setGlobalSearchTerm(searchTerm);
      setActiveTab("products"); // Navigate to products with search
    },
    [setGlobalSearchTerm, setActiveTab]
  );

  const onSearchSuggestionClick = useCallback(
    (suggestion: string) => {
      console.log("💡 [useOverviewActions] onSearchSuggestionClick:", {
        suggestion,
      });
      setGlobalSearchTerm(suggestion);
      setActiveTab("products");
    },
    [setGlobalSearchTerm, setActiveTab]
  );

  // 📊 STATS ACTIONS
  const onStatsClick = useCallback(
    (statType: "products" | "categories" | "wishlist" | "sale") => {
      console.log("📊 [useOverviewActions] onStatsClick:", { statType });

      switch (statType) {
        case "products":
        case "sale":
          setActiveTab("products");
          break;
        case "categories":
          setActiveTab("categories");
          break;
        case "wishlist":
          setActiveTab("wishlist");
          break;
        default:
          break;
      }
    },
    [setActiveTab]
  );

  return {
    // Primary product actions
    onAddToWishlist,
    onAddToCart,
    onQuickView,

    // Navigation actions
    onViewAllProducts,
    onViewAllCategories,
    onCategoryClick,
    onNavigateToWishlist,

    // Search actions
    onSearchChange,
    onSearchSubmit,
    onSearchSuggestionClick,

    // UI actions
    onStatsClick,
  };
}

export default useOverviewActions;
