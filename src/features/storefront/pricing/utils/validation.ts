/**
 * 🔍 PRICING VALIDATION UTILITIES
 * ================================
 *
 * Validation functions for promotions and coupons
 * - Check eligibility
 * - Validate usage limits
 * - Check time periods
 * - Validate conditions
 *
 * Created: 2025-01-17 - E-Commerce Complete Foundation
 */

import { PrismaClient } from "@prisma/client";
import {
  Promotion,
  Coupon,
  ValidationResult,
  PromotionValidationResult,
  CouponValidationResult,
  SalesChannel,
} from "../types/pricing.types";

const prisma = new PrismaClient();

// ========================================
// 🎁 PROMOTION VALIDATION
// ========================================

/**
 * Validate if a promotion can be applied
 */
export async function validatePromotion(
  promotionId: string,
  userId: string | null,
  cartSubtotal: number,
  channel: SalesChannel
): Promise<PromotionValidationResult> {
  try {
    // Fetch promotion from database
    const promotion = await prisma.promotion.findUnique({
      where: { id: promotionId },
    });

    if (!promotion) {
      return {
        isValid: false,
        reason: "Promotion not found",
        promotion: null as any,
      };
    }

    // Check if active
    if (!promotion.isActive) {
      return {
        isValid: false,
        reason: "Promotion is not active",
        promotion: promotion as any,
      };
    }

    // Check channel
    if (!promotion.availableChannels.includes(channel)) {
      return {
        isValid: false,
        reason: `Promotion not available for ${channel} channel`,
        promotion: promotion as any,
      };
    }

    // Check time period
    const now = new Date();
    if (promotion.startAt && now < promotion.startAt) {
      return {
        isValid: false,
        reason: "Promotion has not started yet",
        promotion: promotion as any,
        metadata: { startAt: promotion.startAt },
      };
    }

    if (promotion.endAt && now > promotion.endAt) {
      return {
        isValid: false,
        reason: "Promotion has expired",
        promotion: promotion as any,
        metadata: { endAt: promotion.endAt },
      };
    }

    // Check minimum purchase amount
    if (
      promotion.minPurchaseAmount &&
      cartSubtotal < Number(promotion.minPurchaseAmount)
    ) {
      return {
        isValid: false,
        reason: `Minimum purchase amount of $${promotion.minPurchaseAmount} required`,
        promotion: promotion as any,
        metadata: {
          required: Number(promotion.minPurchaseAmount),
          current: cartSubtotal,
        },
      };
    }

    // Check total usage limit
    if (
      promotion.maxUsesTotal &&
      promotion.usageCount >= promotion.maxUsesTotal
    ) {
      return {
        isValid: false,
        reason: "Promotion usage limit reached",
        promotion: promotion as any,
      };
    }

    // Check per-user usage limit (if user is logged in)
    if (userId && promotion.maxUsesPerUser) {
      const userUsageCount = await prisma.promotionUsage.count({
        where: {
          promotionId: promotion.id,
          userId: userId,
        },
      });

      if (userUsageCount >= promotion.maxUsesPerUser) {
        return {
          isValid: false,
          reason: "You have reached the usage limit for this promotion",
          promotion: promotion as any,
          metadata: {
            limit: promotion.maxUsesPerUser,
            used: userUsageCount,
          },
        };
      }
    }

    // All checks passed
    return {
      isValid: true,
      promotion: promotion as any,
    };
  } catch (error) {
    console.error("Promotion validation error:", error);
    return {
      isValid: false,
      reason: "Error validating promotion",
      promotion: null as any,
    };
  }
}

/**
 * Get all active promotions for a channel
 */
export async function getActivePromotions(
  channel: SalesChannel
): Promise<Promotion[]> {
  try {
    const now = new Date();

    const promotions = await prisma.promotion.findMany({
      where: {
        isActive: true,
        availableChannels: {
          has: channel,
        },
        OR: [
          { startAt: null },
          { startAt: { lte: now } },
        ],
        AND: [
          {
            OR: [
              { endAt: null },
              { endAt: { gte: now } },
            ],
          },
        ],
      },
      orderBy: [
        { isPriority: "desc" }, // Priority promotions first
        { createdAt: "asc" },
      ],
    });

    return promotions as any[];
  } catch (error) {
    console.error("Error fetching active promotions:", error);
    return [];
  }
}

// ========================================
// 🎟️ COUPON VALIDATION
// ========================================

/**
 * Validate if a coupon can be applied
 */
