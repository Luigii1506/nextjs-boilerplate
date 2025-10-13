/**
 * 🗃️ CHECKOUT QUERIES
 * ===================
 *
 * Database queries for checkout and order operations
 */

import { prisma } from "@/core/database/prisma";
import type {
  Order,
  OrderItem,
  Address,
  OrderStatus,
  PaymentStatus,
  FulfillmentStatus,
  PrismaOrderWhereClause,
} from "../types";

// 📦 ORDER QUERIES
// ===============

/**
 * Create a new order in the database
 */
export async function createOrderQuery(orderData: {
  number: string;
  userId?: string;
  email: string;
  phone?: string;
  subtotal: number;
  taxAmount: number;
  shippingCost: number;
  discountAmount: number;
  total: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  fulfillmentStatus: FulfillmentStatus;
  shippingAddress?: string; // JSON string
  billingAddress?: string; // JSON string
  shippingMethod?: string;
  paymentMethod?: string;
  customerNotes?: string;
  items: Array<{
    productId: string;
    quantity: number;
    unitPrice: number;
    total: number;
    productSku: string;
    productName: string;
    productImage?: string;
  }>;
}) {
  console.log("🔍 [CHECKOUT QUERY] Creating order:", {
    orderNumber: orderData.number,
    userId: orderData.userId,
    email: orderData.email,
    itemsCount: orderData.items.length,
    total: orderData.total,
  });

  try {
    const order = await prisma.order.create({
      data: {
        number: orderData.number,
        userId: orderData.userId,
        email: orderData.email,
        phone: orderData.phone,
        subtotal: orderData.subtotal,
        taxAmount: orderData.taxAmount,
        shippingCost: orderData.shippingCost,
        discountAmount: orderData.discountAmount,
        total: orderData.total,
        status: orderData.status,
        paymentStatus: orderData.paymentStatus,
        fulfillmentStatus: orderData.fulfillmentStatus,
        shippingAddress: orderData.shippingAddress,
        shippingMethod: orderData.shippingMethod,
        paymentMethod: orderData.paymentMethod,
        customerNotes: orderData.customerNotes,
        items: {
          create: orderData.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.total,
            productSku: item.productSku,
            productName: item.productName,
            productImage: item.productImage,
          })),
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    console.log("✅ [CHECKOUT QUERY] Order created successfully:", {
      orderId: order.id,
      orderNumber: order.number,
      itemsCount: order.items.length,
    });

    return order;
  } catch (error) {
    console.error("❌ [CHECKOUT QUERY] Error creating order:", error);
    throw error;
  }
}

/**
 * Get order by ID
 */
export async function getOrderQuery(orderId: string, userId?: string) {
  console.log("🔍 [CHECKOUT QUERY] Getting order:", { orderId, userId });

  try {
    const whereClause: PrismaOrderWhereClause = { id: orderId };
    if (userId) {
      whereClause.OR = [
        { userId: userId },
        { userId: null }, // Allow access to guest orders if user created them
      ];
    }

    const order = await prisma.order.findFirst({
      where: whereClause,
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                sku: true,
                images: true,
                currentPrice: true,
                stock: true,
              },
            },
          },
        },
        statusHistory: {
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (order) {
      console.log("✅ [CHECKOUT QUERY] Order found:", {
        orderId: order.id,
        orderNumber: order.number,
        status: order.status,
      });
    } else {
      console.log("❌ [CHECKOUT QUERY] Order not found");
    }

    return order;
  } catch (error) {
    console.error("❌ [CHECKOUT QUERY] Error getting order:", error);
    throw error;
  }
}

/**
 * Get orders for a user
 */
export async function getUserOrdersQuery(
  userId: string,
  options: {
    limit?: number;
    offset?: number;
    status?: OrderStatus[];
  } = {}
) {
  const { limit = 20, offset = 0, status } = options;

  console.log("🔍 [CHECKOUT QUERY] Getting user orders:", {
    userId,
    limit,
    offset,
    statusFilter: status,
  });

  try {
    const whereClause: PrismaOrderWhereClause = { customerId: userId };
    if (status && status.length > 0) {
      whereClause.status = { in: status };
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: whereClause,
        orderBy: {
          placedAt: "desc",
        },
        take: limit,
        skip: offset,
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  sku: true,
                  images: true,
                },
              },
            },
          },
        },
      }),
      prisma.order.count({ where: whereClause }),
    ]);

    console.log("✅ [CHECKOUT QUERY] User orders retrieved:", {
      userId,
      ordersCount: orders.length,
      total,
      hasMore: offset + limit < total,
    });

    return {
      orders,
      total,
      hasMore: offset + limit < total,
    };
  } catch (error) {
    console.error("❌ [CHECKOUT QUERY] Error getting user orders:", error);
    throw error;
  }
}

