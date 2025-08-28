/**
 * 🛒 OVERVIEW TAB - REFACTORED CLEAN ARCHITECTURE
 * ===============================================
 *
 * Componente principal del OverviewTab completamente refactorizado:
 * - Separación de responsabilidades
 * - Hooks especializados para estado y acciones
 * - Componentes modulares reutilizables
 * - Types centralizados
 * - Performance optimizado para SPA
 * - Sin parpadeos ni timeouts artificiales
 *
 * @version 3.0.0 - Feature-First Architecture (Hooks centralizados)
 */

"use client";

import React, { useEffect } from "react";
import { useStorefrontContext } from "@/features/storefront/context";
import { OverviewPageSkeleton } from "@/features/storefront/ui/components/shared/ProductSkeleton";

// 🚀 Import hooks from centralized location (Feature-First v3.0.0)
import {
  useOverviewState,
  useOverviewLogic,
  useOverviewActions,
} from "@/features/storefront/hooks/overview";

// 🎯 Import modular components
import HeroSection from "./HeroSection";
import FeaturedProducts from "./FeaturedProducts";
import PopularCategories from "./PopularCategories";

/**
 * 🎯 MAIN OVERVIEW TAB COMPONENT
 *
 * Coordina componentes especializados y maneja el estado global.
 * Ya no tiene lógica de renderizado compleja, solo coordinación.
 */
const OverviewTab: React.FC = () => {
  const {
    isAuthenticated,
    products,
    featuredProducts,
    categories,
    globalSearchTerm,
    wishlist,
  } = useStorefrontContext();

  // 🎯 STATE MANAGEMENT (via specialized hook)
  const { state, actions } = useOverviewState();

  // 🧠 LOGIC & PROCESSING (via specialized hook v3.0.0)
  const {
    processedFeaturedProducts,
    popularCategories,
    overviewStats,
    searchSuggestions,
    insights,
  } = useOverviewLogic({
    products: products || [],
    featuredProducts: featuredProducts || [],
    categories: categories || [],
    wishlistCount: wishlist?.length || 0,
  });

  // 🚀 ACTIONS (via specialized hook)
  const {
    onAddToCart,
    onAddToWishlist,
    onQuickView,
    onViewAllProducts,
    onViewAllCategories,
    onCategoryClick,
    onSearchChange,
  } = useOverviewActions();

  // 🔍 Search Term Sync
  useEffect(() => {
    actions.setSearchTerm(globalSearchTerm);
  }, [globalSearchTerm, actions]);

  // Loading State for empty first render
  if (state.isFirstRender) {
    return <OverviewPageSkeleton />;
  }

  // 📊 Data Processing moved to useOverviewLogic hook

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section with Search */}
      <HeroSection
        globalSearchTerm={globalSearchTerm}
        onSearchChange={onSearchChange}
        isAuthenticated={isAuthenticated}
        allowAnimations={state.allowAnimations}
      />

      {/* Featured Products Section */}
      {processedFeaturedProducts.length > 0 && (
        <FeaturedProducts
          products={processedFeaturedProducts}
          onAddToCart={onAddToCart}
          onAddToWishlist={onAddToWishlist}
          onQuickView={onQuickView}
          onViewAllProducts={onViewAllProducts}
          allowAnimations={state.allowAnimations}
        />
      )}

      {/* Popular Categories Section */}
      {popularCategories.length > 0 && (
        <PopularCategories
          categories={popularCategories}
          onCategoryClick={onCategoryClick}
          onViewAllCategories={onViewAllCategories}
          allowAnimations={state.allowAnimations}
        />
      )}

      {/* Footer Spacer */}
      <div className="h-16" />
    </div>
  );
};

export default OverviewTab;