export async function validateCoupon(
  couponCode: string,
  userId: string | null,
  cartSubtotal: number,
  channel: SalesChannel,
  isFirstOrder: boolean = false
): Promise<CouponValidationResult> {
  try {
    // Fetch coupon from database
    const coupon = await prisma.coupon.findUnique({
      where: { code: couponCode.toUpperCase() },
    });

    if (!coupon) {
      return {
        isValid: false,
        reason: "Coupon code not found",
      };
    }

    // Check if active
    if (!coupon.isActive) {
      return {
        isValid: false,
        reason: "Coupon is not active",
        coupon: coupon as any,
      };
    }

    // Check channel
    if (!coupon.availableChannels.includes(channel)) {
      return {
        isValid: false,
        reason: `Coupon not available for ${channel} channel`,
        coupon: coupon as any,
      };
    }

    // Check time period
    const now = new Date();
    if (coupon.startAt && now < coupon.startAt) {
      return {
        isValid: false,
        reason: "Coupon is not yet valid",
        coupon: coupon as any,
        metadata: { startAt: coupon.startAt },
      };
    }

    if (coupon.endAt && now > coupon.endAt) {
      return {
        isValid: false,
        reason: "Coupon has expired",
        coupon: coupon as any,
        metadata: { endAt: coupon.endAt },
      };
    }

    // Check minimum purchase amount
    if (
      coupon.minPurchaseAmount &&
      cartSubtotal < Number(coupon.minPurchaseAmount)
    ) {
      return {
        isValid: false,
        reason: `Minimum purchase of $${coupon.minPurchaseAmount} required`,
        coupon: coupon as any,
        metadata: {
          required: Number(coupon.minPurchaseAmount),
          current: cartSubtotal,
        },
      };
    }

    // Check first order requirement
    if (coupon.type === "FIRST_ORDER" && !isFirstOrder) {
      return {
        isValid: false,
        reason: "This coupon is only valid for first orders",
        coupon: coupon as any,
      };
    }

    // Check total usage limit
    if (coupon.maxUsesTotal && coupon.usageCount >= coupon.maxUsesTotal) {
      return {
        isValid: false,
        reason: "Coupon usage limit reached",
        coupon: coupon as any,
      };
    }

    // Check per-user usage limit (if user is logged in)
    if (userId) {
      const userUsageCount = await prisma.couponUsage.count({
        where: {
          couponId: coupon.id,
          userId: userId,
        },
      });

      if (userUsageCount >= coupon.maxUsesPerUser) {
        return {
          isValid: false,
          reason: "You have already used this coupon",
          coupon: coupon as any,
          metadata: {
            limit: coupon.maxUsesPerUser,
            used: userUsageCount,
          },
        };
      }
    }

    // All checks passed
    return {
      isValid: true,
      coupon: coupon as any,
    };
  } catch (error) {
    console.error("Coupon validation error:", error);
    return {
      isValid: false,
      reason: "Error validating coupon",
    };
  }
}

/**
 * Check if user qualifies for first-order coupon
 */
export async function isFirstOrder(userId: string): Promise<boolean> {
  try {
    const orderCount = await prisma.order.count({
      where: {
        userId: userId,
        status: {
          notIn: ["CANCELLED", "REFUNDED"],
        },
      },
    });

    return orderCount === 0;
  } catch (error) {
    console.error("Error checking first order:", error);
    return false;
  }
}

// ========================================
// 📊 USAGE TRACKING
// ========================================

/**
 * Record promotion usage
 */
export async function recordPromotionUsage(
  promotionId: string,
  orderId: string,
  userId: string | null,
  discountAmount: number
) {
  try {
    await prisma.$transaction([
      // Create usage record
      prisma.promotionUsage.create({
        data: {
          promotionId,
          orderId,
          userId,
          discountAmount,
        },
      }),
      // Increment usage count
      prisma.promotion.update({
        where: { id: promotionId },
        data: {
          usageCount: { increment: 1 },
          totalDiscount: { increment: discountAmount },
        },
      }),
    ]);
  } catch (error) {
    console.error("Error recording promotion usage:", error);
  }
}

/**
 * Record coupon usage
 */
export async function recordCouponUsage(
  couponId: string,
  orderId: string,
  userId: string | null,
  discountAmount: number
) {
  try {
    await prisma.$transaction([
      // Create usage record
      prisma.couponUsage.create({
        data: {
          couponId,
          orderId,
          userId,
          discountAmount,
        },
      }),
      // Increment usage count
      prisma.coupon.update({
        where: { id: couponId },
        data: {
          usageCount: { increment: 1 },
          totalDiscount: { increment: discountAmount },
        },
      }),
    ]);
  } catch (error) {
    console.error("Error recording coupon usage:", error);
  }
}

// ========================================
// 🔧 UTILITY FUNCTIONS
// ========================================

/**
 * Get user's promotion usage count
 */
export async function getUserPromotionUsageCount(
  userId: string,
  promotionId: string
): Promise<number> {
  try {
    return await prisma.promotionUsage.count({
      where: {
        userId,
        promotionId,
      },
    });
  } catch (error) {
    console.error("Error getting user promotion usage:", error);
    return 0;
  }
}

/**
 * Get user's coupon usage count
 */
export async function getUserCouponUsageCount(
  userId: string,
  couponId: string
): Promise<number> {
  try {
    return await prisma.couponUsage.count({
      where: {
        userId,
        couponId,
      },
    });
  } catch (error) {
    console.error("Error getting user coupon usage:", error);
    return 0;
  }
}
