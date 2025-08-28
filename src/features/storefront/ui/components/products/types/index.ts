/**
 * 🎯 PRODUCTS TAB - TYPES DEFINITIONS
 * ===================================
 *
 * Tipos específicos para ProductsTab, separados para mejor organización
 * y reutilización entre componentes.
 *
 * @version 2.0.0 - Refactored Architecture
 */

import {
  ProductForCustomer,
  CategoryForCustomer,
} from "@/features/storefront/types";

// 🔍 FILTER TYPES
export interface ProductFilters {
  categories: string[];
  priceRange: [number, number];
  ratings: number[];
  brands: string[];
  inStock: boolean;
  onSale: boolean;
}

export interface SortOption {
  id: string;
  label: string;
  value: string;
}

export interface PriceRange {
  label: string;
  min: number;
  max: number;
}

// 🎛️ COMPONENT PROPS
export interface ProductsHeaderProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
  isFiltersOpen: boolean;
  onFiltersToggle: () => void;
  totalProducts: number;
  allowAnimations: boolean;
}

export interface ProductsFiltersProps {
  filters: ProductFilters;
  categories: CategoryForCustomer[];
  onCategoryFilter: (category: string) => void;
  onPriceRangeFilter: (range: [number, number]) => void;
  onRatingFilter: (rating: number) => void;
  onSpecialFilterChange: (
    key: keyof ProductFilters,
    value: boolean | string[] | [number, number]
  ) => void;
  onClearFilters: () => void;
  isOpen: boolean;
  onClose: () => void;
  allowAnimations: boolean;
}

export interface ProductsGridProps {
  products: ProductForCustomer[];
  viewMode: "grid" | "list";
  onAddToCart: (product: ProductForCustomer) => void;
  onAddToWishlist: (
    product: ProductForCustomer
  ) => Promise<{ success: boolean; message: string }>;
  onQuickView: (product: ProductForCustomer) => void;
  isAddingToWishlist?: boolean;
  isAddingToCart: (productId: string) => boolean;
  allowAnimations: boolean;
}

export interface ProductsPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  allowAnimations: boolean;
}

export interface ProductsResultsProps {
  totalProducts: number;
  searchTerm: string;
  itemsPerPage: number;
  onItemsPerPageChange: (items: number) => void;
  allowAnimations: boolean;
}

// 📊 STATE TYPES
export interface ProductsState {
  isFirstRender: boolean;
  allowAnimations: boolean;
  isFiltersOpen: boolean;
  viewMode: "grid" | "list";
  sortBy: string;
  itemsPerPage: number;
  currentPage: number;
  localSearchTerm: string;
  filters: ProductFilters;
}

// 🔧 ACTION TYPES
export type ProductsAction =
  | { type: "SET_FIRST_RENDER"; payload: boolean }
  | { type: "SET_ALLOW_ANIMATIONS"; payload: boolean }
  | { type: "SET_FILTERS_OPEN"; payload: boolean }
  | { type: "SET_VIEW_MODE"; payload: "grid" | "list" }
  | { type: "SET_SORT_BY"; payload: string }
  | { type: "SET_ITEMS_PER_PAGE"; payload: number }
  | { type: "SET_CURRENT_PAGE"; payload: number }
  | { type: "SET_LOCAL_SEARCH_TERM"; payload: string }
  | { type: "SET_FILTERS"; payload: ProductFilters }
  | { type: "RESET_FILTERS" };

// 🎯 CONSTANTS
export const SORT_OPTIONS: SortOption[] = [
  { id: "relevance", label: "Más Relevantes", value: "relevance" },
  { id: "price-asc", label: "Precio: Menor a Mayor", value: "price_asc" },
  { id: "price-desc", label: "Precio: Mayor a Menor", value: "price_desc" },
  { id: "rating", label: "Mejor Valorados", value: "rating" },
  { id: "newest", label: "Más Nuevos", value: "newest" },
  { id: "bestseller", label: "Más Vendidos", value: "bestseller" },
];

export const ITEMS_PER_PAGE_OPTIONS = [12, 24, 48, 96];

export const PRICE_RANGES: PriceRange[] = [
  { label: "Menos de $500", min: 0, max: 500 },
  { label: "$500 - $1,000", min: 500, max: 1000 },
  { label: "$1,000 - $2,500", min: 1000, max: 2500 },
  { label: "$2,500 - $5,000", min: 2500, max: 5000 },
  { label: "Más de $5,000", min: 5000, max: 100000 },
];

// 🎯 DEFAULT VALUES
export const DEFAULT_FILTERS: ProductFilters = {
  categories: [],
  priceRange: [0, 100000],
  ratings: [],
  brands: [],
  inStock: false,
  onSale: false,
};

export const DEFAULT_PRODUCTS_STATE: ProductsState = {
  isFirstRender: true,
  allowAnimations: false,
  isFiltersOpen: false,
  viewMode: "grid",
  sortBy: "relevance",
  itemsPerPage: 24,
  currentPage: 1,
  localSearchTerm: "",
  filters: DEFAULT_FILTERS,
};
