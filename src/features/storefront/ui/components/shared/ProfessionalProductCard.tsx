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

import React, { useState, useCallback, useEffect } from "react";
import { cn } from "@/shared/utils";
import {
  Heart,
  Star,
  ShoppingCart,
  Eye,
  Package,
  Truck,
  Shield,
  Zap,
} from "lucide-react";
import type { ProductForCustomer } from "@/features/storefront/types";
import { ProductSkeleton } from "./ProductSkeleton";

interface ProfessionalProductCardProps {
  product: ProductForCustomer;
  onAddToCart?: (product: ProductForCustomer) => void;
  onAddToWishlist?: (
    product: ProductForCustomer
  ) => Promise<{ success: boolean; message: string }>;
  onQuickView?: (product: ProductForCustomer) => void;
  isAddingToWishlist?: boolean;
  isAddingToCart?: boolean;
  className?: string;
  variant?: "grid" | "list";
}

export const ProfessionalProductCard: React.FC<
  ProfessionalProductCardProps
> = ({
  product,
  onAddToCart,
  onAddToWishlist,
  onQuickView,
  isAddingToWishlist = false,
  isAddingToCart = false,
  className,
  variant = "grid",
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded] = useState(false);
  const [heartAnimating, setHeartAnimating] = useState(false);
  const [localAddingToWishlist, setLocalAddingToWishlist] = useState(false);
  const [optimisticWishlisted, setOptimisticWishlisted] = useState(
    product.isWishlisted
  );

  // Update optimistic state when product.isWishlisted changes from server
  useEffect(() => {
    setOptimisticWishlisted(product.isWishlisted);
  }, [product.isWishlisted]);

  // Handle wishlist toggle with animation
  const handleWishlistClick = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (isAddingToWishlist || localAddingToWishlist || !onAddToWishlist)
        return;

      // Optimistic update
      setOptimisticWishlisted(!optimisticWishlisted);

      setHeartAnimating(true);

      setLocalAddingToWishlist(true);

      try {
        const result = await onAddToWishlist(product);

        // If the server call fails, revert optimistic update
        if (!result?.success) {
          setOptimisticWishlisted(!optimisticWishlisted);
        }
      } catch (error) {
        console.error("Wishlist error:", error);
        // Revert optimistic update on error
        setOptimisticWishlisted(!optimisticWishlisted);
      } finally {
        setLocalAddingToWishlist(false);
        setTimeout(() => setHeartAnimating(false), 600);
      }
    },
    [
      product, // ✅ Incluir producto completo porque lo usamos en onAddToWishlist
      onAddToWishlist,
      isAddingToWishlist,
      localAddingToWishlist,
      optimisticWishlisted,
    ]
  );

  // Handle add to cart
  const handleAddToCart = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!isAddingToCart && onAddToCart) {
        onAddToCart(product);
      }
    },
    [product, isAddingToCart, onAddToCart]
  );

  // Handle quick view
  const handleQuickView = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (onQuickView) {
        onQuickView(product);
      }
    },
    [product, onQuickView] // ✅ Incluir producto completo porque lo usamos en onQuickView
  );

  // Generate rating stars
  const renderStars = () => {
    const stars = [];
    const safeRating = product.rating || 0;
    const fullStars = Math.floor(safeRating);
    const hasHalfStar = safeRating % 1 !== 0;

    for (let i = 0; i < 5; i++) {
      stars.push(
        <Star
          key={i}
          className={cn(
            "w-3.5 h-3.5 transition-colors",
            i < fullStars
              ? "text-yellow-400 fill-yellow-400"
              : i === fullStars && hasHalfStar
              ? "text-yellow-400 fill-yellow-400 opacity-50"
              : "text-gray-300 dark:text-gray-600"
          )}
        />
      );
    }
    return stars;
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
          "group relative bg-white dark:bg-gray-800 rounded-2xl transition-all duration-300",
          "border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600",
          "shadow-sm hover:shadow-xl p-6",
          "transform hover:scale-[1.02]",
          className
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* 💀 SKELETON OVERLAY - Add to Cart Loading */}
        {isAddingToCart && (
          <div className="absolute inset-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl z-10 flex items-center justify-center">
            <ProductSkeleton variant="list" className="opacity-60" />
          </div>
        )}
        <div className="flex items-start space-x-6">
          {/* Product Image */}
          <div className="relative flex-shrink-0 w-32 h-32 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700">
            {!imageLoaded && (
              <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 animate-pulse" />
            )}
            <div className="w-full h-full bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900 dark:to-indigo-800 flex items-center justify-center">
              <Package className="w-8 h-8 text-gray-400" />
            </div>
            {product.isOnSale && (product.discountPercentage || 0) > 0 && (
              <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                -{Math.round(product.discountPercentage || 0)}%
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1 line-clamp-2">
                  {product.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  {product.brand}
                </p>
              </div>

              {/* Wishlist Button */}
              <button
                onClick={handleWishlistClick}
                disabled={isAddingToWishlist || localAddingToWishlist}
                className={cn(
                  "relative p-2 rounded-full transition-all duration-300 group/heart",
                  "hover:scale-110 active:scale-95",
                  optimisticWishlisted
                    ? "bg-red-50 dark:bg-red-900/20 text-red-500"
                    : "bg-gray-50 dark:bg-gray-800 text-gray-400 hover:bg-red-50 hover:text-red-500"
                )}
              >
                <Heart
                  className={cn(
                    "w-5 h-5 transition-all duration-300",
                    optimisticWishlisted && "fill-current",
                    heartAnimating && "animate-bounce scale-125",
                    "group-hover/heart:scale-110"
                  )}
                />
                {heartAnimating && (
                  <div className="absolute inset-0 bg-red-400 rounded-full animate-ping opacity-20" />
                )}
              </button>
            </div>

            {/* Rating and Reviews */}
            <div className="flex items-center space-x-2 mb-3">
              <div className="flex items-center space-x-1">{renderStars()}</div>
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {(product.rating || 0).toFixed(1)}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                ({(product.reviewCount || 0).toLocaleString()})
              </span>
            </div>

            {/* Price */}
            <div className="flex items-center space-x-2 mb-4">
              <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {formatPrice(product.currentPrice)}
              </span>
              {product.isOnSale && (
                <span className="text-lg text-gray-500 line-through">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
            </div>

            {/* Features */}
            <div className="flex flex-wrap gap-2 mb-4">
              <div className="flex items-center space-x-1 text-xs text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                <Truck className="w-3 h-3" />
                <span>Envío gratis</span>
              </div>
              <div className="flex items-center space-x-1 text-xs text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                <Shield className="w-3 h-3" />
                <span>Garantía</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-3">
              <button
                onClick={handleAddToCart}
                disabled={isAddingToCart || (product.stock || 0) === 0}
                className={cn(
                  "flex-1 px-6 py-3 rounded-xl font-medium transition-all duration-300",
                  "transform hover:scale-105 active:scale-95",
                  "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100",
                  (product.stock || 0) > 0
                    ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                )}
              >
                <div className="flex items-center justify-center space-x-2">
                  <ShoppingCart className="w-5 h-5" />
                  <span>
                    {(product.stock || 0) > 0
                      ? "Agregar al carrito"
                      : "Agotado"}
                  </span>
                </div>
              </button>

              <button
                onClick={handleQuickView}
                className="p-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 rounded-xl transition-all duration-300 hover:scale-105"
              >
                <Eye className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Grid variant (default)
  return (
    <div
      className={cn(
        "group relative bg-white dark:bg-gray-800 rounded-2xl transition-all duration-500",
        "border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600",
        "shadow-sm hover:shadow-2xl",
        "transform hover:scale-[1.03] hover:-translate-y-2",
        "overflow-visible", // Important: don't clip the hover effects
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 💀 SKELETON OVERLAY - Add to Cart Loading */}
      {isAddingToCart && (
        <div className="absolute inset-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl z-30 flex items-center justify-center">
          <ProductSkeleton variant="grid" className="opacity-60" />
        </div>
      )}
      {/* Product Image Container */}
      <div className="relative aspect-square rounded-t-2xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600">
        {/* Sale Badge */}
        {product.isOnSale && (product.discountPercentage || 0) > 0 && (
          <div className="absolute top-3 left-3 bg-gradient-to-r from-red-500 to-pink-500 text-white text-sm font-bold px-3 py-1 rounded-full shadow-lg z-20">
            -{Math.round(product.discountPercentage || 0)}%
          </div>
        )}

        {/* Badges */}
        {product.badges &&
          Array.isArray(product.badges) &&
          product.badges.length > 0 && (
            <div className="absolute top-3 left-3 flex flex-col space-y-1 z-20">
              {product.badges.map((badge: string, index: number) => (
                <span
                  key={index}
                  className={cn(
                    "px-2 py-1 text-xs font-semibold rounded-full shadow-sm",
                    badge === "NEW" && "bg-green-500 text-white",
                    badge === "POPULAR" && "bg-blue-500 text-white",
                    badge === "LIMITED" && "bg-purple-500 text-white"
                  )}
                >
                  {badge}
                </span>
              ))}
            </div>
          )}

        {/* Wishlist Button - Always visible when wishlisted */}
        <div
          className={cn(
            "absolute top-3 right-3 z-50 transition-all duration-300",
            optimisticWishlisted || isHovered
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-2"
          )}
        >
          <button
            onClick={handleWishlistClick}
            disabled={isAddingToWishlist || localAddingToWishlist}
            className={cn(
              "relative p-3 rounded-full transition-all duration-300 group/heart backdrop-blur-sm",
              "transform hover:scale-110 active:scale-95",
              "shadow-lg hover:shadow-xl",
              optimisticWishlisted
                ? "bg-red-500 text-white hover:bg-red-600"
                : "bg-white/90 dark:bg-gray-800/90 text-gray-600 dark:text-gray-300 hover:bg-red-50 hover:text-red-500"
            )}
          >
            <Heart
              className={cn(
                "w-5 h-5 transition-all duration-300",
                optimisticWishlisted && "fill-current",
                heartAnimating && "animate-pulse scale-125"
              )}
            />

            {/* Animated ring on click */}
            {heartAnimating && (
              <>
                <div className="absolute inset-0 bg-red-400 rounded-full animate-ping opacity-30" />
                <div className="absolute inset-0 bg-red-400 rounded-full animate-ping opacity-20 animation-delay-200" />
              </>
            )}
          </button>
        </div>

        {/* Product Image Placeholder */}
        <div className="w-full h-full bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900 dark:to-indigo-800 flex items-center justify-center">
          <Package className="w-16 h-16 text-gray-400" />
        </div>

        {/* Quick Actions Overlay */}
        <div
          className={cn(
            "absolute inset-0 bg-black/0 transition-all duration-300 flex items-center justify-center",
            isHovered && "bg-black/20"
          )}
        >
          <button
            onClick={handleQuickView}
            className={cn(
              "px-6 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-xl font-medium shadow-lg",
              "transform transition-all duration-300 hover:scale-105",
              "flex items-center space-x-2",
              isHovered
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4"
            )}
          >
            <Eye className="w-5 h-5" />
            <span>Vista rápida</span>
          </button>
        </div>

        {/* Stock indicator */}
        {(product.stock || 0) <= 2 && (product.stock || 0) > 0 && (
          <div className="absolute bottom-3 left-3 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            ¡Últimas {product.stock || 0}!
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-6 space-y-4">
        {/* Brand and Title */}
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            {product.brand}
          </p>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 line-clamp-2 mb-2">
            {product.name}
          </h3>
        </div>

        {/* Rating and Reviews */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1">{renderStars()}</div>
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {(product.rating || 0).toFixed(1)}
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            ({(product.reviewCount || 0).toLocaleString()})
          </span>
        </div>

        {/* Price */}
        <div className="flex items-center space-x-2">
          <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {formatPrice(product.currentPrice)}
          </span>
          {product.isOnSale && (
            <span className="text-lg text-gray-500 line-through">
              {formatPrice(product.originalPrice)}
            </span>
          )}
        </div>

        {/* Features */}
        <div className="flex flex-wrap gap-2">
          <div className="flex items-center space-x-1 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-full">
            <Truck className="w-3 h-3" />
            <span>Envío gratis</span>
          </div>
          <div className="flex items-center space-x-1 text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-full">
            <Shield className="w-3 h-3" />
            <span>Garantía</span>
          </div>
          {product.isOnSale && (
            <div className="flex items-center space-x-1 text-xs text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 px-2 py-1 rounded-full">
              <Zap className="w-3 h-3" />
              <span>Oferta limitada</span>
            </div>
          )}
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          disabled={isAddingToCart || (product.stock || 0) === 0}
          className={cn(
            "w-full px-6 py-4 rounded-xl font-semibold transition-all duration-300",
            "transform hover:scale-[1.02] active:scale-98",
            "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100",
            (product.stock || 0) > 0
              ? "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl"
              : "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
          )}
        >
          <div className="flex items-center justify-center space-x-2">
            <ShoppingCart className="w-5 h-5" />
            <span>
              {(product.stock || 0) === 0 ? "Agotado" : "Agregar al carrito"}
            </span>
          </div>
        </button>

        {/* Delivery Info */}
        <div className="text-center text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center justify-center space-x-1">
            <Truck className="w-4 h-4" />
            <span>Llega en {product.estimatedDelivery}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfessionalProductCard;
