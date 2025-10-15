/**
 * 💰 PRICING SYSTEM TYPES
 * ========================
 *
 * Complete type definitions for the multi-layer pricing system
 * - Product-level pricing (sale prices, volume discounts)
 * - Cart-level promotions (BOGO, percentage, fixed amount)
 * - Coupon codes
 * - Auto-discounts
 *
 * Created: 2025-01-17 - E-Commerce Complete Foundation
 */

import { Decimal } from "@prisma/client/runtime/library";

// ========================================
// 🎯 ENUMS (matching Prisma schema)
// ========================================

export enum ProductVisibility {
  HIDDEN = "HIDDEN",
  PUBLIC = "PUBLIC",
  INTERNAL = "INTERNAL",
  COMING_SOON = "COMING_SOON",
  DISCONTINUED = "DISCONTINUED",
}

export enum SalesChannel {
  ONLINE = "ONLINE",
  POS = "POS",
}

export enum PromotionType {
  PERCENTAGE = "PERCENTAGE",
  FIXED_AMOUNT = "FIXED_AMOUNT",
  BOGO = "BOGO",
  BUY_X_GET_Y = "BUY_X_GET_Y",
  FREE_SHIPPING = "FREE_SHIPPING",
  BUNDLE = "BUNDLE",
}

export enum CouponType {
  PERCENTAGE = "PERCENTAGE",
  FIXED_AMOUNT = "FIXED_AMOUNT",
  FREE_SHIPPING = "FREE_SHIPPING",
  FIRST_ORDER = "FIRST_ORDER",
}

export enum DiscountType {
  PERCENTAGE = "PERCENTAGE",
  FIXED_AMOUNT = "FIXED_AMOUNT",
}

export enum AppliesTo {
  ALL_PRODUCTS = "ALL_PRODUCTS",
  SPECIFIC_PRODUCTS = "SPECIFIC_PRODUCTS",
  SPECIFIC_CATEGORIES = "SPECIFIC_CATEGORIES",
  ENTIRE_ORDER = "ENTIRE_ORDER",
}

// ========================================
// 📦 PRODUCT PRICING
// ========================================

export interface VolumePricingTier {
  min: number; // Minimum quantity
  price: number; // Price per unit at this tier
}

export interface ProductPricing {
  productId: string;
  sku: string;
  name: string;
  basePrice: number; // Regular price
  salePrice?: number | null; // Current sale price (if any)
  saleStartAt?: Date | null;
  saleEndAt?: Date | null;
  volumePricing?: VolumePricingTier[] | null; // Bulk pricing
  categoryId: string;
  quantity: number; // Quantity in cart

  // Computed
  effectiveUnitPrice: number; // Price after product-level discounts
  lineTotal: number; // effectiveUnitPrice * quantity
  productLevelDiscount: number; // Amount saved from product discounts
}

// ========================================
// 🎁 PROMOTIONS
// ========================================

export interface Promotion {
  id: string;
  name: string;
  description?: string | null;
  type: PromotionType;
  discountType: DiscountType;
  discountValue: number;
  appliesTo: AppliesTo;
  targetProductIds: string[];
  targetCategoryIds: string[];
  promoConfig?: any; // JSON for BOGO/BuyXGetY config
  minPurchaseAmount?: number | null;
  minQuantity?: number | null;
  maxUsesTotal?: number | null;
  maxUsesPerUser?: number | null;
  availableChannels: SalesChannel[];
  isActive: boolean;
  isPriority: boolean;
  startAt?: Date | null;
  endAt?: Date | null;
  usageCount: number;
}

export interface PromotionResult {
  promotionId: string;
  promotionName: string;
  promotionType: PromotionType;
  discountAmount: number;
  affectedProducts: string[]; // Product IDs that got the discount
  metadata?: any; // Extra info (e.g., which items were free in BOGO)
}

// ========================================
// 🎟️ COUPONS
// ========================================

export interface Coupon {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  type: CouponType;
  discountType: DiscountType;
  discountValue: number;
  appliesTo: AppliesTo;
  targetProductIds: string[];
  targetCategoryIds: string[];
  minPurchaseAmount?: number | null;
  maxDiscountAmount?: number | null;
  maxUsesTotal?: number | null;
  maxUsesPerUser: number;
  availableChannels: SalesChannel[];
  isActive: boolean;
  startAt?: Date | null;
  endAt?: Date | null;
  usageCount: number;
}

