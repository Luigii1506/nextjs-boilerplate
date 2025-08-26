/**
 * 🛒 STOREFRONT INPUT TYPES
 * ========================
 *
 * TypeScript input types for creating and updating storefront entities
 * Used in forms, server actions, and API calls
 *
 * Created: 2025-01-17 - Storefront Module
 */

import type {
  CustomerGender,
  CustomerTier,
  AddressType,
  OrderStatus,
  PaymentStatus,
} from "./models";

// 👤 CUSTOMER INPUTS
export interface CreateCustomerInput {
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  birthDate?: Date;
  gender?: CustomerGender;
  password: string;
  marketingEmails?: boolean;
  smsNotifications?: boolean;
}

export interface UpdateCustomerInput {
  firstName?: string;
  lastName?: string;
  phone?: string;
  birthDate?: Date;
  gender?: CustomerGender;
  marketingEmails?: boolean;
  smsNotifications?: boolean;
}

export interface CustomerLoginInput {
  email: string;
  password: string;
}

export interface CustomerRegistrationInput extends CreateCustomerInput {
  confirmPassword: string;
  acceptTerms: boolean;
}

// 📍 ADDRESS INPUTS
export interface CreateAddressInput {
  userId: string;
  type: AddressType;
  label?: string;
  firstName: string;
  lastName: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone?: string;
  isDefault?: boolean;
}

export interface UpdateAddressInput {
  type?: AddressType;
  label?: string;
  firstName?: string;
  lastName?: string;
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  phone?: string;
  isDefault?: boolean;
}

// 🛒 CART INPUTS
export interface AddToCartInput {
  productId: string;
  quantity: number;
  sessionId?: string; // For guest users
  userId?: string; // For authenticated users
}

export interface UpdateCartItemInput {
  cartId: string;
  productId: string;
  quantity: number;
}

export interface RemoveFromCartInput {
  cartId: string;
  productId: string;
}

// 💖 WISHLIST INPUTS
export interface AddToWishlistInput {
  userId: string;
  productId: string;
}

export interface RemoveFromWishlistInput {
  userId: string;
  productId: string;
}

// 📦 ORDER INPUTS
export interface CreateOrderInput {
  userId?: string; // Optional for guest orders
  email: string;
  phone?: string;

  // Cart items to convert to order
  items: OrderItemInput[];

  // Shipping
  shippingAddressId: string;
  shippingMethod?: string;

  // Payment
  paymentMethod: string;
  paymentIntentId?: string;

  // Pricing
  subtotal: number;
  taxAmount: number;
  shippingCost: number;
  discountAmount?: number;
  total: number;

  // Notes
  customerNotes?: string;
}

export interface OrderItemInput {
  productId: string;
  quantity: number;
  unitPrice: number;
  total: number;
  productSku: string;
  productName: string;
  productImage?: string;
}

export interface UpdateOrderStatusInput {
  orderId: string;
  status: OrderStatus;
  notes?: string;
  trackingNumber?: string;
  shippingMethod?: string;
  estimatedDelivery?: Date;
}

export interface UpdatePaymentStatusInput {
  orderId: string;
  paymentStatus: PaymentStatus;
  paymentIntentId?: string;
  notes?: string;
}

// ⭐ REVIEW INPUTS
export interface CreateReviewInput {
  productId: string;
  userId: string;
  orderId?: string;
  rating: number;
  title?: string;
  content: string;
}

export interface UpdateReviewInput {
  rating?: number;
  title?: string;
  content?: string;
}

// 🔍 SEARCH & FILTER INPUTS
export interface ProductSearchInput {
  query?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  tags?: string[];
  featured?: boolean;
  inStock?: boolean;
  rating?: number;
  sortBy?: "name" | "price" | "rating" | "newest" | "popularity";
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}

export interface CategorySearchInput {
  query?: string;
  parentId?: string;
  featured?: boolean;
  sortBy?: "name" | "productCount" | "newest";
  sortOrder?: "asc" | "desc";
}

// 🎯 CHECKOUT INPUTS
export interface CheckoutInput {
  userId?: string;
  cartId: string;

  // Customer info (for guest checkout)
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;

  // Addresses
  shippingAddress: CreateAddressInput | { id: string }; // New address or existing ID
  billingAddress?: CreateAddressInput | { id: string }; // Optional, defaults to shipping

  // Shipping
  shippingMethod: string;

  // Payment
  paymentMethod: string;

  // Notes
  customerNotes?: string;
}

export interface PaymentIntentInput {
  orderId: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  customerEmail: string;
  metadata?: Record<string, string>;
}

// 🛍️ GUEST CART INPUTS
export interface GuestCartInput {
  sessionId: string;
  items: Array<{
    productId: string;
    quantity: number;
  }>;
}

export interface ConvertGuestCartInput {
  sessionId: string;
  userId: string;
  mergeStrategy: "replace" | "merge" | "keep_guest";
}
