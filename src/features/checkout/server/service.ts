/**
 * 🏢 CHECKOUT SERVICE
 * ==================
 *
 * Business logic for checkout and order processing.
 * Contains all core business rules and calculations.
 */

// TODO: Replace with actual auth implementation when needed
// import { getServerSession } from "next-auth";
import type {
  Order,
  OrderCalculation,
  CheckoutSession,
  CustomerInfo,
  Address,
  ShippingMethod,
  PaymentMethod,
  CreateOrderInput,
} from "../types";
import type { CartWithItems } from "@/features/cart/types";
import {
  createOrderQuery,
  getOrderQuery,
  getUserOrdersQuery,
  updateOrderStatusQuery,
  updateOrderPaymentStatusQuery,
  updateOrderShippingQuery,
  generateOrderNumberQuery,
} from "./queries";
import {
  mapCartToOrderItems,
  calculateOrderTotals,
  mapPrismaOrderToOrder,
  validateCartStockAvailability,
  calculateShippingCost,
  serializeAddress,
  serializeShippingMethod,
  serializePaymentMethod,
} from "./mappers";
import { getCartService } from "@/features/cart/server/service";
import { TAX_RATES, SHIPPING_METHODS, PAYMENT_METHODS } from "../constants";

// 🎯 ORDER CREATION SERVICE
// =========================

/**
 * Create a new order from checkout data
 */
export async function createOrderService(
  input: CreateOrderInput
): Promise<Order> {
  console.log("🏢 [CHECKOUT SERVICE] Creating order:", {
    cartId: input.cartId,
    userId: input.userId,
    customerEmail: input.customerInfo.email,
    shippingMethodId: input.shippingMethodId,
    paymentMethodId: input.paymentMethodId,
  });

  try {
    // 1. Get and validate cart
    const cart = await getCartService(input.cartId, input.userId);
    if (!cart || !cart.items || cart.items.length === 0) {
      throw new Error("Cart is empty or not found");
    }

    // 2. Validate stock availability
    const stockValidation = validateCartStockAvailability(cart);
    if (!stockValidation.isValid) {
      const outOfStockItems = stockValidation.errors
        .map(
          (e) =>
            `${e.productName} (requested: ${e.requested}, available: ${e.available})`
        )
        .join(", ");
      throw new Error(`Insufficient stock for: ${outOfStockItems}`);
    }

    // 3. Get shipping method
    const shippingMethod = SHIPPING_METHODS.find(
      (m) => m.id === input.shippingMethodId
    );
    if (!shippingMethod) {
      throw new Error(`Invalid shipping method: ${input.shippingMethodId}`);
    }

    // 4. Get payment method
    const paymentMethod = PAYMENT_METHODS.find(
      (m) => m.id === input.paymentMethodId
    );
    if (!paymentMethod) {
      throw new Error(`Invalid payment method: ${input.paymentMethodId}`);
    }

    // 5. Calculate shipping cost
    const shippingCost = calculateShippingCost(
      cart,
      input.shippingAddress,
      input.shippingMethodId
    );

    // 6. Calculate totals
    const calculation = calculateOrderTotals(
      cart,
      shippingCost,
      TAX_RATES.DEFAULT, // TODO: Calculate based on address
      0 // No discount for now
    );

    // 7. Generate order number
    const orderNumber = await generateOrderNumberQuery();

    // 8. Map cart items to order items
    const orderItems = mapCartToOrderItems(cart, "temp-id"); // Will be replaced with actual order ID

    // 9. Create order in database
    const orderData = {
      number: orderNumber,
      userId: input.userId,
      email: input.customerInfo.email,
      phone: input.customerInfo.phone,
      subtotal: calculation.subtotal,
      taxAmount: calculation.tax,
      shippingCost: calculation.shipping,
      discountAmount: calculation.discount,
      total: calculation.total,
      status: "PENDING" as const,
      paymentStatus: "PENDING" as const,
      fulfillmentStatus: "UNFULFILLED" as const,
      shippingAddress: serializeAddress(input.shippingAddress),
      billingAddress: input.billingAddress
        ? serializeAddress(input.billingAddress)
        : undefined,
      shippingMethod: serializeShippingMethod({
        id: shippingMethod.id,
        name: shippingMethod.name,
        price: shippingMethod.price,
        estimatedDays: shippingMethod.estimatedDays,
        provider: shippingMethod.provider,
      }),
      paymentMethod: serializePaymentMethod({
        id: paymentMethod.id,
        name: paymentMethod.name,
        type: paymentMethod.type,
      }),
      customerNotes: input.customerNotes,
      items: orderItems,
    };

    const createdOrder = await createOrderQuery(orderData);

    // 10. TODO: Clear cart after successful order creation
    // await clearCartService(input.cartId);

    // 11. Map to business object
    const order = mapPrismaOrderToOrder(createdOrder);

    console.log("✅ [CHECKOUT SERVICE] Order created successfully:", {
      orderId: order.id,
      orderNumber: order.number,
      total: order.total,
      itemsCount: order.items.length,
    });

    return order;
  } catch (error) {
    console.error("❌ [CHECKOUT SERVICE] Error creating order:", error);
    throw error;
  }
}

