/**
 * 🎛️ PRODUCTS FILTERS COMPONENT
 * ==============================
 *
 * Sidebar avanzado de filtros con categorías, precios, ratings y más.
 * Componente especializado y optimizado con React.memo.
 *
 * @version 2.0.0 - Separated Component
 */

"use client";

import React, { memo, useMemo } from "react";
import { cn } from "@/lib/utils";
import { Filter, Star, X } from "lucide-react";

import { ProductsFiltersProps, PRICE_RANGES } from "./types";

const ProductsFilters: React.FC<ProductsFiltersProps> = memo(
  function ProductsFilters({
    filters,
    categories,
    onCategoryFilter,
    onPriceRangeFilter,
    onRatingFilter,
    onSpecialFilterChange,
    onClearFilters,
    isOpen,
    onClose,
    allowAnimations,
  }) {
    // 📊 COMPUTED VALUES
    const activeFiltersCount = useMemo(() => {
      return (
        filters.categories.length +
        filters.ratings.length +
        (filters.onSale ? 1 : 0) +
        (filters.inStock ? 1 : 0)
      );
    }, [filters]);

    return (
      <>
        {/* Mobile Overlay */}
        {isOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={onClose}
          />
        )}

        {/* Filters Sidebar */}
        <div
          className={cn(
            "w-80 bg-white dark:bg-gray-800 rounded-lg shadow-sm h-fit",
            "fixed lg:relative top-0 left-0 z-50 lg:z-auto",
            "transform transition-transform duration-300 lg:transform-none",
            isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
            allowAnimations && "animate-customerFadeInUp customer-stagger-1"
          )}
        >
          {/* Filters Header */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Filtros
                </h3>
                {activeFiltersCount > 0 && (
                  <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs px-2 py-1 rounded-full">
                    {activeFiltersCount}
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-2">
                {activeFiltersCount > 0 && (
                  <button
                    onClick={onClearFilters}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                  >
                    Limpiar
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="lg:hidden p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Filters Content */}
          <div className="p-6 space-y-8 max-h-[calc(100vh-120px)] overflow-y-auto">
            {/* Categories */}
            {categories && categories.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Categorías
                </h4>
                <div className="space-y-2">
                  {categories.slice(0, 6).map((category) => (
                    <label
                      key={category.id}
                      className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded-lg"
                    >
                      <input
                        type="checkbox"
                        checked={filters.categories.includes(category.name)}
                        onChange={() => onCategoryFilter(category.name)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {category.name}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 ml-auto">
                        ({category.productCount || 0})
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Price Range */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Rango de Precio
              </h4>
              <div className="space-y-2">
                {PRICE_RANGES.map((range, index) => (
                  <label
                    key={index}
                    className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded-lg"
                  >
                    <input
                      type="radio"
                      name="priceRange"
                      checked={
                        filters.priceRange[0] === range.min &&
                        filters.priceRange[1] === range.max
                      }
                      onChange={() =>
                        onPriceRangeFilter([range.min, range.max])
                      }
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {range.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Ratings */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Calificación
              </h4>
              <div className="space-y-2">
                {[4, 3, 2, 1].map((rating) => (
                  <label
                    key={rating}
                    className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded-lg"
                  >
                    <input
                      type="checkbox"
                      checked={filters.ratings.includes(rating)}
                      onChange={() => onRatingFilter(rating)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="flex items-center space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={cn(
                            "w-4 h-4",
                            i < rating
                              ? "text-yellow-400 fill-current"
                              : "text-gray-300"
                          )}
                        />
                      ))}
                      <span className="text-sm text-gray-600 dark:text-gray-400 ml-1">
                        y más
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Special Filters */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Características
              </h4>
              <div className="space-y-2">
                <label className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded-lg">
                  <input
                    type="checkbox"
                    checked={filters.onSale}
                    onChange={(e) =>
                      onSpecialFilterChange("onSale", e.target.checked)
                    }
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    En Oferta
                  </span>
                  <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full ml-auto">
                    🔥 HOT
                  </span>
                </label>

                <label className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded-lg">
                  <input
                    type="checkbox"
                    checked={filters.inStock}
                    onChange={(e) =>
                      onSpecialFilterChange("inStock", e.target.checked)
                    }
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    En Stock
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }
);

export default ProductsFilters;
