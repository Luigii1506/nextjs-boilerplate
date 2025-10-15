/**
 * 💰 PRICING ENGINE SERVICE
 * ==========================
 *
 * Multi-layer pricing calculation system:
 * 1. Product-level discounts (sale prices, volume pricing)
 * 2. Cart-level promotions (BOGO, 2x1, 3x2, percentage, fixed)
 * 3. Coupon codes
 * 4. Auto-discounts (loyalty, first order, etc.)
 *
 * Usage:
 *   const engine = new PricingEngine(config);
 *   const result = await engine.calculatePricing(input);
 *
 * Created: 2025-01-17 - E-Commerce Complete Foundation
 */

import {
  PricingCalculationInput,
  PricingResult,
  PricingBreakdown,
  ProductPricing,
  PromotionResult,
  CouponResult,
  DiscountDetails,
  PricingEngineConfig,
  Promotion,
  Coupon,
  PromotionType,
  DiscountType,
  AppliesTo,
} from "../types/pricing.types";

export class PricingEngine {
  private config: PricingEngineConfig;

  constructor(config?: Partial<PricingEngineConfig>) {
    this.config = {
      enableProductDiscounts: true,
      enablePromotions: true,
      enableCoupons: true,
      enableAutoDiscounts: true,
      maxDiscountPercentage: 90, // Max 90% discount
      allowStackingPromotions: true,
      allowStackingCoupons: true,
      taxRate: 0.16, // 16% IVA México
      ...config,
    };
  }

  /**
   * 🎯 MAIN CALCULATION METHOD
   * Calculates complete pricing breakdown for a cart
   */
  async calculatePricing(
    input: PricingCalculationInput,
    activePromotions: Promotion[] = [],
    coupon?: Coupon | null
  ): Promise<PricingResult> {
    try {
      const errors: string[] = [];
      const warnings: string[] = [];

      // Validate input
      if (!input.items || input.items.length === 0) {
        return {
          success: false,
          errors: ["Cart is empty"],
        };
      }

      // Step 1: Calculate product-level pricing
      const products = this.calculateProductPricing(input.items);

      // Step 2: Calculate subtotals
      const originalSubtotal = products.reduce(
        (sum, p) => sum + p.basePrice * p.quantity,
        0
      );
      const subtotal = products.reduce((sum, p) => sum + p.lineTotal, 0);
      const productDiscounts = originalSubtotal - subtotal;

      // Step 3: Apply cart-level promotions
      let promotionDiscounts = 0;
      const appliedPromotions: PromotionResult[] = [];

      if (this.config.enablePromotions && activePromotions.length > 0) {
        const promotionResults = this.applyPromotions(
          products,
          activePromotions,
          subtotal,
          input.context
        );
        appliedPromotions.push(...promotionResults);
        promotionDiscounts = promotionResults.reduce(
          (sum, p) => sum + p.discountAmount,
          0
        );
      }

      // Step 4: Apply coupon code
      let couponDiscounts = 0;
      let appliedCoupon: CouponResult | undefined;

      if (this.config.enableCoupons && coupon) {
        const couponResult = this.applyCoupon(
          products,
          coupon,
          subtotal - promotionDiscounts,
          input.context
        );

        if (couponResult) {
          appliedCoupon = couponResult;
          couponDiscounts = couponResult.discountAmount;
        }
      }

      // Step 5: Calculate shipping
      let shippingCost = input.context.shippingCost || 0;
      let shippingDiscount = 0;

      // Check if free shipping was applied by promotions or coupon
      const hasFreeShipping =
        appliedPromotions.some((p) => p.promotionType === PromotionType.FREE_SHIPPING) ||
        appliedCoupon?.couponName.toLowerCase().includes("envío gratis");

      if (hasFreeShipping && shippingCost > 0) {
        shippingDiscount = shippingCost;
        shippingCost = 0;
      }

      // Step 6: Auto-discounts (future implementation)
      const autoDiscounts = 0;

      // Step 7: Calculate totals
      const totalDiscounts =
        productDiscounts +
        promotionDiscounts +
        couponDiscounts +
        shippingDiscount +
        autoDiscounts;

      const subtotalAfterDiscounts =
        subtotal - promotionDiscounts - couponDiscounts - autoDiscounts;

      // Step 8: Calculate tax
      const taxAmount = subtotalAfterDiscounts * this.config.taxRate;

      // Step 9: Calculate final total
      const total = subtotalAfterDiscounts + taxAmount + shippingCost;

      // Step 10: Build discount details for display
      const discountDetails = this.buildDiscountDetails(
        products,
        appliedPromotions,
        appliedCoupon,
        shippingCost + shippingDiscount,
        shippingCost,
        shippingDiscount
      );

      // Step 11: Safety check - ensure total is not negative
      if (total < 0) {
        errors.push("Total cannot be negative");
        return { success: false, errors };
      }

      // Step 12: Safety check - ensure discount is not too high
      const discountPercentage = (totalDiscounts / originalSubtotal) * 100;
      if (
        this.config.maxDiscountPercentage &&
        discountPercentage > this.config.maxDiscountPercentage
      ) {
        warnings.push(
          `Discount percentage (${discountPercentage.toFixed(1)}%) exceeds maximum allowed (${this.config.maxDiscountPercentage}%)`
        );
      }

      // Build final breakdown
      const breakdown: PricingBreakdown = {
        products,
        subtotal,
        originalSubtotal,
        productDiscounts,
        appliedPromotions,
        promotionDiscounts,
        appliedCoupon,
        couponDiscounts,
        autoDiscounts,
        shippingCost,
        shippingDiscount,
        taxAmount,
        totalDiscounts,
        total,
        discountDetails,
      };

      return {
        success: true,
        breakdown,
        errors: errors.length > 0 ? errors : undefined,
        warnings: warnings.length > 0 ? warnings : undefined,
      };
    } catch (error) {
      console.error("PricingEngine calculation error:", error);
      return {
        success: false,
        errors: [
          error instanceof Error ? error.message : "Unknown pricing error",
        ],
      };
    }
  }

