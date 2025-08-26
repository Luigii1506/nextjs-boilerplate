/**
 * 🛒 PRICE DISPLAY COMPONENT
 * ==========================
 *
 * Componente para mostrar precios customer-friendly con ofertas
 * Optimizado para experiencia de compra del usuario final
 *
 * Created: 2025-01-17 - Storefront Price Display
 */

import React from "react";
import { cn } from "../../../../../shared/utils";

// 🏷️ Type Definitions
export type PriceSize = "sm" | "md" | "lg" | "xl";
export type SupportedCurrency = "USD" | "MXN" | "EUR" | "COP" | "CLP";

interface SizeStyles {
  current: string;
  original: string;
  savings: string;
  badge: string;
}

// 🏷️ Component Props Interface (Exported for reuse)
export interface PriceDisplayProps {
  price: number;
  salePrice?: number | null;
  currency?: SupportedCurrency;
  size?: PriceSize;
  showOriginal?: boolean;
  className?: string;
}

const PriceDisplay: React.FC<PriceDisplayProps> = ({
  price,
  salePrice = null,
  currency = "MXN",
  size = "md",
  showOriginal = true,
  className,
}) => {
  // Calculate if item is on sale with explicit types
  const isOnSale: boolean =
    salePrice !== null && salePrice !== undefined && salePrice < price;
  const displayPrice: number = isOnSale ? salePrice! : price;
  const savingsAmount: number = isOnSale ? price - salePrice! : 0;
  const savingsPercentage: number = isOnSale
    ? Math.round((savingsAmount / price) * 100)
    : 0;

  // Format prices with proper typing
  const formatPrice = (amount: number): string => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // Size variants with proper typing
  const sizeClasses: Record<PriceSize, SizeStyles> = {
    sm: {
      current: "text-lg font-bold",
      original: "text-sm line-through",
      savings: "text-xs",
      badge: "text-xs px-1.5 py-0.5",
    },
    md: {
      current: "text-xl font-bold",
      original: "text-base line-through",
      savings: "text-sm",
      badge: "text-xs px-2 py-1",
    },
    lg: {
      current: "text-2xl font-bold",
      original: "text-lg line-through",
      savings: "text-base",
      badge: "text-sm px-2 py-1",
    },
    xl: {
      current: "text-3xl font-bold",
      original: "text-xl line-through",
      savings: "text-lg",
      badge: "text-base px-3 py-1.5",
    },
  };

  // No need for type assertion since size is already typed correctly
  const styles = sizeClasses[size];

  return (
    <div className={cn("flex flex-col space-y-1", className)}>
      {/* Main Price Display */}
      <div className="flex items-center space-x-2">
        {/* Current Price */}
        <span
          className={cn(
            styles.current,
            isOnSale
              ? "text-red-600 dark:text-red-400 animate-priceGlow"
              : "text-gray-900 dark:text-gray-100"
          )}
        >
          {formatPrice(displayPrice)}
        </span>

        {/* Original Price (if on sale) */}
        {isOnSale && showOriginal && (
          <span
            className={cn(styles.original, "text-gray-500 dark:text-gray-400")}
          >
            {formatPrice(price)}
          </span>
        )}

        {/* Sale Badge */}
        {isOnSale && savingsPercentage > 0 && (
          <span
            className={cn(
              styles.badge,
              "bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400 rounded-full font-medium animate-saleBadgePulse"
            )}
          >
            -{savingsPercentage}%
          </span>
        )}
      </div>

      {/* Savings Amount */}
      {isOnSale && savingsAmount > 0 && (
        <div
          className={cn(styles.savings, "text-green-600 dark:text-green-400")}
        >
          Ahorras {formatPrice(savingsAmount)}
        </div>
      )}
    </div>
  );
};

export default PriceDisplay;
