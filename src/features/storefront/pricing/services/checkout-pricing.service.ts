/**
 * 💰 CHECKOUT PRICING SERVICE
 * ============================
 *
 * Integration layer between PricingEngine and Checkout
 * - Calculates pricing for cart during checkout
 * - Validates and applies coupons
 * - Tracks promotion/coupon usage after order creation
 *
 * Usage in checkout:
 *   const pricing = await calculateCheckoutPricing(cart, context);
 *
 * Created: 2025-01-17 - E-Commerce Complete Foundation
 */

import { PrismaClient } from "@prisma/client";
import { PricingEngine } from "./PricingEngine";
import {
  PricingCalculationInput,
  PricingBreakdown,
  SalesChannel,
  CartItem,
  PricingContext,
} from "../types/pricing.types";
import {
  getActivePromotions,
  validateCoupon,
  isFirstOrder,
  recordPromotionUsage,
  recordCouponUsage,
} from "../utils/validation";

const prisma = new PrismaClient();
const pricingEngine = new PricingEngine();

// ========================================
// 🛒 CART TO PRICING INPUT CONVERSION
// ========================================

/**
 * Convert Prisma cart to PricingEngine input format
 */
export async function convertCartToPricingInput(
  cart: any, // Prisma Cart with items
  channel: SalesChannel = SalesChannel.ONLINE,
  userId?: string | null,
  couponCode?: string | null
): Promise<PricingCalculationInput> {
  // Map cart items to pricing format
  const items: CartItem[] = cart.items.map((item: any) => ({
    productId: item.product.id,
    sku: item.product.sku,
    name: item.product.name,
    categoryId: item.product.categoryId,
    quantity: item.quantity,
    basePrice: Number(item.product.price),
    salePrice: item.product.salePrice ? Number(item.product.salePrice) : null,
    saleStartAt: item.product.saleStartAt,
    saleEndAt: item.product.saleEndAt,
    volumePricing: item.product.volumePricing,
    image: item.product.publicImages?.[0] || null,
  }));

  // Check if this is user's first order (for FIRST_ORDER coupons)
  let isFirstOrderFlag = false;
  if (userId) {
    isFirstOrderFlag = await isFirstOrder(userId);
  }

  // Build pricing context
  const context: PricingContext = {
    channel,
    userId,
    isFirstOrder: isFirstOrderFlag,
    appliedCouponCode: couponCode || null,
    shippingCost: 0, // Will be set later if shipping info available
    timestamp: new Date(),
  };

  return {
    items,
    context,
  };
}

// ========================================
// 💰 CHECKOUT PRICING CALCULATION
// ========================================

/**
 * Calculate complete pricing for checkout
 * This is the main function used during checkout flow
 */
