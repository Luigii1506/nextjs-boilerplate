/**
 * 🛠️ Storefront Utils - Barrel Export
 * ====================================
 *
 * Centralized export for all storefront utility functions.
 * Pure functions for pricing, filtering, sorting, pagination, and formatting.
 *
 * @module storefront/utils
 */

// 💰 Pricing Helpers
export {
  getEffectivePrice,
  calculateDiscountPercentage,
  isProductOnSale,
  formatPrice,
  getPriceDisplayInfo,
  isProductInPriceRange,
} from "./pricing.helpers";

// 🎛️ Filter Helpers
export {
  filterProductsBySearch,
  filterProductsByCategories,
  filterProductsByPriceRange,
  filterProductsByRatings,
  filterProductsByBrands,
  filterProductsByStock,
  filterProductsBySale,
  applyProductFilters,
  filterCategoriesBySearch,
  filterCategoriesByProductCount,
  filterCategoriesByFeatured,
  filterCategoriesByPopular,
  applyCategoryFilters,
  getAvailableBrands,
  type ProductFilterOptions,
  type CategoryFilterOptions,
} from "./filter.helpers";

// 📊 Sort Helpers
export {
  sortProductsByPriceAsc,
  sortProductsByPriceDesc,
  sortProductsByRating,
  sortProductsByNewest,
  sortProductsByBestseller,
  sortProductsByRelevance,
  sortProducts,
  sortCategoriesByName,
  sortCategoriesByPopularity,
  sortCategoriesByProductCount,
  sortCategoriesByNewest,
  sortCategories,
  type ProductSortOption,
  type CategorySortOption,
} from "./sort.helpers";

// 📄 Pagination Helpers
export {
  calculateTotalPages,
  paginateItems,
  calculateVisiblePages,
  getPaginationInfo,
  isValidPage,
  getSafePage,
  type VisiblePagesOptions,
  type VisiblePagesResult,
  type PaginationInfo,
} from "./pagination.helpers";

// 🎨 Product Formatters
export {
  formatStockStatus,
  formatRating,
  formatReviewCount,
  truncateText,
  formatProductDescription,
  getProductImageUrl,
  getProductBadges,
  formatProductSlug,
  getAvailabilityStatus,
  type ProductBadge,
} from "./product.formatters";
