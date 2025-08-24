/**
 * 📦 PRODUCTS TAB COMPONENT
 * =========================
 *
 * Gestión completa de productos con filtros avanzados
 * Búsqueda, paginación, modals y acciones bulk
 *
 * Created: 2025-01-17 - Inventory Products Tab
 */

"use client";

import React, { useState, useMemo, useCallback } from "react";
import {
  Package,
  Plus,
  Search,
  Filter,
  Grid3X3,
  List,
  Download,
  Upload,
  Edit3,
  Trash2,
  Eye,
  X,
} from "lucide-react";
import { cn } from "@/shared/utils";
import { useInventoryContext } from "../../../context";
import { ProductCard, StockIndicator, CategoryBadge } from "..";
import { TabTransition } from "../shared/TabTransition";
import type { ProductWithRelations } from "../../../types";

// 🔍 Advanced Search & Filter Component
const ProductFilters: React.FC = () => {
  const {
    globalSearchTerm,
    setGlobalSearchTerm,
    productFilters,
    setProductFilters,
    inventory,
    viewMode,
    setViewMode,
    clearAllFilters,
    setIsProductModalOpen,
  } = useInventoryContext();

  const { categories, suppliers } = inventory;
  const [showFilters, setShowFilters] = useState(false);

  const activeFiltersCount = useMemo(() => {
    return Object.values(productFilters).filter(
      (value) => value !== undefined && value !== null && value !== ""
    ).length;
  }, [productFilters]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-4">
      {/* Primary Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar productos por nombre, SKU o código de barras..."
            value={globalSearchTerm}
            onChange={(e) => setGlobalSearchTerm(e.target.value)}
            className={cn(
              "w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600",
              "bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100",
              "focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all",
              "placeholder:text-gray-500 dark:placeholder:text-gray-400"
            )}
          />
          {globalSearchTerm && (
            <button
              onClick={() => setGlobalSearchTerm("")}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "px-4 py-3 border rounded-lg flex items-center space-x-2 transition-all duration-200",
              "hover:scale-[1.02] active:scale-[0.98]",
              showFilters || activeFiltersCount > 0
                ? "border-blue-300 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                : "border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
            )}
          >
            <Filter className="w-4 h-4" />
            <span>Filtros</span>
            {activeFiltersCount > 0 && (
              <span className="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                {activeFiltersCount}
              </span>
            )}
          </button>

          {/* View Mode Toggle */}
          <div className="flex border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode("grid")}
              className={cn(
                "px-3 py-3 flex items-center transition-colors",
                viewMode === "grid"
                  ? "bg-blue-600 text-white"
                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
              )}
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={cn(
                "px-3 py-3 flex items-center border-l border-gray-300 dark:border-gray-600 transition-colors",
                viewMode === "list"
                  ? "bg-blue-600 text-white"
                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
              )}
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {/* Actions */}
          <button
            onClick={() => setIsProductModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg flex items-center space-x-2 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-4 focus:ring-blue-500/20"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Nuevo Producto</span>
          </button>
        </div>
      </div>

      {/* Advanced Filters */}
      <div
        className={cn(
          "transition-all duration-300 ease-in-out overflow-hidden",
          showFilters ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        )}
      >
        {showFilters && (
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-4">
              {/* Category Filter */}
              <select
                value={productFilters.categoryId || ""}
                onChange={(e) =>
                  setProductFilters({
                    ...productFilters,
                    categoryId: e.target.value || undefined,
                  })
                }
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todas las categorías</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>

              {/* Supplier Filter */}
              <select
                value={productFilters.supplierId || ""}
                onChange={(e) =>
                  setProductFilters({
                    ...productFilters,
                    supplierId: e.target.value || undefined,
                  })
                }
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos los proveedores</option>
                {suppliers.map((supplier) => (
                  <option key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </option>
                ))}
              </select>

              {/* Stock Status Filter */}
              <select
                value={productFilters.stockStatus || ""}
                onChange={(e) =>
                  setProductFilters({
                    ...productFilters,
                    stockStatus:
                      (e.target.value as
                        | "IN_STOCK"
                        | "LOW_STOCK"
                        | "CRITICAL_STOCK"
                        | "OUT_OF_STOCK") || undefined,
                  })
                }
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos los estados</option>
                <option value="IN_STOCK">En Stock</option>
                <option value="LOW_STOCK">Stock Bajo</option>
                <option value="CRITICAL_STOCK">Stock Crítico</option>
                <option value="OUT_OF_STOCK">Agotado</option>
              </select>

              {/* Price Range */}
              <input
                type="number"
                placeholder="Precio min"
                value={productFilters.minPrice || ""}
                onChange={(e) =>
                  setProductFilters({
                    ...productFilters,
                    minPrice: e.target.value
                      ? parseFloat(e.target.value)
                      : undefined,
                  })
                }
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
              />

              <input
                type="number"
                placeholder="Precio max"
                value={productFilters.maxPrice || ""}
                onChange={(e) =>
                  setProductFilters({
                    ...productFilters,
                    maxPrice: e.target.value
                      ? parseFloat(e.target.value)
                      : undefined,
                  })
                }
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Active Filters & Clear */}
            {activeFiltersCount > 0 && (
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {activeFiltersCount} filtro
                  {activeFiltersCount !== 1 ? "s" : ""} aplicado
                  {activeFiltersCount !== 1 ? "s" : ""}
                </div>
                <button
                  onClick={clearAllFilters}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                >
                  Limpiar todos los filtros
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// 📦 Products Display Component
const ProductsDisplay: React.FC = () => {
  const { inventory, viewMode, openEditModal, openDeleteConfirm } =
    useInventoryContext();
  const { products, isLoading } = inventory;

  const handleViewProduct = useCallback((product: ProductWithRelations) => {
    console.log("View product", product);
    // TODO: Open product modal
  }, []);

  const handleEditProduct = useCallback(
    (product: ProductWithRelations) => {
      openEditModal(product);
    },
    [openEditModal]
  );

  const handleDeleteProduct = useCallback(
    (product: ProductWithRelations) => {
      openDeleteConfirm(product);
    },
    [openDeleteConfirm]
  );

  if (isLoading) {
    return (
      <div
        className={cn(
          "transition-all duration-300",
          viewMode === "grid"
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            : "space-y-4"
        )}
      >
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className={cn(
              "bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse",
              viewMode === "grid" ? "h-80" : "h-24"
            )}
            style={{
              animationDelay: `${i * 0.1}s`,
            }}
          />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-16">
        <Package className="w-20 h-20 text-gray-300 dark:text-gray-600 mx-auto mb-6" />
        <h3 className="text-xl font-medium text-gray-900 dark:text-gray-100 mb-2">
          No se encontraron productos
        </h3>
        <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto">
          No hay productos que coincidan con tus criterios de búsqueda. Intenta
          ajustar los filtros o agregar productos nuevos.
        </p>
        <button
          onClick={() => setIsProductModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg flex items-center space-x-2 mx-auto transition-all duration-200 hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-blue-500/20"
        >
          <Plus className="w-5 h-5" />
          <span>Agregar Primer Producto</span>
        </button>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "transition-all duration-300",
        viewMode === "grid"
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          : "space-y-4"
      )}
    >
      {products.map((product, index) => (
        <div
          key={product.id}
          className={cn(
            "transition-all duration-200",
            viewMode === "list" &&
              "border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-md"
          )}
          style={{
            animationDelay: `${index * 0.05}s`,
          }}
        >
          {viewMode === "grid" ? (
            <ProductCard
              product={product}
              onView={handleViewProduct}
              onEdit={handleEditProduct}
              onDelete={handleDeleteProduct}
              className="h-full hover:scale-[1.02] transition-transform duration-200"
            />
          ) : (
            // List view layout
            <div className="p-4 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  {product.images[0] ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                      <Package className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                        {product.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                        SKU: {product.sku}
                      </p>
                      <div className="flex items-center space-x-4 mt-2">
                        <CategoryBadge
                          category={product.category}
                          size="sm"
                          showIcon={false}
                        />
                        <StockIndicator
                          stock={product.stock}
                          minStock={product.minStock}
                          maxStock={product.maxStock}
                          size="sm"
                          showLabel={true}
                        />
                      </div>
                    </div>

                    <div className="text-right ml-4">
                      <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        ${product.price.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Costo: ${product.cost.toLocaleString()}
                      </div>

                      <div className="flex items-center space-x-2 mt-2">
                        <button
                          onClick={() => handleViewProduct(product)}
                          className="p-1.5 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                          title="Ver detalles"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEditProduct(product)}
                          className="p-1.5 text-gray-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded transition-colors"
                          title="Editar"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product)}
                          className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

// 🎯 OPTIMIZED PRODUCTS TAB - Memoized for SPA Performance
const ProductsTab: React.FC = React.memo(function ProductsTab() {
  return (
    <TabTransition isActive={true} transitionType="fade" delay={50}>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fadeInUp stagger-1">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              📦 Gestión de Productos
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Administra tu catálogo de productos, stock y precios
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <Download className="w-4 h-4" />
              <span>Exportar</span>
            </button>

            <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <Upload className="w-4 h-4" />
              <span>Importar</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="animate-slideInDown stagger-2">
          <ProductFilters />
        </div>

        {/* Products Display */}
        <div className="animate-fadeInScale stagger-3">
          <ProductsDisplay />
        </div>
      </div>
    </TabTransition>
  );
});

export default ProductsTab;
