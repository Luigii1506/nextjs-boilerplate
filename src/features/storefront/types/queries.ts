/**
 * 🛒 STOREFRONT QUERY TYPES
 * =========================
 *
 * TypeScript types for queries, filters, and paginated responses
 * Used in hooks, server actions, and data fetching
 *
 * Created: 2025-01-17 - Storefront Module
 */

import type {
  ProductForCustomer,
  CategoryForCustomer,
  Customer,
  Order,
  CartWithItems,
  WishlistItem,
  ProductReview,
  CustomerTier,
  OrderStatus,
  PaymentStatus,
  FulfillmentStatus,
} from "./models";

// 📊 PAGINATION
export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// 🔍 PRODUCT FILTERS & QUERIES
export interface ProductFilters {
  query?: string;
  categoryId?: string;
  categoryIds?: string[];
  minPrice?: number;
  maxPrice?: number;
  tags?: string[];
  featured?: boolean;
  inStock?: boolean;
  minRating?: number;
  isPublic?: boolean;
}

export interface ProductSortOptions {
  sortBy: "name" | "price" | "rating" | "newest" | "popularity" | "stock";
  sortOrder: "asc" | "desc";
}

export interface ProductQueryOptions
  extends ProductFilters,
    ProductSortOptions,
    PaginationParams {}

// 🏷️ CATEGORY FILTERS & QUERIES
export interface CategoryFilters {
  query?: string;
  parentId?: string;
  featured?: boolean;
  isPublic?: boolean;
  hasProducts?: boolean;
}

export interface CategorySortOptions {
  sortBy: "name" | "productCount" | "sortOrder" | "newest";
  sortOrder: "asc" | "desc";
}

export interface CategoryQueryOptions
  extends CategoryFilters,
    CategorySortOptions,
    PaginationParams {}

// 👤 CUSTOMER FILTERS & QUERIES
export interface CustomerFilters {
  query?: string; // Search by name or email
  tier?: CustomerTier;
  emailVerified?: boolean;
  hasOrders?: boolean;
  registeredAfter?: Date;
  registeredBefore?: Date;
}

export interface CustomerSortOptions {
  sortBy:
    | "name"
    | "email"
    | "totalSpent"
    | "totalOrders"
    | "joinDate"
    | "lastLoginAt";
  sortOrder: "asc" | "desc";
}

export interface CustomerQueryOptions
  extends CustomerFilters,
    CustomerSortOptions,
    PaginationParams {}

// 📦 ORDER FILTERS & QUERIES
export interface OrderFilters {
  userId?: string;
  status?: OrderStatus;
  statuses?: OrderStatus[];
  paymentStatus?: PaymentStatus;
  fulfillmentStatus?: FulfillmentStatus;
  placedAfter?: Date;
  placedBefore?: Date;
  minTotal?: number;
  maxTotal?: number;
  query?: string; // Search by order number or customer email
}

export interface OrderSortOptions {
  sortBy: "number" | "placedAt" | "total" | "status" | "customerEmail";
  sortOrder: "asc" | "desc";
}

export interface OrderQueryOptions
  extends OrderFilters,
    OrderSortOptions,
    PaginationParams {}

// 💖 WISHLIST FILTERS & QUERIES
export interface WishlistFilters {
  userId: string;
  categoryId?: string;
  addedAfter?: Date;
  addedBefore?: Date;
  inStock?: boolean;
  maxPrice?: number;
}

export interface WishlistSortOptions {
  sortBy: "addedAt" | "productName" | "price" | "rating";
  sortOrder: "asc" | "desc";
}

export interface WishlistQueryOptions
  extends WishlistFilters,
    WishlistSortOptions,
    PaginationParams {}

// ⭐ REVIEW FILTERS & QUERIES
export interface ReviewFilters {
  productId?: string;
  userId?: string;
  rating?: number;
  minRating?: number;
  maxRating?: number;
  isVerifiedPurchase?: boolean;
  isPublished?: boolean;
  createdAfter?: Date;
  createdBefore?: Date;
}

export interface ReviewSortOptions {
  sortBy: "createdAt" | "rating" | "helpfulCount";
  sortOrder: "asc" | "desc";
}

export interface ReviewQueryOptions
  extends ReviewFilters,
    ReviewSortOptions,
    PaginationParams {}

