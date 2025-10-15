/**
 * 💰 PRICING SYSTEM - PUBLIC API
 * ===============================
 *
 * Main export file for the pricing system
 * Import from here to use pricing services in your code
 *
 * Usage:
 *   import { calculateCheckoutPricing, validateCouponForCheckout } from '@/features/storefront/pricing';
 *
 * Created: 2025-01-17 - E-Commerce Complete Foundation
 */

// ========================================
// 🎯 MAIN SERVICES
// ========================================

export { PricingEngine, pricingEngine } from "./services/PricingEngine";
export {
  calculateCheckoutPricing,
  validateCouponForCheckout,
  recordOrderPricingUsage,
  updateOrderWithPricingBreakdown,
  getPricingSummary,
  convertCartToPricingInput,
} from "./services/checkout-pricing.service";

// ========================================
// 🔍 VALIDATION UTILITIES
// ========================================

export {
  validatePromotion,
  validateCoupon,
  getActivePromotions,
  isFirstOrder,
  recordPromotionUsage,
  recordCouponUsage,
  getUserPromotionUsageCount,
  getUserCouponUsageCount,
} from "./utils/validation";

// ========================================
// 📊 TYPES
// ========================================

export type {
  // Enums
  ProductVisibility,
  SalesChannel,
  PromotionType,
  CouponType,
  DiscountType,
  AppliesTo,

  // Product Pricing
  VolumePricingTier,
  ProductPricing,

  // Promotions
  Promotion,
  PromotionResult,

  // Coupons
  Coupon,
  CouponResult,

  // Cart & Calculation
  CartItem,
  PricingContext,
  PricingCalculationInput,

  // Results
  PricingBreakdown,
  DiscountDetails,
  PricingResult,

  // Validation
  ValidationResult,
  PromotionValidationResult,
  CouponValidationResult,

  // Usage Tracking
  PromotionUsageData,
  CouponUsageData,

  // Config
  PricingEngineConfig,
} from "./types/pricing.types";

// ========================================
// 🎯 QUICK START GUIDE
// ========================================

/**
 * QUICK START: How to use the pricing system
 *
 * 1. Calculate pricing during checkout:
 *
 *    import { calculateCheckoutPricing } from '@/features/storefront/pricing';
 *
 *    const result = await calculateCheckoutPricing(cart, {
 *      channel: SalesChannel.ONLINE,
 *      userId: user?.id,
 *      couponCode: 'BIENVENIDO25',
 *      shippingCost: 150,
 *    });
 *
 *    if (result.success && result.breakdown) {
 *      console.log('Total:', result.breakdown.total);
 *      console.log('Discounts:', result.breakdown.totalDiscounts);
 *    }
 *
 *
 * 2. Validate a coupon before applying:
 *
 *    import { validateCouponForCheckout } from '@/features/storefront/pricing';
 *
 *    const validation = await validateCouponForCheckout(
 *      'VERANO2025',
 *      cart,
 *      SalesChannel.ONLINE,
 *      userId
 *    );
 *
 *    if (validation.isValid) {
 *      console.log('Estimated discount:', validation.estimatedDiscount);
 *    } else {
 *      console.log('Error:', validation.reason);
 *    }
 *
 *
 * 3. Record usage after order creation:
 *
 *    import {
 *      recordOrderPricingUsage,
 *      updateOrderWithPricingBreakdown
 *    } from '@/features/storefront/pricing';
 *
 *    // After creating order
 *    await updateOrderWithPricingBreakdown(orderId, pricingBreakdown);
 *    await recordOrderPricingUsage(orderId, userId, pricingBreakdown);
 *
 *
 * 4. Get active promotions:
 *
 *    import { getActivePromotions } from '@/features/storefront/pricing';
 *
 *    const promotions = await getActivePromotions(SalesChannel.ONLINE);
 *    console.log('Active promotions:', promotions.length);
 *
 *
 * 5. Check if user's first order (for first-order coupons):
 *
 *    import { isFirstOrder } from '@/features/storefront/pricing';
 *
 *    const firstOrder = await isFirstOrder(userId);
 *    if (firstOrder) {
 *      console.log('User is eligible for first-order coupon!');
 *    }
 */
