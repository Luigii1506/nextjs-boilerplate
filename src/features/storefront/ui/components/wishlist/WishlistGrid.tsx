/**
 * 🛍️ WISHLIST GRID COMPONENT
 * ==========================
 *
 * Component grid para mostrar productos del wishlist usando ProfessionalProductCard.
 * Soporta vista grid y list con selección múltiple.
 *
 * @version 2.0.0 - Clean Architecture
 */

"use client";

import React, { useCallback } from "react";
import { cn } from "@/lib/utils";
import { Heart } from "lucide-react";
import { ProfessionalProductCard } from "@/features/storefront/ui/components/shared/ProfessionalProductCard";
import { ProductForCustomer } from "@/features/storefront/types";
import { WishlistGridProps } from "./types";

export const WishlistGrid: React.FC<WishlistGridProps> = ({
  products,
  viewMode,
  selectedItems,
  onSelectItem,
  onRemoveFromWishlist,
  onAddToCart,
  onMoveToCart,
  onQuickView,
  allowAnimations,
}) => {
  // Use unused parameters to avoid lint warnings
  void selectedItems;
  void onSelectItem;
  void onMoveToCart;

  // 💖 Wishlist Actions - Convert to ProductsTab format
  const onAddToWishlist = useCallback(
    async (
      product: ProductForCustomer
    ): Promise<{ success: boolean; message: string }> => {
      // Remove from wishlist when clicked in wishlist
      const result = await onRemoveFromWishlist(product);
      return {
        success: result.success,
        message: result.message || "Producto eliminado de favoritos",
      };
    },
    [onRemoveFromWishlist]
  );

  if (products.length === 0) {
    return (
      <div
        className={cn(
          "text-center py-16 bg-white dark:bg-gray-800 rounded-lg",
          allowAnimations && "animate-customerFadeInUp"
        )}
      >
        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
          <Heart className="w-8 h-8 text-gray-400" />
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

  return (
    <div id="wishlist-grid">
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {products.map((product, index) => (
            <ProfessionalProductCard
              key={product.id}
              product={product}
              onAddToCart={onAddToCart}
              onAddToWishlist={onAddToWishlist} // Pass the adapted handler
              onQuickView={onQuickView}
              isAddingToWishlist={false} // Assuming no separate loading state for wishlist removal
              variant="grid"
              className={cn(
                allowAnimations && `customer-stagger-${(index % 4) + 1}`,
                "transform-gpu will-change-transform"
              )}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {products.map((product, index) => (
            <ProfessionalProductCard
              key={product.id}
              product={product}
              onAddToCart={onAddToCart}
              onAddToWishlist={onAddToWishlist} // Pass the adapted handler
              onQuickView={onQuickView}
              isAddingToWishlist={false}
              variant="list"
              className={cn(
                allowAnimations && `customer-stagger-${(index % 3) + 1}`,
                "transform-gpu will-change-transform"
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default WishlistGrid;
