/**
 * 📊 Sort Helpers
 * ===============
 *
 * Pure functions for sorting products and categories.
 * Centralized sorting logic for consistency across storefront.
 *
 * @module storefront/utils/sort
 */

import type { ProductForCustomer, CategoryForCustomer } from "../types";
import { getEffectivePrice } from "./pricing.helpers";

// ========================================
// PRODUCT SORTING
// ========================================

export type ProductSortOption =
  | "relevance"
  | "price_asc"
  | "price_desc"
  | "rating"
  | "newest"
  | "bestseller";

/**
 * Sort products by price (ascending)
 */
export function sortProductsByPriceAsc(
  products: ProductForCustomer[]
): ProductForCustomer[] {
  return [...products].sort((a, b) => {
    return getEffectivePrice(a) - getEffectivePrice(b);
  });
}

/**
 * Sort products by price (descending)
 */
export function sortProductsByPriceDesc(
  products: ProductForCustomer[]
): ProductForCustomer[] {
  return [...products].sort((a, b) => {
    return getEffectivePrice(b) - getEffectivePrice(a);
  });
}

/**
 * Sort products by rating (highest first)
 */
export function sortProductsByRating(
  products: ProductForCustomer[]
): ProductForCustomer[] {
  return [...products].sort((a, b) => {
    return (b.rating || 0) - (a.rating || 0);
  });
}

/**
 * Sort products by date (newest first)
 */
export function sortProductsByNewest(
  products: ProductForCustomer[]
): ProductForCustomer[] {
  return [...products].sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

/**
 * Sort products by bestseller (using reviewCount as proxy)
 */
export function sortProductsByBestseller(
  products: ProductForCustomer[]
): ProductForCustomer[] {
  return [...products].sort((a, b) => {
    return (b.reviewCount || 0) - (a.reviewCount || 0);
  });
}

/**
 * Sort products by relevance (default order)
 */
export function sortProductsByRelevance(
  products: ProductForCustomer[]
): ProductForCustomer[] {
  return [...products];
}

/**
 * Apply product sorting based on sort option
 */
export function sortProducts(
  products: ProductForCustomer[],
  sortBy: ProductSortOption
): ProductForCustomer[] {
  switch (sortBy) {
    case "price_asc":
      return sortProductsByPriceAsc(products);
    case "price_desc":
      return sortProductsByPriceDesc(products);
    case "rating":
      return sortProductsByRating(products);
    case "newest":
      return sortProductsByNewest(products);
    case "bestseller":
      return sortProductsByBestseller(products);
    case "relevance":
    default:
      return sortProductsByRelevance(products);
  }
}

// ========================================
// CATEGORY SORTING
// ========================================

export type CategorySortOption =
  | "name"
  | "popularity"
  | "product_count"
  | "newest";

/**
 * Sort categories by name (A-Z)
 */
export function sortCategoriesByName(
  categories: CategoryForCustomer[]
): CategoryForCustomer[] {
  return [...categories].sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Sort categories by popularity
 */
export function sortCategoriesByPopularity(
  categories: CategoryForCustomer[]
): CategoryForCustomer[] {
  return [...categories].sort((a, b) => {
    return (b.popularity || 0) - (a.popularity || 0);
  });
}

/**
 * Sort categories by product count
 */
export function sortCategoriesByProductCount(
  categories: CategoryForCustomer[]
): CategoryForCustomer[] {
  return [...categories].sort((a, b) => {
    return (b.productCount || 0) - (a.productCount || 0);
  });
}

/**
 * Sort categories by date (newest first)
 */
export function sortCategoriesByNewest(
  categories: CategoryForCustomer[]
): CategoryForCustomer[] {
  return [...categories].sort((a, b) => {
    return (
      new Date(b.createdAt || "").getTime() -
      new Date(a.createdAt || "").getTime()
    );
  });
}

/**
 * Apply category sorting based on sort option
 */
export function sortCategories(
  categories: CategoryForCustomer[],
  sortBy: CategorySortOption
): CategoryForCustomer[] {
  switch (sortBy) {
    case "name":
      return sortCategoriesByName(categories);
    case "product_count":
      return sortCategoriesByProductCount(categories);
    case "newest":
      return sortCategoriesByNewest(categories);
    case "popularity":
    default:
      return sortCategoriesByPopularity(categories);
  }
}