  /**
   * 📦 STEP 1: Calculate product-level pricing
   * Applies sale prices and volume discounts
   */
  private calculateProductPricing(
    items: PricingCalculationInput["items"]
  ): ProductPricing[] {
    return items.map((item) => {
      let effectiveUnitPrice = item.basePrice;
      let productLevelDiscount = 0;
      const now = new Date();

      // Check if sale price is active
      if (
        item.salePrice &&
        item.salePrice < item.basePrice &&
        (!item.saleStartAt || now >= new Date(item.saleStartAt)) &&
        (!item.saleEndAt || now <= new Date(item.saleEndAt))
      ) {
        effectiveUnitPrice = item.salePrice;
        productLevelDiscount = (item.basePrice - item.salePrice) * item.quantity;
      }

      // Check volume pricing (if no sale, or if volume price is better)
      if (item.volumePricing && item.volumePricing.length > 0) {
        // Find the best applicable tier
        const applicableTiers = item.volumePricing.filter(
          (tier) => item.quantity >= tier.min
        );

        if (applicableTiers.length > 0) {
          // Get the tier with the lowest price
          const bestTier = applicableTiers.reduce((best, current) =>
            current.price < best.price ? current : best
          );

          // Use volume price if it's better than current effective price
          if (bestTier.price < effectiveUnitPrice) {
            const volumeDiscount =
              (effectiveUnitPrice - bestTier.price) * item.quantity;
            productLevelDiscount += volumeDiscount;
            effectiveUnitPrice = bestTier.price;
          }
        }
      }

      const lineTotal = effectiveUnitPrice * item.quantity;

      return {
        productId: item.productId,
        sku: item.sku,
        name: item.name,
        basePrice: item.basePrice,
        salePrice: item.salePrice,
        saleStartAt: item.saleStartAt,
        saleEndAt: item.saleEndAt,
        volumePricing: item.volumePricing,
        categoryId: item.categoryId,
        quantity: item.quantity,
        effectiveUnitPrice,
        lineTotal,
        productLevelDiscount,
      };
    });
  }