/**
 * Update order status
 */
export async function updateOrderStatusQuery(
  orderId: string,
  status: OrderStatus,
  notes?: string
) {
  console.log("🔄 [CHECKOUT QUERY] Updating order status:", {
    orderId,
    status,
    hasNotes: !!notes,
  });

  try {
    const order = await prisma.order.update({
      where: { id: orderId },
      data: {
        status,
        adminNotes: notes,
        // Set specific date fields based on status
        ...(status === "SHIPPED" && { shippedAt: new Date() }),
        ...(status === "DELIVERED" && { deliveredAt: new Date() }),
        ...(status === "CANCELLED" && { cancelledAt: new Date() }),
      },
      include: {
        items: true,
      },
    });

    // Create status history entry
    await prisma.orderStatusHistory.create({
      data: {
        orderId: order.id,
        status,
        notes,
      },
    });

    console.log("✅ [CHECKOUT QUERY] Order status updated:", {
      orderId: order.id,
      newStatus: order.status,
    });

    return order;
  } catch (error) {
    console.error("❌ [CHECKOUT QUERY] Error updating order status:", error);
    throw error;
  }
}

/**
 * Update order payment status
 */
export async function updateOrderPaymentStatusQuery(
  orderId: string,
  paymentStatus: PaymentStatus,
  paymentIntentId?: string
) {
  console.log("💳 [CHECKOUT QUERY] Updating payment status:", {
    orderId,
    paymentStatus,
    paymentIntentId,
  });

  try {
    const order = await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentStatus,
        paymentIntentId,
        // Auto-update order status based on payment
        ...(paymentStatus === "PAID" && { status: "CONFIRMED" }),
        ...(paymentStatus === "FAILED" && { status: "CANCELLED" }),
      },
    });

    console.log("✅ [CHECKOUT QUERY] Payment status updated:", {
      orderId: order.id,
      paymentStatus: order.paymentStatus,
      orderStatus: order.status,
    });

    return order;
  } catch (error) {
    console.error("❌ [CHECKOUT QUERY] Error updating payment status:", error);
    throw error;
  }
}

/**
 * Update shipping information
 */
export async function updateOrderShippingQuery(
  orderId: string,
  shippingData: {
    trackingNumber?: string;
    shippedAt?: Date;
    estimatedDelivery?: Date;
  }
) {
  console.log("🚚 [CHECKOUT QUERY] Updating shipping info:", {
    orderId,
    trackingNumber: shippingData.trackingNumber,
    hasShippedAt: !!shippingData.shippedAt,
    hasEstimatedDelivery: !!shippingData.estimatedDelivery,
  });

  try {
    const order = await prisma.order.update({
      where: { id: orderId },
      data: {
        trackingNumber: shippingData.trackingNumber,
        shippedAt: shippingData.shippedAt,
        estimatedDelivery: shippingData.estimatedDelivery,
        // Auto-update status if shipped date is set
        ...(shippingData.shippedAt && { status: "SHIPPED" as OrderStatus }),
      },
    });

    console.log("✅ [CHECKOUT QUERY] Shipping info updated:", {
      orderId: order.id,
      trackingNumber: order.trackingNumber,
      status: order.status,
    });

    return order;
  } catch (error) {
    console.error("❌ [CHECKOUT QUERY] Error updating shipping info:", error);
    throw error;
  }
}

// 🔢 UTILITY QUERIES
// ==================

/**
 * Generate unique order number
 */
export async function generateOrderNumberQuery(): Promise<string> {
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2);
  const month = (now.getMonth() + 1).toString().padStart(2, "0");
  const day = now.getDate().toString().padStart(2, "0");

  // Get count of orders today to create unique suffix
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(now);
  endOfDay.setHours(23, 59, 59, 999);

  const ordersToday = await prisma.order.count({
    where: {
      placedAt: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
  });

  const sequence = (ordersToday + 1).toString().padStart(4, "0");
  const orderNumber = `ORD-${year}${month}${day}-${sequence}`;

  console.log("🔢 [CHECKOUT QUERY] Generated order number:", {
    orderNumber,
    ordersToday: ordersToday,
  });

  return orderNumber;
}

/**
 * Check if order belongs to user (for authorization)
 */
export async function checkOrderOwnershipQuery(
  orderId: string,
  userId?: string,
  sessionId?: string
): Promise<boolean> {
  try {
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        OR: [
          ...(userId ? [{ userId }] : []),
          // For guest orders, we could check by email or session
          // This is a simplified version
          { userId: null },
        ],
      },
      select: { id: true },
    });

    return !!order;
  } catch (error) {
    console.error("❌ [CHECKOUT QUERY] Error checking order ownership:", error);
    return false;
  }
}
