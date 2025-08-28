/**
 * 🛒 WISHLIST TAB - REFACTORED CLEAN ARCHITECTURE
 * ===============================================
 *
 * Componente principal del WishlistTab completamente refactorizado:
 * - Separación de responsabilidades
 * - Hooks especializados para estado, filtros y acciones
 * - Componentes modulares reutilizables
 * - Types centralizados
 * - Performance optimizado para SPA
 * - Sin parpadeos ni timeouts artificiales
 *
 * @version 3.0.0 - Feature-First Architecture (Hooks centralizados)
 */

"use client";

import React, { useEffect, useMemo } from "react";
import { cn } from "@/lib/utils";
import { useStorefrontContext } from "@/features/storefront/context";

// 🚀 Import hooks from centralized location (Feature-First v3.0.0)
import {
  useWishlistState,
  useWishlistLogic,
  useWishlistActions,
} from "@/features/storefront/hooks/wishlist";

// 🎯 Import modular components
import EmptyWishlist from "./EmptyWishlist";
import WishlistLoginPrompt from "./WishlistLoginPrompt";
import WishlistStats from "./WishlistStats";
import WishlistHeader from "./WishlistHeader";
import WishlistGrid from "./WishlistGrid";
import WishlistFilters from "./WishlistFilters";
import WishlistPagination from "./WishlistPagination";

// 🎯 Import types and constants
import { ITEMS_PER_PAGE_OPTIONS } from "./types";

/**
 * 🎯 MAIN WISHLIST TAB COMPONENT
 *
 * Coordina componentes especializados y maneja el estado global.
 * Ya no tiene lógica de renderizado compleja, solo coordinación.
 */