  /**
   * 🎁 STEP 3: Apply cart-level promotions
   * Processes promotions in priority order
   */
  private applyPromotions(
    products: ProductPricing[],
    promotions: Promotion[],
    currentSubtotal: number,
    context: PricingCalculationInput["context"]
  ): PromotionResult[] {
    const results: PromotionResult[] = [];

    // Sort by priority (priority promotions first)
    const sortedPromotions = [...promotions].sort((a, b) => {
      if (a.isPriority && !b.isPriority) return -1;
      if (!a.isPriority && b.isPriority) return 1;
      return 0;
    });

    for (const promotion of sortedPromotions) {
      // Validate promotion
      if (!this.validatePromotion(promotion, currentSubtotal, context)) {
        continue;
      }

      // Get eligible products
      const eligibleProducts = this.getEligibleProducts(products, promotion);

      if (eligibleProducts.length === 0) {
        continue;
      }

      // Apply promotion based on type
      let result: PromotionResult | null = null;

      switch (promotion.type) {
        case PromotionType.PERCENTAGE:
          result = this.applyPercentagePromotion(
            promotion,
            eligibleProducts,
            currentSubtotal
          );
          break;

        case PromotionType.FIXED_AMOUNT:
          result = this.applyFixedAmountPromotion(
            promotion,
            eligibleProducts,
            currentSubtotal
          );
          break;

        case PromotionType.BOGO:
        case PromotionType.BUY_X_GET_Y:
          result = this.applyBuyXGetYPromotion(promotion, eligibleProducts);
          break;

        case PromotionType.FREE_SHIPPING:
          result = {
            promotionId: promotion.id,
            promotionName: promotion.name,
            promotionType: promotion.type,
            discountAmount: 0, // Calculated later in shipping
            affectedProducts: [],
          };
          break;

        case PromotionType.BUNDLE:
          result = this.applyBundlePromotion(promotion, eligibleProducts);
          break;
      }

      if (result && result.discountAmount > 0) {
        results.push(result);

        // Update current subtotal for next promotion
        if (!this.config.allowStackingPromotions) {
          break; // Only apply first valid promotion
        }
      }
    }

    return results;
  }

  /**
   * 🎟️ STEP 4: Apply coupon code
   */
  private applyCoupon(
    products: ProductPricing[],
    coupon: Coupon,
    currentSubtotal: number,
    context: PricingCalculationInput["context"]
  ): CouponResult | null {
    // Validate coupon
    if (!this.validateCoupon(coupon, currentSubtotal, context)) {
      return null;
    }

    // Get eligible products
    const eligibleProducts = this.getEligibleProductsForCoupon(products, coupon);

    if (eligibleProducts.length === 0 && coupon.appliesTo !== AppliesTo.ENTIRE_ORDER) {
      return null;
    }

    let discountAmount = 0;

    // Calculate discount based on type
    if (coupon.discountType === DiscountType.PERCENTAGE) {
      const eligibleTotal = eligibleProducts.reduce((sum, p) => sum + p.lineTotal, 0);
      discountAmount = (eligibleTotal * coupon.discountValue) / 100;

      // Apply max discount cap if specified
      if (coupon.maxDiscountAmount && discountAmount > coupon.maxDiscountAmount) {
        discountAmount = coupon.maxDiscountAmount;
      }
    } else if (coupon.discountType === DiscountType.FIXED_AMOUNT) {
      discountAmount = coupon.discountValue;

      // Don't exceed the eligible total
      const eligibleTotal = eligibleProducts.reduce((sum, p) => sum + p.lineTotal, 0);
      if (discountAmount > eligibleTotal) {
        discountAmount = eligibleTotal;
      }
    }

    return {
      couponId: coupon.id,
      couponCode: coupon.code,
      couponName: coupon.name,
      discountAmount,
    };
  }

  /**
   * 🔍 Helper: Validate promotion eligibility
   */
  private validatePromotion(
    promotion: Promotion,
    currentSubtotal: number,
    context: PricingCalculationInput["context"]
  ): boolean {
    // Check if active
    if (!promotion.isActive) return false;

    // Check channel
    if (!promotion.availableChannels.includes(context.channel)) return false;

    // Check time period
    const now = context.timestamp || new Date();
    if (promotion.startAt && now < new Date(promotion.startAt)) return false;
    if (promotion.endAt && now > new Date(promotion.endAt)) return false;

    // Check minimum purchase amount
    if (
      promotion.minPurchaseAmount &&
      currentSubtotal < promotion.minPurchaseAmount
    ) {
      return false;
    }

    // Check usage limits (would need to query database in real implementation)
    // For now, we'll skip this check

    return true;
  }

