/**
 * 🛒 STOREFRONT TYPES INDEX
 * ========================
 *
 * Barrel exports for all storefront TypeScript types
 * Centralized export point for easy imports
 *
 * Created: 2025-01-17 - Storefront Module
 */

// 🏷️ Base Models
export type {
  // Core entities
  Customer,
  CustomerAddress,
  Cart,
  CartItem,
  WishlistItem,
  Order,
  OrderItem,
  OrderStatusHistory,
  ProductReview,

  // Extended entities (from inventory)
  ProductForCustomer,
  CategoryForCustomer,

  // Relations
  CustomerWithRelations,
  CartWithItems,
  CartItemWithProduct,
  OrderWithItems,
  OrderItemWithProduct,
  WishlistItemWithProduct,
  ProductReviewWithRelations,
} from "./models";

// 🏷️ Enums (regular exports, not type-only)
export {
  CustomerGender,
  CustomerTier,
  AddressType,
  OrderStatus,
  PaymentStatus,
  FulfillmentStatus,
} from "./models";

// 📥 Input Types
export type {
  // Customer inputs
  CreateCustomerInput,
  UpdateCustomerInput,
  CustomerLoginInput,
  CustomerRegistrationInput,

  // Address inputs
  CreateAddressInput,
  UpdateAddressInput,

  // Cart inputs
  AddToCartInput,
  UpdateCartItemInput,
  RemoveFromCartInput,
  GuestCartInput,
  ConvertGuestCartInput,

  // Wishlist inputs
  AddToWishlistInput,
  RemoveFromWishlistInput,

  // Order inputs
  CreateOrderInput,
  OrderItemInput,
  UpdateOrderStatusInput,
  UpdatePaymentStatusInput,

  // Review inputs
  CreateReviewInput,
  UpdateReviewInput,

  // Search inputs
  ProductSearchInput,
  CategorySearchInput,

  // Checkout inputs
  CheckoutInput,
  PaymentIntentInput,
} from "./inputs";

// 📤 Query Types
export type {
  // Pagination
  PaginationParams,
  PaginatedResponse,

  // Filters
  ProductFilters,
  CategoryFilters,
  CustomerFilters,
  OrderFilters,
  WishlistFilters,
  ReviewFilters,

  // Sort options
  ProductSortOptions,
  CategorySortOptions,
  CustomerSortOptions,
  OrderSortOptions,
  WishlistSortOptions,
  ReviewSortOptions,

  // Query options (filters + sort + pagination)
  ProductQueryOptions,
  CategoryQueryOptions,
  CustomerQueryOptions,
  OrderQueryOptions,
  WishlistQueryOptions,
  ReviewQueryOptions,

  // Stats & analytics
  StorefrontStats,
  CustomerDashboard,
  ProductAnalytics,
  ProductRecommendations,
  TopProduct,
  TopCategory,

  // Search
  GlobalSearchQuery,
  GlobalSearchResult,
  CartQuery,

  // Alerts
  StockAlert,
  CustomerAlert,

  // Query results
  UseStorefrontQueryResult,
  StorefrontMutationResult,

  // Generic types
  StorefrontQuery,
  StorefrontFilter,
} from "./queries";

// 🎯 Re-export everything for convenience
export * from "./models";
export * from "./inputs";
export * from "./queries";
export * from "./shared";

// 📋 Type utilities
export type RequiredBy<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type OptionalBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// 🔧 Utility types for common patterns
export type WithId<T> = T & { id: string };
export type WithTimestamps<T> = T & {
  createdAt: Date;
  updatedAt: Date;
};
export type WithPagination<T> = {
  data: T[];
  pagination: PaginatedResponse<T>["pagination"];
};

// 🎨 Component prop types
export interface ProductCardProps {
  product: ProductForCustomer;
  showWishlist?: boolean;
  showQuickView?: boolean;
  showAddToCart?: boolean;
  onAddToCart?: (productId: string) => void;
  onAddToWishlist?: (productId: string) => void;
  onQuickView?: (productId: string) => void;
}

export interface CategoryCardProps {
  category: CategoryForCustomer;
  showProductCount?: boolean;
  onClick?: (categoryId: string) => void;
}

export interface CartItemProps {
  item: CartItemWithProduct;
  onUpdateQuantity?: (itemId: string, quantity: number) => void;
  onRemove?: (itemId: string) => void;
}

export interface OrderSummaryProps {
  order: OrderWithItems;
  showItems?: boolean;
  showStatus?: boolean;
  onViewDetails?: (orderId: string) => void;
}

export interface CustomerProfileProps {
  customer: CustomerWithRelations;
  onUpdateProfile?: (data: UpdateCustomerInput) => void;
  onAddAddress?: (data: CreateAddressInput) => void;
}

// 🛒 Hook return types
export interface UseCartReturn {
  cart: CartWithItems | null;
  itemsCount: number;
  total: number;
  isLoading: boolean;
  addItem: (productId: string, quantity?: number) => Promise<void>;
  updateItem: (productId: string, quantity: number) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
}

export interface UseWishlistReturn {
  wishlist: WishlistItemWithProduct[];
  itemsCount: number;
  isLoading: boolean;
  addItem: (productId: string) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
}

export interface UseCustomerReturn {
  customer: Customer | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: CustomerLoginInput) => Promise<void>;
  register: (data: CustomerRegistrationInput) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: UpdateCustomerInput) => Promise<void>;
}

// 🔍 Search & Filter types
export type SearchSortBy = "relevance" | "name" | "price" | "rating" | "newest";
export type ViewMode = "grid" | "list";
export type PriceRange = {
  min: number;
  max: number;
};

// 🎭 UI State types
export interface StorefrontUIState {
  activeTab: string;
  viewMode: ViewMode;
  sortBy: SearchSortBy;
  sortOrder: "asc" | "desc";
  filters: ProductFilters;
  searchTerm: string;
  selectedCategory: string | null;
  isFiltersOpen: boolean;
  isMobileMenuOpen: boolean;
}

// 🌐 API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  errors?: Record<string, string[]>;
  message?: string;
}

export interface ApiErrorResponse {
  success: false;
  error: string;
  errors?: Record<string, string[]>;
  statusCode?: number;
}

export interface ApiSuccessResponse<T = any> {
  success: true;
  data: T;
  message?: string;
}
