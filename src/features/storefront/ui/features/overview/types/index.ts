/**
 * 🎯 OVERVIEW TAB - TYPES DEFINITIONS
 * ===================================
 *
 * Tipos específicos para OverviewTab, separados para mejor organización
 * y reutilización entre componentes.
 *
 * @version 2.0.0 - Refactored Architecture
 */

import {
  ProductForCustomer,
  CategoryForCustomer,
} from "@/features/storefront/types";

// 🎯 COMPONENT PROPS
export interface CustomerProductCardProps {
  product: ProductForCustomer;
  onAddToCart?: (product: ProductForCustomer) => void;
  onAddToWishlist?: (
    product: ProductForCustomer
  ) => Promise<{ success: boolean; message: string }>;
  onQuickView?: (product: ProductForCustomer) => void;
  className?: string;
}

export interface CategoryCardProps {
  category: CategoryForCustomer;
  onClick?: () => void;
  className?: string;
}

export interface HeroSectionProps {
  globalSearchTerm: string;
  onSearchChange: (term: string) => void;
  isAuthenticated: boolean;
  allowAnimations: boolean;
}

export interface FeaturedProductsProps {
  products: ProductForCustomer[];
  onAddToCart: (product: ProductForCustomer) => void;
  onAddToWishlist: (
    product: ProductForCustomer
  ) => Promise<{ success: boolean; message: string }>;
  onQuickView: (product: ProductForCustomer) => void;
  onViewAllProducts: () => void;
  allowAnimations: boolean;
}

export interface PopularCategoriesProps {
  categories: CategoryForCustomer[];
  onCategoryClick: (category: CategoryForCustomer) => void;
  onViewAllCategories: () => void;
  allowAnimations: boolean;
}

export interface OverviewStatsProps {
  totalProducts: number;
  totalCategories: number;
  featuredCount: number;
  allowAnimations: boolean;
}

// 🔧 STATE MANAGEMENT
export interface OverviewState {
  isFirstRender: boolean;
  allowAnimations: boolean;
  searchTerm: string;
}

// 🔧 ACTION TYPES
export type OverviewAction =
  | { type: "SET_FIRST_RENDER"; payload: boolean }
  | { type: "SET_ALLOW_ANIMATIONS"; payload: boolean }
  | { type: "SET_SEARCH_TERM"; payload: string };

// 🎯 CONSTANTS
export const DEFAULT_OVERVIEW_STATE: OverviewState = {
  isFirstRender: true,
  allowAnimations: false,
  searchTerm: "",
};

export const HERO_ANIMATION_DELAY = 100;