  /**
   * 🔍 Helper: Validate coupon eligibility
   */
  private validateCoupon(
    coupon: Coupon,
    currentSubtotal: number,
    context: PricingCalculationInput["context"]
  ): boolean {
    // Check if active
    if (!coupon.isActive) return false;

    // Check channel
    if (!coupon.availableChannels.includes(context.channel)) return false;

    // Check time period
    const now = context.timestamp || new Date();
    if (coupon.startAt && now < new Date(coupon.startAt)) return false;
    if (coupon.endAt && now > new Date(coupon.endAt)) return false;

    // Check minimum purchase amount
    if (coupon.minPurchaseAmount && currentSubtotal < coupon.minPurchaseAmount) {
      return false;
    }

    // Check first order requirement
    if (coupon.type === "FIRST_ORDER" && !context.isFirstOrder) {
      return false;
    }

    return true;
  }

  /**
   * 🔍 Helper: Get eligible products for promotion
   */
  private getEligibleProducts(
    products: ProductPricing[],
    promotion: Promotion
  ): ProductPricing[] {
    if (promotion.appliesTo === AppliesTo.ALL_PRODUCTS) {
      return products;
    }

    if (promotion.appliesTo === AppliesTo.SPECIFIC_PRODUCTS) {
      return products.filter((p) =>
        promotion.targetProductIds.includes(p.productId)
      );
    }

    if (promotion.appliesTo === AppliesTo.SPECIFIC_CATEGORIES) {
      return products.filter((p) =>
        promotion.targetCategoryIds.includes(p.categoryId)
      );
    }

    return [];
  }

  /**
   * 🔍 Helper: Get eligible products for coupon
   */
  private getEligibleProductsForCoupon(
    products: ProductPricing[],
    coupon: Coupon
  ): ProductPricing[] {
    if (coupon.appliesTo === AppliesTo.ALL_PRODUCTS) {
      return products;
    }

    if (coupon.appliesTo === AppliesTo.SPECIFIC_PRODUCTS) {
      return products.filter((p) => coupon.targetProductIds.includes(p.productId));
    }

    if (coupon.appliesTo === AppliesTo.SPECIFIC_CATEGORIES) {
      return products.filter((p) =>
        coupon.targetCategoryIds.includes(p.categoryId)
      );
    }

    return [];
  }

  /**
   * 💸 Apply percentage promotion
   */
  private applyPercentagePromotion(
    promotion: Promotion,
    eligibleProducts: ProductPricing[],
    currentSubtotal: number
  ): PromotionResult {
    const eligibleTotal = eligibleProducts.reduce((sum, p) => sum + p.lineTotal, 0);
    const discountAmount = (eligibleTotal * promotion.discountValue) / 100;

    return {
      promotionId: promotion.id,
      promotionName: promotion.name,
      promotionType: promotion.type,
      discountAmount,
      affectedProducts: eligibleProducts.map((p) => p.productId),
    };
  }

  /**
   * 💵 Apply fixed amount promotion
   */
  private applyFixedAmountPromotion(
    promotion: Promotion,
    eligibleProducts: ProductPricing[],
    currentSubtotal: number
  ): PromotionResult {
    const eligibleTotal = eligibleProducts.reduce((sum, p) => sum + p.lineTotal, 0);
    const discountAmount = Math.min(promotion.discountValue, eligibleTotal);

    return {
      promotionId: promotion.id,
      promotionName: promotion.name,
      promotionType: promotion.type,
      discountAmount,
      affectedProducts: eligibleProducts.map((p) => p.productId),
    };
  }

