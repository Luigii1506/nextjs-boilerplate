/**
 * 🏷️ CATEGORY CARD COMPONENT
 * ==========================
 *
 * Reusable card component for displaying category information
 * Extracted from CategoriesTab for maintainability and reusability
 *
 * FEATURES:
 * - Color-coded category display with visual indicators
 * - Product count with prominent display
 * - Subcategories count and parent category indicator
 * - Action buttons (view, edit, delete) with hover effects
 * - Responsive design with dark mode support
 * - Active/inactive status badges
 *
 * Created: 2025-01-27 - Extracted from CategoriesTab
 */

"use client";

import React from "react";
import {
  Tags,
  Eye,
  Edit2,
  Trash2,
  Package,
  Layers,
} from "lucide-react";
import { cn } from "@/shared/utils";
import type { CategoryWithRelations } from "../../../types";

/**
 * CategoryCard component props
 */
export interface CategoryCardProps {
  /** Category data with relations */
  category: CategoryWithRelations;
  /** Callback when viewing category details */
  onView: (category: CategoryWithRelations) => void;
  /** Callback when editing category */
  onEdit: (category: CategoryWithRelations) => void;
  /** Callback when deleting category */
  onDelete: (category: CategoryWithRelations) => void;
}

/**
 * CategoryCard Component
 *
 * Displays a category card with product information, actions, and visual styling
 *
 * @param category - Category data with related information
 * @param onView - Handler for view action
 * @param onEdit - Handler for edit action
 * @param onDelete - Handler for delete action
 *
 * @example
 * <CategoryCard
 *   category={categoryData}
 *   onView={handleView}
 *   onEdit={handleEdit}
 *   onDelete={handleDelete}
 * />
 */
export const CategoryCard: React.FC<CategoryCardProps> = React.memo(
  ({ category, onView, onEdit, onDelete }) => {
    const productCount = category._count?.products || 0;
    const subcategoriesCount = category._count?.children || 0;
    const hasProducts = productCount > 0;

    return (
      <div className="group bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-200 overflow-hidden">
        {/* Color Header Bar */}
        <div
          className="h-2 w-full"
          style={{ backgroundColor: category.color || "#6B7280" }}
        />

        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center shadow-sm"
                  style={{
                    backgroundColor: `${category.color || "#6B7280"}20`,
                  }}
                >
                  <Tags
                    className="w-5 h-5"
                    style={{ color: category.color || "#6B7280" }}
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
                    {category.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      #{category.sortOrder}
                    </span>
                    {!category.isActive && (
                      <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-xs rounded-full font-medium">
                        Inactiva
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => onView(category)}
                className="p-2 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                title="Ver detalles"
              >
                <Eye className="w-4 h-4" />
              </button>
              <button
                onClick={() => onEdit(category)}
                className="p-2 text-gray-500 hover:text-yellow-600 dark:hover:text-yellow-400 rounded-lg hover:bg-yellow-50 dark:hover:bg-yellow-900/20 transition-colors"
                title="Editar"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDelete(category)}
                className="p-2 text-gray-500 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                title="Eliminar"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Description */}
          {category.description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2 leading-relaxed">
              {category.description}
            </p>
          )}

          {/* Products Section - Destacado */}
          <div
            className={cn(
              "rounded-lg p-4 mb-4",
              hasProducts
                ? "bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800"
                : "bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700"
            )}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "p-2 rounded-lg",
                    hasProducts
                      ? "bg-blue-100 dark:bg-blue-900/40"
                      : "bg-gray-200 dark:bg-gray-700"
                  )}
                >
                  <Package
                    className={cn(
                      "w-5 h-5",
                      hasProducts
                        ? "text-blue-600 dark:text-blue-400"
                        : "text-gray-400"
                    )}
                  />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    Productos
                  </p>
                  <p
                    className={cn(
                      "text-2xl font-bold",
                      hasProducts
                        ? "text-blue-600 dark:text-blue-400"
                        : "text-gray-400"
                    )}
                  >
                    {productCount}
                  </p>
                </div>
              </div>

              {hasProducts && (
                <button
                  onClick={() => onView(category)}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors"
                >
                  Ver Productos
                </button>
              )}
            </div>
          </div>

          {/* Footer Stats */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-3">
              {subcategoriesCount > 0 && (
                <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                  <Layers className="w-4 h-4" />
                  <span className="text-xs">
                    {subcategoriesCount} subcategoría
                    {subcategoriesCount !== 1 ? "s" : ""}
                  </span>
                </div>
              )}
            </div>

            {/* Parent indicator */}
            {category.parent && (
              <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                <Layers className="w-3 h-3" />
                {category.parent.name}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
);

CategoryCard.displayName = "CategoryCard";
