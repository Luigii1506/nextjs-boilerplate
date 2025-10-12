/**
 * 🏆 PROFESSIONAL PRODUCT CARD - ENTERPRISE LEVEL
 * ===============================================
 *
 * Tarjeta de producto súper profesional estilo Amazon/Shopify/eBay
 * Con diseño moderno, animaciones fluidas y UX perfecta
 *
 * Enterprise: 2025-01-26 - Professional product card
 */

"use client";

import React, { memo } from "react";
import { cn } from "@/shared/utils";
import type { ProductForCustomer } from "@/features/storefront/types";
import { AnimatedHeartButton } from "./AnimatedHeartButton";
// ✅ NO MORE CART CONTEXT - Using stable prop instead

interface ProfessionalProductCardProps {
  product: ProductForCustomer;
  onAddToCart?: (productId: string, quantity?: number) => Promise<void>; // ✅ STABLE PROP - From ProductsTab
  onAddToWishlist?: (
    product: ProductForCustomer
  ) => Promise<{ success: boolean; message: string }>;
  onQuickView?: (product: ProductForCustomer) => void;
  isAddingToWishlist?: boolean;
  isAddingToCart?: boolean;
  className?: string;
  variant?: "grid" | "list";
}

const ProfessionalProductCardComponent: React.FC<
  ProfessionalProductCardProps
> = ({
  product,
  onAddToCart, // ✅ STABLE PROP - From ProductsTab (memoized)
  onAddToWishlist,
  onQuickView,
  isAddingToWishlist = false,
  isAddingToCart = false,
  className,
  variant = "grid",
}) => {
  console.log("🃏 [PRODUCT CARD] Component re-rendering (MEMOIZED):", {
    productId: product.id,
    productName: product.name,
    usingStableProp: true,
    isMemoized: true,
    hasOnAddToCart: !!onAddToCart,
    timestamp: Date.now(),
  });

  // 🛒 Handle add to cart with stable prop - NO useCallback to prevent dependency issues
  const handleAddToCart = async (e: React.MouseEvent) => {
    console.log("🎯 [PRODUCT CARD] handleAddToCart clicked:", {
      productId: product.id,
      productName: product.name,
      isAddingToCart,
      usingStableProp: true,
      hasOnAddToCart: !!onAddToCart,
    });

    e.preventDefault();
    e.stopPropagation();

    if (!isAddingToCart && onAddToCart) {
      try {
        console.log("🚀 [PRODUCT CARD] Calling stable onAddToCart prop...");
        await onAddToCart(product.id, 1);
        console.log("✅ [PRODUCT CARD] onAddToCart completed");
      } catch (error) {
        console.error("❌ [PRODUCT CARD] Add to cart failed:", error);
      }
    } else {
      console.log("⚠️ [PRODUCT CARD] Add to cart blocked:", {
        isAddingToCart,
        hasOnAddToCart: !!onAddToCart,
      });
    }
  };

  // Format price with proper currency
  const formatPrice = (price: number | null | undefined) => {
    if (price == null || isNaN(Number(price))) {
      return "Precio no disponible";
    }
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(Number(price));
  };

  if (variant === "list") {
    return (
      <div
        className={cn(
          "bg-white dark:bg-gray-800 rounded-lg transition-all duration-200",
          "border border-gray-200 dark:border-gray-700 hover:border-gray-300",
          "shadow-sm hover:shadow-md p-4",
          className
        )}
      >
        <div className="flex items-start space-x-4">
          {/* Product Image - Simplified */}
          <div className="flex-shrink-0 w-24 h-24 rounded-md overflow-hidden bg-gray-100 dark:bg-gray-700">
            {product.images && product.images.length > 0 ? (
              <img
                src={product.images[0]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                No image
              </div>
            )}
          </div>

          {/* Product Info - Simplified */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 line-clamp-2">
                {product.name}
              </h3>

              {/* Animated Wishlist Button */}
              <AnimatedHeartButton
                product={product}
                isWishlisted={product.isWishlisted}
                isLoading={isAddingToWishlist}
                onToggle={onAddToWishlist}
                size="sm"
                variant="inline"
                className="ml-2"
              />
            </div>

            {/* Description */}
            {product.description && (
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
                {product.description}
              </p>
            )}

            {/* Price */}
            <p className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">
              {formatPrice(product.currentPrice)}
            </p>

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              disabled={isAddingToCart || (product.stock || 0) === 0}
              className={cn(
                "px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              {(product.stock || 0) === 0 ? "Agotado" : "Agregar al carrito"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Grid variant (default) - Simplified & Clean
  return (
    <div
      className={cn(
        "group bg-white dark:bg-gray-800 rounded-lg transition-all duration-200",
        "border border-gray-200 dark:border-gray-700 hover:border-gray-300",
        "shadow-sm hover:shadow-md",
        "overflow-hidden",
        className
      )}
    >
      {/* Product Image */}
      <div className="aspect-square bg-gray-100 dark:bg-gray-700 overflow-hidden relative">
        {/* Animated Wishlist Button */}
        <AnimatedHeartButton
          product={product}
          isWishlisted={product.isWishlisted}
          isLoading={isAddingToWishlist}
          onToggle={onAddToWishlist}
          size="md"
          variant="overlay"
        />

        {/* Simple Image Placeholder */}
        <div className="w-full h-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
          {product.images && product.images.length > 0 ? (
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
              onClick={() => onQuickView?.(product)}
            />
          ) : (
            <div className="text-gray-400">No image</div>
          )}
        </div>
      </div>

      {/* Product Info - Simplified */}
      <div className="p-4">
        {/* Product Name */}
        <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-2 line-clamp-2">
          {product.name}
        </h3>

        {/* Description - Optional */}
        {product.description && (
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
            {product.description}
          </p>
        )}

        {/* Price */}
        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          {formatPrice(product.currentPrice)}
        </p>

        {/* Add to Cart Button - Simple */}
        <button
          onClick={handleAddToCart}
          disabled={isAddingToCart || (product.stock || 0) === 0}
          className={cn(
            "w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        >
          {(product.stock || 0) === 0 ? "Agotado" : "Agregar al carrito"}
        </button>
      </div>
    </div>
  );
};

// Export memoized version with custom comparison to prevent unnecessary re-renders
export const ProfessionalProductCard = memo(
  ProfessionalProductCardComponent,
  (prevProps, nextProps) => {
    // Only re-render if product data actually changes
    return (
      prevProps.product.id === nextProps.product.id &&
      prevProps.product.name === nextProps.product.name &&
      prevProps.product.currentPrice === nextProps.product.currentPrice &&
      prevProps.product.originalPrice === nextProps.product.originalPrice &&
      prevProps.product.images === nextProps.product.images &&
      prevProps.product.stock === nextProps.product.stock &&
      prevProps.product.isWishlisted === nextProps.product.isWishlisted &&
      prevProps.isAddingToCart === nextProps.isAddingToCart &&
      prevProps.variant === nextProps.variant &&
      prevProps.className === nextProps.className
      // ✅ Ignore onAddToCart, onAddToWishlist, onRemoveFromWishlist - they're functions that change but do the same thing
    );
  }
);

// Set display name for React DevTools
ProfessionalProductCard.displayName = "ProfessionalProductCard";

export default ProfessionalProductCard;
