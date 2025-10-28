/**
 * 🔍 PRODUCT FILTERS COMPONENT
 * ==============================
 *
 * Search and filter controls for products
 *
 * Created: 2025-01-27
 */

"use client";

import React from "react";
import { ProductVisibility } from "../../../types";

export interface Category {
  id: string;
  name: string;
}

export interface ProductFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  categoryFilter: string;
  onCategoryChange: (category: string) => void;
  visibilityFilter: string;
  onVisibilityChange: (visibility: string) => void;
  categories: Category[] | undefined;
}

/**
 * ProductFilters - Search and filter controls
 */
export const ProductFilters: React.FC<ProductFiltersProps> = React.memo(
  ({
    searchQuery,
    onSearchChange,
    categoryFilter,
    onCategoryChange,
    visibilityFilter,
    onVisibilityChange,
    categories,
  }) => {
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Buscar
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Nombre o SKU..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Categoría
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => onCategoryChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="ALL">Todas</option>
              {categories?.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Visibilidad
            </label>
            <select
              value={visibilityFilter}
              onChange={(e) => onVisibilityChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="ALL">Todas</option>
              <option value={ProductVisibility.PUBLIC}>Público</option>
              <option value={ProductVisibility.HIDDEN}>Oculto</option>
              <option value={ProductVisibility.INTERNAL}>Interno</option>
              <option value={ProductVisibility.COMING_SOON}>
                Próximamente
              </option>
              <option value={ProductVisibility.DISCONTINUED}>
                Descontinuado
              </option>
            </select>
          </div>
        </div>
      </div>
    );
  }
);

ProductFilters.displayName = "ProductFilters";
