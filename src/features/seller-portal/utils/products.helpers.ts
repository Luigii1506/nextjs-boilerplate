/**
 * 🏷️ PRODUCTS HELPERS
 * ====================
 *
 * Pure utility functions for products management
 *
 * Created: 2025-01-27
 */

import { ProductVisibility } from "../types";

/**
 * Get visibility badge configuration
 */
export function getVisibilityBadgeConfig(visibility: ProductVisibility): {
  label: string;
  color: string;
  icon: string;
} {
  const config: Record<
    ProductVisibility,
    { label: string; color: string; icon: string }
  > = {
    [ProductVisibility.PUBLIC]: {
      label: "Público",
      color:
        "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-300 dark:border-green-700",
      icon: "👁️",
    },
    [ProductVisibility.HIDDEN]: {
      label: "Oculto",
      color:
        "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600",
      icon: "🔒",
    },
    [ProductVisibility.INTERNAL]: {
      label: "Interno",
      color:
        "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700",
      icon: "🔧",
    },
    [ProductVisibility.COMING_SOON]: {
      label: "Próximamente",
      color:
        "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-700",
      icon: "⏰",
    },
    [ProductVisibility.DISCONTINUED]: {
      label: "Descontinuado",
      color:
        "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-300 dark:border-red-700",
      icon: "⛔",
    },
  };

  return config[visibility];
}

/**
 * Get stock color class based on quantity
 */
export function getStockColorClass(stock: number): string {
  if (stock > 10) {
    return "text-green-600 dark:text-green-400";
  } else if (stock > 0) {
    return "text-yellow-600 dark:text-yellow-400";
  } else {
    return "text-red-600 dark:text-red-400";
  }
}

/**
 * Format price display
 */
export function formatPrice(price: number): string {
  return `$${price.toFixed(2)}`;
}
