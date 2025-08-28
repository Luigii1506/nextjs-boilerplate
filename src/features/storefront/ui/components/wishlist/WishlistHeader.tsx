/**
 * 🎯 WISHLIST HEADER COMPONENT
 * ============================
 *
 * Component header para el WishlistTab con búsqueda, controles y acciones.
 * Diseño profesional responsive con bulk actions.
 *
 * @version 2.0.0 - Clean Architecture
 */

import React from "react";
import { cn } from "@/lib/utils";
import { Search, Heart, Grid, List, ChevronDown } from "lucide-react";
import { WishlistHeaderProps, WISHLIST_SORT_OPTIONS } from "./types";

export const WishlistHeader: React.FC<WishlistHeaderProps> = ({
  searchTerm,
  onSearchChange,
  sortBy,
  onSortChange,
  viewMode,
  onViewModeChange,
  totalProducts,
  selectedCount,
  onSelectAll,
  onBulkAddToCart,
  onBulkRemove,
  allowAnimations,
}) => {
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
              <div className="w-10 h-10 bg-gradient-to-r from-pink-600 to-red-600 rounded-xl flex items-center justify-center">
                <Heart className="w-6 h-6 text-white fill-current animate-heartBeat" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  Mi Wishlist
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Tus productos favoritos guardados
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
                    ? "bg-white dark:bg-gray-800 shadow-sm text-pink-600 dark:text-pink-400"
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
                    ? "bg-white dark:bg-gray-800 shadow-sm text-pink-600 dark:text-pink-400"
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
                placeholder="Buscar en tu wishlist..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg
                         bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                         focus:ring-2 focus:ring-pink-500 focus:border-transparent
                         placeholder:text-gray-500 dark:placeholder:text-gray-400
                         transition-all duration-200"
              />
            </div>

            {/* Controls Row */}
            <div className="flex items-center gap-3">
              {/* Bulk Actions */}
              {selectedCount > 0 && (
                <div className="flex items-center space-x-2 bg-pink-50 dark:bg-pink-900/20 px-3 py-2 rounded-lg">
                  <span className="text-sm text-pink-700 dark:text-pink-300">
                    {selectedCount} seleccionados
                  </span>
                  <button
                    onClick={onBulkAddToCart}
                    className="text-xs bg-pink-600 text-white px-2 py-1 rounded hover:bg-pink-700 transition-colors"
                  >
                    + Carrito
                  </button>
                  <button
                    onClick={onBulkRemove}
                    className="text-xs bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700 transition-colors"
                  >
                    Remover
                  </button>
                </div>
              )}

              {/* Select All */}
              <button
                onClick={onSelectAll}
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                {selectedCount === totalProducts
                  ? "Deseleccionar"
                  : "Seleccionar"}{" "}
                Todo
              </button>

              {/* Sort Dropdown */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => onSortChange(e.target.value)}
                  className="appearance-none bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 
                           text-gray-900 dark:text-gray-100 px-4 py-3 pr-10 rounded-lg
                           focus:ring-2 focus:ring-pink-500 focus:border-transparent
                           transition-all duration-200"
                >
                  {WISHLIST_SORT_OPTIONS.map((option) => (
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
                <span className="ml-1">favoritos</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WishlistHeader;
