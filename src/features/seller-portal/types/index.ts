/**
 * 👨‍💼 SELLER PORTAL TYPES
 * =====================
 *
 * TypeScript types for the Seller Portal module
 * - Orders management
 * - Tracking
 * - Products visibility
 * - Promotions & Coupons
 * - Analytics
 *
 * Created: 2025-01-17 - Seller Portal Implementation
 */

// Import and re-export Prisma enums (both as values and types)
import type {
  OrderStatus,
  PaymentStatus,
  FulfillmentStatus,
  ProductVisibility,
  SalesChannel,
  PromotionType,
  CouponType,
  DiscountType,
  AppliesTo,
} from "@prisma/client";

export {
  OrderStatus,
  PaymentStatus,
  FulfillmentStatus,
  ProductVisibility,
  SalesChannel,
  PromotionType,
  CouponType,
  DiscountType,
  AppliesTo,
} from "@prisma/client";

// ========================================
// 📦 ORDERS
// ========================================

export interface OrderFilters {
  status?: OrderStatus | "ALL";
  paymentStatus?: PaymentStatus | "ALL";
  fulfillmentStatus?: FulfillmentStatus | "ALL";
  dateFrom?: Date;
  dateTo?: Date;
  searchQuery?: string; // Search by order number, email, customer name
}

export interface OrderSummary {
  id: string;
  number: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  fulfillmentStatus: FulfillmentStatus;
  customerEmail: string;
  customerName?: string;
  total: number;
  itemsCount: number;
  placedAt: Date;
  shippedAt?: Date;
  deliveredAt?: Date;
  estimatedDelivery?: Date;
  trackingNumber?: string;
  paymentMethod?: string;
}

export interface OrderDetails extends OrderSummary {
  userId?: string;
  phone?: string;
  subtotal: number;
  taxAmount: number;
  shippingCost: number;
  discountAmount: number;
  productDiscounts: number;
  promotionDiscounts: number;
  couponDiscounts: number;
  appliedCouponCode?: string;
  shippingAddress?: string; // JSON string
  shippingMethod?: string;
  paymentMethod?: string;
  customerNotes?: string;
  adminNotes?: string;
  items: OrderItemDetails[];
  statusHistory: OrderStatusHistoryItem[];
}

export interface OrderItemDetails {
  id: string;
  productId: string;
  productSku: string;
  productName: string;
  productImage?: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface OrderStatusHistoryItem {
  id: string;
  status: OrderStatus;
  notes?: string;
  createdAt: Date;
}

// ========================================
// 🚚 TRACKING
// ========================================

export interface TrackingUpdate {
  orderId: string;
  trackingNumber: string;
  shippingCarrier?: string;
  estimatedDelivery?: Date;
  notes?: string;
}

export interface TrackingInfo {
  orderId: string;
  orderNumber: string;
  trackingNumber?: string;
  shippingCarrier?: string;
  shippedAt?: Date;
  estimatedDelivery?: Date;
  deliveredAt?: Date;
  currentStatus: FulfillmentStatus;
  timeline: TrackingTimelineEvent[];
}

export interface TrackingTimelineEvent {
  id: string;
  status: FulfillmentStatus;
  description: string;
  location?: string;
  timestamp: Date;
}

// ========================================
// 📦 PRODUCTS (Quick Management)
// ========================================

export interface ProductQuickView {
  id: string;
  sku: string;
  name: string;
  price: number;
  publicPrice?: number;
  salePrice?: number;
  stock: number;
  visibility: ProductVisibility;
  availableChannels: SalesChannel[];
  isPublic: boolean;
  isActive: boolean;
  categoryName: string;
  image?: string;
}

export interface ProductVisibilityUpdate {
  productId: string;
  visibility: ProductVisibility;
  availableChannels: SalesChannel[];
  isPublic: boolean;
}

// ========================================
// 🎁 PROMOTIONS
// ========================================

export interface PromotionFormData {
  name: string;
  description?: string;
  type: PromotionType;
  discountType: DiscountType;
  discountValue: number;
  appliesTo: AppliesTo;
  targetProductIds?: string[];
  targetCategoryIds?: string[];
  promoConfig?: any; // BOGO config
  minPurchaseAmount?: number;
  minQuantity?: number;
  maxUsesTotal?: number;
  maxUsesPerUser?: number;
  availableChannels: SalesChannel[];
  isActive: boolean;
  isPriority: boolean;
  startAt?: Date;
  endAt?: Date;
}

// ========================================
// 🎟️ COUPONS
// ========================================

export interface CouponFormData {
  code: string;
  name: string;
  description?: string;
  type: CouponType;
  discountType: DiscountType;
  discountValue: number;
  appliesTo: AppliesTo;
  targetProductIds?: string[];
  targetCategoryIds?: string[];
  minPurchaseAmount?: number;
  maxDiscountAmount?: number;
  maxUsesTotal?: number;
  maxUsesPerUser: number;
  availableChannels: SalesChannel[];
  isActive: boolean;
  startAt?: Date;
  endAt?: Date;
}

// ========================================
// 📊 ANALYTICS
// ========================================

export interface AnalyticsSummary {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  totalCustomers: number;
  period: {
    from: Date;
    to: Date;
  };

  // By channel
  revenueByChannel: Record<SalesChannel, number>;
  ordersByChannel: Record<SalesChannel, number>;

  // By status
  ordersByStatus: Record<OrderStatus, number>;

  // Top products
  topProducts: {
    productId: string;
    productName: string;
    quantity: number;
    revenue: number;
  }[];

  // Discount analytics
  discountStats: {
    totalDiscounts: number;
    promotionDiscounts: number;
    couponDiscounts: number;
    productDiscounts: number;
    averageDiscountPerOrder: number;
  };
}

export interface RevenueChartData {
  date: string;
  revenue: number;
  orders: number;
  channel: SalesChannel;
}

// ========================================
// ⭐ REVIEWS (Optional)
// ========================================

export interface ReviewSummary {
  id: string;
  productId: string;
  productName: string;
  productImage?: string;
  userId: string;
  userName?: string;
  rating: number;
  title?: string;
  content: string;
  isVerifiedPurchase: boolean;
  isPublished: boolean;
  helpfulCount: number;
  unhelpfulCount: number;
  createdAt: Date;
  orderId?: string;
}

// ========================================
// 🔄 RESPONSES
// ========================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  validationErrors?: Record<string, string>;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ========================================
// 📋 TAB TYPES
// ========================================

export type SellerPortalTab =
  | "orders"
  | "tracking"
  | "products"
  | "promotions"
  | "coupons"
  | "reviews"
  | "analytics";

export interface TabConfig {
  id: SellerPortalTab;
  label: string;
  icon: string;
  description: string;
  badge?: number; // Optional badge count
}