const WishlistTab: React.FC = () => {
  const {
    isAuthenticated,
    categories,
    globalSearchTerm,
    setGlobalSearchTerm,
    wishlist,
  } = useStorefrontContext();

  // 🎯 STATE MANAGEMENT (via specialized hook)
  const { state, actions } = useWishlistState();

  // 🧠 LOGIC & PROCESSING (via specialized hook v3.0.0)
  const {
    wishlistProducts,
    processedProducts,
    availableCategories,
    priceRange,
    handleSortChange,
    handleCategoryFilter,
    handlePriceRangeFilter,
    handleSpecialFilterChange,
  } = useWishlistLogic({
    wishlist: wishlist || [],
    searchTerm: state.localSearchTerm,
    filters: state.filters,
  });

  // 🚀 ACTIONS (via specialized hook)
  const {
    onRemoveFromWishlist,
    onAddToCart,
    onMoveToCart,
    onQuickView,
    onBulkAddToCart,
    onBulkRemoveFromWishlist,
    onPageChange,
    onLogin,
  } = useWishlistActions();

  useEffect(() => {
    actions.setLocalSearchTerm(globalSearchTerm);
    actions.setFilters({
      ...state.filters,
      searchTerm: globalSearchTerm,
    });
  }, [globalSearchTerm, actions]);

  // 📄 Pagination calculations
  const totalPages = Math.ceil(processedProducts.length / state.itemsPerPage);
  const startIndex = (state.currentPage - 1) * state.itemsPerPage;
  const paginatedProducts = processedProducts.slice(
    startIndex,
    startIndex + state.itemsPerPage
  );

  // 🔧 Enhanced Handler Functions
  const handleSortChangeLocal = (sortBy: string) => {
    const newFilters = handleSortChange(sortBy);
    actions.setFilters(newFilters);
    actions.setCurrentPage(1);
  };

  const handleCategoryFilterLocal = (category: string) => {
    const newFilters = handleCategoryFilter(category);
    actions.setFilters(newFilters);
    actions.setCurrentPage(1);
  };

  const handlePriceRangeFilterLocal = (range: [number, number]) => {
    const newFilters = handlePriceRangeFilter(range);
    actions.setFilters(newFilters);
    actions.setCurrentPage(1);
  };

  const handleSpecialFilterChangeLocal = (key: any, value: any) => {
    const newFilters = handleSpecialFilterChange(key, value);
    actions.setFilters(newFilters);
    actions.setCurrentPage(1);
  };

  const clearAllFilters = () => {
    actions.resetFilters();
    actions.setLocalSearchTerm("");
    setGlobalSearchTerm("");
    actions.setCurrentPage(1);
  };

  // 🎯 Bulk Actions
  const handleSelectAll = () => {
    if (state.selectedItems.size === paginatedProducts.length) {
      actions.clearSelection();
    } else {
      actions.setSelectedItems(new Set(paginatedProducts.map((p) => p.id)));
    }
  };

  const handleBulkAddToCartLocal = async () => {
    await onBulkAddToCart(paginatedProducts, state.selectedItems);
    actions.clearSelection();
  };

  const handleBulkRemoveFromWishlistLocal = async () => {
    await onBulkRemoveFromWishlist(paginatedProducts, state.selectedItems);
    actions.clearSelection();
  };

  // 📄 Pagination Handler
  const handlePageChangeLocal = (page: number) => {
    actions.setCurrentPage(page);
    actions.clearSelection(); // Clear selections on page change
    onPageChange(page);
  };

  // 🔐 Login Check - Use Real Authentication
  if (!isAuthenticated) {
    return <WishlistLoginPrompt onLogin={onLogin} />;
  }

  // Loading State for empty first render
  if (state.isFirstRender) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] bg-gray-50 dark:bg-gray-900">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-gradient-to-r from-pink-600 to-red-600 rounded-full animate-pulse flex items-center justify-center mx-auto">
            <div className="w-8 h-8 text-white fill-current animate-heartBeat">
              💖
            </div>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Cargando Wishlist...
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Preparando tus productos favoritos
          </p>
        </div>
      </div>
    );
  }

  // Empty Wishlist State
  if (
    processedProducts.length === 0 &&
    !state.localSearchTerm &&
    state.filters.categories.length === 0
  ) {
    console.log(
      "❌ [EMPTY WISHLIST] Rendering EmptyWishlist component - no products found after processing"
    );
    return <EmptyWishlist />;
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900">
      {/* Wishlist Header */}
      <WishlistHeader
        searchTerm={state.localSearchTerm}
        onSearchChange={actions.setLocalSearchTerm}
        sortBy={state.filters.sortBy}
        onSortChange={handleSortChangeLocal}
        viewMode={state.viewMode}
        onViewModeChange={actions.setViewMode}
        totalProducts={processedProducts.length}
        selectedCount={state.selectedItems.size}
        onSelectAll={handleSelectAll}
        onBulkAddToCart={handleBulkAddToCartLocal}
        onBulkRemove={handleBulkRemoveFromWishlistLocal}
        allowAnimations={state.allowAnimations}
      />

      <div className="mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-6">
        {/* Wishlist Stats */}
        <WishlistStats
          totalItems={processedProducts.length}
          totalValue={processedProducts.reduce(
            (sum, p) => sum + (p.currentPrice || 0),
            0
          )}
          onSaleItems={processedProducts.filter((p) => p.isOnSale).length}
          allowAnimations={state.allowAnimations}
        />

        <div className="flex flex-col lg:flex-row gap-8 mt-8">
          {/* Filters Sidebar */}
          <WishlistFilters
            filters={state.filters}
            categories={(categories || []).map((cat) => ({
              id: cat.id,
              name: cat.name,
              slug: cat.slug || cat.name.toLowerCase().replace(/\s+/g, "-"),
            }))}
            onCategoryFilter={handleCategoryFilterLocal}
            onPriceRangeFilter={handlePriceRangeFilterLocal}
            onSpecialFilterChange={handleSpecialFilterChangeLocal}
            onClearFilters={clearAllFilters}
            allowAnimations={state.allowAnimations}
          />

          {/* Wishlist Content */}
          <div className="flex-1">
            {/* Results Summary */}
            <div
              className={cn(
                "flex items-center justify-between mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm",
                state.allowAnimations && "animate-customerFadeInUp"
              )}
            >
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {processedProducts.length} productos en tu wishlist
                </h2>
                {state.localSearchTerm && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Resultados para:{" "}
                    <span className="font-medium">
                      &ldquo;{state.localSearchTerm}&rdquo;
                    </span>
                  </p>
                )}
              </div>

              {/* Items Per Page */}
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Mostrar:
                </span>
                <select
                  value={state.itemsPerPage}
                  onChange={(e) => {
                    actions.setItemsPerPage(Number(e.target.value));
                  }}
                  className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                >
                  {ITEMS_PER_PAGE_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option} por página
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Wishlist Grid */}
            <WishlistGrid
              products={paginatedProducts}
              viewMode={state.viewMode}
              selectedItems={state.selectedItems}
              onSelectItem={actions.toggleSelected}
              onRemoveFromWishlist={onRemoveFromWishlist}
              onAddToCart={onAddToCart}
              onMoveToCart={onMoveToCart}
              onQuickView={onQuickView}
              allowAnimations={state.allowAnimations}
            />

            {/* Pagination */}
            <WishlistPagination
              currentPage={state.currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChangeLocal}
              allowAnimations={state.allowAnimations}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default WishlistTab;
