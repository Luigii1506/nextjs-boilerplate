/**
 * 🛒 PRODUCTS TAB - CON FILTROS FUNCIONALES RESTAURADOS
 * =====================================================
 *
 * ✅ Filtros funcionales completos (categorías, precios, ratings, etc.)
 * ✅ Dark mode support
 * ✅ Single source of truth (StorefrontContext)
 * ✅ Super rápido - sin skeletons innecesarios
 * ✅ Diseño original mantenido
 *
 * RESTAURADO: 2025-01-29 - Filtros funcionales + Dark mode
 */

"use client";

import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
} from "react";
import { useStorefrontUI } from "@/features/storefront/context";
import { useStorefrontData, useWishlist } from "@/features/storefront/hooks";
import type { ProductForCustomer } from "@/features/storefront/types";

// 🎛️ Filtros restaurados
import ProductsFilters from "./ProductsFilters";
import ProductsHeader from "./ProductsHeader";
import ProductsGrid from "./ProductsGrid";
import ProductsPagination from "./ProductsPagination";
import {
  ProductFilters,
  DEFAULT_FILTERS,
  ITEMS_PER_PAGE_OPTIONS,
} from "./types";

// 🎯 PRODUCTS TAB PROPS - Recibe cart actions desde StorefrontScreen
interface ProductsTabProps {
  onAddToCart: (productId: string, quantity?: number) => Promise<void>;
}

/**
 * 🎯 PRODUCTS TAB - CON FILTROS FUNCIONALES COMPLETOS
 * ✅ SPA ARCHITECTURE - Recibe acciones desde StorefrontScreen (single source of truth)
 */
