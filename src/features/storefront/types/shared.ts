/**
 * 🛒 STOREFRONT SHARED TYPES
 * =========================
 *
 * Tipos compartidos y utilidades para el módulo Storefront
 * Clean Architecture: Domain Layer (Types)
 *
 * Created: 2025-01-17 - Storefront Customer Module
 */

// 🎯 Action Result Types (Enhanced with message for customer-facing UX)
export interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string; // Customer-friendly message for UI feedback
  errors?: Record<string, string[]>; // validation errors
}

// 📊 Pagination Types
export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  nextPage: number | null;
  prevPage: number | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  pagination: PaginationInfo;
}

// 🔍 Search & Filter Types
export interface SearchOptions {
  query?: string;
  filters?: Record<string, unknown>;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

// 📊 Statistics Types
export interface StorefrontStats {
  totalProducts: number;
  categoriesCount: number;
  onSaleCount: number;
  newArrivalsCount: number;
  avgRating: number;
  totalReviews: number;
  featuredProducts: number;
  popularCategories: number;
}

export interface CustomerStats {
  wishlistCount: number;
  cartItemsCount: number;
  ordersCount: number;
  favoriteCategories: string[];
  recentlyViewed: any[]; // TODO: Type this when product view tracking is implemented
  recommendations: any[]; // TODO: Type this when recommendation engine is implemented
}

// 🏷️ Badge & Status Types
export type ProductBadgeType =
  | "new"
  | "sale"
  | "bestseller"
  | "limited"
  | "out_of_stock";
export type StockStatus = "in_stock" | "low_stock" | "out_of_stock";
export type CustomerTier = "BRONZE" | "SILVER" | "GOLD" | "PLATINUM";

// 🎨 UI State Types
export interface UIState {
  isLoading: boolean;
  isRefetching: boolean;
  isError: boolean;
  error: string | null;
}

// 🔄 Hook Return Types Base
export interface BaseHookResult extends UIState {
  refetch: () => void;
  invalidateCache: () => void;
}

// 📱 Customer Session Types
export interface CustomerSession {
  id: string;
  userId?: string;
  sessionId?: string;
  cartId?: string;
  preferences?: Record<string, unknown>;
  lastActivity: Date;
}

// 🛒 Shopping Context Types
export interface ShoppingContext {
  userId?: string;
  sessionId?: string;
  cartId?: string;
  wishlistId?: string;
  currency: string;
  locale: string;
}

// 🎯 Feature Flag Types
export interface StorefrontFeatureFlags {
  enableWishlist: boolean;
  enableCart: boolean;
  enableReviews: boolean;
  enableRecommendations: boolean;
  enableSocialLogin: boolean;
  enableGuestCheckout: boolean;
  enableInventoryTracking: boolean;
}

// 📊 Analytics Event Types
export interface AnalyticsEvent {
  event: string;
  userId?: string;
  sessionId?: string;
  data?: Record<string, unknown>;
  timestamp: Date;
}

export interface CustomerInteractionEvent extends AnalyticsEvent {
  productId?: string;
  categoryId?: string;
  searchTerm?: string;
  page?: string;
  action: "view" | "click" | "add_to_cart" | "add_to_wishlist" | "purchase";
}

// 🔐 Permission Types
export type StorefrontPermission =
  | "read_products"
  | "read_categories"
  | "manage_wishlist"
  | "manage_cart"
  | "read_orders"
  | "manage_profile";

// 💰 Price Types
export interface PriceInfo {
  price: number;
  salePrice?: number | null;
  currency: string;
  isOnSale: boolean;
  discountPercentage: number;
  formattedPrice: string;
  formattedSalePrice?: string;
}

// 🚚 Delivery Types
export interface DeliveryOption {
  id: string;
  name: string;
  description: string;
  price: number;
  estimatedDays: string;
  icon: string;
}

export interface EstimatedDelivery {
  standard: string;
  express: string;
  overnight: string;
  pickup: string;
}

// 🎨 Theme & UI Types
export type ThemeMode = "light" | "dark" | "auto";
export type ViewMode = "grid" | "list";
export type SortDirection = "asc" | "desc";

// 🔍 Filter Types Base
export interface BaseFilters {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: SortDirection;
  query?: string;
}

// 📱 Responsive Types
export type Breakpoint = "mobile" | "tablet" | "desktop" | "wide";
export type GridColumns = 1 | 2 | 3 | 4 | 5 | 6;

// 🎯 Customer Journey Types
export type JourneyStage =
  | "awareness"
  | "consideration"
  | "purchase"
  | "retention"
  | "advocacy";

export interface CustomerJourney {
  stage: JourneyStage;
  touchpoints: string[];
  interactions: CustomerInteractionEvent[];
  conversionRate?: number;
}

// 🏪 Store Configuration Types
export interface StoreConfig {
  name: string;
  currency: string;
  locale: string;
  timezone: string;
  features: StorefrontFeatureFlags;
  theme: {
    primaryColor: string;
    secondaryColor: string;
    mode: ThemeMode;
  };
}
