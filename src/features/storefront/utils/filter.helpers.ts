/**
 * 🎛️ Filter Helpers
 * =================
 *
 * Pure functions for filtering products and categories.
 * Centralized filtering logic for consistency across storefront.
 *
 * @module storefront/utils/filter
 */

import type { ProductForCustomer, CategoryForCustomer } from "../types";
import { getEffectivePrice, isProductOnSale } from "./pricing.helpers";

// ========================================
// PRODUCT FILTERS
// ========================================

/**
 * Filter products by search term
 */
export function filterProductsBySearch(
  products: ProductForCustomer[],
  searchTerm: string
): ProductForCustomer[] {
  if (!searchTerm.trim()) return products;

  const searchLower = searchTerm.toLowerCase();
  return products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchLower) ||
      product.description?.toLowerCase().includes(searchLower) ||
      product.brand?.toLowerCase().includes(searchLower)
  );
}

/**
 * Filter products by categories
 */
export function filterProductsByCategories(
  products: ProductForCustomer[],
  categoryIds: string[]
): ProductForCustomer[] {
  if (categoryIds.length === 0) return products;
  return products.filter((product) => categoryIds.includes(product.categoryId));
}

/**
 * Filter products by price range
 */
export function filterProductsByPriceRange(
  products: ProductForCustomer[],
  minPrice: number,
  maxPrice: number
): ProductForCustomer[] {
  return products.filter((product) => {
    const price = getEffectivePrice(product);
    return price >= minPrice && price <= maxPrice;
  });
}

/**
 * Filter products by ratings
 */
export function filterProductsByRatings(
  products: ProductForCustomer[],
  ratings: number[]
): ProductForCustomer[] {
  if (ratings.length === 0) return products;
  return products.filter((product) =>
    ratings.some((rating) => Math.floor(product.rating || 0) >= rating)
  );
}

/**
 * Filter products by brands
 */
export function filterProductsByBrands(
  products: ProductForCustomer[],
  brands: string[]
): ProductForCustomer[] {
  if (brands.length === 0) return products;
  return products.filter(
    (product) => product.brand && brands.includes(product.brand)
  );
}

/**
 * Filter products by stock availability
 */
export function filterProductsByStock(
  products: ProductForCustomer[],
  inStockOnly: boolean
): ProductForCustomer[] {
  if (!inStockOnly) return products;
  return products.filter((product) => product.stock && product.stock > 0);
}

/**
 * Filter products by sale status
 */
export function filterProductsBySale(
  products: ProductForCustomer[],
  onSaleOnly: boolean
): ProductForCustomer[] {
  if (!onSaleOnly) return products;
  return products.filter((product) => isProductOnSale(product));
}

/**
 * Apply all product filters at once
 */
export interface ProductFilterOptions {
  searchTerm?: string;
  categories?: string[];
  priceRange?: [number, number];
  ratings?: number[];
  brands?: string[];
  inStock?: boolean;
  onSale?: boolean;
}

export function applyProductFilters(
  products: ProductForCustomer[],
  filters: ProductFilterOptions
): ProductForCustomer[] {
  let filtered = [...products];

  if (filters.searchTerm) {
    filtered = filterProductsBySearch(filtered, filters.searchTerm);
  }

  if (filters.categories && filters.categories.length > 0) {
    filtered = filterProductsByCategories(filtered, filters.categories);
  }

  if (filters.priceRange) {
    filtered = filterProductsByPriceRange(
      filtered,
      filters.priceRange[0],
      filters.priceRange[1]
    );
  }

  if (filters.ratings && filters.ratings.length > 0) {
    filtered = filterProductsByRatings(filtered, filters.ratings);
  }

  if (filters.brands && filters.brands.length > 0) {
    filtered = filterProductsByBrands(filtered, filters.brands);
  }

  if (filters.inStock) {
    filtered = filterProductsByStock(filtered, filters.inStock);
  }

  if (filters.onSale) {
    filtered = filterProductsBySale(filtered, filters.onSale);
  }

  return filtered;
}

// ========================================
// CATEGORY FILTERS
// ========================================

/**
 * Filter categories by search term
 */
export function filterCategoriesBySearch(
  categories: CategoryForCustomer[],
  searchTerm: string
): CategoryForCustomer[] {
  if (!searchTerm.trim()) return categories;

  const searchLower = searchTerm.toLowerCase();
  return categories.filter(
    (category) =>
      category.name.toLowerCase().includes(searchLower) ||
      category.description?.toLowerCase().includes(searchLower)
  );
}

/**
 * Filter categories by product count range
 */
export function filterCategoriesByProductCount(
  categories: CategoryForCustomer[],
  minCount: number,
  maxCount: number
): CategoryForCustomer[] {
  return categories.filter(
    (category) =>
      (category.productCount || 0) >= minCount &&
      (category.productCount || 0) <= maxCount
  );
}

/**
 * Filter categories by featured status
 */
export function filterCategoriesByFeatured(
  categories: CategoryForCustomer[],
  featuredOnly: boolean
): CategoryForCustomer[] {
  if (!featuredOnly) return categories;
  return categories.filter((category) => category.featured);
}

/**
 * Filter categories by popular status
 */
export function filterCategoriesByPopular(
  categories: CategoryForCustomer[],
  popularOnly: boolean
): CategoryForCustomer[] {
  if (!popularOnly) return categories;
  return categories.filter((category) => category.isPopular);
}

/**
 * Apply all category filters at once
 */
export interface CategoryFilterOptions {
  searchTerm?: string;
  productCountRange?: [number, number];
  showFeatured?: boolean;
  showPopular?: boolean;
}

export function applyCategoryFilters(
  categories: CategoryForCustomer[],
  filters: CategoryFilterOptions
): CategoryForCustomer[] {
  let filtered = [...categories];

  if (filters.searchTerm) {
    filtered = filterCategoriesBySearch(filtered, filters.searchTerm);
  }

  if (filters.productCountRange) {
    filtered = filterCategoriesByProductCount(
      filtered,
      filters.productCountRange[0],
      filters.productCountRange[1]
    );
  }

  if (filters.showFeatured) {
    filtered = filterCategoriesByFeatured(filtered, filters.showFeatured);
  }

  if (filters.showPopular) {
    filtered = filterCategoriesByPopular(filtered, filters.showPopular);
  }

  return filtered;
}

/**
 * Get available brands from products
 */
export function getAvailableBrands(
  products: ProductForCustomer[]
): string[] {
  const brands = new Set<string>();
  products.forEach((product) => {
    if (product.brand) {
      brands.add(product.brand);
    }
  });
  return Array.from(brands).sort();
}