export interface CouponResult {
  couponId: string;
  couponCode: string;
  couponName: string;
  discountAmount: number;
  metadata?: any;
}

// ========================================
// 🛒 CART & PRICING CALCULATION
// ========================================

export interface CartItem {
  productId: string;
  sku: string;
  name: string;
  categoryId: string;
  quantity: number;
  basePrice: number; // Regular price per unit
  salePrice?: number | null;
  saleStartAt?: Date | null;
  saleEndAt?: Date | null;
  volumePricing?: VolumePricingTier[] | null;
  image?: string | null;
}

export interface PricingContext {
  channel: SalesChannel; // ONLINE or POS
  userId?: string | null; // For user-specific rules
  isFirstOrder?: boolean; // For first-order coupons
  appliedCouponCode?: string | null; // User-entered coupon
  shippingCost?: number; // For free shipping calculations
  timestamp?: Date; // For time-based promotions
}

export interface PricingCalculationInput {
  items: CartItem[];
  context: PricingContext;
}

// ========================================
// 💵 PRICING BREAKDOWN (OUTPUT)
// ========================================

export interface PricingBreakdown {
  // Product-level pricing
  products: ProductPricing[];

  // Subtotals
  subtotal: number; // Sum of all line totals (after product discounts)
  originalSubtotal: number; // Sum of base prices * quantities
  productDiscounts: number; // Total saved from sales/volume pricing

  // Cart-level discounts
  appliedPromotions: PromotionResult[];
  promotionDiscounts: number; // Total from promotions

  // Coupon discounts
  appliedCoupon?: CouponResult | null;
  couponDiscounts: number; // Total from coupon

  // Auto discounts (future: loyalty, first purchase, etc.)
  autoDiscounts: number;

  // Shipping
  shippingCost: number;
  shippingDiscount: number; // If free shipping was applied

  // Tax (calculated elsewhere, but included here for completeness)
  taxAmount: number;

  // Final totals
  totalDiscounts: number; // Sum of all discount types
  total: number; // Final amount to pay

  // Metadata for display/debugging
  discountDetails: DiscountDetails;
}

export interface DiscountDetails {
  productLevel: Array<{
    productId: string;
    productName: string;
    type: "sale" | "volume";
    originalPrice: number;
    discountedPrice: number;
    amountSaved: number;
  }>;

  promotionLevel: Array<{
    promotionId: string;
    promotionName: string;
    type: string;
    amountSaved: number;
    affectedProducts: string[];
  }>;

  couponLevel?: {
    couponCode: string;
    couponName: string;
    type: string;
    amountSaved: number;
  } | null;

  shippingLevel?: {
    originalCost: number;
    finalCost: number;
    amountSaved: number;
  } | null;
}

// ========================================
// 🔧 VALIDATION RESULTS
// ========================================

export interface ValidationResult {
  isValid: boolean;
  reason?: string; // Error message if invalid
  metadata?: any; // Extra info
}

export interface PromotionValidationResult extends ValidationResult {
  promotion: Promotion;
}

export interface CouponValidationResult extends ValidationResult {
  coupon?: Coupon;
}

// ========================================
// 📊 USAGE TRACKING
// ========================================

export interface PromotionUsageData {
  promotionId: string;
  orderId: string;
  userId?: string | null;
  discountAmount: number;
}

export interface CouponUsageData {
  couponId: string;
  couponCode: string;
  orderId: string;
  userId?: string | null;
  discountAmount: number;
}

// ========================================
// 🎯 PRICING ENGINE CONFIG
// ========================================

export interface PricingEngineConfig {
  enableProductDiscounts: boolean;
  enablePromotions: boolean;
  enableCoupons: boolean;
  enableAutoDiscounts: boolean;
  maxDiscountPercentage?: number; // Safety cap (e.g., 90%)
  allowStackingPromotions: boolean; // Can multiple promotions apply?
  allowStackingCoupons: boolean; // Can coupon + promotion stack?
  taxRate: number; // Default tax rate
}

// ========================================
// 🔄 PRICING ENGINE OUTPUT
// ========================================

export interface PricingResult {
  success: boolean;
  breakdown?: PricingBreakdown;
  errors?: string[];
  warnings?: string[];
}
