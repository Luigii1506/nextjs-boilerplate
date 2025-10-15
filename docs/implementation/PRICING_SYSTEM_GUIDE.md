# 💰 Pricing System - Complete Implementation Guide

**Status**: ✅ Implemented (DAY 2 Complete)
**Date**: 2025-01-17
**Version**: 1.0.0

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Database Schema](#database-schema)
4. [Core Services](#core-services)
5. [Usage Examples](#usage-examples)
6. [Integration with Checkout](#integration-with-checkout)
7. [Testing](#testing)
8. [API Reference](#api-reference)

---

## Overview

The Pricing System is a multi-layer discount calculation engine that handles:

- **Product-level discounts** (sale prices, volume pricing)
- **Cart-level promotions** (BOGO, 2x1, 3x2, percentage, fixed amount)
- **Coupon codes** (user-entered discount codes)
- **Auto-discounts** (first order, loyalty - future)

### Key Features

✅ Multi-layer discount calculation
✅ Automatic promotion detection and application
✅ Coupon validation and usage tracking
✅ Volume pricing support
✅ Time-based promotions
✅ Channel-specific pricing (ONLINE, POS)
✅ Usage limits (per user, total)
✅ Detailed discount breakdown
✅ Free shipping promotions

---

## Architecture

### High-Level Flow

```
Cart Items
    ↓
PricingEngine
    ↓
1. Calculate product-level pricing (sale prices, volume)
2. Apply cart-level promotions (BOGO, 2x1, etc)
3. Apply coupon code (if valid)
4. Calculate shipping (with free shipping check)
5. Calculate tax
    ↓
PricingBreakdown (complete price details)
```

### Components

```
src/features/storefront/pricing/
├── services/
│   ├── PricingEngine.ts              # Core pricing calculation logic
│   └── checkout-pricing.service.ts   # Integration with checkout
├── utils/
│   └── validation.ts                 # Promotion/coupon validation
├── types/
│   └── pricing.types.ts              # TypeScript definitions
└── index.ts                          # Public API exports
```

---

## Database Schema

### New Models

#### **Promotion** - Cart-level automatic discounts

```prisma
model Promotion {
  id          String        @id @default(cuid())
  name        String
  description String?
  type        PromotionType // PERCENTAGE, FIXED_AMOUNT, BOGO, BUY_X_GET_Y, FREE_SHIPPING, BUNDLE

  // Discount Configuration
  discountType  DiscountType // PERCENTAGE or FIXED_AMOUNT
  discountValue Decimal

  // Targeting
  appliesTo         AppliesTo  // ALL_PRODUCTS, SPECIFIC_PRODUCTS, SPECIFIC_CATEGORIES, ENTIRE_ORDER
  targetProductIds  String[]
  targetCategoryIds String[]

  // BOGO/BuyXGetY Configuration
  promoConfig Json? // {buy: 2, get: 1, discountPercent: 100}

  // Conditions
  minPurchaseAmount Decimal?
  minQuantity       Int?
  maxUsesTotal      Int?
  maxUsesPerUser    Int?

  // Channel & Visibility
  availableChannels SalesChannel[] // [ONLINE, POS]
  isActive          Boolean
  isPriority        Boolean

  // Time Period
  startAt   DateTime?
  endAt     DateTime?

  // Usage Tracking
  usageCount    Int
  totalDiscount Decimal

  // Relations
  usageHistory PromotionUsage[]
}
```

#### **Coupon** - User-entered discount codes

```prisma
model Coupon {
  id          String     @id @default(cuid())
  code        String     @unique // "BIENVENIDO25"
  name        String
  description String?
  type        CouponType // PERCENTAGE, FIXED_AMOUNT, FREE_SHIPPING, FIRST_ORDER

  // Discount Configuration
  discountType  DiscountType
  discountValue Decimal

  // Targeting
  appliesTo         AppliesTo
  targetProductIds  String[]
  targetCategoryIds String[]

  // Conditions
  minPurchaseAmount Decimal?
  maxDiscountAmount Decimal? // Cap for percentage discounts
  maxUsesTotal      Int?
  maxUsesPerUser    Int

  // Channel & Visibility
  availableChannels SalesChannel[]
  isActive          Boolean

  // Time Period
  startAt   DateTime?
  endAt     DateTime?

  // Usage Tracking
  usageCount    Int
  totalDiscount Decimal

  // Relations
  usageHistory CouponUsage[]
}
```

### Updated Models

#### **Product** - Enhanced with pricing fields

```prisma
model Product {
  // ... existing fields ...

  // Lifecycle
  visibility        ProductVisibility // HIDDEN, PUBLIC, INTERNAL, COMING_SOON, DISCONTINUED
  availableChannels SalesChannel[]    // [ONLINE, POS]

  // Advanced Pricing
  salePrice       Decimal?   // Temporary sale price
  saleStartAt     DateTime?
  saleEndAt       DateTime?
  volumePricing   Json?      // [{min: 10, price: 9.99}, ...]
  channelConfig   Json?      // Channel-specific configs
}
```

#### **Order** - Enhanced with discount breakdown

```prisma
model Order {
  // ... existing fields ...

  // Discount Breakdown
  productDiscounts   Decimal  // Product-level discounts
  promotionDiscounts Decimal  // Cart-level promotions
  couponDiscounts    Decimal  // Coupon codes
  autoDiscounts      Decimal  // Auto-applied discounts
  appliedCouponCode  String?  // Coupon code used
  discountDetails    Json?    // Full breakdown
}
```

---

## Core Services

### 1. PricingEngine

**File**: `src/features/storefront/pricing/services/PricingEngine.ts`

Main pricing calculation engine. Processes cart items through multiple discount layers.

**Methods**:

```typescript
async calculatePricing(
  input: PricingCalculationInput,
  activePromotions: Promotion[],
  coupon?: Coupon
): Promise<PricingResult>
```

**Example**:

```typescript
import { PricingEngine } from '@/features/storefront/pricing';

const engine = new PricingEngine({
  taxRate: 0.16, // 16% IVA
  maxDiscountPercentage: 90,
  allowStackingPromotions: true,
});

const result = await engine.calculatePricing(input, promotions, coupon);

if (result.success && result.breakdown) {
  console.log('Total:', result.breakdown.total);
  console.log('Discounts:', result.breakdown.totalDiscounts);
}
```

### 2. Checkout Pricing Service

**File**: `src/features/storefront/pricing/services/checkout-pricing.service.ts`

Integration layer between PricingEngine and Checkout.

**Main Functions**:

#### `calculateCheckoutPricing()`

Calculate complete pricing for checkout.

```typescript
import { calculateCheckoutPricing, SalesChannel } from '@/features/storefront/pricing';

const result = await calculateCheckoutPricing(cart, {
  channel: SalesChannel.ONLINE,
  userId: user?.id,
  couponCode: 'BIENVENIDO25',
  shippingCost: 150,
  shippingAddress: address,
});

if (result.success && result.breakdown) {
  // Use breakdown in UI
  displayPricing(result.breakdown);
}
```

#### `validateCouponForCheckout()`

Validate a coupon code instantly.

```typescript
import { validateCouponForCheckout } from '@/features/storefront/pricing';

const validation = await validateCouponForCheckout(
  'VERANO2025',
  cart,
  SalesChannel.ONLINE,
  userId
);

if (validation.isValid) {
  console.log('Coupon valid! Estimated discount:', validation.estimatedDiscount);
} else {
  console.log('Invalid:', validation.reason);
}
```

#### `recordOrderPricingUsage()`

Record promotion/coupon usage after order creation.

```typescript
import { recordOrderPricingUsage } from '@/features/storefront/pricing';

// After creating order
await recordOrderPricingUsage(orderId, userId, pricingBreakdown);
```

### 3. Validation Utilities

**File**: `src/features/storefront/pricing/utils/validation.ts`

**Functions**:

- `validatePromotion()` - Check if promotion can be applied
- `validateCoupon()` - Check if coupon code is valid
- `getActivePromotions()` - Get all active promotions for a channel
- `isFirstOrder()` - Check if user's first order
- `recordPromotionUsage()` - Record promotion usage
- `recordCouponUsage()` - Record coupon usage

---

## Usage Examples

### Example 1: Calculate Cart Pricing

```typescript
import { calculateCheckoutPricing, SalesChannel } from '@/features/storefront/pricing';
import { getCartService } from '@/features/storefront/cart/server/service';

export async function calculateCartPricing(userId: string, couponCode?: string) {
  // 1. Get cart
  const cart = await getCartService({ userId });

  if (!cart || !cart.items.length) {
    return { error: 'Cart is empty' };
  }

  // 2. Calculate pricing
  const result = await calculateCheckoutPricing(cart, {
    channel: SalesChannel.ONLINE,
    userId,
    couponCode,
    shippingCost: 150, // $150 shipping
  });

  if (!result.success) {
    return { error: result.errors?.[0] || 'Pricing calculation failed' };
  }

  // 3. Return breakdown
  return {
    subtotal: result.breakdown.subtotal,
    originalSubtotal: result.breakdown.originalSubtotal,
    discounts: {
      product: result.breakdown.productDiscounts,
      promotion: result.breakdown.promotionDiscounts,
      coupon: result.breakdown.couponDiscounts,
      total: result.breakdown.totalDiscounts,
    },
    shipping: result.breakdown.shippingCost,
    tax: result.breakdown.taxAmount,
    total: result.breakdown.total,
    appliedPromotions: result.breakdown.appliedPromotions.map(p => ({
      name: p.promotionName,
      discount: p.discountAmount,
    })),
    appliedCoupon: result.breakdown.appliedCoupon ? {
      code: result.breakdown.appliedCoupon.couponCode,
      discount: result.breakdown.appliedCoupon.discountAmount,
    } : null,
  };
}
```

### Example 2: Apply Coupon in Checkout UI

```typescript
'use server';

import { validateCouponForCheckout, SalesChannel } from '@/features/storefront/pricing';
import { getCartService } from '@/features/storefront/cart/server/service';

export async function applyCouponAction(couponCode: string, userId?: string) {
  try {
    // 1. Get cart
    const cart = await getCartService({ userId });

    if (!cart) {
      return { success: false, error: 'Cart not found' };
    }

    // 2. Validate coupon
    const validation = await validateCouponForCheckout(
      couponCode,
      cart,
      SalesChannel.ONLINE,
      userId
    );

    if (!validation.isValid) {
      return {
        success: false,
        error: validation.reason || 'Invalid coupon code',
      };
    }

    // 3. Return success with estimated discount
    return {
      success: true,
      coupon: {
        code: couponCode,
        name: validation.coupon.name,
        description: validation.coupon.description,
        estimatedDiscount: validation.estimatedDiscount,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to apply coupon',
    };
  }
}
```

### Example 3: Create Order with Pricing

```typescript
import {
  calculateCheckoutPricing,
  recordOrderPricingUsage,
  updateOrderWithPricingBreakdown,
} from '@/features/storefront/pricing';

export async function createOrderWithPricing(orderData: CreateOrderInput) {
  // 1. Get cart
  const cart = await getCartService({ userId: orderData.userId });

  // 2. Calculate final pricing
  const pricingResult = await calculateCheckoutPricing(cart, {
    channel: SalesChannel.ONLINE,
    userId: orderData.userId,
    couponCode: orderData.couponCode,
    shippingCost: orderData.shippingCost,
  });

  if (!pricingResult.success || !pricingResult.breakdown) {
    throw new Error('Failed to calculate pricing');
  }

  const breakdown = pricingResult.breakdown;

  // 3. Create order with pricing breakdown
  const order = await createOrderInDatabase({
    ...orderData,
    subtotal: breakdown.subtotal,
    productDiscounts: breakdown.productDiscounts,
    promotionDiscounts: breakdown.promotionDiscounts,
    couponDiscounts: breakdown.couponDiscounts,
    discountAmount: breakdown.totalDiscounts,
    taxAmount: breakdown.taxAmount,
    shippingCost: breakdown.shippingCost,
    total: breakdown.total,
    appliedCouponCode: breakdown.appliedCoupon?.couponCode,
    discountDetails: breakdown.discountDetails,
  });

  // 4. Record usage for analytics
  await recordOrderPricingUsage(order.id, orderData.userId, breakdown);

  // 5. Return order
  return order;
}
```

---

## Integration with Checkout

### Step 1: Calculate Pricing During Checkout

In your checkout service, replace the old pricing calculation with:

```typescript
// OLD:
const calculation = calculateOrderTotals(cart, shippingCost, taxRate, 0);

// NEW:
const pricingResult = await calculateCheckoutPricing(cart, {
  channel: SalesChannel.ONLINE,
  userId,
  couponCode,
  shippingCost,
});

const breakdown = pricingResult.breakdown!;
```

### Step 2: Update Order Creation

```typescript
// When creating order, use breakdown values
const order = await createOrderQuery({
  // ... other fields ...
  subtotal: breakdown.subtotal,
  productDiscounts: breakdown.productDiscounts,
  promotionDiscounts: breakdown.promotionDiscounts,
  couponDiscounts: breakdown.couponDiscounts,
  autoDiscounts: breakdown.autoDiscounts,
  discountAmount: breakdown.totalDiscounts,
  taxAmount: breakdown.taxAmount,
  shippingCost: breakdown.shippingCost,
  total: breakdown.total,
  appliedCouponCode: breakdown.appliedCoupon?.couponCode,
  discountDetails: breakdown.discountDetails,
});
```

### Step 3: Record Usage

```typescript
// After successful order creation
await recordOrderPricingUsage(order.id, userId, breakdown);
```

---

## Testing

### Test Data

The seed script (`seed-ecommerce-complete.ts`) creates:

- **6 Promotions**: 2x1, 3x2, 20% off, Free Shipping, Fixed $100, Bundle 15%
- **7 Coupons**: BIENVENIDO25, VERANO2025, AMOR15, ENVIOGRATIS, CUMPLE20, ESTUDIANTE10, VIP50
- **Product updates**: Sale prices, volume pricing, channels, visibility

### Test Cases

#### Test 1: Apply Product-Level Discount

```typescript
// Product with sale price
const cart = {
  items: [
    {
      product: {
        price: 100,
        salePrice: 85, // 15% off
        saleStartAt: new Date('2025-01-01'),
        saleEndAt: new Date('2025-12-31'),
      },
      quantity: 1,
    },
  ],
};

const result = await calculateCheckoutPricing(cart, {});
// Expected: productDiscounts = $15
```

#### Test 2: Apply BOGO Promotion

```typescript
// 2x1 promotion active
const cart = {
  items: [
    {
      product: { price: 50, categoryId: 'electronics-category' },
      quantity: 2,
    },
  ],
};

const result = await calculateCheckoutPricing(cart, {});
// Expected: promotionDiscounts = $50 (one item free)
```

#### Test 3: Apply Coupon

```typescript
const cart = {
  items: [{ product: { price: 100 }, quantity: 2 }],
};

const result = await calculateCheckoutPricing(cart, {
  couponCode: 'BIENVENIDO25', // 25% off
});

// Expected: couponDiscounts = $50 (25% of $200)
```

#### Test 4: Stack Multiple Discounts

```typescript
const cart = {
  items: [
    {
      product: {
        price: 100,
        salePrice: 90, // 10% product discount
        categoryId: 'home-category',
      },
      quantity: 2,
    },
  ],
};

const result = await calculateCheckoutPricing(cart, {
  couponCode: 'AMOR15', // 15% off (if applicable to home category)
});

// Expected:
// - productDiscounts = $20 (2 * $10)
// - promotionDiscounts = 0 or calculated
// - couponDiscounts = calculated from discounted price
```

---

## API Reference

### Types

```typescript
interface PricingBreakdown {
  products: ProductPricing[];
  subtotal: number;
  originalSubtotal: number;
  productDiscounts: number;
  appliedPromotions: PromotionResult[];
  promotionDiscounts: number;
  appliedCoupon?: CouponResult;
  couponDiscounts: number;
  autoDiscounts: number;
  shippingCost: number;
  shippingDiscount: number;
  taxAmount: number;
  totalDiscounts: number;
  total: number;
  discountDetails: DiscountDetails;
}
```

### Main Functions

#### `calculateCheckoutPricing()`

```typescript
async function calculateCheckoutPricing(
  cart: Cart,
  options: {
    channel?: SalesChannel;
    userId?: string | null;
    couponCode?: string | null;
    shippingCost?: number;
    shippingAddress?: Address;
  }
): Promise<PricingResult>
```

#### `validateCouponForCheckout()`

```typescript
async function validateCouponForCheckout(
  couponCode: string,
  cart: Cart,
  channel: SalesChannel,
  userId?: string
): Promise<{
  isValid: boolean;
  coupon?: Coupon;
  reason?: string;
  estimatedDiscount?: number;
}>
```

#### `getActivePromotions()`

```typescript
async function getActivePromotions(
  channel: SalesChannel
): Promise<Promotion[]>
```

---

## Summary

✅ **DAY 2 Complete!**

**What was implemented**:

1. ✅ Complete TypeScript types system
2. ✅ PricingEngine core service
3. ✅ Promotion validation utilities
4. ✅ Coupon validation utilities
5. ✅ Checkout integration service
6. ✅ Usage tracking system
7. ✅ Comprehensive documentation

**Next Steps (DAY 3+)**:

- Create Seller Portal UI for managing promotions/coupons
- Add admin analytics dashboard
- Implement auto-discounts (loyalty, first purchase)
- Create customer-facing promotion displays
- Add promotion/coupon testing UI

**Files Created**:

- `pricing/types/pricing.types.ts` - All TypeScript definitions
- `pricing/services/PricingEngine.ts` - Core calculation engine
- `pricing/services/checkout-pricing.service.ts` - Checkout integration
- `pricing/utils/validation.ts` - Validation & usage tracking
- `pricing/index.ts` - Public API exports
- `docs/implementation/PRICING_SYSTEM_GUIDE.md` - This guide

The pricing system is now **production-ready** and can be integrated into the checkout flow!