// 🧮 ORDER CALCULATION SERVICE
// ============================

/**
 * Calculate order totals without creating the order
 */
export async function calculateOrderService(
  cartId: string,
  userId?: string,
  shippingAddress?: Address,
  shippingMethodId?: string,
  discountCodes?: string[]
): Promise<OrderCalculation> {
  console.log("🧮 [CHECKOUT SERVICE] Calculating order:", {
    cartId,
    userId,
    hasShippingAddress: !!shippingAddress,
    shippingMethodId,
    discountCodes,
  });

  try {
    // 1. Get cart
    const cart = await getCartService(cartId, userId);
    if (!cart) {
      throw new Error("Cart not found");
    }

    // 2. Calculate shipping cost
    let shippingCost = 0;
    if (shippingAddress && shippingMethodId) {
      shippingCost = calculateShippingCost(
        cart,
        shippingAddress,
        shippingMethodId
      );
    }

    // 3. Calculate discount (simplified - would normally validate codes)
    const discountAmount = 0; // TODO: Implement discount calculation

    // 4. Calculate totals
    const calculation = calculateOrderTotals(
      cart,
      shippingCost,
      TAX_RATES.DEFAULT, // TODO: Calculate based on address
      discountAmount
    );

    console.log("✅ [CHECKOUT SERVICE] Order calculated:", {
      subtotal: calculation.subtotal,
      shipping: calculation.shipping,
      tax: calculation.tax,
      total: calculation.total,
    });

    return calculation;
  } catch (error) {
    console.error("❌ [CHECKOUT SERVICE] Error calculating order:", error);
    throw error;
  }
}

// 💳 PAYMENT PROCESSING SERVICE
// =============================

/**
 * Process payment for an order
 */
export async function processOrderPaymentService(
  orderId: string,
  paymentMethodId: string,
  paymentData?: any
): Promise<{ success: boolean; error?: string; requiresAction?: boolean }> {
  console.log("💳 [CHECKOUT SERVICE] Processing payment:", {
    orderId,
    paymentMethodId,
    hasPaymentData: !!paymentData,
  });

  try {
    // 1. Get order
    const order = await getOrderQuery(orderId);
    if (!order) {
      throw new Error("Order not found");
    }

    if (order.paymentStatus === "PAID") {
      console.log("💳 [CHECKOUT SERVICE] Order already paid");
      return { success: true };
    }

    // 2. Get payment method
    const paymentMethod = PAYMENT_METHODS.find((m) => m.id === paymentMethodId);
    if (!paymentMethod) {
      throw new Error(`Invalid payment method: ${paymentMethodId}`);
    }

    // 3. Process payment based on method
    let paymentResult: {
      success: boolean;
      error?: string;
      requiresAction?: boolean;
    };

    switch (paymentMethod.type) {
      case "credit_card":
      case "debit_card":
        paymentResult = await processCreditCardPayment(order, paymentData);
        break;

      case "paypal":
        paymentResult = await processPayPalPayment(order, paymentData);
        break;

      case "bank_transfer":
        paymentResult = await processBankTransferPayment(order, paymentData);
        break;

      case "cash_on_delivery":
        paymentResult = await processCashOnDeliveryPayment(order);
        break;

      default:
        throw new Error(`Unsupported payment method: ${paymentMethod.type}`);
    }

    // 4. Update order payment status
    if (paymentResult.success) {
      await updateOrderPaymentStatusQuery(
        orderId,
        "PAID",
        paymentData?.paymentIntentId
      );

      console.log("✅ [CHECKOUT SERVICE] Payment processed successfully:", {
        orderId,
        paymentMethodId,
      });
    } else {
      await updateOrderPaymentStatusQuery(orderId, "FAILED");

      console.log("❌ [CHECKOUT SERVICE] Payment failed:", {
        orderId,
        error: paymentResult.error,
      });
    }

    return paymentResult;
  } catch (error) {
    console.error("❌ [CHECKOUT SERVICE] Error processing payment:", error);
    await updateOrderPaymentStatusQuery(orderId, "FAILED");
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Payment processing failed",
    };
  }
}

// 💳 PAYMENT METHOD IMPLEMENTATIONS
// =================================

async function processCreditCardPayment(
  order: any,
  paymentData: any
): Promise<{ success: boolean; error?: string; requiresAction?: boolean }> {
  console.log("💳 [CHECKOUT SERVICE] Processing credit card payment");

  // TODO: Implement Stripe integration
  // For now, simulate successful payment
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true });
    }, 1000);
  });
}