const ProductsTab: React.FC<ProductsTabProps> = ({ onAddToCart }) => {
  // 🎨 UI State
  const { globalSearchTerm, setGlobalSearchTerm, setViewingProduct } =
    useStorefrontUI();

  // 📊 Data (TanStack Query)
  const { data, isLoading } = useStorefrontData();
  const { addToWishlist, removeFromWishlist } = useWishlist();

  // Extract data
  const products = data?.products || [];
  const categories = data?.categories || [];

  // 🎯 Component State - SUPER FAST!
  const [isFirstRender, setIsFirstRender] = useState(true);
  const [allowAnimations, setAllowAnimations] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState("relevance");
  const [itemsPerPage, setItemsPerPage] = useState(24);
  const [currentPage, setCurrentPage] = useState(1);
  const [localSearchTerm, setLocalSearchTerm] = useState(globalSearchTerm);

  // 🎛️ Filtros completos restaurados
  const [filters, setFilters] = useState<ProductFilters>(DEFAULT_FILTERS);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 🎨 Anti-flicker Animation Setup - SUPER FAST!
  useEffect(() => {
    if (isFirstRender) {
      timeoutRef.current = setTimeout(() => {
        setAllowAnimations(true);
        setIsFirstRender(false);
      }, 100);
    }
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isFirstRender]);

  // 🔍 Search Term Sync
  useEffect(() => {
    setLocalSearchTerm(globalSearchTerm);
  }, [globalSearchTerm]);

  // 🎛️ FILTRADO COMPLETO - Todas las opciones funcionales
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = [...products];

    // 🔍 Filtrar por búsqueda
    if (localSearchTerm.trim()) {
      const searchLower = localSearchTerm.toLowerCase();
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchLower) ||
          product.description?.toLowerCase().includes(searchLower) ||
          product.brand?.toLowerCase().includes(searchLower)
      );
    }

    // 🏷️ Filtrar por categorías
    if (filters.categories.length > 0) {
      filtered = filtered.filter((product) =>
        filters.categories.includes(product.categoryId)
      );
    }

    // 💰 Filtrar por rango de precios
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 100000) {
      filtered = filtered.filter((product) => {
        const price = product.salePrice || product.price;
        return price >= filters.priceRange[0] && price <= filters.priceRange[1];
      });
    }

    // ⭐ Filtrar por ratings
    if (filters.ratings.length > 0) {
      filtered = filtered.filter((product) =>
        filters.ratings.some(
          (rating) => Math.floor(product.rating || 0) >= rating
        )
      );
    }

    // 🏷️ Filtrar por brands
    if (filters.brands.length > 0) {
      filtered = filtered.filter(
        (product) => product.brand && filters.brands.includes(product.brand)
      );
    }

    // 📦 Filtrar por stock
    if (filters.inStock) {
      filtered = filtered.filter(
        (product) => product.stock && product.stock > 0
      );
    }

    // 🔥 Filtrar por ofertas
    if (filters.onSale) {
      filtered = filtered.filter(
        (product) =>
          product.isOnSale &&
          product.salePrice &&
          product.salePrice < product.price
      );
    }

    // 📊 Ordenar productos
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "price_asc":
          return (a.salePrice || a.price) - (b.salePrice || b.price);
        case "price_desc":
          return (b.salePrice || b.price) - (a.salePrice || a.price);
        case "rating":
          return (b.rating || 0) - (a.rating || 0);
        case "newest":
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        case "bestseller":
          // Use reviewCount as proxy for bestseller until soldCount is added
          return (b.reviewCount || 0) - (a.reviewCount || 0);
        default: // relevance
          return 0;
      }
    });

    return filtered;
  }, [products, localSearchTerm, filters, sortBy]);

  // 📊 Paginación - SUPER FAST!
  const totalPages = Math.ceil(filteredAndSortedProducts.length / itemsPerPage);
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredAndSortedProducts.slice(startIndex, endIndex);
  }, [filteredAndSortedProducts, currentPage, itemsPerPage]);

  // 🎛️ FILTER HANDLERS - Funcionalidad completa restaurada
  const handleCategoryFilter = (categoryId: string) => {
    setFilters((prev) => ({
      ...prev,
      categories: prev.categories.includes(categoryId)
        ? prev.categories.filter((id) => id !== categoryId)
        : [...prev.categories, categoryId],
    }));
    setCurrentPage(1);
  };

  const handlePriceRangeFilter = (range: [number, number]) => {
    setFilters((prev) => ({ ...prev, priceRange: range }));
    setCurrentPage(1);
  };

  const handleRatingFilter = (rating: number) => {
    setFilters((prev) => ({
      ...prev,
      ratings: prev.ratings.includes(rating)
        ? prev.ratings.filter((r) => r !== rating)
        : [...prev.ratings, rating],
    }));
    setCurrentPage(1);
  };

  const handleSpecialFilterChange = (
    key: keyof ProductFilters,
    value: boolean | string[] | [number, number]
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setCurrentPage(1);
    setLocalSearchTerm("");
    setGlobalSearchTerm("");
  };

  // 🔍 SEARCH & SORT HANDLERS
  const handleSearchChange = (term: string) => {
    setLocalSearchTerm(term);
    setGlobalSearchTerm(term);
    setCurrentPage(1);
  };

  const handleSortChange = (sort: string) => {
    setSortBy(sort);
    setCurrentPage(1);
  };

  // 📱 VIEW HANDLERS
  const handleViewModeChange = (mode: "grid" | "list") => {
    setViewMode(mode);
  };

  const handleFiltersToggle = () => {
    setIsFiltersOpen(!isFiltersOpen);
  };

  // 📄 PAGINATION HANDLERS
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (items: number) => {
    setItemsPerPage(items);
    setCurrentPage(1);
  };

  // ⚡ PRODUCT ACTIONS - Directo y simple
  const handleWishlistToggle = useCallback(
    async (
      product: ProductForCustomer
    ): Promise<{ success: boolean; message: string }> => {
      try {
        if (product.isWishlisted) {
          await removeFromWishlist(product.id);
          return { success: true, message: "Producto eliminado de wishlist" };
        } else {
          await addToWishlist(product.id);
          return { success: true, message: "Producto agregado a wishlist" };
        }
      } catch (error) {
        console.error("Wishlist action failed:", error);
        return { success: false, message: "Error al actualizar wishlist" };
      }
    },
    [addToWishlist, removeFromWishlist]
  );

  const handleQuickView = useCallback(
    (product: ProductForCustomer) => {
      setViewingProduct(product);
    },
    [setViewingProduct]
  );

  // 🔄 Loading State
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="products-tab">
      {/* 🎯 PRODUCTS HEADER - Con filtros y búsqueda completos */}
      <ProductsHeader
        searchTerm={localSearchTerm}
        onSearchChange={handleSearchChange}
        sortBy={sortBy}
        onSortChange={handleSortChange}
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
        isFiltersOpen={isFiltersOpen}
        onFiltersToggle={handleFiltersToggle}
        totalProducts={filteredAndSortedProducts.length}
        allowAnimations={allowAnimations}
      />

      <div className="flex gap-6">
        {/* 🎛️ FILTROS SIDEBAR - Funcionalidad completa restaurada */}
        <div
          className={`${
            isFiltersOpen ? "block" : "hidden lg:block"
          } w-full lg:w-80 flex-shrink-0`}
        >
          <ProductsFilters
            filters={filters}
            categories={categories || []}
            onCategoryFilter={handleCategoryFilter}
            onPriceRangeFilter={handlePriceRangeFilter}
            onRatingFilter={handleRatingFilter}
            onSpecialFilterChange={handleSpecialFilterChange}
            onClearFilters={handleClearFilters}
            isOpen={isFiltersOpen}
            onClose={() => setIsFiltersOpen(false)}
            allowAnimations={allowAnimations}
          />
        </div>

        {/* 📋 PRODUCTOS MAIN CONTENT */}
        <div className="flex-1 min-w-0">
          {/* 📊 Results Info */}
          <div className="mb-4 flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
            <span>
              Mostrando{" "}
              {Math.min(
                (currentPage - 1) * itemsPerPage + 1,
                filteredAndSortedProducts.length
              )}{" "}
              -{" "}
              {Math.min(
                currentPage * itemsPerPage,
                filteredAndSortedProducts.length
              )}{" "}
              de {filteredAndSortedProducts.length} productos
            </span>
            <select
              value={itemsPerPage}
              onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
            >
              {ITEMS_PER_PAGE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option} por página
                </option>
              ))}
            </select>
          </div>

          {/* 📱 PRODUCTS GRID - Con dark mode support */}
          <ProductsGrid
            products={paginatedProducts}
            viewMode={viewMode}
            onAddToCart={onAddToCart}
            onAddToWishlist={handleWishlistToggle}
            onQuickView={handleQuickView}
            isAddingToCart={() => false} // Simplified - no individual loading states
            allowAnimations={allowAnimations}
          />

          {/* 📄 PAGINACIÓN - Solo si hay múltiples páginas */}
          {totalPages > 1 && (
            <div className="mt-8">
              <ProductsPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                allowAnimations={allowAnimations}
              />
            </div>
          )}

          {/* 📭 NO RESULTS STATE - Con dark mode */}
          {paginatedProducts.length === 0 && (
            <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-lg">
              <div className="text-gray-500 dark:text-gray-400">
                <svg
                  className="mx-auto h-16 w-16 mb-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <h3 className="text-xl font-medium mb-2 text-gray-900 dark:text-gray-100">
                  No se encontraron productos
                </h3>
                <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                  {localSearchTerm ||
                  filters.categories.length > 0 ||
                  filters.onSale ||
                  filters.inStock
                    ? "Intenta ajustar los filtros o la búsqueda"
                    : "No hay productos disponibles en este momento"}
                </p>
                {(localSearchTerm ||
                  filters.categories.length > 0 ||
                  filters.onSale ||
                  filters.inStock) && (
                  <button
                    onClick={handleClearFilters}
                    className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    Limpiar filtros
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductsTab;
