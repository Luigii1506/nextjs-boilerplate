/**
 * 👁️ QUICK VIEW MODAL - PROFESSIONAL E-COMMERCE
 * ============================================
 *
 * Modal profesional para vista rápida de productos
 * Estilo Amazon/eBay con imágenes, info completa y acciones
 *
 * Created: 2025-01-27 - Quick View Modal Implementation
 */

"use client";

import React, { useState, useEffect, useCallback } from "react";
import { cn } from "@/shared/utils";
import {
  X,
  Heart,
  ShoppingCart,
  Star,
  Package,
  Truck,
  Shield,
  Zap,
  Plus,
  Minus,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import type { ProductForCustomer } from "../../types/shared";

interface QuickViewModalProps {
  product: ProductForCustomer | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart?: (product: ProductForCustomer, quantity: number) => void;
  onAddToWishlist?: (
    product: ProductForCustomer
  ) => Promise<{ success: boolean; message: string }>;
  isAddingToWishlist?: boolean;
  isAddingToCart?: boolean;
}

export const QuickViewModal: React.FC<QuickViewModalProps> = ({
  product,
  isOpen,
  onClose,
  onAddToCart,
  onAddToWishlist,
  isAddingToWishlist = false,
  isAddingToCart = false,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [heartAnimating, setHeartAnimating] = useState(false);
  const [localAddingToWishlist, setLocalAddingToWishlist] = useState(false);
  const [optimisticWishlisted, setOptimisticWishlisted] = useState(false);

  // Reset state when product changes or modal opens
  useEffect(() => {
    if (isOpen && product) {
      setQuantity(1);
      setSelectedImageIndex(0);
      setOptimisticWishlisted(product.isWishlisted || false);
    }
  }, [isOpen, product]);

  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  // Handle wishlist toggle
  const handleWishlistClick = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (
        !product ||
        isAddingToWishlist ||
        localAddingToWishlist ||
        !onAddToWishlist
      )
        return;

      // Optimistic update
      setOptimisticWishlisted(!optimisticWishlisted);
      setHeartAnimating(true);
      setLocalAddingToWishlist(true);

      try {
        const result = await onAddToWishlist(product);
        if (!result?.success) {
          setOptimisticWishlisted(!optimisticWishlisted);
        }
      } catch (error) {
        console.error("Wishlist error:", error);
        setOptimisticWishlisted(!optimisticWishlisted);
      } finally {
        setLocalAddingToWishlist(false);
        setTimeout(() => setHeartAnimating(false), 600);
      }
    },
    [
      product,
      onAddToWishlist,
      isAddingToWishlist,
      localAddingToWishlist,
      optimisticWishlisted,
    ]
  );

  // Handle add to cart
  const handleAddToCart = useCallback(() => {
    if (!product || isAddingToCart || !onAddToCart || quantity <= 0) return;
    onAddToCart(product, quantity);
  }, [product, onAddToCart, isAddingToCart, quantity]);

  // Generate rating stars
  const renderStars = () => {
    const stars = [];
    const safeRating = product?.rating || 0;
    const fullStars = Math.floor(safeRating);
    const hasHalfStar = safeRating % 1 !== 0;

    for (let i = 0; i < 5; i++) {
      stars.push(
        <Star
          key={i}
          className={cn(
            "w-4 h-4 transition-colors",
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

  if (!isOpen || !product) return null;

  // Mock images array (in real app, these would come from product.images)
  const productImages = [
    "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&h=600&fit=crop",
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=600&fit=crop",
    "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&h=600&fit=crop",
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* 🌫️ Backdrop with fade animation - Same as BaseModal */}
      <div
        className="fixed inset-0 bg-black/50 transition-opacity duration-300 animate-fadeIn"
        onClick={onClose}
      />

      {/* 📦 Modal Container - Same as BaseModal */}
      <div className="flex min-h-full items-end sm:items-center justify-center p-4">
        <div
          className={cn(
            "relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl",
            "w-full max-w-6xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden",
            "transform transition-all duration-300 animate-slideInUp"
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 bg-white/90 dark:bg-gray-800/90 hover:bg-white dark:hover:bg-gray-700 rounded-full shadow-lg transition-all duration-200 hover:scale-110"
          >
            <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>

          {/* Modal Content */}
          <div className="flex flex-col lg:flex-row max-h-[90vh]">
            {/* Product Images */}
            <div className="flex-1 lg:max-w-md xl:max-w-lg bg-gray-50 dark:bg-gray-700 p-6">
              {/* Main Image */}
              <div className="relative aspect-square rounded-xl overflow-hidden bg-white dark:bg-gray-600 mb-4">
                <div className="w-full h-full bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900 dark:to-indigo-800 flex items-center justify-center">
                  <Package className="w-20 h-20 text-gray-400" />
                </div>

                {/* Sale Badge */}
                {product.isOnSale && product.discountPercentage > 0 && (
                  <div className="absolute top-4 left-4 bg-gradient-to-r from-red-500 to-pink-500 text-white text-sm font-bold px-3 py-2 rounded-full shadow-lg">
                    -{Math.round(product.discountPercentage || 0)}%
                  </div>
                )}

                {/* Image Navigation Arrows */}
                {productImages.length > 1 && (
                  <>
                    <button
                      onClick={() =>
                        setSelectedImageIndex(
                          selectedImageIndex > 0
                            ? selectedImageIndex - 1
                            : productImages.length - 1
                        )
                      }
                      className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-white/90 dark:bg-gray-800/90 rounded-full shadow-lg hover:bg-white dark:hover:bg-gray-700 transition-all duration-200"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() =>
                        setSelectedImageIndex(
                          selectedImageIndex < productImages.length - 1
                            ? selectedImageIndex + 1
                            : 0
                        )
                      }
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white/90 dark:bg-gray-800/90 rounded-full shadow-lg hover:bg-white dark:hover:bg-gray-700 transition-all duration-200"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>

              {/* Image Thumbnails */}
              {productImages.length > 1 && (
                <div className="flex space-x-2 overflow-x-auto">
                  {productImages.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={cn(
                        "flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200",
                        selectedImageIndex === index
                          ? "border-blue-500"
                          : "border-gray-200 dark:border-gray-600 hover:border-gray-300"
                      )}
                    >
                      <div className="w-full h-full bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900 dark:to-indigo-800 flex items-center justify-center">
                        <Package className="w-4 h-4 text-gray-400" />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="flex-1 p-6 overflow-y-auto">
              <div className="space-y-6">
                {/* Header */}
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {product.brand}
                  </p>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                    {product.name}
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    {product.description ||
                      "Descripción del producto no disponible."}
                  </p>
                </div>

                {/* Rating and Reviews */}
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-1">
                    {renderStars()}
                  </div>
                  <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {(product.rating || 0).toFixed(1)}
                  </span>
                  <span className="text-gray-500 dark:text-gray-400">
                    ({(product.reviewCount || 0).toLocaleString()} reseñas)
                  </span>
                </div>

                {/* Price */}
                <div className="py-4 border-y border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-3">
                    <span className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                      {formatPrice(product.currentPrice)}
                    </span>
                    {product.isOnSale && (
                      <span className="text-xl text-gray-500 line-through">
                        {formatPrice(product.originalPrice)}
                      </span>
                    )}
                  </div>
                  {product.isOnSale && (
                    <p className="text-green-600 dark:text-green-400 font-medium mt-1">
                      Ahorras{" "}
                      {formatPrice(
                        (product.originalPrice || 0) -
                          (product.currentPrice || 0)
                      )}
                    </p>
                  )}
                </div>

                {/* Stock Status */}
                <div className="flex items-center space-x-2">
                  <div
                    className={cn(
                      "w-3 h-3 rounded-full",
                      (product.stock || 0) > 0 ? "bg-green-500" : "bg-red-500"
                    )}
                  />
                  <span
                    className={cn(
                      "font-medium",
                      (product.stock || 0) > 0
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-600 dark:text-red-400"
                    )}
                  >
                    {(product.stock || 0) > 0
                      ? `En stock (${product.stock} disponibles)`
                      : "Agotado"}
                  </span>
                </div>

                {/* Features */}
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Características
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    <div className="flex items-center space-x-2 text-sm text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-2 rounded-lg">
                      <Truck className="w-4 h-4" />
                      <span>Envío gratuito</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-3 py-2 rounded-lg">
                      <Shield className="w-4 h-4" />
                      <span>Garantía incluida</span>
                    </div>
                    {product.isOnSale && (
                      <div className="flex items-center space-x-2 text-sm text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 px-3 py-2 rounded-lg">
                        <Zap className="w-4 h-4" />
                        <span>Oferta limitada</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Quantity and Actions */}
                <div className="space-y-4">
                  {/* Quantity Selector */}
                  {(product.stock || 0) > 0 && (
                    <div className="flex items-center space-x-4">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Cantidad:
                      </span>
                      <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg">
                        <button
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          disabled={quantity <= 1}
                          className="p-2 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="px-4 py-2 font-medium">
                          {quantity}
                        </span>
                        <button
                          onClick={() =>
                            setQuantity(
                              Math.min(product.stock || 0, quantity + 1)
                            )
                          }
                          disabled={quantity >= (product.stock || 0)}
                          className="p-2 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex space-x-3">
                    {/* Add to Cart */}
                    <button
                      onClick={handleAddToCart}
                      disabled={isAddingToCart || (product.stock || 0) === 0}
                      className={cn(
                        "flex-1 px-6 py-4 rounded-xl font-semibold transition-all duration-300",
                        "transform hover:scale-[1.02] active:scale-98",
                        "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100",
                        (product.stock || 0) > 0
                          ? "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl"
                          : "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                      )}
                    >
                      <div className="flex items-center justify-center space-x-2">
                        {isAddingToCart ? (
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <ShoppingCart className="w-5 h-5" />
                        )}
                        <span>
                          {(product.stock || 0) === 0
                            ? "Agotado"
                            : isAddingToCart
                            ? "Agregando..."
                            : `Agregar${
                                quantity > 1 ? ` ${quantity}` : ""
                              } al carrito`}
                        </span>
                      </div>
                    </button>

                    {/* Wishlist Button */}
                    <button
                      onClick={handleWishlistClick}
                      disabled={isAddingToWishlist || localAddingToWishlist}
                      className={cn(
                        "p-4 rounded-xl transition-all duration-300 group/heart",
                        "hover:scale-110 active:scale-95",
                        "border-2",
                        optimisticWishlisted
                          ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-500"
                          : "bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-400 hover:bg-red-50 hover:border-red-200 hover:text-red-500"
                      )}
                    >
                      <Heart
                        className={cn(
                          "w-6 h-6 transition-all duration-300",
                          optimisticWishlisted && "fill-current",
                          heartAnimating && "animate-bounce scale-125"
                        )}
                      />
                    </button>
                  </div>

                  {/* Delivery Info */}
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                      <Truck className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                          Envío gratuito
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Llega en{" "}
                          {product.estimatedDelivery || "2-3 días hábiles"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickViewModal;