export async function calculateCheckoutPricing(
  cart: any, // Prisma Cart with items
  options: {
    channel?: SalesChannel;
    userId?: string | null;
    couponCode?: string | null;
    shippingCost?: number;
    shippingAddress?: any;
  } = {}
): Promise<{
  success: boolean;
  breakdown?: PricingBreakdown;
  errors?: string[];
  warnings?: string[];
}> {
  try {
    const {
      channel = SalesChannel.ONLINE,
      userId = null,
      couponCode = null,
      shippingCost = 0,
      shippingAddress = null,
    } = options;

    console.log("💰 [CHECKOUT PRICING] Calculating pricing:", {
      cartId: cart.id,
      itemsCount: cart.items.length,
      channel,
      userId,
      couponCode,
      shippingCost,
    });

    // 1. Convert cart to pricing input
    const input = await convertCartToPricingInput(cart, channel, userId, couponCode);

    // Add shipping cost to context
    input.context.shippingCost = shippingCost;

    // 2. Get active promotions for this channel
    const activePromotions = await getActivePromotions(channel);

    console.log("💰 [CHECKOUT PRICING] Found active promotions:", {
      count: activePromotions.length,
      promotions: activePromotions.map((p) => ({
        id: p.id,
        name: p.name,
        type: p.type,
      })),
    });

    // 3. Validate and get coupon (if provided)
    let coupon = null;
    if (couponCode) {
      const subtotalEstimate = cart.items.reduce(
        (sum: number, item: any) => sum + Number(item.unitPrice) * item.quantity,
        0
      );

      const couponValidation = await validateCoupon(
        couponCode,
        userId,
        subtotalEstimate,
        channel,
        input.context.isFirstOrder
      );

      if (couponValidation.isValid && couponValidation.coupon) {
        coupon = couponValidation.coupon;
        console.log("💰 [CHECKOUT PRICING] Valid coupon applied:", {
          code: couponCode,
          name: coupon.name,
          type: coupon.type,
        });
      } else {
        console.log("⚠️ [CHECKOUT PRICING] Invalid coupon:", {
          code: couponCode,
          reason: couponValidation.reason,
        });
        return {
          success: false,
          errors: [couponValidation.reason || "Invalid coupon code"],
        };
      }
    }

    // 4. Calculate pricing using PricingEngine
    const result = await pricingEngine.calculatePricing(
      input,
      activePromotions as any[],
      coupon as any
    );

    if (result.success && result.breakdown) {
      console.log("✅ [CHECKOUT PRICING] Pricing calculated:", {
        subtotal: result.breakdown.subtotal,
        productDiscounts: result.breakdown.productDiscounts,
        promotionDiscounts: result.breakdown.promotionDiscounts,
        couponDiscounts: result.breakdown.couponDiscounts,
        shippingCost: result.breakdown.shippingCost,
        taxAmount: result.breakdown.taxAmount,
        total: result.breakdown.total,
        totalDiscounts: result.breakdown.totalDiscounts,
      });
    }

    return result;
  } catch (error) {
    console.error("❌ [CHECKOUT PRICING] Error calculating pricing:", error);
    return {
      success: false,
      errors: [
        error instanceof Error ? error.message : "Failed to calculate pricing",
      ],
    };
  }
}

// ========================================
// 📊 USAGE TRACKING (After Order Creation)
// ========================================

/**
 * Record all promotions and coupons used in an order
 * Call this AFTER the order is successfully created
 */
export async function recordOrderPricingUsage(
  orderId: string,
  userId: string | null,
  pricingBreakdown: PricingBreakdown
): Promise<void> {
  try {
    console.log("📊 [CHECKOUT PRICING] Recording pricing usage:", {
      orderId,
      userId,
      promotionsCount: pricingBreakdown.appliedPromotions.length,
      hasCoupon: !!pricingBreakdown.appliedCoupon,
    });

    // Record promotion usage
    for (const promotion of pricingBreakdown.appliedPromotions) {
      await recordPromotionUsage(
        promotion.promotionId,
        orderId,
        userId,
        promotion.discountAmount
      );
    }

    // Record coupon usage
    if (pricingBreakdown.appliedCoupon) {
      await recordCouponUsage(
        pricingBreakdown.appliedCoupon.couponId,
        orderId,
        userId,
        pricingBreakdown.appliedCoupon.discountAmount
      );
    }

    console.log("✅ [CHECKOUT PRICING] Usage recorded successfully");
  } catch (error) {
    console.error("❌ [CHECKOUT PRICING] Error recording usage:", error);
    // Don't throw error - this is tracking only
  }
}

// ========================================
// 🔄 UPDATE ORDER WITH PRICING BREAKDOWN
// ========================================

/**
 * Update order in database with detailed pricing breakdown
 * Call this when creating an order to store discount details
 */
export async function updateOrderWithPricingBreakdown(
  orderId: string,
  pricingBreakdown: PricingBreakdown
): Promise<void> {
  try {
    console.log("🔄 [CHECKOUT PRICING] Updating order with pricing breakdown:", {
      orderId,
    });

    await prisma.order.update({
      where: { id: orderId },
      data: {
        // Update discount breakdown fields
        productDiscounts: pricingBreakdown.productDiscounts,
        promotionDiscounts: pricingBreakdown.promotionDiscounts,
        couponDiscounts: pricingBreakdown.couponDiscounts,
        autoDiscounts: pricingBreakdown.autoDiscounts,
        appliedCouponCode: pricingBreakdown.appliedCoupon?.couponCode || null,
        discountDetails: pricingBreakdown.discountDetails as any,

        // Update totals
        discountAmount: pricingBreakdown.totalDiscounts,
        subtotal: pricingBreakdown.subtotal,
        taxAmount: pricingBreakdown.taxAmount,
        shippingCost: pricingBreakdown.shippingCost,
        total: pricingBreakdown.total,
      },
    });

    console.log("✅ [CHECKOUT PRICING] Order updated with pricing breakdown");
  } catch (error) {
    console.error("❌ [CHECKOUT PRICING] Error updating order:", error);
    throw error;
  }
}

