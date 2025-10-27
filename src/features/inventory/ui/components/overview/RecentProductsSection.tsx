/**
 * 📦 RECENT PRODUCTS SECTION COMPONENT
 * =====================================
 *
 * Displays recently updated products in a grid layout
 * Extracted from OverviewTab for reusability and maintainability
 *
 * FEATURES:
 * - Shows last 6 updated products
 * - Grid responsive layout
 * - Loading and empty states
 * - Staggered animation
 *
 * Created: 2025-01-27 - Extracted from OverviewTab
 */

"use client";

import React, { useMemo } from "react";
import { Package } from "lucide-react";
import { TabLoadingSkeleton, TabEmptyState } from "@/shared/ui/components/tabs";
import { ProductCard } from "../shared";
import { computeProductProps } from "../../../utils";
import type { ProductWithRelations } from "../../../types";

/**
 * Component props
 */
export interface RecentProductsSectionProps {
  products: ProductWithRelations[];
  isLoading?: boolean;
  maxDisplay?: number;
  onManageClick?: () => void;
  className?: string;
}

/**
 * Recent Products Section Component
 *
 * Displays a grid of recently updated products with staggered animations
 *
 * @param products - Array of products to display
 * @param isLoading - Loading state
 * @param maxDisplay - Maximum number of products to show (default: 6)
 * @param onManageClick - Callback when "Gestionar productos" is clicked
 * @param className - Additional CSS classes
 *
 * @example
 * <RecentProductsSection
 *   products={inventoryProducts}
 *   isLoading={false}
 *   maxDisplay={6}
 *   onManageClick={() => setActiveTab('products')}
 * />
 */
export const RecentProductsSection: React.FC<RecentProductsSectionProps> =
  React.memo(
    ({
      products,
      isLoading = false,
      maxDisplay = 6,
      onManageClick,
      className,
    }) => {
      // Sort by most recently updated and limit
      const recentProducts = useMemo(
        () =>
          products
            .slice(0, maxDisplay)
            .sort(
              (a, b) =>
                new Date(b.updatedAt).getTime() -
                new Date(a.updatedAt).getTime()
            ),
        [products, maxDisplay]
      );

      return (
        <div
          className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm ${className || ""}`}
        >
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  📦 Productos Recientes
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Últimos productos actualizados
                </p>
              </div>

              {/* Manage button */}
              {onManageClick && (
                <button
                  onClick={onManageClick}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center space-x-1 transition-colors"
                  aria-label="Gestionar productos"
                >
                  <Package className="w-3 h-3" />
                  <span>Gestionar productos</span>
                </button>
              )}
            </div>

            {/* Content */}
            {isLoading ? (
              /* Loading state */
              <TabLoadingSkeleton type="grid" count={6} className="h-48" />
            ) : recentProducts.length === 0 ? (
              /* Empty state */
              <TabEmptyState
                icon={<Package className="w-20 h-20" />}
                title="No hay productos recientes"
                description="Los productos actualizados recientemente aparecerán aquí"
              />
            ) : (
              /* Products grid */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {recentProducts.map((product, index) => (
                  <div
                    key={product.id}
                    style={{
                      animationDelay: `${index * 0.1}s`,
                    }}
                  >
                    <ProductCard
                      product={computeProductProps(product)}
                      showActions={false}
                      className="h-full hover:scale-[1.02] transition-transform duration-200"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      );
    }
  );

RecentProductsSection.displayName = "RecentProductsSection";
