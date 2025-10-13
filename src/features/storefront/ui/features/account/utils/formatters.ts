/**
 * 🎨 ACCOUNT FORMATTERS
 * ====================
 *
 * Utility functions for formatting account data
 */

import type { OrderStatus } from "@prisma/client";
import type { UserProfile } from "../types";

/**
 * Format price to currency string
 */
export function formatPrice(amount: number): string {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "USD",
  }).format(amount / 100);
}

/**
 * Get color classes for order status
 */
export function getOrderStatusColor(status: OrderStatus | string): string {
  switch (status) {
    case "DELIVERED":
      return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300";
    case "SHIPPED":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300";
    case "PROCESSING":
    case "CONFIRMED":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300";
    case "PENDING":
      return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300";
    case "CANCELLED":
    case "REFUNDED":
      return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

/**
 * Get label for order status
 */
export function getOrderStatusLabel(status: OrderStatus | string): string {
  const labels: Record<string, string> = {
    PENDING: "Pendiente",
    CONFIRMED: "Confirmado",
    PROCESSING: "En Proceso",
    SHIPPED: "Enviado",
    DELIVERED: "Entregado",
    CANCELLED: "Cancelado",
    REFUNDED: "Reembolsado",
  };
  return labels[status] || status;
}

/**
 * Get gradient color for tier badge
 */
export function getTierColor(tier: UserProfile["tier"]): string {
  switch (tier) {
    case "platinum":
      return "from-purple-600 to-indigo-600";
    case "gold":
      return "from-yellow-500 to-orange-500";
    case "silver":
      return "from-gray-400 to-gray-500";
    default:
      return "from-amber-700 to-orange-700";
  }
}

/**
 * Get label for tier
 */
export function getTierLabel(tier: UserProfile["tier"]): string {
  switch (tier) {
    case "platinum":
      return "Platino";
    case "gold":
      return "Oro";
    case "silver":
      return "Plata";
    default:
      return "Bronce";
  }
}
