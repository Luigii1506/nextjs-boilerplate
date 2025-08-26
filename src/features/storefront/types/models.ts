/**
 * 🛒 STOREFRONT MODELS TYPES
 * =========================
 *
 * TypeScript types for storefront entities
 * Generated from Prisma schema and extended for business logic
 *
 * Created: 2025-01-17 - Storefront Module
 */

// 🗄️ Base Prisma Types (will be auto-generated)
export interface Customer {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  birthDate: Date | null;
  gender: CustomerGender | null;
  emailVerified: boolean;
  marketingEmails: boolean;
  smsNotifications: boolean;
  passwordHash: string | null;
  resetToken: string | null;
  resetTokenExpiry: Date | null;
  lastLoginAt: Date | null;
  totalOrders: number;
  totalSpent: number;
  tier: CustomerTier;
  joinDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CustomerAddress {
  id: string;
  userId: string;
  type: AddressType;
  label: string | null;
  firstName: string;
  lastName: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string | null;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Cart {
  id: string;
  sessionId: string | null;
  userId: string | null;
  subtotal: number;
  taxAmount: number;
  total: number;
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date;
}

export interface CartItem {
  id: string;
  cartId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  total: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface WishlistItem {
  id: string;
  userId: string;
  productId: string;
  addedAt: Date;
}

export interface Order {
  id: string;
  number: string;
  customerId: string | null;
  email: string;
  phone: string | null;
  subtotal: number;
  taxAmount: number;
  shippingCost: number;
  discountAmount: number;
  total: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  fulfillmentStatus: FulfillmentStatus;
  placedAt: Date;
  estimatedDelivery: Date | null;
  shippedAt: Date | null;
  deliveredAt: Date | null;
  cancelledAt: Date | null;
  shippingAddressId: string | null;
  trackingNumber: string | null;
  shippingMethod: string | null;
  paymentMethod: string | null;
  paymentIntentId: string | null;
  customerNotes: string | null;
  adminNotes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  total: number;
  productSku: string;
  productName: string;
  productImage: string | null;
  createdAt: Date;
}

export interface OrderStatusHistory {
  id: string;
  orderId: string;
  status: OrderStatus;
  notes: string | null;
  createdAt: Date;
}

export interface ProductReview {
  id: string;
  productId: string;
  userId: string;
  orderId: string | null;
  rating: number;
  title: string | null;
  content: string;
  isVerifiedPurchase: boolean;
  isPublished: boolean;
  helpfulCount: number;
  unhelpfulCount: number;
  createdAt: Date;
  updatedAt: Date;
}

// 🏷️ Extended Product interface for storefront (from inventory)
export interface ProductForCustomer {
  id: string;
  sku: string;
  name: string;
  description: string | null;
  categoryId: string;
  price: number;
  stock: number;
  unit: string;
  images: string[];
  tags: string[];

  // ✨ Storefront-specific fields
  isPublic: boolean;
  publicPrice: number | null;
  publicDescription: string | null;
  publicImages: string[];
  seoTitle: string | null;
  seoDescription: string | null;
  seoKeywords: string[];
  featured: boolean;

  // 🛒 Customer-facing fields (computed/derived)
  currentPrice?: number;
  originalPrice?: number;
  isOnSale?: boolean;
  discountPercentage?: number;
  rating?: number;
  reviewCount?: number;
  category?: string; // Category name (resolved from categoryId)
  brand?: string;
  salesCount?: number;
  isWishlisted?: boolean;
  isInCart?: boolean;
  isAvailable?: boolean;
  badges?: string[];
  estimatedDelivery?: string;
  salePrice?: number;

  // 📅 Timestamps
  createdAt: Date;
  updatedAt: Date;

  // 💖 Wishlist info (computed)
  dateAddedToWishlist?: Date | string;
}

// 🏷️ Extended Category interface for storefront (from inventory)
export interface CategoryForCustomer {
  id: string;
  name: string;
  slug?: string; // URL-friendly version of name
  description: string | null;
  parentId: string | null;
  color: string | null;
  icon: string | null;
  sortOrder: number;

  // ✨ Storefront-specific fields
  isPublic: boolean;
  publicDescription: string | null;
  publicImage: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  seoKeywords: string[];
  featured: boolean;

  // 📊 Computed properties
  productCount?: number;
  popularity?: number;
  isPopular?: boolean;

  // 📅 Timestamps
  createdAt: Date;
  updatedAt: Date;
}

// 🏷️ Enums
export enum CustomerGender {
  MALE = "MALE",
  FEMALE = "FEMALE",
  OTHER = "OTHER",
  PREFER_NOT_TO_SAY = "PREFER_NOT_TO_SAY",
}

export enum CustomerTier {
  BRONZE = "BRONZE",
  SILVER = "SILVER",
  GOLD = "GOLD",
  PLATINUM = "PLATINUM",
}

export enum AddressType {
  SHIPPING = "SHIPPING",
  BILLING = "BILLING",
  BOTH = "BOTH",
}

export enum OrderStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  PROCESSING = "PROCESSING",
  SHIPPED = "SHIPPED",
  DELIVERED = "DELIVERED",
  CANCELLED = "CANCELLED",
  REFUNDED = "REFUNDED",
}

export enum PaymentStatus {
  PENDING = "PENDING",
  PAID = "PAID",
  FAILED = "FAILED",
  REFUNDED = "REFUNDED",
  PARTIALLY_REFUNDED = "PARTIALLY_REFUNDED",
}

export enum FulfillmentStatus {
  UNFULFILLED = "UNFULFILLED",
  PARTIALLY_FULFILLED = "PARTIALLY_FULFILLED",
  FULFILLED = "FULFILLED",
  SHIPPED = "SHIPPED",
  DELIVERED = "DELIVERED",
}

// 🔗 Relations Types
export interface CustomerWithRelations extends Customer {
  addresses: CustomerAddress[];
  orders: Order[];
  cart: CartWithItems | null;
  wishlistItems: WishlistItemWithProduct[];
  reviews: ProductReview[];
}

export interface CartWithItems extends Cart {
  customer: Customer | null;
  items: CartItemWithProduct[];
}

export interface CartItemWithProduct extends CartItem {
  product: ProductForCustomer;
}

export interface OrderWithItems extends Order {
  customer: Customer | null;
  shippingAddress: CustomerAddress | null;
  items: OrderItemWithProduct[];
  statusHistory: OrderStatusHistory[];
}

export interface OrderItemWithProduct extends OrderItem {
  product: ProductForCustomer;
}

export interface WishlistItemWithProduct extends WishlistItem {
  product: ProductForCustomer;
}

export interface ProductReviewWithRelations extends ProductReview {
  product: ProductForCustomer;
  customer: Customer;
}
