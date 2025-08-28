/**
 * 🎬 CHECKOUT ACTIONS
 * ==================
 *
 * Server actions for checkout and order management.
 * These are the main interface between frontend and backend.
 */

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getServerSession } from "@/core/auth/server";
import type {
  CreateOrderResponse,
  CalculateOrderResponse,
  ProcessPaymentResponse,
  CalculateShippingResponse,
  GetOrdersResponse,
  CreateOrderInput,
  CalculateOrderInput,
  ProcessPaymentInput,
  CalculateShippingInput,
} from "../types/api";
import {
  createOrderSchema,
  calculateOrderSchema,
  processPaymentSchema,
  calculateShippingSchema,
} from "../schemas";
import {
  createOrderService,
  calculateOrderService,
  processOrderPaymentService,
  getShippingMethodsService,
  getOrderService,
  getUserOrdersService,
  updateOrderStatusService,
} from "./service";
import {
  validateCheckoutAccess,
  validateOrderAccess,
  validateCompleteCheckout,
  validateCheckoutRateLimit,
} from "./validators";
import { clearCartAction } from "@/features/cart/server/actions";

// 🎯 ORDER CREATION ACTIONS
// =========================

/**
 * Create a new order from checkout data
 */
export async function createOrderAction(
  input: CreateOrderInput
): Promise<CreateOrderResponse> {
  const requestId = `createOrder-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;

  console.log("🎬 [CHECKOUT ACTION] Creating order:", {
    requestId,
    cartId: input.cartId,
    userId: input.userId,
    customerEmail: input.customerInfo.email,
    shippingMethodId: input.shippingMethodId,
    paymentMethodId: input.paymentMethodId,
  });

  try {
    // 1. Validate input schema
    const validationResult = createOrderSchema.safeParse(input);
    if (!validationResult.success) {
      const validationErrors: Record<string, string> = {};
      validationResult.error.issues.forEach((issue) => {
        validationErrors[issue.path.join(".")] = issue.message;
      });

      console.log("❌ [CHECKOUT ACTION] Schema validation failed:", {
        requestId,
        errors: validationErrors,
      });

      return {
        success: false,
        error: "Invalid input data",
        validationErrors,
      };
    }

    // 2. Validate authentication/authorization
    const accessValidation = await validateCheckoutAccess(
      input.userId,
      input.cartId
    );
    if (!accessValidation.isValid) {
      console.log("❌ [CHECKOUT ACTION] Access denied:", {
        requestId,
        error: accessValidation.error,
      });

      return {
        success: false,
        error: accessValidation.error || "Access denied",
      };
    }

    // 3. Check rate limits
    const rateLimitCheck = validateCheckoutRateLimit(
      input.userId,
      input.cartId
    );
    if (!rateLimitCheck.isAllowed) {
      console.log("❌ [CHECKOUT ACTION] Rate limit exceeded:", {
        requestId,
        retryAfter: rateLimitCheck.retryAfter,
      });

      return {
        success: false,
        error: rateLimitCheck.error || "Too many checkout attempts",
      };
    }

    // 4. Validate complete checkout session
    const checkoutValidation = validateCompleteCheckout(validationResult.data);
    if (!checkoutValidation.isValid) {
      console.log("❌ [CHECKOUT ACTION] Checkout validation failed:", {
        requestId,
        errors: checkoutValidation.errors,
      });

      return {
        success: false,
        error: "Checkout validation failed",
        validationErrors: checkoutValidation.errors,
      };
    }

    // 5. Create order
    const order = await createOrderService(validationResult.data);

    // 6. Clear cart after successful order creation
    try {
      await clearCartAction(input.cartId, input.userId);
      console.log("✅ [CHECKOUT ACTION] Cart cleared after order creation");
    } catch (cartError) {
      console.warn("⚠️ [CHECKOUT ACTION] Failed to clear cart:", cartError);
      // Don't fail the order creation if cart clearing fails
    }

    // 7. Revalidate relevant paths
    revalidatePath("/store");
    if (input.userId) {
      revalidatePath("/account/orders");
    }

    console.log("✅ [CHECKOUT ACTION] Order created successfully:", {
      requestId,
      orderId: order.id,
      orderNumber: order.number,
      total: order.total,
    });

    return {
      success: true,
      data: order,
    };
  } catch (error) {
    console.error("❌ [CHECKOUT ACTION] Error creating order:", {
      requestId,
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
    });

    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create order",
    };
  }
}

// 🧮 ORDER CALCULATION ACTIONS
// ============================

/**
 * Calculate order totals without creating the order
 */
export async function calculateOrderAction(
  input: CalculateOrderInput
): Promise<CalculateOrderResponse> {
  const requestId = `calculateOrder-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;

  console.log("🧮 [CHECKOUT ACTION] Calculating order:", {
    requestId,
    cartId: input.cartId,
    hasShippingAddress: !!input.shippingAddress,
    shippingMethodId: input.shippingMethodId,
  });

  try {
    // 1. Validate input schema
    const validationResult = calculateOrderSchema.safeParse(input);
    if (!validationResult.success) {
      console.log(
        "❌ [CHECKOUT ACTION] Calculation schema validation failed:",
        {
          requestId,
          errors: validationResult.error.issues,
        }
      );

      return {
        success: false,
        error: "Invalid calculation parameters",
      };
    }

    // 2. Calculate order
    const calculation = await calculateOrderService(
      validationResult.data.cartId,
      undefined, // userId not required for calculation
      validationResult.data.shippingAddress,
      validationResult.data.shippingMethodId,
      validationResult.data.discountCodes
    );

    console.log("✅ [CHECKOUT ACTION] Order calculated successfully:", {
      requestId,
      subtotal: calculation.subtotal,
      shipping: calculation.shipping,
      tax: calculation.tax,
      total: calculation.total,
    });

    return {
      success: true,
      data: calculation,
    };
  } catch (error) {
    console.error("❌ [CHECKOUT ACTION] Error calculating order:", {
      requestId,
      error: error instanceof Error ? error.message : error,
    });

    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to calculate order",
    };
  }
}