async function processPayPalPayment(
  order: any,
  paymentData: any
): Promise<{ success: boolean; error?: string; requiresAction?: boolean }> {
  console.log("💳 [CHECKOUT SERVICE] Processing PayPal payment");

  // TODO: Implement PayPal integration
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true });
    }, 1000);
  });
}

async function processBankTransferPayment(
  order: any,
  paymentData: any
): Promise<{ success: boolean; error?: string }> {
  console.log("💳 [CHECKOUT SERVICE] Processing bank transfer payment");

  // Bank transfers are typically manual verification
  // Mark as pending and require manual confirmation
  return { success: true };
}

async function processCashOnDeliveryPayment(
  order: any
): Promise<{ success: boolean; error?: string }> {
  console.log("💳 [CHECKOUT SERVICE] Processing cash on delivery");

  // COD doesn't require immediate payment processing
  return { success: true };
}

// 🚚 SHIPPING SERVICES
// ===================

/**
 * Get available shipping methods for an address
 */
export async function getShippingMethodsService(
  cartId: string,
  shippingAddress: Address,
  userId?: string
): Promise<ShippingMethod[]> {
  console.log("🚚 [CHECKOUT SERVICE] Getting shipping methods:", {
    cartId,
    destination: `${shippingAddress.city}, ${shippingAddress.state}`,
  });

  try {
    // 1. Get cart to calculate shipping rates
    const cart = await getCartService(cartId, userId);
    if (!cart) {
      throw new Error("Cart not found");
    }

    // 2. Filter available shipping methods based on cart/address
    // In real implementation, you'd call shipping APIs here
    const availableMethods = SHIPPING_METHODS.filter((method) => {
      // Simple filtering logic - can be expanded
      if (method.id === "pickup" && shippingAddress.country !== "US") {
        return false; // Store pickup only available in US
      }

      return method.isActive;
    });

    console.log("✅ [CHECKOUT SERVICE] Shipping methods retrieved:", {
      methodsCount: availableMethods.length,
      methods: availableMethods.map((m) => m.name),
    });

    return availableMethods;
  } catch (error) {
    console.error(
      "❌ [CHECKOUT SERVICE] Error getting shipping methods:",
      error
    );
    throw error;
  }
}

// 📋 ORDER RETRIEVAL SERVICES
// ===========================

/**
 * Get order by ID with user authorization
 */
export async function getOrderService(
  orderId: string,
  userId?: string
): Promise<Order | null> {
  console.log("📋 [CHECKOUT SERVICE] Getting order:", { orderId, userId });

  try {
    const prismaOrder = await getOrderQuery(orderId, userId);
    if (!prismaOrder) {
      console.log("❌ [CHECKOUT SERVICE] Order not found or access denied");
      return null;
    }

    const order = mapPrismaOrderToOrder(prismaOrder);

    console.log("✅ [CHECKOUT SERVICE] Order retrieved:", {
      orderId: order.id,
      orderNumber: order.number,
      status: order.status,
    });

    return order;
  } catch (error) {
    console.error("❌ [CHECKOUT SERVICE] Error getting order:", error);
    throw error;
  }
}

/**
 * Get orders for a user
 */
export async function getUserOrdersService(
  userId: string,
  options: { limit?: number; offset?: number; status?: string[] } = {}
): Promise<{ orders: Order[]; total: number; hasMore: boolean }> {
  console.log("📋 [CHECKOUT SERVICE] Getting user orders:", {
    userId,
    options,
  });

  try {
    const result = await getUserOrdersQuery(userId, options);

    const orders = result.orders.map(mapPrismaOrderToOrder);

    console.log("✅ [CHECKOUT SERVICE] User orders retrieved:", {
      userId,
      ordersCount: orders.length,
      total: result.total,
      hasMore: result.hasMore,
    });

    return {
      orders,
      total: result.total,
      hasMore: result.hasMore,
    };
  } catch (error) {
    console.error("❌ [CHECKOUT SERVICE] Error getting user orders:", error);
    throw error;
  }
}

// 🔧 ORDER MANAGEMENT SERVICES (Admin)
// ====================================

/**
 * Update order status (admin only)
 */
export async function updateOrderStatusService(
  orderId: string,
  status: string,
  notes?: string
): Promise<Order> {
  console.log("🔧 [CHECKOUT SERVICE] Updating order status:", {
    orderId,
    status,
    hasNotes: !!notes,
  });

  try {
    const updatedOrder = await updateOrderStatusQuery(
      orderId,
      status as any,
      notes
    );
    const order = mapPrismaOrderToOrder(updatedOrder);

    console.log("✅ [CHECKOUT SERVICE] Order status updated:", {
      orderId: order.id,
      newStatus: order.status,
    });

    return order;
  } catch (error) {
    console.error("❌ [CHECKOUT SERVICE] Error updating order status:", error);
    throw error;
  }
}
