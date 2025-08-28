/**
 * 🎁 DISCOUNT CALCULATION SERVICE
 * ==============================
 *
 * Calculate discounts and promotional codes for orders.
 * Following project patterns for business logic separation.
 *
 * @version 1.0.0 - Discount calculation implementation
 */

import type { CartWithItems } from "@/features/cart/types";
import type { DiscountBreakdown } from "../types";

// 🎯 DISCOUNT TYPES & CONFIGURATIONS
// ==================================

interface DiscountRule {
  id: string;
  code: string;
  name: string;
  type: 'percentage' | 'fixed' | 'free_shipping';
  value: number;
  minAmount?: number;
  maxDiscount?: number;
  active: boolean;
  expiresAt?: Date;
  usageLimit?: number;
  usedCount?: number;
}

/**
 * Demo discount codes for MVP
 * In production, these would come from database
 */
const DEMO_DISCOUNT_CODES: DiscountRule[] = [
  {
    id: 'welcome10',
    code: 'WELCOME10',
    name: '10% Off Welcome',
    type: 'percentage',
    value: 0.10,
    minAmount: 50,
    maxDiscount: 20,
    active: true,
  },
  {
    id: 'save20',
    code: 'SAVE20',
    name: '$20 Off',
    type: 'fixed',
    value: 20,
    minAmount: 100,
    active: true,
  },
  {
    id: 'freeship',
    code: 'FREESHIP',
    name: 'Free Shipping',
    type: 'free_shipping',
    value: 0,
    minAmount: 25,
    active: true,
  },
  {
    id: 'student15',
    code: 'STUDENT15',
    name: '15% Student Discount',
    type: 'percentage',
    value: 0.15,
    minAmount: 30,
    maxDiscount: 50,
    active: true,
  },
];

// 🧮 DISCOUNT CALCULATION FUNCTIONS
// =================================

/**
 * Validate discount code
 */
export function validateDiscountCode(code: string): DiscountRule | null {
  console.log("🎁 [DISCOUNT CALCULATOR] Validating discount code:", { code });

  const discountRule = DEMO_DISCOUNT_CODES.find(
    rule => rule.code.toUpperCase() === code.toUpperCase() && rule.active
  );

  if (!discountRule) {
    console.log("❌ [DISCOUNT CALCULATOR] Invalid or inactive discount code");
    return null;
  }

  // Check expiration
  if (discountRule.expiresAt && discountRule.expiresAt < new Date()) {
    console.log("❌ [DISCOUNT CALCULATOR] Discount code expired");
    return null;
  }

  // Check usage limit
  if (discountRule.usageLimit && discountRule.usedCount && discountRule.usedCount >= discountRule.usageLimit) {
    console.log("❌ [DISCOUNT CALCULATOR] Discount code usage limit reached");
    return null;
  }

  console.log("✅ [DISCOUNT CALCULATOR] Discount code validated:", {
    code: discountRule.code,
    name: discountRule.name,
    type: discountRule.type,
    value: discountRule.value,
  });

  return discountRule;
}

/**
 * Calculate discount amount for a cart
 */
export async function calculateDiscountAmount(
  cart: CartWithItems, 
  discountCodes?: string[]
): Promise<number> {
  console.log("🎁 [DISCOUNT CALCULATOR] Calculating discount:", {
    cartSubtotal: cart.subtotal,
    discountCodes: discountCodes || [],
  });

  if (!discountCodes || discountCodes.length === 0) {
    return 0;
  }

  let totalDiscount = 0;
  const subtotal = cart.subtotal || 0;

  for (const code of discountCodes) {
    const discountRule = validateDiscountCode(code);
    
    if (!discountRule) {
      continue; // Skip invalid codes
    }

    // Check minimum amount requirement
    if (discountRule.minAmount && subtotal < discountRule.minAmount) {
      console.log("⚠️ [DISCOUNT CALCULATOR] Minimum amount not met:", {
        code: discountRule.code,
        minAmount: discountRule.minAmount,
        cartSubtotal: subtotal,
      });
      continue;
    }

    // Calculate discount based on type
    let discountAmount = 0;

    switch (discountRule.type) {
      case 'percentage':
        discountAmount = subtotal * discountRule.value;
        if (discountRule.maxDiscount) {
          discountAmount = Math.min(discountAmount, discountRule.maxDiscount);
        }
        break;

      case 'fixed':
        discountAmount = Math.min(discountRule.value, subtotal);
        break;

      case 'free_shipping':
        // Free shipping is handled separately in shipping calculation
        discountAmount = 0;
        break;

      default:
        console.warn("❌ [DISCOUNT CALCULATOR] Unknown discount type:", discountRule.type);
        continue;
    }

    totalDiscount += discountAmount;

    console.log("✅ [DISCOUNT CALCULATOR] Discount applied:", {
      code: discountRule.code,
      type: discountRule.type,
      discountAmount,
      runningTotal: totalDiscount,
    });
  }

  // Ensure discount doesn't exceed cart subtotal
  totalDiscount = Math.min(totalDiscount, subtotal);

  console.log("🎁 [DISCOUNT CALCULATOR] Total discount calculated:", {
    totalDiscount,
    originalSubtotal: subtotal,
    finalSubtotal: subtotal - totalDiscount,
  });

  return totalDiscount;
}

/**
 * Get discount breakdown for display
 */
export async function getDiscountBreakdown(
  cart: CartWithItems, 
  discountCodes?: string[]
): Promise<DiscountBreakdown[]> {
  if (!discountCodes || discountCodes.length === 0) {
    return [];
  }

  const breakdown: DiscountBreakdown[] = [];
  const subtotal = cart.subtotal || 0;

  for (const code of discountCodes) {
    const discountRule = validateDiscountCode(code);
    
    if (!discountRule) {
      continue;
    }

    if (discountRule.minAmount && subtotal < discountRule.minAmount) {
      continue;
    }

    let discountAmount = 0;

    switch (discountRule.type) {
      case 'percentage':
        discountAmount = subtotal * discountRule.value;
        if (discountRule.maxDiscount) {
          discountAmount = Math.min(discountAmount, discountRule.maxDiscount);
        }
        break;

      case 'fixed':
        discountAmount = Math.min(discountRule.value, subtotal);
        break;

      case 'free_shipping':
        discountAmount = 0; // Handled in shipping
        break;
    }

    if (discountAmount > 0) {
      breakdown.push({
        code: discountRule.code,
        name: discountRule.name,
        type: discountRule.type,
        value: discountRule.value,
        amount: discountAmount,
      });
    }
  }

  return breakdown;
}

/**
 * Check if cart qualifies for free shipping discount
 */
export function checkFreeShippingDiscount(discountCodes?: string[]): boolean {
  if (!discountCodes || discountCodes.length === 0) {
    return false;
  }

  return discountCodes.some(code => {
    const rule = validateDiscountCode(code);
    return rule?.type === 'free_shipping';
  });
}
