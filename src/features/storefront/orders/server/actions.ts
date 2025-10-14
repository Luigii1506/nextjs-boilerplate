/**
 * 📦 ORDERS - SERVER ACTIONS
 * ===========================
 *
 * Next.js Server Actions for orders.
 * These are the public API consumed by the UI.
 *
 * @version 1.0.0 - Feature-First Architecture v3
 */

"use server";

import { getServerSession } from "@/core/auth/server";
import type {
  GetOrdersRequest,
  GetOrdersResponse,
  GetOrderByIdRequest,
  GetOrderByIdResponse,
  CreateOrderRequest,
  CreateOrderResponse,
  CancelOrderRequest,
  CancelOrderResponse,
} from "../types";
import {
  getUserOrders,
  getOrderById,
  createOrder,
  cancelOrder,
} from "./queries";
import { mapOrderToApi, mapOrderToSummary, serializeShippingAddress } from "./mappers";

/**
 * 📥 Get user's orders
 */
export async function getOrdersAction(
  request: GetOrdersRequest
): Promise<GetOrdersResponse> {
  console.log("📦 [getOrdersAction] Fetching orders:", request);

  try {
    // Verify authentication
    const session = await getServerSession();
    console.log("🔐 [getOrdersAction] Session:", {
      hasSession: !!session,
      hasUser: !!session?.user,
      userId: session?.user?.id,
      requestUserId: request.userId,
    });

    if (!session?.user || session.user.id !== request.userId) {
      console.error("❌ [getOrdersAction] Unauthorized:", {
        sessionUserId: session?.user?.id,
        requestUserId: request.userId,
      });
      throw new Error("Unauthorized");
    }

    // Fetch orders
    console.log("🔍 [getOrdersAction] Fetching from database...");
    const { orders, total } = await getUserOrders({
      userId: request.userId,
      limit: request.limit,
      offset: request.offset,
      status: request.status,
    });

    console.log("✅ [getOrdersAction] Fetched orders:", {
      ordersCount: orders.length,
      total,
    });

    // Map to summaries
    const orderSummaries = orders.map(mapOrderToSummary);

    console.log("📤 [getOrdersAction] Returning summaries:", {
      summariesCount: orderSummaries.length,
    });

    return {
      orders: orderSummaries,
      total,
      hasMore: (request.offset || 0) + orders.length < total,
    };
  } catch (error) {
    console.error("❌ [getOrdersAction] Error:", error);
    return {
      orders: [],
      total: 0,
      hasMore: false,
    };
  }
}

/**
 * 📥 Get single order by ID
 */
export async function getOrderByIdAction(
  request: GetOrderByIdRequest
): Promise<GetOrderByIdResponse> {
  try {
    // Verify authentication
    const session = await auth();
    if (!session?.user || session.user.id !== request.userId) {
      throw new Error("Unauthorized");
    }

    // Fetch order
    const order = await getOrderById(request.orderId, request.userId);

    if (!order) {
      return null;
    }

    // Map to API type
    return mapOrderToApi(order);
  } catch (error) {
    console.error("❌ [getOrderByIdAction] Error:", error);
    return null;
  }
}

/**
 * 📤 Create a new order
 */
export async function createOrderAction(
  request: CreateOrderRequest
): Promise<CreateOrderResponse> {
  try {
    // Verify authentication for logged-in users
    const session = await auth();
    if (request.userId && (!session?.user || session.user.id !== request.userId)) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    // Validate request
    if (!request.items || request.items.length === 0) {
      return {
        success: false,
        error: "El pedido debe tener al menos un producto",
      };
    }

    if (!request.email) {
      return {
        success: false,
        error: "El email es requerido",
      };
    }

    // Create order
    const order = await createOrder({
      userId: request.userId,
      email: request.email,
      phone: request.phone,
      subtotal: request.subtotal,
      taxAmount: request.taxAmount,
      shippingCost: request.shippingCost,
      discountAmount: request.discountAmount || 0,
      total: request.total,
      shippingAddress: serializeShippingAddress(request.shippingAddress),
      shippingMethod: request.shippingMethod,
      paymentMethod: request.paymentMethod,
      paymentIntentId: request.paymentIntentId,
      customerNotes: request.customerNotes,
      items: request.items,
    });

    return {
      success: true,
      order: mapOrderToApi(order),
    };
  } catch (error) {
    console.error("❌ [createOrderAction] Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error al crear el pedido",
    };
  }
}

/**
 * 🚫 Cancel an order
 */
export async function cancelOrderAction(
  request: CancelOrderRequest
): Promise<CancelOrderResponse> {
  try {
    // Verify authentication
    const session = await auth();
    if (!session?.user || session.user.id !== request.userId) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    // Verify order ownership
    const existingOrder = await getOrderById(request.orderId, request.userId);
    if (!existingOrder) {
      return {
        success: false,
        error: "Pedido no encontrado",
      };
    }

    // Check if order can be cancelled
    if (["DELIVERED", "CANCELLED", "REFUNDED"].includes(existingOrder.status)) {
      return {
        success: false,
        error: "Este pedido no puede ser cancelado",
      };
    }

    // Cancel order
    await cancelOrder(request.orderId, request.reason);

    return {
      success: true,
      message: "Pedido cancelado exitosamente",
    };
  } catch (error) {
    console.error("❌ [cancelOrderAction] Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error al cancelar el pedido",
    };
  }
}
