/**
 * 🔄 CHECKOUT MAPPERS
 * ===================
 *
 * Transform data between different layers (DB ↔ Business Logic ↔ API)
 */

import type {
  Order,
  OrderItem,
  Address,
  OrderCalculation,
  CheckoutSession,
} from "../types";
import type { CartWithItems, CartItem } from "@/features/cart/types";
import { TAX_RATES, FREE_SHIPPING_THRESHOLD } from "../constants";

// 📦 CART TO ORDER MAPPERS
// ========================

/**
 * Map cart items to order items with price snapshots
 */
export function mapCartToOrderItems(
  cart: CartWithItems,
  orderId: string
): Array<{
  productId: string;
  quantity: number;
  unitPrice: number;
  total: number;
  productSku: string;
  productName: string;
  productImage?: string;
}> {
  console.log("🔄 [CHECKOUT MAPPER] Mapping cart to order items:", {
    cartId: cart.id,
    itemsCount: cart.items.length,
    orderId,
  });

  const orderItems = cart.items.map((cartItem) => {
    const { product, quantity, unitPrice, total } = cartItem;

    if (!product) {
      console.warn("⚠️ [CHECKOUT MAPPER] Cart item missing product:", {
        cartItemId: cartItem.id,
      });
      throw new Error(
        `Cart item ${cartItem.id} is missing product information`
      );
    }

    return {
      productId: product.id,
      quantity,
      unitPrice,
      total,
      productSku: product.sku || `PROD-${product.id.slice(-8)}`,
      productName: product.name,
      productImage: product.images?.[0] || null,
    };
  });

  console.log("✅ [CHECKOUT MAPPER] Cart items mapped to order items:", {
    inputItemsCount: cart.items.length,
    outputItemsCount: orderItems.length,
    totalValue: orderItems.reduce((sum, item) => sum + item.total, 0),
  });

  return orderItems;
}

/**
 * Calculate order totals from cart
 */
export function calculateOrderTotals(
  cart: CartWithItems,
  shippingCost: number = 0,
  taxRate: number = TAX_RATES.DEFAULT,
  discountAmount: number = 0
): OrderCalculation {
  console.log("🧮 [CHECKOUT MAPPER] Calculating order totals:", {
    cartId: cart.id,
    cartSubtotal: cart.subtotal,
    shippingCost,
    taxRate,
    discountAmount,
  });

  const subtotal = cart.subtotal || 0;

  // Apply free shipping threshold
  const finalShippingCost =
    subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : shippingCost;

  // Calculate tax on subtotal (not shipping)
  const taxAmount = Math.round(subtotal * taxRate);

  // Calculate total
  const total = subtotal + finalShippingCost + taxAmount - discountAmount;

  const calculation: OrderCalculation = {
    subtotal,
    shipping: finalShippingCost,
    tax: taxAmount,
    discount: discountAmount,
    total: Math.max(0, total), // Ensure total is never negative

    taxBreakdown: [
      {
        name: "Sales Tax",
        rate: taxRate,
        amount: taxAmount,
      },
    ],

    ...(discountAmount > 0 && {
      discountBreakdown: [
        {
          code: "DISCOUNT",
          name: "Applied Discount",
          type: "fixed" as const,
          value: discountAmount,
          amount: discountAmount,
        },
      ],
    }),
  };

  console.log("✅ [CHECKOUT MAPPER] Order totals calculated:", {
    subtotal: calculation.subtotal,
    shipping: calculation.shipping,
    tax: calculation.tax,
    discount: calculation.discount,
    total: calculation.total,
    freeShippingApplied: shippingCost > finalShippingCost,
  });

  return calculation;
}

// 🗃️ DATABASE TO API MAPPERS
// ===========================

/**
 * Map Prisma order to API order
 */
export function mapPrismaOrderToOrder(prismaOrder: any): Order {
  console.log("🔄 [CHECKOUT MAPPER] Mapping Prisma order to API order:", {
    orderId: prismaOrder.id,
    orderNumber: prismaOrder.number,
  });

  const order: Order = {
    id: prismaOrder.id,
    number: prismaOrder.number,
    customerId: prismaOrder.userId,

    email: prismaOrder.email,
    phone: prismaOrder.phone,

    subtotal: Number(prismaOrder.subtotal),
    taxAmount: Number(prismaOrder.taxAmount),
    shippingCost: Number(prismaOrder.shippingCost),
    discountAmount: Number(prismaOrder.discountAmount),
    total: Number(prismaOrder.total),

    status: prismaOrder.status,
    paymentStatus: prismaOrder.paymentStatus,
    fulfillmentStatus: prismaOrder.fulfillmentStatus,

    placedAt: prismaOrder.placedAt,
    estimatedDelivery: prismaOrder.estimatedDelivery,
    shippedAt: prismaOrder.shippedAt,
    deliveredAt: prismaOrder.deliveredAt,
    cancelledAt: prismaOrder.cancelledAt,

    // Parse JSON addresses if they exist
    shippingAddress: prismaOrder.shippingAddress
      ? JSON.parse(prismaOrder.shippingAddress)
      : undefined,
    billingAddress: prismaOrder.billingAddress
      ? JSON.parse(prismaOrder.billingAddress)
      : undefined,

    trackingNumber: prismaOrder.trackingNumber,
    shippingMethod: prismaOrder.shippingMethod
      ? JSON.parse(prismaOrder.shippingMethod)
      : undefined,
    paymentMethod: prismaOrder.paymentMethod
      ? JSON.parse(prismaOrder.paymentMethod)
      : undefined,
    paymentIntentId: prismaOrder.paymentIntentId,

    customerNotes: prismaOrder.customerNotes,
    adminNotes: prismaOrder.adminNotes,

    items: prismaOrder.items?.map(mapPrismaOrderItemToOrderItem) || [],

    createdAt: prismaOrder.createdAt,
    updatedAt: prismaOrder.updatedAt,
  };

  console.log("✅ [CHECKOUT MAPPER] Prisma order mapped to API order:", {
    orderId: order.id,
    itemsCount: order.items.length,
    total: order.total,
  });

  return order;
}

