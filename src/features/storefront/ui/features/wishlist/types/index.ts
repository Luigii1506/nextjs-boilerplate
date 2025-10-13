/**
 * 🎯 WISHLIST TAB - TYPES DEFINITIONS
 * ===================================
 *
 * Tipos específicos para WishlistTab, separados para mejor organización
 * y reutilización entre componentes.
 *
 * @version 2.0.0 - Refactored Architecture
 */

import {
  ProductForCustomer,
  CategoryForCustomer,
} from "@/features/storefront/types";

// 🔍 FILTER TYPES
export interface WishlistFilters {
  searchTerm: string;
  sortBy: "date_added" | "name" | "price_asc" | "price_desc" | "rating";
  priceRange: [number, number];
  categories: string[];
  onSale: boolean;
  inStock: boolean;
}

export interface WishlistSortOption {
  id: string;
  label: string;
  value: string;
}

// 🎯 COMPONENT PROPS
export interface WishlistGridProps {
  products: ProductForCustomer[];
  viewMode: "grid" | "list";
  selectedItems: Set<string>;
  onSelectItem: (id: string) => void;
  onRemoveFromWishlist: (product: ProductForCustomer) => void;
  onAddToCart: (product: ProductForCustomer) => void;
  onMoveToCart: (product: ProductForCustomer) => void;
  onQuickView: (product: ProductForCustomer) => void;
  allowAnimations: boolean;
}

export interface WishlistHeaderProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
  totalProducts: number;
  selectedCount: number;
  onSelectAll: () => void;
  onBulkAddToCart: () => void;
  onBulkRemove: () => void;
  allowAnimations: boolean;
}

export interface WishlistStatsProps {
  totalItems: number;
  totalValue: number;
  onSaleItems: number;
  allowAnimations: boolean;
}

export interface WishlistFiltersProps {
  filters: WishlistFilters;
  categories: { id: string; name: string; slug: string }[];
  onCategoryFilter: (category: string) => void;
  onPriceRangeFilter: (range: [number, number]) => void;
  onSpecialFilterChange: (
    key: keyof WishlistFilters,
    value: string | number | boolean | string[] | [number, number]
  ) => void;
  onClearFilters: () => void;
  allowAnimations: boolean;
}

export interface WishlistPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  allowAnimations: boolean;
}

export interface WishlistLoginPromptProps {
  onLogin: () => void;
}

// 🔧 STATE MANAGEMENT
export interface WishlistState {
  isFirstRender: boolean;
  allowAnimations: boolean;
  viewMode: "grid" | "list";
  itemsPerPage: number;
  currentPage: number;
  localSearchTerm: string;
  selectedItems: Set<string>;
  filters: WishlistFilters;
}

// 🔧 ACTION TYPES
export type WishlistAction =
  | { type: "SET_FIRST_RENDER"; payload: boolean }
  | { type: "SET_ALLOW_ANIMATIONS"; payload: boolean }
  | { type: "SET_VIEW_MODE"; payload: "grid" | "list" }
  | { type: "SET_ITEMS_PER_PAGE"; payload: number }
  | { type: "SET_CURRENT_PAGE"; payload: number }
  | { type: "SET_LOCAL_SEARCH_TERM"; payload: string }
  | { type: "SET_SELECTED_ITEMS"; payload: Set<string> }
  | { type: "SET_FILTERS"; payload: WishlistFilters }
  | { type: "RESET_FILTERS" };

// 🎯 CONSTANTS
export const WISHLIST_SORT_OPTIONS: WishlistSortOption[] = [
  { id: "date_added", label: "Agregado Recientemente", value: "date_added" },
  { id: "name", label: "Nombre A-Z", value: "name" },
  { id: "price_asc", label: "Precio: Menor a Mayor", value: "price_asc" },
  { id: "price_desc", label: "Precio: Mayor a Menor", value: "price_desc" },
  { id: "rating", label: "Mejor Valorados", value: "rating" },
];

export const ITEMS_PER_PAGE_OPTIONS = [12, 24, 48];

export const DEFAULT_FILTERS: WishlistFilters = {
  searchTerm: "",
  sortBy: "date_added",
  priceRange: [0, 1000000],
  categories: [],
  onSale: false,
  inStock: false,
};

export const DEFAULT_WISHLIST_STATE: WishlistState = {
  isFirstRender: true,
  allowAnimations: false,
  viewMode: "grid",
  itemsPerPage: 24,
  currentPage: 1,
  localSearchTerm: "",
  selectedItems: new Set<string>(),
  filters: DEFAULT_FILTERS,
};
