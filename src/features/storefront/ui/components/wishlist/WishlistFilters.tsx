/**
 * 🎛️ WISHLIST FILTERS COMPONENT
 * ==============================
 *
 * Component sidebar con filtros para el WishlistTab.
 * Incluye filtros por categoría, precio, estado y acciones rápidas.
 *
 * @version 2.0.0 - Clean Architecture
 */

import React from "react";
import { cn } from "@/lib/utils";
import { Filter } from "lucide-react";
import { WishlistFiltersProps } from "./types";

export const WishlistFilters: React.FC<WishlistFiltersProps> = ({
  filters,
  categories,
  onCategoryFilter,
  onPriceRangeFilter,
  onSpecialFilterChange,
  onClearFilters,
  allowAnimations,
}) => {
  const priceRanges = [
    { label: "Menos de $500", min: 0, max: 500 },
    { label: "$500 - $1,000", min: 500, max: 1000 },
    { label: "$1,000 - $5,000", min: 1000, max: 5000 },
    { label: "$5,000 - $15,000", min: 5000, max: 15000 },
    { label: "$15,000 - $50,000", min: 15000, max: 50000 },
    { label: "Más de $50,000", min: 50000, max: 1000000 },
  ];

  const activeFiltersCount =
    filters.categories.length +
    (filters.onSale ? 1 : 0) +
    (filters.inStock ? 1 : 0);

  return (
    <div
      className={cn(
        "w-80 bg-white dark:bg-gray-800 rounded-lg shadow-sm h-fit",
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
              <span className="bg-pink-100 dark:bg-pink-900/30 text-pink-800 dark:text-pink-300 text-xs px-2 py-1 rounded-full">
                {activeFiltersCount}
              </span>
            )}
          </div>
          {activeFiltersCount > 0 && (
            <button
              onClick={onClearFilters}
              className="text-sm text-pink-600 dark:text-pink-400 hover:text-pink-700 dark:hover:text-pink-300"
            >
              Limpiar
            </button>
          )}
        </div>
      </div>

      {/* Filters Content */}
      <div className="p-6 space-y-8 max-h-[calc(100vh-200px)] overflow-y-auto">
        {/* Categories */}
        {categories.length > 0 && (
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
                    className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {category.name}
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
            {priceRanges.map((range, index) => (
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
                  onChange={() => onPriceRangeFilter([range.min, range.max])}
                  className="text-pink-600 focus:ring-pink-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {range.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Special Filters */}
        <div>
          <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Estado de Productos
          </h4>
          <div className="space-y-2">
            <label className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded-lg">
              <input
                type="checkbox"
                checked={filters.onSale}
                onChange={(e) =>
                  onSpecialFilterChange("onSale", e.target.checked)
                }
                className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
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
                className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                En Stock
              </span>
            </label>
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Acciones Rápidas
          </h4>
          <div className="space-y-2">
            <button className="w-full text-left p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 transition-colors">
              Ver solo productos disponibles
            </button>
            <button className="w-full text-left p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 transition-colors">
              Productos agregados esta semana
            </button>
            <button className="w-full text-left p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 transition-colors">
              Productos con descuento
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WishlistFilters;