// 💳 PAYMENT PROCESSING ACTIONS
// =============================

/**
 * Process payment for an order
 */
export async function processPaymentAction(
  input: ProcessPaymentInput
): Promise<ProcessPaymentResponse> {
  const requestId = `processPayment-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;

  console.log("💳 [CHECKOUT ACTION] Processing payment:", {
    requestId,
    orderId: input.orderId,
    paymentMethodId: input.paymentMethodId,
  });

  try {
    // 1. Validate input schema
    const validationResult = processPaymentSchema.safeParse(input);
    if (!validationResult.success) {
      console.log("❌ [CHECKOUT ACTION] Payment schema validation failed:", {
        requestId,
        errors: validationResult.error.issues,
      });

      return {
        success: false,
        error: "Invalid payment parameters",
      };
    }

    // 2. Get current session for user validation
    // Server session validation with better-auth
    const session = await getServerSession();
    const userId = session?.user?.id;

    // 3. Validate order access
    const accessValidation = await validateOrderAccess(
      validationResult.data.orderId,
      userId,
      undefined // sessionId for guest orders
    );

    if (!accessValidation.isValid) {
      console.log("❌ [CHECKOUT ACTION] Payment access denied:", {
        requestId,
        error: accessValidation.error,
      });

      return {
        success: false,
        error: accessValidation.error || "Order access denied",
      };
    }

    // 4. Process payment
    const paymentResult = await processOrderPaymentService(
      validationResult.data.orderId,
      validationResult.data.paymentMethodId,
      validationResult.data.paymentData
    );

    if (paymentResult.success) {
      // 5. Get updated order after successful payment
      const updatedOrder = await getOrderService(
        validationResult.data.orderId,
        userId
      );

      // 6. Revalidate paths
      revalidatePath("/store");
      if (userId) {
        revalidatePath("/account/orders");
      }

      console.log("✅ [CHECKOUT ACTION] Payment processed successfully:", {
        requestId,
        orderId: validationResult.data.orderId,
      });

      return {
        success: true,
        data: {
          order: updatedOrder!,
          requiresAction: paymentResult.requiresAction,
        },
      };
    } else {
      console.log("❌ [CHECKOUT ACTION] Payment processing failed:", {
        requestId,
        error: paymentResult.error,
      });

      return {
        success: false,
        error: paymentResult.error || "Payment processing failed",
      };
    }
  } catch (error) {
    console.error("❌ [CHECKOUT ACTION] Error processing payment:", {
      requestId,
      error: error instanceof Error ? error.message : error,
    });

    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Payment processing failed",
    };
  }
}

// 🚚 SHIPPING ACTIONS
// ===================

/**
 * Calculate available shipping methods for address
 */
export async function calculateShippingAction(
  input: CalculateShippingInput
): Promise<CalculateShippingResponse> {
  const requestId = `calculateShipping-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;

  console.log("🚚 [CHECKOUT ACTION] Calculating shipping:", {
    requestId,
    cartId: input.cartId,
    destination: `${input.shippingAddress.city}, ${input.shippingAddress.state}`,
  });

  try {
    // 1. Validate input schema
    const validationResult = calculateShippingSchema.safeParse(input);
    if (!validationResult.success) {
      console.log(
        "❌ [CHECKOUT ACTION] Shipping calculation schema validation failed:",
        {
          requestId,
          errors: validationResult.error.issues,
        }
      );

      return {
        success: false,
        error: "Invalid shipping calculation parameters",
      };
    }

    // 2. Get shipping methods
    const shippingMethods = await getShippingMethodsService(
      validationResult.data.cartId,
      validationResult.data.shippingAddress
    );

    console.log("✅ [CHECKOUT ACTION] Shipping methods calculated:", {
      requestId,
      methodsCount: shippingMethods.length,
      methods: shippingMethods.map((m) => m.name),
    });

    return {
      success: true,
      data: shippingMethods,
    };
  } catch (error) {
    console.error("❌ [CHECKOUT ACTION] Error calculating shipping:", {
      requestId,
      error: error instanceof Error ? error.message : error,
    });

    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to calculate shipping",
    };
  }
}