// 📊 STOREFRONT ANALYTICS (Admin Dashboard)
export interface StorefrontAnalytics {
  totalCustomers: number;
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;

  // Period comparisons
  customersGrowth: number;
  ordersGrowth: number;
  revenueGrowth: number;

  // Top performers
  topProducts: Array<{
    product: ProductForCustomer;
    totalSold: number;
    revenue: number;
  }>;

  topCategories: Array<{
    category: CategoryForCustomer;
    productCount: number;
    revenue: number;
  }>;

  // Recent activity
  recentOrders: Order[];
  recentCustomers: Customer[];
}

// 📊 STOREFRONT STATS (Customer-facing)
export interface StorefrontStats {
  totalProducts: number;
  categoriesCount: number;
  onSaleCount: number;
  newArrivalsCount: number;
  avgRating: number;
  totalReviews: number;

  // Featured content
  featuredProducts: ProductForCustomer[];
  popularCategories: CategoryForCustomer[];
}

export interface CustomerDashboard {
  customer: Customer;
  recentOrders: Order[];
  wishlistCount: number;
  cartItemsCount: number;
  totalSpent: number;
  savedAddresses: number;
  reviewsCount: number;

  // Recommendations
  recommendedProducts: ProductForCustomer[];
  reorderSuggestions: ProductForCustomer[];
}

// 🛒 CART QUERIES
export interface CartQuery {
  sessionId?: string;
  userId?: string;
}

// 🔍 SEARCH QUERIES
export interface GlobalSearchQuery {
  query: string;
  includeProducts?: boolean;
  includeCategories?: boolean;
  limit?: number;
}

export interface GlobalSearchResult {
  products: ProductForCustomer[];
  categories: CategoryForCustomer[];
  totalResults: number;
}

// 📈 PRODUCT ANALYTICS
export interface ProductAnalytics {
  product: ProductForCustomer;
  views: number;
  addedToCart: number;
  addedToWishlist: number;
  purchased: number;
  averageRating: number;
  reviewCount: number;
  conversionRate: number;
}

// 🎯 RECOMMENDATIONS
export interface ProductRecommendations {
  relatedProducts: ProductForCustomer[];
  frequentlyBoughtTogether: ProductForCustomer[];
  customerAlsoViewed: ProductForCustomer[];
  similarProducts: ProductForCustomer[];
}

// 🏆 TOP LISTS
export interface TopProduct {
  product: ProductForCustomer;
  metric: number;
  metricType: "sales" | "revenue" | "views" | "rating";
}

export interface TopCategory {
  category: CategoryForCustomer;
  productCount: number;
  revenue: number;
  orderCount: number;
}

// 🚨 ALERTS & NOTIFICATIONS
export interface StockAlert {
  product: ProductForCustomer;
  currentStock: number;
  threshold: number;
  severity: "low" | "critical" | "out_of_stock";
}

export interface CustomerAlert {
  userId: string;
  type:
    | "order_shipped"
    | "order_delivered"
    | "payment_failed"
    | "wishlist_price_drop";
  message: string;
  data?: Record<string, unknown>;
  createdAt: Date;
}

// 📋 QUERY RESULTS
export interface UseStorefrontQueryResult {
  // Products
  products: ProductForCustomer[];
  featuredProducts: ProductForCustomer[];

  // Categories
  categories: CategoryForCustomer[];
  featuredCategories: CategoryForCustomer[];

  // Customer data
  customer: Customer | null;
  cart: CartWithItems | null;
  wishlist: WishlistItem[];
  orders: Order[];

  // Stats
  stats: StorefrontStats;

  // Loading states
  isLoading: boolean;
  isError: boolean;
  error: string | null;

  // Methods
  refetch: () => void;
  invalidateCache: (tags?: string[]) => void;
}

// 🔄 MUTATION RESULTS
export interface StorefrontMutationResult<T = any> {
  data: T | null;
  success: boolean;
  error: string | null;
  errors: Record<string, string[]> | null;
}

// 📤 EXPORT TYPES
export type StorefrontQuery =
  | ProductQueryOptions
  | CategoryQueryOptions
  | OrderQueryOptions
  | CustomerQueryOptions
  | WishlistQueryOptions
  | ReviewQueryOptions;

export type StorefrontFilter =
  | ProductFilters
  | CategoryFilters
  | OrderFilters
  | CustomerFilters
  | WishlistFilters
  | ReviewFilters;
