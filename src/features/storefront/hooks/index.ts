/**
 * 🎣 STOREFRONT HOOKS - EXPORTS
 * =============================
 *
 * Clean exports para todos los hooks de TanStack Query.
 *
 * @version 3.0.0 - TanStack Query Migration
 */

// 🔑 Query Keys
export { storefrontKeys } from "./queryKeys";

// 📊 Data Hooks
export {
  useStorefrontData,
  useStorefrontProducts,
  useStorefrontCategories,
  useFeaturedContent,
} from "./useStorefrontData";

// 💖 Wishlist Hooks
export { useWishlist, useWishlistToggle } from "./useWishlist";

// 🛒 Cart Hooks - REMOVED: Using UltraFast Cart Context instead
// export { useCart } from "./useCart";

// 🎛️ Filtering, Sorting & Pagination Hooks
export {
  useProductFiltering,
  DEFAULT_PRODUCT_FILTERS,
  type ProductFilters,
  type UseProductFilteringOptions,
  type UseProductFilteringReturn,
} from "./useProductFiltering";

export {
  useProductSorting,
  type UseProductSortingOptions,
  type UseProductSortingReturn,
} from "./useProductSorting";

export {
  useCategoryFiltering,
  DEFAULT_CATEGORY_FILTERS,
  type CategoryFilters,
  type UseCategoryFilteringOptions,
  type UseCategoryFilteringReturn,
} from "./useCategoryFiltering";

export {
  useCategorySorting,
  type UseCategorySortingOptions,
  type UseCategorySortingReturn,
} from "./useCategorySorting";

export {
  usePagination,
  type UsePaginationOptions,
  type UsePaginationReturn,
} from "./usePagination";