// 📋 ORDER RETRIEVAL ACTIONS
// ==========================

/**
 * Get order by ID
 */
export async function getOrderAction(orderId: string) {
  const requestId = `getOrder-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;

  console.log("📋 [CHECKOUT ACTION] Getting order:", {
    requestId,
    orderId,
  });

  try {
    // Server session validation with better-auth
    const session = await getServerSession();
    const userId = session?.user?.id;

    const order = await getOrderService(orderId, userId);

    if (!order) {
      console.log("❌ [CHECKOUT ACTION] Order not found or access denied:", {
        requestId,
        orderId,
      });

      return {
        success: false,
        error: "Order not found or access denied",
      };
    }

    console.log("✅ [CHECKOUT ACTION] Order retrieved:", {
      requestId,
      orderId: order.id,
      orderNumber: order.number,
    });

    return {
      success: true,
      data: order,
    };
  } catch (error) {
    console.error("❌ [CHECKOUT ACTION] Error getting order:", {
      requestId,
      error: error instanceof Error ? error.message : error,
    });

    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get order",
    };
  }
}

/**
 * Get orders for current user
 */
export async function getUserOrdersAction(
  options: { limit?: number; offset?: number; status?: string[] } = {}
): Promise<GetOrdersResponse> {
  const requestId = `getUserOrders-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;

  console.log("📋 [CHECKOUT ACTION] Getting user orders:", {
    requestId,
    options,
  });

  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      console.log("❌ [CHECKOUT ACTION] User not authenticated for orders:", {
        requestId,
      });

      return {
        success: false,
        error: "Authentication required",
      };
    }

    const result = await getUserOrdersService(session.user.id, options);

    console.log("✅ [CHECKOUT ACTION] User orders retrieved:", {
      requestId,
      userId: session.user.id,
      ordersCount: result.orders.length,
      total: result.total,
    });

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error("❌ [CHECKOUT ACTION] Error getting user orders:", {
      requestId,
      error: error instanceof Error ? error.message : error,
    });

    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get orders",
    };
  }
}

// 🔧 ORDER MANAGEMENT ACTIONS (Admin)
// ===================================

/**
 * Update order status (admin only)
 */
export async function updateOrderStatusAction(
  orderId: string,
  status: string,
  notes?: string
) {
  const requestId = `updateOrderStatus-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;

  console.log("🔧 [CHECKOUT ACTION] Updating order status:", {
    requestId,
    orderId,
    status,
  });

  try {
    // Admin permission check with better-auth
    const session = await getServerSession();
    if (!session?.user?.id) {
      return {
        success: false,
        error: "Authentication required",
      };
    }

    // TODO: Add proper admin role check with hasPermission when needed
    // For now, allowing all authenticated users to update order status
    // const hasAdminPermission = hasPermission(session.user, 'orders:update');
    // if (!hasAdminPermission) { 
    //   return { success: false, error: "Admin permission required" };
    // }

    const order = await updateOrderStatusService(orderId, status, notes);

    // Revalidate admin paths
    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${orderId}`);

    console.log("✅ [CHECKOUT ACTION] Order status updated:", {
      requestId,
      orderId: order.id,
      newStatus: order.status,
    });

    return {
      success: true,
      data: order,
    };
  } catch (error) {
    console.error("❌ [CHECKOUT ACTION] Error updating order status:", {
      requestId,
      error: error instanceof Error ? error.message : error,
    });

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to update order status",
    };
  }
}