/**
 * Map Prisma order item to API order item
 */
export function mapPrismaOrderItemToOrderItem(prismaOrderItem: any): OrderItem {
  return {
    id: prismaOrderItem.id,
    orderId: prismaOrderItem.orderId,
    productId: prismaOrderItem.productId,
    quantity: prismaOrderItem.quantity,

    unitPrice: Number(prismaOrderItem.unitPrice),
    total: Number(prismaOrderItem.total),

    productSku: prismaOrderItem.productSku,
    productName: prismaOrderItem.productName,
    productImage: prismaOrderItem.productImage,

    createdAt: prismaOrderItem.createdAt,
  };
}

// 📋 ADDRESS MAPPERS
// ==================

/**
 * Convert Address object to JSON string for database storage
 */
export function serializeAddress(address: Address): string {
  return JSON.stringify({
    firstName: address.firstName,
    lastName: address.lastName,
    company: address.company,
    addressLine1: address.addressLine1,
    addressLine2: address.addressLine2,
    city: address.city,
    state: address.state,
    postalCode: address.postalCode,
    country: address.country,
    phone: address.phone,
  });
}

/**
 * Parse JSON address string from database
 */
export function deserializeAddress(addressJson: string): Address {
  try {
    return JSON.parse(addressJson);
  } catch (error) {
    console.error("❌ [CHECKOUT MAPPER] Error parsing address JSON:", error);
    throw new Error("Invalid address data");
  }
}

// 🚚 SHIPPING MAPPERS
// ===================

/**
 * Map shipping method to JSON for database storage
 */
export function serializeShippingMethod(method: {
  id: string;
  name: string;
  price: number;
  estimatedDays: number;
  provider?: string;
}): string {
  return JSON.stringify(method);
}

/**
 * Map payment method to JSON for database storage
 */
export function serializePaymentMethod(method: {
  id: string;
  name: string;
  type: string;
}): string {
  return JSON.stringify(method);
}

// 🔍 VALIDATION HELPERS
// =====================

/**
 * Validate that all cart items have sufficient stock
 */
export function validateCartStockAvailability(cart: CartWithItems): {
  isValid: boolean;
  errors: Array<{
    productId: string;
    productName: string;
    requested: number;
    available: number;
  }>;
} {
  console.log("🔍 [CHECKOUT MAPPER] Validating cart stock availability:", {
    cartId: cart.id,
    itemsCount: cart.items.length,
  });

  const errors: Array<{
    productId: string;
    productName: string;
    requested: number;
    available: number;
  }> = [];

  cart.items.forEach((item) => {
    if (item.product && item.quantity > item.product.stock) {
      errors.push({
        productId: item.product.id,
        productName: item.product.name,
        requested: item.quantity,
        available: item.product.stock,
      });
    }
  });

  const isValid = errors.length === 0;

  console.log("✅ [CHECKOUT MAPPER] Stock validation result:", {
    isValid,
    errorsCount: errors.errors,
    outOfStockProducts: errors.map((e) => e.productName),
  });

  return { isValid, errors };
}

/**
 * Calculate shipping cost based on address and items
 * This is a simplified implementation - in real world you'd integrate with shipping APIs
 */
export function calculateShippingCost(
  cart: CartWithItems,
  address: Address,
  shippingMethodId: string
): number {
  console.log("🚚 [CHECKOUT MAPPER] Calculating shipping cost:", {
    cartId: cart.id,
    destination: `${address.city}, ${address.state}`,
    shippingMethodId,
  });

  // Simplified shipping calculation
  // In real implementation, you'd call shipping APIs like UPS, FedEx, etc.

  let baseCost = 0;

  switch (shippingMethodId) {
    case "standard":
      baseCost = 999; // $9.99
      break;
    case "express":
      baseCost = 1999; // $19.99
      break;
    case "overnight":
      baseCost = 3999; // $39.99
      break;
    case "pickup":
      baseCost = 0; // Free pickup
      break;
    case "free_shipping":
      baseCost = 0; // Free shipping
      break;
    default:
      baseCost = 999; // Default to standard
  }

  // Apply free shipping threshold
  const cartTotal = cart.subtotal || 0;
  if (cartTotal >= FREE_SHIPPING_THRESHOLD) {
    baseCost = 0;
  }

  console.log("✅ [CHECKOUT MAPPER] Shipping cost calculated:", {
    shippingMethodId,
    baseCost,
    cartTotal,
    freeShippingApplied: cartTotal >= FREE_SHIPPING_THRESHOLD,
  });

  return baseCost;
}
