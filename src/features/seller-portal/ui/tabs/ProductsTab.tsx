/**
 * 🏷️ PRODUCTS TAB - Seller Portal
 * =================================
 *
 * Gestión rápida de productos para ventas
 * - Vista en tabla con acciones inline
 * - Filtros de búsqueda y categoría
 * - Gestión de visibilidad y canales
 * - Toggle de estado activo
 *
 * REFACTORED: 2025-01-27
 * - Using shared Tab components (TabHeader, TabWrapper, TabSearchBar, TabLoadingSkeleton)
 * - Reduced from 396 to ~150 lines (62% reduction)
 * - Extracted 3 components
 * - Extracted products helpers
 * - Clean orchestration pattern
 *
 * Created: 2025-01-17
 * Last Updated: 2025-01-27
 */

"use client";

import { useState } from "react";
import { Tag } from "lucide-react";
import {
  useProducts,
  useCategories,
  useUpdateProductVisibility,
  useToggleProductActive,
} from "../../hooks/useProducts";
import { ProductVisibility, SalesChannel } from "../../types";
import type { ProductQuickView } from "../../types";
import { ProductFilters, ProductTable } from "../components/products";
import {
  TabHeader,
  TabWrapper,
  TabSearchBar,
  TabLoadingSkeleton,
} from "@/shared/ui/components/tabs";

export function ProductsTab() {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [visibilityFilter, setVisibilityFilter] = useState<string>("ALL");

  const { data: productsData, isLoading } = useProducts(
    page,
    20,
    searchQuery || undefined,
    categoryFilter !== "ALL" ? categoryFilter : undefined,
    visibilityFilter !== "ALL"
      ? (visibilityFilter as ProductVisibility)
      : undefined
  );

  const { data: categories } = useCategories();

  const updateVisibilityMutation = useUpdateProductVisibility();
  const toggleActiveMutation = useToggleProductActive();

  const products = productsData?.items || [];

  // Handlers
  const handleVisibilityChange = async (
    product: ProductQuickView,
    visibility: ProductVisibility
  ) => {
    try {
      await updateVisibilityMutation.mutateAsync({
        productId: product.id,
        visibility,
        availableChannels: product.availableChannels,
        isPublic: visibility === ProductVisibility.PUBLIC,
      });
    } catch {
      alert("Error al cambiar visibilidad");
    }
  };

  const handleChannelToggle = async (
    product: ProductQuickView,
    channel: SalesChannel
  ) => {
    const currentChannels = product.availableChannels;
    const newChannels = currentChannels.includes(channel)
      ? currentChannels.filter((c) => c !== channel)
      : [...currentChannels, channel];

    try {
      await updateVisibilityMutation.mutateAsync({
        productId: product.id,
        visibility: product.visibility,
        availableChannels: newChannels,
        isPublic: product.isPublic,
      });
    } catch {
      alert("Error al cambiar canal");
    }
  };

  const handleToggleActive = async (product: ProductQuickView) => {
    try {
      await toggleActiveMutation.mutateAsync({
        productId: product.id,
        isActive: !product.isActive,
      });
    } catch {
      alert("Error al activar/desactivar producto");
    }
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setPage(1);
  };

  const handleCategoryFilterChange = (category: string) => {
    setCategoryFilter(category);
    setPage(1);
  };

  const handleVisibilityFilterChange = (visibility: string) => {
    setVisibilityFilter(visibility);
    setPage(1);
  };

  return (
    <TabWrapper>
      <TabHeader
        icon={<Tag className="w-8 h-8 text-blue-600 dark:text-blue-400" />}
        title="Productos"
        description="Gestión rápida de productos y precios"
      />

      {/* Search Bar */}
      <TabSearchBar
        placeholder="Buscar productos por nombre o SKU..."
        value={searchQuery}
        onChange={handleSearchChange}
      />

      {/* Filters */}
      <ProductFilters
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        categoryFilter={categoryFilter}
        onCategoryChange={handleCategoryFilterChange}
        visibilityFilter={visibilityFilter}
        onVisibilityChange={handleVisibilityFilterChange}
        categories={categories}
      />

      {/* Loading State */}
      {isLoading && (
        <TabLoadingSkeleton type="table" count={10} showHeader={false} />
      )}

      {/* Products Table */}
      {!isLoading && (
        <ProductTable
          products={products}
          onVisibilityChange={handleVisibilityChange}
          onChannelToggle={handleChannelToggle}
          onToggleActive={handleToggleActive}
          isUpdatingVisibility={updateVisibilityMutation.isPending}
          isTogglingActive={toggleActiveMutation.isPending}
        />
      )}

      {/* Pagination */}
      {productsData && productsData.totalPages > 1 && (
        <div className="flex items-center justify-between bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-6 py-4">
          <div className="text-sm text-gray-600 dark:text-gray-300">
            Página {page} de {productsData.totalPages} ({productsData.total}{" "}
            productos)
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            <button
              onClick={() =>
                setPage((p) => Math.min(productsData.totalPages, p + 1))
              }
              disabled={page === productsData.totalPages}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </TabWrapper>
  );
}