// ========================================
// 🔍 COUPON VALIDATION (Public API)
// ========================================

/**
 * Validate a coupon code for the current cart
 * Used in checkout UI to show instant validation
 */
export async function validateCouponForCheckout(
  couponCode: string,
  cart: any,
  channel: SalesChannel = SalesChannel.ONLINE,
  userId?: string | null
): Promise<{
  isValid: boolean;
  coupon?: any;
  reason?: string;
  estimatedDiscount?: number;
}> {
  try {
    // Calculate cart subtotal
    const subtotal = cart.items.reduce(
      (sum: number, item: any) => sum + Number(item.unitPrice) * item.quantity,
      0
    );

    // Check if first order
    let isFirstOrderFlag = false;
    if (userId) {
      isFirstOrderFlag = await isFirstOrder(userId);
    }

    // Validate coupon
    const validation = await validateCoupon(
      couponCode,
      userId,
      subtotal,
      channel,
      isFirstOrderFlag
    );

    if (!validation.isValid || !validation.coupon) {
      return {
        isValid: false,
        reason: validation.reason,
      };
    }

    // Estimate discount amount
    let estimatedDiscount = 0;
    if (validation.coupon.discountType === "PERCENTAGE") {
      estimatedDiscount = (subtotal * validation.coupon.discountValue) / 100;

      // Apply max discount cap
      if (
        validation.coupon.maxDiscountAmount &&
        estimatedDiscount > validation.coupon.maxDiscountAmount
      ) {
        estimatedDiscount = validation.coupon.maxDiscountAmount;
      }
    } else {
      estimatedDiscount = Math.min(validation.coupon.discountValue, subtotal);
    }

    return {
      isValid: true,
      coupon: validation.coupon,
      estimatedDiscount,
    };
  } catch (error) {
    console.error("❌ [CHECKOUT PRICING] Error validating coupon:", error);
    return {
      isValid: false,
      reason: "Error validating coupon",
    };
  }
}

// ========================================
// 📋 PRICING SUMMARY (For Display)
// ========================================

/**
 * Get a human-readable pricing summary for display
 */
export function getPricingSummary(breakdown: PricingBreakdown): {
  items: Array<{ label: string; amount: number }>;
  total: number;
} {
  const items: Array<{ label: string; amount: number }> = [];

  // Subtotal
  items.push({
    label: "Subtotal",
    amount: breakdown.originalSubtotal,
  });

  // Product discounts
  if (breakdown.productDiscounts > 0) {
    items.push({
      label: "Product Discounts (Sales & Volume)",
      amount: -breakdown.productDiscounts,
    });
  }

  // Promotion discounts
  if (breakdown.promotionDiscounts > 0) {
    breakdown.appliedPromotions.forEach((promo) => {
      items.push({
        label: `Promotion: ${promo.promotionName}`,
        amount: -promo.discountAmount,
      });
    });
  }

  // Coupon discount
  if (breakdown.couponDiscounts > 0 && breakdown.appliedCoupon) {
    items.push({
      label: `Coupon: ${breakdown.appliedCoupon.couponCode}`,
      amount: -breakdown.couponDiscounts,
    });
  }

  // Shipping
  if (breakdown.shippingDiscount > 0) {
    items.push({
      label: "Shipping (Free Shipping Applied!)",
      amount: 0,
    });
  } else if (breakdown.shippingCost > 0) {
    items.push({
      label: "Shipping",
      amount: breakdown.shippingCost,
    });
  }

  // Tax
  items.push({
    label: "Tax",
    amount: breakdown.taxAmount,
  });

  return {
    items,
    total: breakdown.total,
  };
}
