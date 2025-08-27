/**
 * 🛡️ PRODUCT SAFE VALUES UTILITY
 * ==============================
 *
 * Utilidades para manejar valores null/undefined en productos
 * Previene errores como "Cannot read properties of null (reading 'toFixed')"
 *
 * Enterprise: 2025-01-26 - Safe product values
 */

import type { ProductForCustomer } from "../types/shared";

/**
 * Get safe rating value
 * @param product - Product object
 * @returns Safe rating number (0 if null/undefined)
 */
export const getSafeRating = (product: ProductForCustomer): number => {
  return product.rating || 0;
};

/**
 * Get safe review count
 * @param product - Product object
 * @returns Safe review count number (0 if null/undefined)
 */
export const getSafeReviewCount = (product: ProductForCustomer): number => {
  return product.reviewCount || 0;
};

/**
 * Get safe stock value
 * @param product - Product object
 * @returns Safe stock number (0 if null/undefined)
 */
export const getSafeStock = (product: ProductForCustomer): number => {
  return product.stock || 0;
};

/**
 * Get safe discount percentage
 * @param product - Product object
 * @returns Safe discount percentage rounded (0 if null/undefined)
 */
export const getSafeDiscountPercentage = (
  product: ProductForCustomer
): number => {
  return Math.round(product.discountPercentage || 0);
};

/**
 * Format price safely
 * @param price - Price value (can be null/undefined)
 * @param currency - Currency code (default: MXN)
 * @param locale - Locale code (default: es-MX)
 * @returns Formatted price string
 */
export const formatSafePrice = (
  price: number | null | undefined,
  currency: string = "MXN",
  locale: string = "es-MX"
): string => {
  if (price == null || isNaN(Number(price))) {
    return "Precio no disponible";
  }

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(Number(price));
};

/**
 * Get safe rating display (formatted)
 * @param product - Product object
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted rating string
 */
export const getSafeRatingDisplay = (
  product: ProductForCustomer,
  decimals: number = 1
): string => {
  return getSafeRating(product).toFixed(decimals);
};

/**
 * Get safe review count display (formatted with locale)
 * @param product - Product object
 * @param locale - Locale for number formatting (default: es-MX)
 * @returns Formatted review count string
 */
export const getSafeReviewCountDisplay = (
  product: ProductForCustomer,
  locale: string = "es-MX"
): string => {
  return getSafeReviewCount(product).toLocaleString(locale);
};

/**
 * Check if product has safe badges array
 * @param product - Product object
 * @returns Whether badges is a valid array
 */
export const hasSafeBadges = (product: ProductForCustomer): boolean => {
  return (
    product.badges && Array.isArray(product.badges) && product.badges.length > 0
  );
};

/**
 * Check if product is in stock safely
 * @param product - Product object
 * @returns Whether product is in stock
 */
export const isInStock = (product: ProductForCustomer): boolean => {
  return getSafeStock(product) > 0;
};

/**
 * Check if product has low stock safely
 * @param product - Product object
 * @param threshold - Low stock threshold (default: 2)
 * @returns Whether product has low stock
 */
export const hasLowStock = (
  product: ProductForCustomer,
  threshold: number = 2
): boolean => {
  const stock = getSafeStock(product);
  return stock > 0 && stock <= threshold;
};

/**
 * Get stock status text
 * @param product - Product object
 * @returns Stock status text
 */
export const getStockStatusText = (product: ProductForCustomer): string => {
  const stock = getSafeStock(product);

  if (stock === 0) {
    return "Agotado";
  } else if (stock <= 2) {
    return `¡Últimas ${stock}!`;
  }

  return "Disponible";
};

/**
 * Validate product has minimum required data
 * @param product - Product object
 * @returns Whether product has valid data
 */
export const isValidProduct = (product: ProductForCustomer): boolean => {
  return !!(
    product &&
    product.id &&
    product.name &&
    typeof product.currentPrice === "number" &&
    product.currentPrice > 0
  );
};

/**
 * Get safe delivery estimate
 * @param product - Product object
 * @returns Safe delivery estimate string
 */
export const getSafeDeliveryEstimate = (
  product: ProductForCustomer
): string => {
  return product.estimatedDelivery || "Tiempo no disponible";
};

/**
 * Get safe brand name
 * @param product - Product object
 * @returns Safe brand name string
 */
export const getSafeBrand = (product: ProductForCustomer): string => {
  return product.brand || "Marca no disponible";
};

export default {
  getSafeRating,
  getSafeReviewCount,
  getSafeStock,
  getSafeDiscountPercentage,
  formatSafePrice,
  getSafeRatingDisplay,
  getSafeReviewCountDisplay,
  hasSafeBadges,
  isInStock,
  hasLowStock,
  getStockStatusText,
  isValidProduct,
  getSafeDeliveryEstimate,
  getSafeBrand,
};
