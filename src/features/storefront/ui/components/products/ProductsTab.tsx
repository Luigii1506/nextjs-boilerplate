/**
 * 🛒 PRODUCTS TAB - REFACTORED CLEAN ARCHITECTURE
 * ===============================================
 *
 * Componente principal del ProductsTab completamente refactorizado:
 * - Separación de responsabilidades
 * - Componentes modulares reutilizables
 * - Hooks especializados
 * - Performance optimizado para SPA
 * - Sin parpadeos ni timeouts artificiales
 *
 * @version 3.0.0 - Feature-First Architecture (Hooks centralizados)
 */

"use client";

import React, { useEffect, useMemo, useRef } from "react";
import { useStorefrontContext } from "@/features/storefront/context";

// 🎯 Import our specialized components
import ProductsHeader from "./ProductsHeader";
import ProductsResults from "./ProductsResults";
import ProductsFilters from "./ProductsFilters";
import ProductsGrid from "./ProductsGrid";
import ProductsPagination from "./ProductsPagination";

// 🚀 Import hooks from centralized location (Feature-First v3.0.0)
import {
  useProductsState,
  useProductsLogic,
  useProductsActions,
} from "@/features/storefront/hooks/products";

// 🎯 Import shared components
import { StorefrontPageSkeleton } from "@/features/storefront/ui/components/shared/ProductSkeleton";

/**
 * 🎯 MAIN PRODUCTS TAB COMPONENT
 *
 * Coordina componentes especializados y maneja el estado global.
 * Ya no tiene lógica de renderizado compleja, solo coordinación.
 */
const ProductsTab: React.FC = () => {
  const {
    products: filteredProducts,
    categories,
    globalSearchTerm,
    setGlobalSearchTerm,
    isAddingToWishlist,
  } = useStorefrontContext();

  // 🎛️ LOCAL STATE (via specialized hook)
  const { state, actions, startIndex } = useProductsState();

  // 🧠 LOGIC & PROCESSING (via specialized hook v3.0.0)
  const {
    processedProducts,
    activeFiltersCount,
    priceRange,
    availableCategories,
    handleCategoryFilter,
    handlePriceRangeFilter,
    handleRatingFilter,
    handleSpecialFilterChange,
  } = useProductsLogic({
    products: filteredProducts,
    searchTerm: state.localSearchTerm,
    filters: state.filters,
    sortBy: state.sortBy,
  });

  // 🚀 ACTIONS (via specialized hook)
  const {
    onAddToWishlist,
    onAddToCart,
    onQuickView,
    onPageChange,
    isAddingToCart,
  } = useProductsActions();

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 🎨 INSTANT ANIMATION SETUP (no artificial delays)
  useEffect(() => {
    if (state.isFirstRender) {
      // Use requestAnimationFrame for better performance
      const animationFrame = requestAnimationFrame(() => {
        actions.setAllowAnimations(true);
        actions.setFirstRender(false);
      });

      return () => cancelAnimationFrame(animationFrame);
    }
  }, [state.isFirstRender, actions]);

  // 🔍 SYNC SEARCH TERM
  useEffect(() => {
    actions.setLocalSearchTerm(globalSearchTerm);
  }, [globalSearchTerm, actions]);

  // 📄 PAGINATION CALCULATIONS
  const totalPages = Math.ceil(processedProducts.length / state.itemsPerPage);
  const paginatedProducts = processedProducts.slice(
    startIndex,
    startIndex + state.itemsPerPage
  );

  // 🔧 FILTER HANDLERS (wrapped with our state actions)
  const handleCategoryFilterWithState = (category: string) => {
    const newFilters = handleCategoryFilter(category, state.filters);
    actions.setFilters(newFilters);
  };

  const handlePriceRangeFilterWithState = (range: [number, number]) => {
    const newFilters = handlePriceRangeFilter(range, state.filters);
    actions.setFilters(newFilters);
  };

  const handleRatingFilterWithState = (rating: number) => {
    const newFilters = handleRatingFilter(rating, state.filters);
    actions.setFilters(newFilters);
  };

  const handleSpecialFilterChangeWithState = (
    key: keyof typeof state.filters,
    value: boolean | string[] | [number, number]
  ) => {
    const newFilters = handleSpecialFilterChange(key, value, state.filters);
    actions.setFilters(newFilters);
  };

  const handleClearAllFilters = () => {
    actions.resetFilters();
    setGlobalSearchTerm("");
  };

  const handlePageChangeWithScroll = (page: number) => {
    actions.setCurrentPage(page);
    onPageChange(page);
  };

  // 📭 LOADING STATE - Clean skeleton without delays
  if (state.isFirstRender) {
    return (
      <StorefrontPageSkeleton
        showFilters={true}
        productCount={12}
        variant={state.viewMode}
      />
    );
  }

  // 🎯 MAIN RENDER - Clean component composition
  return (
    <div className="bg-gray-50 dark:bg-gray-900">
      {/* 📋 Header - Search, filters, sorting */}
      <ProductsHeader
        searchTerm={state.localSearchTerm}
        onSearchChange={actions.setLocalSearchTerm}
        sortBy={state.sortBy}
        onSortChange={actions.setSortBy}
        viewMode={state.viewMode}
        onViewModeChange={actions.setViewMode}
        isFiltersOpen={state.isFiltersOpen}
        onFiltersToggle={actions.toggleFilters}
        totalProducts={processedProducts.length}
        allowAnimations={state.allowAnimations}
      />

      <div className="mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* 🎛️ Filters Sidebar */}
          <ProductsFilters
            filters={state.filters}
            categories={categories || []}
            onCategoryFilter={handleCategoryFilterWithState}
            onPriceRangeFilter={handlePriceRangeFilterWithState}
            onRatingFilter={handleRatingFilterWithState}
            onSpecialFilterChange={handleSpecialFilterChangeWithState}
            onClearFilters={handleClearAllFilters}
            isOpen={state.isFiltersOpen}
            onClose={() => actions.setFiltersOpen(false)}
            allowAnimations={state.allowAnimations}
          />

          {/* 🎯 Main Content */}
          <div className="flex-1">
            {/* 📊 Results Summary */}
            <ProductsResults
              totalProducts={processedProducts.length}
              searchTerm={state.localSearchTerm}
              itemsPerPage={state.itemsPerPage}
              onItemsPerPageChange={actions.setItemsPerPage}
              allowAnimations={state.allowAnimations}
            />

            {/* 🛍️ Products Grid */}
            <ProductsGrid
              products={paginatedProducts}
              viewMode={state.viewMode}
              onAddToCart={onAddToCart}
              onAddToWishlist={onAddToWishlist}
              onQuickView={onQuickView}
              isAddingToWishlist={isAddingToWishlist}
              isAddingToCart={isAddingToCart}
              allowAnimations={state.allowAnimations}
            />

            {/* 📄 Pagination */}
            <ProductsPagination
              currentPage={state.currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChangeWithScroll}
              allowAnimations={state.allowAnimations}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductsTab;
