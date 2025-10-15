/**
 * 🎬 SELLER PORTAL - ORDERS ACTIONS
 * ==================================
 *
 * Server actions for orders management
 * - Update order status
 * - Add tracking information
 * - Add admin notes
 * - Cancel/refund orders
 *
 * Created: 2025-01-17 - Seller Portal Implementation
 */

"use server";

import { revalidatePath } from "next/cache";
import { PrismaClient } from "@prisma/client";
import {
  ApiResponse,
  OrderDetails,
  OrderStatus,
  TrackingUpdate,
  OrderFilters,
  PaginatedResponse,
  OrderSummary,
} from "../../types";
import {
  getOrdersQuery,
  getOrderDetailsQuery,
  getOrdersStatsQuery,
  getPendingOrdersCountQuery,
} from "../queries/orders.queries";

const prisma = new PrismaClient();

// ========================================
// 📝 UPDATE ORDER STATUS
// ========================================

export async function updateOrderStatusAction(
  orderId: string,
  newStatus: OrderStatus,
  notes?: string
): Promise<ApiResponse<OrderDetails>> {
  try {
    console.log("🎬 [SELLER PORTAL] Updating order status:", {
      orderId,
      newStatus,
      notes,
    });

    // Update order and create status history entry
    const updatedOrder = await prisma.$transaction(async (tx) => {
      // Update order status
      const order = await tx.order.update({
        where: { id: orderId },
        data: {
          status: newStatus,
          // Update timestamps based on status
          ...(newStatus === "SHIPPED" && { shippedAt: new Date() }),
          ...(newStatus === "DELIVERED" && { deliveredAt: new Date() }),
          ...(newStatus === "CANCELLED" && { cancelledAt: new Date() }),
        },
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  sku: true,
                  name: true,
                  publicImages: true,
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

      // Create status history entry
      await tx.orderStatusHistory.create({
        data: {
          orderId,
          status: newStatus,
          notes,
        },
      });

      return order;
    });

    // Revalidate paths
    revalidatePath("/seller-portal");
    revalidatePath(`/seller-portal/orders/${orderId}`);

    console.log("✅ [SELLER PORTAL] Order status updated successfully");

    // Map to OrderDetails (similar to query)
    const details: OrderDetails = {
      id: updatedOrder.id,
      number: updatedOrder.number,
      status: updatedOrder.status as any,
      paymentStatus: updatedOrder.paymentStatus as any,
      fulfillmentStatus: updatedOrder.fulfillmentStatus as any,
      userId: updatedOrder.userId || undefined,
      customerEmail: updatedOrder.email,
      phone: updatedOrder.phone || undefined,
      total: Number(updatedOrder.total),
      subtotal: Number(updatedOrder.subtotal),
      taxAmount: Number(updatedOrder.taxAmount),
      shippingCost: Number(updatedOrder.shippingCost),
      discountAmount: Number(updatedOrder.discountAmount),
      productDiscounts: Number((updatedOrder as any).productDiscounts || 0),
      promotionDiscounts: Number((updatedOrder as any).promotionDiscounts || 0),
      couponDiscounts: Number((updatedOrder as any).couponDiscounts || 0),
      itemsCount: updatedOrder.items.reduce((sum, item) => sum + item.quantity, 0),
      placedAt: updatedOrder.placedAt,
      shippedAt: updatedOrder.shippedAt || undefined,
      deliveredAt: updatedOrder.deliveredAt || undefined,
      estimatedDelivery: updatedOrder.estimatedDelivery || undefined,
      trackingNumber: updatedOrder.trackingNumber || undefined,
      shippingAddress: updatedOrder.shippingAddress || undefined,
      shippingMethod: updatedOrder.shippingMethod || undefined,
      paymentMethod: updatedOrder.paymentMethod || undefined,
      customerNotes: updatedOrder.customerNotes || undefined,
      adminNotes: updatedOrder.adminNotes || undefined,
      items: updatedOrder.items.map((item) => ({
        id: item.id,
        productId: item.productId,
        productSku: item.productSku,
        productName: item.productName,
        productImage: item.productImage || undefined,
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice),
        total: Number(item.total),
      })),
      statusHistory: updatedOrder.statusHistory.map((history) => ({
        id: history.id,
        status: history.status as any,
        notes: history.notes || undefined,
        createdAt: history.createdAt,
      })),
    };

    return {
      success: true,
      data: details,
    };
  } catch (error) {
    console.error("❌ [SELLER PORTAL] Error updating order status:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update order status",
    };
  }
}

// ========================================
// 🚚 ADD TRACKING INFORMATION
// ========================================

export async function addTrackingInfoAction(
  data: TrackingUpdate
): Promise<ApiResponse<OrderDetails>> {
  try {
    console.log("🚚 [SELLER PORTAL] Adding tracking info:", data);

    // Update order with tracking info
    const updatedOrder = await prisma.$transaction(async (tx) => {
      // Update order
      const order = await tx.order.update({
        where: { id: data.orderId },
        data: {
          trackingNumber: data.trackingNumber,
          shippingMethod: data.shippingCarrier || undefined,
          estimatedDelivery: data.estimatedDelivery,
          // Automatically mark as SHIPPED if not already
          status: {
            set: "SHIPPED",
          },
          fulfillmentStatus: {
            set: "SHIPPED",
          },
          shippedAt: new Date(),
        },
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  sku: true,
                  name: true,
                  publicImages: true,
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

      // Create status history entry
      await tx.orderStatusHistory.create({
        data: {
          orderId: data.orderId,
          status: "SHIPPED",
          notes: data.notes || `Tracking: ${data.trackingNumber}`,
        },
      });

      return order;
    });

    // Revalidate paths
    revalidatePath("/seller-portal");
    revalidatePath(`/seller-portal/orders/${data.orderId}`);

    console.log("✅ [SELLER PORTAL] Tracking info added successfully");

    // Map to OrderDetails
    const details: OrderDetails = {
      id: updatedOrder.id,
      number: updatedOrder.number,
      status: updatedOrder.status as any,
      paymentStatus: updatedOrder.paymentStatus as any,
      fulfillmentStatus: updatedOrder.fulfillmentStatus as any,
      userId: updatedOrder.userId || undefined,
      customerEmail: updatedOrder.email,
      phone: updatedOrder.phone || undefined,
      total: Number(updatedOrder.total),
      subtotal: Number(updatedOrder.subtotal),
      taxAmount: Number(updatedOrder.taxAmount),
      shippingCost: Number(updatedOrder.shippingCost),
      discountAmount: Number(updatedOrder.discountAmount),
      productDiscounts: Number((updatedOrder as any).productDiscounts || 0),
      promotionDiscounts: Number((updatedOrder as any).promotionDiscounts || 0),
      couponDiscounts: Number((updatedOrder as any).couponDiscounts || 0),
      itemsCount: updatedOrder.items.reduce((sum, item) => sum + item.quantity, 0),
      placedAt: updatedOrder.placedAt,
      shippedAt: updatedOrder.shippedAt || undefined,
      deliveredAt: updatedOrder.deliveredAt || undefined,
      trackingNumber: updatedOrder.trackingNumber || undefined,
      estimatedDelivery: updatedOrder.estimatedDelivery || undefined,
      shippingAddress: updatedOrder.shippingAddress || undefined,
      shippingMethod: updatedOrder.shippingMethod || undefined,
      paymentMethod: updatedOrder.paymentMethod || undefined,
      customerNotes: updatedOrder.customerNotes || undefined,
      adminNotes: updatedOrder.adminNotes || undefined,
      items: updatedOrder.items.map((item) => ({
        id: item.id,
        productId: item.productId,
        productSku: item.productSku,
        productName: item.productName,
        productImage: item.productImage || undefined,
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice),
        total: Number(item.total),
      })),
      statusHistory: updatedOrder.statusHistory.map((history) => ({
        id: history.id,
        status: history.status as any,
        notes: history.notes || undefined,
        createdAt: history.createdAt,
      })),
    };

    return {
      success: true,
      data: details,
    };
  } catch (error) {
    console.error("❌ [SELLER PORTAL] Error adding tracking info:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to add tracking info",
    };
  }
}

// ========================================
// 📝 ADD ADMIN NOTES
// ========================================

export async function addAdminNotesAction(
  orderId: string,
  notes: string
): Promise<ApiResponse<{ notes: string }>> {
  try {
    console.log("📝 [SELLER PORTAL] Adding admin notes to order:", orderId);

    await prisma.order.update({
      where: { id: orderId },
      data: {
        adminNotes: notes,
      },
    });

    // Revalidate paths
    revalidatePath("/seller-portal");
    revalidatePath(`/seller-portal/orders/${orderId}`);

    console.log("✅ [SELLER PORTAL] Admin notes added successfully");

    return {
      success: true,
      data: { notes },
    };
  } catch (error) {
    console.error("❌ [SELLER PORTAL] Error adding admin notes:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to add admin notes",
    };
  }
}

// ========================================
// ❌ CANCEL ORDER
// ========================================

export async function cancelOrderAction(
  orderId: string,
  reason: string
): Promise<ApiResponse<OrderDetails>> {
  try {
    console.log("❌ [SELLER PORTAL] Cancelling order:", orderId);

    const updatedOrder = await prisma.$transaction(async (tx) => {
      // Update order
      const order = await tx.order.update({
        where: { id: orderId },
        data: {
          status: "CANCELLED",
          cancelledAt: new Date(),
          adminNotes: reason,
        },
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  sku: true,
                  name: true,
                  publicImages: true,
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

      // Create status history entry
      await tx.orderStatusHistory.create({
        data: {
          orderId,
          status: "CANCELLED",
          notes: reason,
        },
      });

      // TODO: Restore stock for cancelled items
      // This should be done through the inventory service

      return order;
    });

    // Revalidate paths
    revalidatePath("/seller-portal");
    revalidatePath(`/seller-portal/orders/${orderId}`);

    console.log("✅ [SELLER PORTAL] Order cancelled successfully");

    // Map to OrderDetails
    const details: OrderDetails = {
      id: updatedOrder.id,
      number: updatedOrder.number,
      status: updatedOrder.status as any,
      paymentStatus: updatedOrder.paymentStatus as any,
      fulfillmentStatus: updatedOrder.fulfillmentStatus as any,
      userId: updatedOrder.userId || undefined,
      customerEmail: updatedOrder.email,
      phone: updatedOrder.phone || undefined,
      total: Number(updatedOrder.total),
      subtotal: Number(updatedOrder.subtotal),
      taxAmount: Number(updatedOrder.taxAmount),
      shippingCost: Number(updatedOrder.shippingCost),
      discountAmount: Number(updatedOrder.discountAmount),
      productDiscounts: Number((updatedOrder as any).productDiscounts || 0),
      promotionDiscounts: Number((updatedOrder as any).promotionDiscounts || 0),
      couponDiscounts: Number((updatedOrder as any).couponDiscounts || 0),
      itemsCount: updatedOrder.items.reduce((sum, item) => sum + item.quantity, 0),
      placedAt: updatedOrder.placedAt,
      shippedAt: updatedOrder.shippedAt || undefined,
      deliveredAt: updatedOrder.deliveredAt || undefined,
      estimatedDelivery: updatedOrder.estimatedDelivery || undefined,
      trackingNumber: updatedOrder.trackingNumber || undefined,
      shippingAddress: updatedOrder.shippingAddress || undefined,
      shippingMethod: updatedOrder.shippingMethod || undefined,
      paymentMethod: updatedOrder.paymentMethod || undefined,
      customerNotes: updatedOrder.customerNotes || undefined,
      adminNotes: updatedOrder.adminNotes || undefined,
      items: updatedOrder.items.map((item) => ({
        id: item.id,
        productId: item.productId,
        productSku: item.productSku,
        productName: item.productName,
        productImage: item.productImage || undefined,
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice),
        total: Number(item.total),
      })),
      statusHistory: updatedOrder.statusHistory.map((history) => ({
        id: history.id,
        status: history.status as any,
        notes: history.notes || undefined,
        createdAt: history.createdAt,
      })),
    };

    return {
      success: true,
      data: details,
    };
  } catch (error) {
    console.error("❌ [SELLER PORTAL] Error cancelling order:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to cancel order",
    };
  }
}

// ========================================
// 📊 QUERY ACTIONS (Replaces API Routes)
// ========================================

/**
 * Get paginated orders with filters
 * Replaces: GET /api/seller-portal/orders
 */
export async function getOrdersAction(
  filters: OrderFilters = {},
  page: number = 1,
  pageSize: number = 20
): Promise<PaginatedResponse<OrderSummary>> {
  return await getOrdersQuery(filters, page, pageSize);
}

/**
 * Get single order details
 * Replaces: GET /api/seller-portal/orders/[id]
 */
export async function getOrderDetailsAction(
  orderId: string
): Promise<OrderDetails | null> {
  return await getOrderDetailsQuery(orderId);
}

/**
 * Get orders statistics
 * Replaces: GET /api/seller-portal/orders/stats
 */
export async function getOrdersStatsAction(filters: OrderFilters = {}) {
  return await getOrdersStatsQuery(filters);
}

/**
 * Get pending orders count
 * Replaces: GET /api/seller-portal/orders/pending-count
 */
export async function getPendingOrdersCountAction(): Promise<number> {
  return await getPendingOrdersCountQuery();
}
