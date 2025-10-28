/**
 * 🎟️ COUPONS HELPERS
 * ===================
 *
 * Pure utility functions for coupons management
 *
 * Created: 2025-01-27
 */

/**
 * Get Spanish label for coupon type
 */
export function getCouponTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    GENERAL: "General",
    FIRST_PURCHASE: "Primera Compra",
    LOYALTY: "Fidelidad",
    SEASONAL: "Temporal",
    CART_ABANDONMENT: "Carrito Abandonado",
  };
  return labels[type] || type;
}

/**
 * Format coupon code (uppercase, alphanumeric only)
 */
export function formatCouponCode(code: string): string {
  return code.toUpperCase().replace(/[^A-Z0-9]/g, "");
}

/**
 * Validate coupon code
 */
export function isValidCouponCode(code: string): boolean {
  return code.length >= 3 && code.length <= 20 && /^[A-Z0-9]+$/.test(code);
}

/**
 * Format discount display
 */
export function formatDiscount(
  discountType: "PERCENTAGE" | "FIXED_AMOUNT",
  discountValue: number
): string {
  return discountType === "PERCENTAGE"
    ? `${discountValue}%`
    : `$${discountValue}`;
}

/**
 * Format date range display
 */
export function formatDateRange(
  startAt: Date | null,
  endAt: Date | null
): string {
  if (!startAt && !endAt) return "Sin límite";
  if (startAt && !endAt)
    return new Date(startAt).toLocaleDateString("es-MX");
  if (!startAt && endAt) return `Hasta ${new Date(endAt).toLocaleDateString("es-MX")}`;
  return `${new Date(startAt!).toLocaleDateString("es-MX")} - ${new Date(endAt!).toLocaleDateString("es-MX")}`;
}

/**
 * Format usage display
 */
export function formatUsage(
  usageCount: number,
  maxUsesTotal?: number,
  maxUsesPerUser?: number
): { main: string; subtitle: string } {
  const main = maxUsesTotal
    ? `${usageCount} / ${maxUsesTotal}`
    : `${usageCount}`;
  const subtitle = maxUsesPerUser ? `Máx. ${maxUsesPerUser}/usuario` : "";
  return { main, subtitle };
}
