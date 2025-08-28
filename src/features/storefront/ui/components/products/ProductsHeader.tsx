/**
 * 🎯 PRODUCTS HEADER COMPONENT
 * ============================
 *
 * Header profesional para ProductsTab con búsqueda, filtros y controles.
 * Componente puro y optimizado con React.memo.
 *
 * @version 2.0.0 - Separated Component
 */

"use client";

import React, { memo } from "react";
import { cn } from "@/lib/utils";
import {
  Search,
  Grid,
  List,
  ChevronDown,
  Package,
  Sliders,
} from "lucide-react";

import { ProductsHeaderProps, SORT_OPTIONS } from "./types";

const ProductsHeader: React.FC<ProductsHeaderProps> = memo(
  function ProductsHeader({
    searchTerm,
    onSearchChange,
    sortBy,
    onSortChange,
    viewMode,
    onViewModeChange,
    isFiltersOpen,
    onFiltersToggle,
    totalProducts,
    allowAnimations,
  }) {
    return (
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-6">
          <div
            className={cn(
              "space-y-4",
              allowAnimations && "animate-customerFadeInUp"
            )}
          >
            {/* Page Title */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                  <Package className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    Productos
                  </h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Descubre nuestra amplia selección de productos
                  </p>
                </div>
              </div>

              {/* View Mode Toggle */}
              <div className="hidden sm:flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                <button
                  onClick={() => onViewModeChange("grid")}
                  className={cn(
                    "p-2 rounded-md transition-all duration-200",
                    viewMode === "grid"
                      ? "bg-white dark:bg-gray-800 shadow-sm text-blue-600 dark:text-blue-400"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                  )}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => onViewModeChange("list")}
                  className={cn(
                    "p-2 rounded-md transition-all duration-200",
                    viewMode === "list"
                      ? "bg-white dark:bg-gray-800 shadow-sm text-blue-600 dark:text-blue-400"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                  )}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Search & Controls */}
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search Bar */}
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                  <Search className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Buscar productos por nombre, marca, categoría..."
                  value={searchTerm}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg
                         bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent
                         placeholder:text-gray-500 dark:placeholder:text-gray-400
                         transition-all duration-200"
                />
              </div>

              {/* Controls Row */}
              <div className="flex items-center gap-3">
                {/* Filters Toggle */}
                <button
                  onClick={onFiltersToggle}
                  className={cn(
                    "flex items-center space-x-2 px-4 py-3 border rounded-lg transition-all duration-200",
                    isFiltersOpen
                      ? "bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300"
                      : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-500"
                  )}
                >
                  <Sliders className="w-5 h-5" />
                  <span className="hidden sm:inline">Filtros</span>
                </button>

                {/* Sort Dropdown */}
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => onSortChange(e.target.value)}
                    className="appearance-none bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 
                           text-gray-900 dark:text-gray-100 px-4 py-3 pr-10 rounded-lg
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent
                           transition-all duration-200"
                  >
                    {SORT_OPTIONS.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  </div>
                </div>

                {/* Results Count */}
                <div className="hidden lg:flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-medium">{totalProducts}</span>
                  <span className="ml-1">resultados</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

export default ProductsHeader;
