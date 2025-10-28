/**
 * 💰 Pricing Helpers
 * ==================
 *
 * Pure functions for price calculations and formatting.
 * Used across storefront for consistent pricing logic.
 *
 * @module storefront/utils/pricing
 */

import type { ProductForCustomer } from "../types";

/**
 * Get the effective price for a product (sale price if available, otherwise regular price)
 */
export function getEffectivePrice(product: ProductForCustomer): number {
  return product.salePrice || product.price;
}

/**
 * Calculate discount percentage
 */
export function calculateDiscountPercentage(
  regularPrice: number,
  salePrice: number
): number {
  if (!salePrice || salePrice >= regularPrice) return 0;
  return Math.round(((regularPrice - salePrice) / regularPrice) * 100);
}

/**
 * Check if product is on sale
 */
export function isProductOnSale(product: ProductForCustomer): boolean {
  return !!(
    product.isOnSale &&
    product.salePrice &&
    product.salePrice < product.price
  );
}

/**
 * Format price to currency string
 */
export function formatPrice(price: number, currency: string = "USD"): string {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency,
  }).format(price);
}

/**
 * Get price display info (includes regular, sale, and discount percentage)
 */
export function getPriceDisplayInfo(product: ProductForCustomer) {
  const effectivePrice = getEffectivePrice(product);
  const isOnSale = isProductOnSale(product);
  const discountPercentage = isOnSale
    ? calculateDiscountPercentage(product.price, product.salePrice!)
    : 0;

  return {
    effectivePrice,
    regularPrice: product.price,
    salePrice: product.salePrice,
    isOnSale,
    discountPercentage,
    formattedEffectivePrice: formatPrice(effectivePrice),
    formattedRegularPrice: formatPrice(product.price),
    formattedSalePrice: product.salePrice
      ? formatPrice(product.salePrice)
      : null,
  };
}

/**
 * Check if product is in price range
 */
export function isProductInPriceRange(
  product: ProductForCustomer,
  minPrice: number,
  maxPrice: number
): boolean {
  const price = getEffectivePrice(product);
  return price >= minPrice && price <= maxPrice;
}
