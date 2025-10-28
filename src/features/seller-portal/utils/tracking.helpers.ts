/**
 * 🚚 TRACKING & FULFILLMENT HELPERS
 * ===================================
 *
 * Pure utility functions for tracking/logistics management
 *
 * Created: 2025-01-27
 */

import { FulfillmentStatus, PaymentStatus, OrderStatus } from "../types";

export interface OrderForMetrics {
  id: string;
  placedAt: Date | string;
  shippedAt?: Date | string | null;
  trackingNumber?: string | null;
  paymentStatus: PaymentStatus;
  fulfillmentStatus: FulfillmentStatus;
  status: OrderStatus;
  paymentMethod?: string | null;
}

/**
 * Calculate hours since order was placed
 */
export function getHoursSincePlaced(placedAt: Date | string): number {
  const now = new Date();
  return (now.getTime() - new Date(placedAt).getTime()) / (1000 * 60 * 60);
}

/**
 * Calculate hours from order placed to shipped
 */
export function getFulfillmentHours(
  placedAt: Date | string,
  shippedAt: Date | string
): number {
  return (
    (new Date(shippedAt).getTime() - new Date(placedAt).getTime()) /
    (1000 * 60 * 60)
  );
}

/**
 * Check if order was shipped within 24 hours
 */
export function wasShippedIn24Hours(
  placedAt: Date | string,
  shippedAt: Date | string
): boolean {
  return getFulfillmentHours(placedAt, shippedAt) <= 24;
}

/**
 * Check if order is delayed (>48 hours without tracking)
 */
export function isOrderDelayed(
  order: OrderForMetrics,
  delayThresholdHours: number = 48
): boolean {
  if (order.trackingNumber) return false;
  if (
    order.paymentStatus !== PaymentStatus.PAID ||
    order.fulfillmentStatus !== FulfillmentStatus.UNFULFILLED
  ) {
    return false;
  }
  return getHoursSincePlaced(order.placedAt) > delayThresholdHours;
}

/**
 * Format hours to readable string
 */
export function formatHours(hours: number): string {
  if (hours < 24) {
    return `${hours.toFixed(1)} hrs`;
  }
  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  return `${days}d ${remainingHours.toFixed(0)}h`;
}

/**
 * Get carrier logo emoji
 */
export function getCarrierLogo(carrierName: string): string {
  const logos: Record<string, string> = {
    FedEx: "📦",
    DHL: "🔴",
    Estafeta: "📮",
    UPS: "🟤",
    "99Minutos": "⚡",
    Redpack: "🔴",
  };
  return logos[carrierName] || "📦";
}

/**
 * Get color class for success rate
 */
export function getSuccessRateColor(rate: number): string {
  if (rate >= 85) return "text-green-600 dark:text-green-400";
  if (rate >= 70) return "text-yellow-600 dark:text-yellow-400";
  return "text-red-600 dark:text-red-400";
}

/**
 * Get background color class for success rate bar
 */
export function getSuccessRateBarColor(rate: number): string {
  if (rate >= 85) return "bg-green-600 dark:bg-green-500";
  if (rate >= 70) return "bg-yellow-600 dark:bg-yellow-500";
  return "bg-red-600 dark:bg-red-500";
}