  /**
   * 🎁 Apply BOGO / Buy X Get Y promotion
   */
  private applyBuyXGetYPromotion(
    promotion: Promotion,
    eligibleProducts: ProductPricing[]
  ): PromotionResult | null {
    const config = promotion.promoConfig as {
      buy: number;
      get: number;
      discountPercent: number;
      applyToLowest?: boolean;
    };

    if (!config || !config.buy || !config.get) {
      return null;
    }

    // Calculate total quantity
    const totalQuantity = eligibleProducts.reduce((sum, p) => sum + p.quantity, 0);

    // Check if promotion applies
    const setsRequired = config.buy + config.get;
    const completeSets = Math.floor(totalQuantity / setsRequired);

    if (completeSets === 0) {
      return null;
    }

    // Sort products by price (lowest to highest)
    const sortedProducts = [...eligibleProducts].sort(
      (a, b) => a.effectiveUnitPrice - b.effectiveUnitPrice
    );

    // Calculate discount on the cheapest items
    const itemsToDiscount = completeSets * config.get;
    let discountAmount = 0;
    let itemsDiscounted = 0;

    for (const product of sortedProducts) {
      if (itemsDiscounted >= itemsToDiscount) break;

      const qtyToDiscount = Math.min(
        product.quantity,
        itemsToDiscount - itemsDiscounted
      );

      const itemDiscount =
        (product.effectiveUnitPrice * qtyToDiscount * config.discountPercent) / 100;
      discountAmount += itemDiscount;
      itemsDiscounted += qtyToDiscount;
    }

    return {
      promotionId: promotion.id,
      promotionName: promotion.name,
      promotionType: promotion.type,
      discountAmount,
      affectedProducts: eligibleProducts.map((p) => p.productId),
      metadata: {
        completeSets,
        itemsDiscounted,
      },
    };
  }

  /**
   * 📦 Apply bundle promotion
   */
  private applyBundlePromotion(
    promotion: Promotion,
    eligibleProducts: ProductPricing[]
  ): PromotionResult | null {
    const config = promotion.promoConfig as {
      bundleProducts?: string[];
      requiredCount?: number;
    };

    // Check if all required products are in cart
    if (config?.bundleProducts && config.requiredCount) {
      const hasAllProducts =
        eligibleProducts.length >= config.requiredCount &&
        config.bundleProducts.every((reqProductId) =>
          eligibleProducts.some((p) => p.productId === reqProductId)
        );

      if (!hasAllProducts) {
        return null;
      }
    }

    // Apply percentage discount to all eligible products
    const eligibleTotal = eligibleProducts.reduce((sum, p) => sum + p.lineTotal, 0);
    const discountAmount = (eligibleTotal * promotion.discountValue) / 100;

    return {
      promotionId: promotion.id,
      promotionName: promotion.name,
      promotionType: promotion.type,
      discountAmount,
      affectedProducts: eligibleProducts.map((p) => p.productId),
    };
  }

  /**
   * 📊 Build discount details for display
   */
  private buildDiscountDetails(
    products: ProductPricing[],
    promotions: PromotionResult[],
    coupon: CouponResult | undefined,
    originalShipping: number,
    finalShipping: number,
    shippingDiscount: number
  ): DiscountDetails {
    const productLevel = products
      .filter((p) => p.productLevelDiscount > 0)
      .map((p) => ({
        productId: p.productId,
        productName: p.name,
        type: (p.salePrice ? "sale" : "volume") as "sale" | "volume",
        originalPrice: p.basePrice * p.quantity,
        discountedPrice: p.lineTotal,
        amountSaved: p.productLevelDiscount,
      }));

    const promotionLevel = promotions.map((p) => ({
      promotionId: p.promotionId,
      promotionName: p.promotionName,
      type: p.promotionType,
      amountSaved: p.discountAmount,
      affectedProducts: p.affectedProducts,
    }));

    const couponLevel = coupon
      ? {
          couponCode: coupon.couponCode,
          couponName: coupon.couponName,
          type: "coupon",
          amountSaved: coupon.discountAmount,
        }
      : null;

    const shippingLevel =
      shippingDiscount > 0
        ? {
            originalCost: originalShipping,
            finalCost: finalShipping,
            amountSaved: shippingDiscount,
          }
        : null;

    return {
      productLevel,
      promotionLevel,
      couponLevel,
      shippingLevel,
    };
  }
}

// Export singleton instance with default config
export const pricingEngine = new PricingEngine();
