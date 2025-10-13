/**
 * 📊 PRODUCTS RESULTS COMPONENT
 * =============================
 *
 * Muestra resumen de resultados y control de items por página.
 * Componente puro optimizado para performance.
 *
 * @version 2.0.0 - Separated Component
 */

"use client";

import React, { memo } from "react";
import { cn } from "@/lib/utils";

import { ProductsResultsProps, ITEMS_PER_PAGE_OPTIONS } from "./types";

const ProductsResults: React.FC<ProductsResultsProps> = memo(
  function ProductsResults({
    totalProducts,
    searchTerm,
    itemsPerPage,
    onItemsPerPageChange,
    allowAnimations,
  }) {
    return (
      <div
        className={cn(
          "flex items-center justify-between mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm",
          allowAnimations && "animate-customerFadeInUp"
        )}
      >
        {/* Results Summary */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {totalProducts} productos encontrados
          </h2>
          {searchTerm && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Resultados para:{" "}
              <span className="font-medium">&ldquo;{searchTerm}&rdquo;</span>
            </p>
          )}
        </div>

        {/* Items Per Page Control */}
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Mostrar:
          </span>
          <select
            value={itemsPerPage}
            onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
            className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                     focus:ring-2 focus:ring-blue-500 focus:border-transparent
                     transition-all duration-200"
          >
            {ITEMS_PER_PAGE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option} por página
              </option>
            ))}
          </select>
        </div>
      </div>
    );
  }
);

export default ProductsResults;
