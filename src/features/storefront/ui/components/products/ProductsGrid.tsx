/**
 * 🛍️ PRODUCTS GRID COMPONENT
 * ===========================
 *
 * Grid/List view optimizado para productos. Usa ProfessionalProductCard
 * para renderizado individual y se enfoca solo en layout y performance.
 *
 * @version 2.0.0 - Separated Component
 */

"use client";

import React, { memo } from "react";
import { cn } from "@/lib/utils";
import { Package } from "lucide-react";

import { ProductsGridProps } from "./types";
import { ProfessionalProductCard } from "@/features/storefront/ui/components/shared/ProfessionalProductCard";

const ProductsGrid: React.FC<ProductsGridProps> = memo(function ProductsGrid({
  products,
  viewMode,
  onAddToCart,
  onAddToWishlist,
  onQuickView,
  isAddingToWishlist = false,
  isAddingToCart,
  allowAnimations,
}) {
  // 📭 EMPTY STATE
  if (products.length === 0) {
    return (
      <div
        className={cn(
          "text-center py-16 bg-white dark:bg-gray-800 rounded-lg",
          allowAnimations && "animate-customerFadeInUp"
        )}
      >
        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
          <Package className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          No se encontraron productos
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Intenta ajustar tus filtros o términos de búsqueda
        </p>
      </div>
    );
  }

  // 🔥 GRID VIEW - Optimized with staggered animations
  if (viewMode === "grid") {
    return (
      <div id="products-grid">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {products.map((product, index) => (
            <ProfessionalProductCard
              key={product.id}
              product={product}
              onAddToCart={onAddToCart}
              onAddToWishlist={onAddToWishlist}
              onQuickView={onQuickView}
              isAddingToWishlist={isAddingToWishlist}
              isAddingToCart={isAddingToCart(product.id)}
              variant="grid"
              className={cn(
                allowAnimations && `customer-stagger-${(index % 4) + 1}`,
                "transform-gpu will-change-transform"
              )}
            />
          ))}
        </div>
      </div>
    );
  }

  // 📋 LIST VIEW - Optimized with different stagger pattern
  return (
    <div id="products-grid">
      <div className="space-y-6">
        {products.map((product, index) => (
          <ProfessionalProductCard
            key={product.id}
            product={product}
            onAddToCart={onAddToCart}
            onAddToWishlist={onAddToWishlist}
            onQuickView={onQuickView}
            isAddingToWishlist={isAddingToWishlist}
            isAddingToCart={isAddingToCart(product.id)}
            variant="list"
            className={cn(
              allowAnimations && `customer-stagger-${(index % 3) + 1}`,
              "transform-gpu will-change-transform"
            )}
          />
        ))}
      </div>
    </div>
  );
});

export default ProductsGrid;
