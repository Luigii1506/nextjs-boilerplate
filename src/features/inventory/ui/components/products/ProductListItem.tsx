/**
 * 📋 PRODUCT LIST ITEM COMPONENT
 * ================================
 *
 * Reusable list view component for displaying product information
 * Extracted from ProductsTab for maintainability and reusability
 *
 * FEATURES:
 * - Horizontal layout optimized for list view
 * - Product image with fallback
 * - Essential product information (name, SKU, category, stock)
 * - Price and cost display
 * - Action buttons (view, edit, delete)
 * - Optional checkbox for bulk selection
 * - Responsive design with dark mode support
 *
 * Created: 2025-01-27 - Extracted from ProductsTab
 */

"use client";

import React from "react";
import { Package, Eye, Edit3, Trash2 } from "lucide-react";
import { cn } from "@/shared/utils";
import { StockIndicator, CategoryBadge } from "..";
import type { ProductWithRelations } from "../../../types";

/**
 * ProductListItem component props
 */
export interface ProductListItemProps {
  /** Product data with relations */
  product: ProductWithRelations;
  /** Callback when viewing product */
  onView: (product: ProductWithRelations) => void;
  /** Callback when editing product */
  onEdit: (product: ProductWithRelations) => void;
  /** Callback when deleting product */
  onDelete: (product: ProductWithRelations) => void;
  /** Whether to show checkbox for selection */
  showCheckbox?: boolean;
  /** Whether product is selected */
  isSelected?: boolean;
  /** Callback when toggling selection */
  onToggleSelection?: (productId: string) => void;
}

/**
 * ProductListItem Component
 *
 * Displays a product in horizontal list layout with actions
 *
 * @param product - Product data with relations
 * @param onView - Handler for view action
 * @param onEdit - Handler for edit action
 * @param onDelete - Handler for delete action
 * @param showCheckbox - Whether to show selection checkbox
 * @param isSelected - Whether product is selected
 * @param onToggleSelection - Handler for selection toggle
 *
 * @example
 * <ProductListItem
 *   product={productData}
 *   onView={handleView}
 *   onEdit={handleEdit}
 *   onDelete={handleDelete}
 *   showCheckbox={true}
 *   isSelected={selectedIds.has(product.id)}
 *   onToggleSelection={handleToggleSelection}
 * />
 */
export const ProductListItem: React.FC<ProductListItemProps> = React.memo(
  ({
    product,
    onView,
    onEdit,
    onDelete,
    showCheckbox = false,
    isSelected = false,
    onToggleSelection,
  }) => {
    return (
      <div className="p-4 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
        <div className="flex items-center space-x-4">
          {/* Checkbox for list view */}
          {showCheckbox && (
            <div className="flex-shrink-0">
              <input
                type="checkbox"
                checked={isSelected}
                onChange={(e) => {
                  e.stopPropagation();
                  onToggleSelection?.(product.id);
                }}
                className={cn(
                  "w-5 h-5 rounded border-2 cursor-pointer transition-all",
                  "focus:ring-2 focus:ring-blue-500",
                  isSelected
                    ? "bg-blue-600 border-blue-600"
                    : "bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                )}
              />
            </div>
          )}

          {/* Product Image */}
          <div className="flex-shrink-0">
            {product.images[0] ? (
              // eslint-disable-next-line @next/next/no-img-element
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

          {/* Product Info */}
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

              {/* Price and Actions */}
              <div className="text-right ml-4">
                <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  ${product.price.toLocaleString()}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Costo: ${product.cost.toLocaleString()}
                </div>

                <div className="flex items-center space-x-2 mt-2">
                  <button
                    onClick={() => onView(product)}
                    className="p-1.5 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                    title="Ver detalles"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onEdit(product)}
                    className="p-1.5 text-gray-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded transition-colors"
                    title="Editar"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDelete(product)}
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
    );
  }
);

ProductListItem.displayName = "ProductListItem";
