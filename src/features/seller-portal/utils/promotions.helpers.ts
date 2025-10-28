/**
 * 🎁 PROMOTIONS HELPERS
 * ======================
 *
 * Pure utility functions for promotions management
 *
 * Created: 2025-01-27
 */

/**
 * Get readable label for promotion type
 */
export function getPromotionTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    BUY_X_GET_Y: "2x1 / 3x2",
    PERCENTAGE_DISCOUNT: "Descuento %",
    FIXED_DISCOUNT: "Descuento Fijo",
    BUNDLE: "Bundle",
    FREE_SHIPPING: "Envío Gratis",
  };
  return labels[type] || type;
}

/**
 * Format discount value with appropriate symbol
 */
export function formatDiscount(
  discountType: "PERCENTAGE" | "FIXED_AMOUNT",
  discountValue: number
): string {
  return discountType === "PERCENTAGE"
    ? `${discountValue}%`
    : `$${discountValue.toFixed(2)}`;
}

/**
 * Format date range for display
 */
export function formatDateRange(
  startAt: Date | string,
  endAt?: Date | string | null
): string {
  const start = new Date(startAt).toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  if (endAt) {
    const end = new Date(endAt).toLocaleDateString("es-MX", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
    return `${start} - ${end}`;
  }

  return `Desde ${start}`;
}

/**
 * Format usage count with max limit
 */
export function formatUsageCount(
  usageCount: number,
  maxUsesTotal?: number | null
): string {
  if (maxUsesTotal) {
    return `${usageCount} / ${maxUsesTotal}`;
  }
  return `${usageCount}`;
}

/**
 * Check if promotion is expired
 */
export function isPromotionExpired(endAt?: Date | string | null): boolean {
  if (!endAt) return false;
  return new Date(endAt) < new Date();
}

/**
 * Check if promotion is scheduled (not started yet)
 */
export function isPromotionScheduled(startAt: Date | string): boolean {
  return new Date(startAt) > new Date();
}
