/**
 * 🛒 WISHLIST COMPONENTS - BARREL EXPORTS
 * ========================================
 *
 * Exportaciones centralizadas para todos los componentes del WishlistTab.
 * Facilita las importaciones y mantiene la organización modular.
 *
 * @version 3.0.0 - Feature-First Architecture
 */

// 🎯 Main Tab Component
export { default as WishlistTab } from "./WishlistTab";

// 🧩 Sub-components
export { default as EmptyWishlist } from "./EmptyWishlist";
export { default as WishlistLoginPrompt } from "./WishlistLoginPrompt";
export { default as WishlistStats } from "./WishlistStats";
export { default as WishlistHeader } from "./WishlistHeader";
export { default as WishlistGrid } from "./WishlistGrid";
export { default as WishlistFilters } from "./WishlistFilters";
export { default as WishlistPagination } from "./WishlistPagination";

// Re-export types for convenience
export type {
  WishlistGridProps,
  WishlistHeaderProps,
  WishlistStatsProps,
  WishlistFiltersProps,
  WishlistPaginationProps,
  WishlistLoginPromptProps,
} from "./types";
