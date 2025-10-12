/**
 * 💖 WISHLIST BUTTON EXAMPLE - ARQUITECTURA PROFESIONAL
 * =====================================================
 *
 * Ejemplo de cómo usar wishlist con nueva arquitectura profesional:
 * ✅ Single source of truth (StorefrontContext)
 * ✅ Zero hooks intermediarios
 * ✅ Simple, directo, mantenible
 *
 * MIGRADO: 2025-01-28 - Professional Architecture
 */

"use client";

import React, { useState } from "react";
import { Heart, Plus, Minus, ShoppingHeart } from "lucide-react";
import { cn } from "@/shared/utils";
// TODO: Update this example to use new TanStack Query hooks
// import { useWishlist } from "../../../hooks";
import type { ProductForCustomer } from "../../types";

interface WishlistButtonExampleProps {
  product: ProductForCustomer;
  variant?: "default" | "compact" | "icon-only" | "with-counter";
  showLabel?: boolean;
}

/**
 * 💖 WISHLIST BUTTON - PROFESIONAL Y SIMPLE
 * TODO: This component needs migration to new TanStack Query architecture
 */
const WishlistButtonExample: React.FC<WishlistButtonExampleProps> = ({
  product,
  variant = "default",
  showLabel = true,
}) => {
  // TEMPORARILY DISABLED - Needs migration
  return (
    <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg">
      <p className="text-sm text-gray-600">
        WishlistButtonExample - Needs TanStack Query migration
      </p>
    </div>
  );

  /*
  const [isProcessing, setIsProcessing] = useState(false);

  // 🏪 Wishlist actions - Directo desde contexto
  const { addToWishlist, removeFromWishlist } = useWishlist();

  // ⚡ Handle wishlist toggle - Simple
  const handleToggle = async () => {
    if (isProcessing) return;

    setIsProcessing(true);
    try {
      if (product.isWishlisted) {
        await removeFromWishlist(product.id);
      } else {
        await addToWishlist(product.id);
      }
    } catch (error) {
      console.error("Wishlist action failed:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  // 🎨 Variant styles
  const getButtonStyles = () => {
    const baseStyles =
      "inline-flex items-center gap-2 transition-all duration-200 disabled:opacity-50";

    switch (variant) {
      case "compact":
        return cn(
          baseStyles,
          "px-2 py-1 text-sm rounded-md border",
          product.isWishlisted
            ? "bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
            : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
        );

      case "icon-only":
        return cn(
          baseStyles,
          "p-2 rounded-full border",
          product.isWishlisted
            ? "bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
            : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
        );

      case "with-counter":
        return cn(
          baseStyles,
          "px-4 py-2 rounded-lg border bg-white shadow-sm hover:shadow-md",
          product.isWishlisted
            ? "text-red-600 border-red-200"
            : "text-gray-600 border-gray-200"
        );

      default:
        return cn(
          baseStyles,
          "px-4 py-2 rounded-lg border",
          product.isWishlisted
            ? "bg-red-500 text-white border-red-500 hover:bg-red-600"
            : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
        );
    }
  };

  // 🎨 Icon styles
  const getIconStyles = () => {
    return cn(
      "transition-all duration-200",
      variant === "icon-only" ? "w-5 h-5" : "w-4 h-4",
      isProcessing && "animate-pulse"
    );
  };

  return (
    <div className="wishlist-button-example">
      <button
        onClick={handleToggle}
        disabled={isProcessing}
        className={getButtonStyles()}
        title={
          product.isWishlisted ? "Quitar de wishlist" : "Agregar a wishlist"
        }
      >
        {/* Icon */}
        {variant === "with-counter" ? (
          <ShoppingHeart className={getIconStyles()} />
        ) : (
          <Heart
            className={cn(
              getIconStyles(),
              product.isWishlisted && "fill-current"
            )}
          />
        )}

        {/* Label */}
        {showLabel && variant !== "icon-only" && (
          <span>
            {isProcessing
              ? "Procesando..."
              : product.isWishlisted
              ? "En Wishlist"
              : "Agregar a Wishlist"}
          </span>
        )}

        {/* Counter for with-counter variant */}
        {variant === "with-counter" && (
          <div className="flex items-center gap-2 ml-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                console.log("Decrement wishlist priority");
              }}
              className="p-1 rounded hover:bg-gray-100"
              disabled={isProcessing}
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="text-sm font-medium px-2">1</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                console.log("Increment wishlist priority");
              }}
              className="p-1 rounded hover:bg-gray-100"
              disabled={isProcessing}
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
        )}
      </button>

      {/* Status indicator */}
      {isProcessing && (
        <div className="mt-2 text-sm text-gray-500">
          Actualizando wishlist...
        </div>
      )}
    </div>
  );
};

// 🎯 Example usage
export const WishlistButtonExamples: React.FC = () => {
  // Mock product para ejemplos
  const mockProduct: ProductForCustomer = {
    id: "example-product",
    name: "Producto de Ejemplo",
    price: 99,
    isWishlisted: false,
    description: "Producto para demostrar el wishlist",
    imageUrl: null,
    category: null,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  return (
    <div className="space-y-6 p-6">
      <h2 className="text-2xl font-bold mb-4">Ejemplos de Wishlist Button</h2>

      <div className="grid gap-6">
        {/* Default variant */}
        <div>
          <h3 className="font-semibold mb-2">Default</h3>
          <WishlistButtonExample product={mockProduct} />
        </div>

        {/* Compact variant */}
        <div>
          <h3 className="font-semibold mb-2">Compact</h3>
          <WishlistButtonExample product={mockProduct} variant="compact" />
        </div>

        {/* Icon only variant */}
        <div>
          <h3 className="font-semibold mb-2">Icon Only</h3>
          <WishlistButtonExample product={mockProduct} variant="icon-only" />
        </div>

        {/* With counter variant */}
        <div>
          <h3 className="font-semibold mb-2">With Counter</h3>
          <WishlistButtonExample product={mockProduct} variant="with-counter" />
        </div>
      </div>
    </div>
  );
};

export default WishlistButtonExample;
