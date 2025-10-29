/**
 * 🗄️ POS Cart Repository
 * =======================
 *
 * Low-level Prisma operations for the POS cart domain.
 * This layer isolates direct database access so higher layers (services/actions)
 * can focus on business orchestration.
 *
 * @module pos/sale/server/cart.repository
 * @version 1.0.0
 */

import { POSCartStatus, type Prisma } from "@prisma/client";
import { prisma } from "@/core/database/prisma";
import { logger } from "@/shared/utils/logger";
import { computeCartTotal, roundCurrency } from "@/shared/utils/pricing";

export type POSCartInclude = Prisma.POSCartInclude;

export const defaultPOSCartInclude: POSCartInclude = {
  items: {
    include: {
      product: {
        include: {
          category: true,
        },
      },
    },
  },
  adjustments: true,
};

export async function findActiveCartBySession(
  sessionId: string,
  include: POSCartInclude = defaultPOSCartInclude
) {
  try {
    return await prisma.pOSCart.findFirst({
      where: {
        sessionId,
        status: POSCartStatus.ACTIVE,
      },
      include,
    });
  } catch (error) {
    logger.error("POS Cart Repository: findActiveCartBySession failed", {
      sessionId,
      error,
    });
    throw error;
  }
}

export async function createCart(
  input: Prisma.POSCartCreateInput,
  include: POSCartInclude = defaultPOSCartInclude
) {
  try {
    return await prisma.pOSCart.create({
      data: input,
      include,
    });
  } catch (error) {
    logger.error("POS Cart Repository: createCart failed", {
      input,
      error,
    });
    throw error;
  }
}

export async function updateCart(
  cartId: string,
  data: Prisma.POSCartUpdateInput,
  include: POSCartInclude = defaultPOSCartInclude
) {
  try {
    return await prisma.pOSCart.update({
      where: { id: cartId },
      data,
      include,
    });
  } catch (error) {
    logger.error("POS Cart Repository: updateCart failed", {
      cartId,
      error,
    });
    throw error;
  }
}

export async function upsertCartItem(
  cartId: string,
  productId: string,
  data: Prisma.POSCartItemCreateInput
) {
  try {
    return await prisma.pOSCartItem.upsert({
      where: {
        cartId_productId: {
          cartId,
          productId,
        },
      },
      update: {
        quantity: data.quantity,
        unitPrice: data.unitPrice,
        discount: data.discount ?? 0,
        tax: data.tax ?? 0,
        subtotal: data.subtotal,
        total: data.total,
        productName: data.productName,
        productSku: data.productSku,
        metadata: data.metadata,
      },
      create: data,
      include: {
        product: {
          include: {
            category: true,
          },
        },
      },
    });
  } catch (error) {
    logger.error("POS Cart Repository: upsertCartItem failed", {
      cartId,
      productId,
      error,
    });
    throw error;
  }
}

export async function removeCartItem(itemId: string) {
  try {
    return await prisma.pOSCartItem.delete({
      where: { id: itemId },
    });
  } catch (error) {
    logger.error("POS Cart Repository: removeCartItem failed", {
      itemId,
      error,
    });
    throw error;
  }
}

export async function clearCartItems(cartId: string) {
  try {
    await prisma.$transaction([
      prisma.pOSCartItem.deleteMany({
        where: { cartId },
      }),
      prisma.pOSCartAdjustment.deleteMany({
        where: { cartId },
      }),
      prisma.pOSCart.update({
        where: { id: cartId },
        data: {
          itemCount: 0,
          subtotal: 0,
          discount: 0,
          fees: 0,
          tax: 0,
          total: 0,
        },
      }),
    ]);
  } catch (error) {
    logger.error("POS Cart Repository: clearCartItems failed", {
      cartId,
      error,
    });
    throw error;
  }
}

export async function deleteCart(cartId: string) {
  try {
    return await prisma.pOSCart.delete({
      where: { id: cartId },
    });
  } catch (error) {
    logger.error("POS Cart Repository: deleteCart failed", {
      cartId,
      error,
    });
    throw error;
  }
}

export async function recalculateCartTotals(cartId: string) {
  try {
    const cartWithItems = await prisma.pOSCart.findUnique({
      where: { id: cartId },
      include: {
        items: true,
        adjustments: true,
      },
    });

    if (!cartWithItems) {
      return null;
    }

    const subtotal = roundCurrency(
      cartWithItems.items.reduce((sum, item) => sum + Number(item.subtotal), 0)
    );

    const adjustmentTotals =
      cartWithItems.adjustments?.reduce(
        (acc, adjustment) => {
          const amount = Number(adjustment.amount);
          if (amount < 0) {
            acc.discount += Math.abs(amount);
          } else if (amount > 0) {
            acc.fees += amount;
          }
          return acc;
        },
        { discount: 0, fees: 0 }
      ) ?? { discount: 0, fees: 0 };

    const discount = roundCurrency(adjustmentTotals.discount);
    const fees = roundCurrency(adjustmentTotals.fees);

    const tax = roundCurrency(
      cartWithItems.items.reduce((sum, item) => sum + Number(item.tax), 0)
    );

    const total = computeCartTotal({
      subtotal,
      discountAmount: discount,
      feesAmount: fees,
      taxAmount: tax,
    });

    const itemCount = cartWithItems.items.reduce(
      (sum, item) => sum + item.quantity,
      0
    );

    return await prisma.pOSCart.update({
      where: { id: cartId },
      data: {
        subtotal,
        discount,
        fees,
        tax,
        total,
        itemCount,
      },
      include: defaultPOSCartInclude,
    });
  } catch (error) {
    logger.error("POS Cart Repository: recalculateCartTotals failed", {
      cartId,
      error,
    });
    throw error;
  }
}

export async function addCartAdjustment(
  cartId: string,
  data: Prisma.POSCartAdjustmentCreateInput
) {
  try {
    return await prisma.pOSCartAdjustment.create({
      data,
    });
  } catch (error) {
    logger.error("POS Cart Repository: addCartAdjustment failed", {
      cartId,
      error,
    });
    throw error;
  }
}

export async function finalizeCartCheckout(
  cartId: string,
  status: POSCartStatus = POSCartStatus.CHECKED_OUT
) {
  try {
    await prisma.$transaction([
      prisma.pOSCartItem.deleteMany({
        where: { cartId },
      }),
      prisma.pOSCartAdjustment.deleteMany({
        where: { cartId },
      }),
      prisma.pOSCart.update({
        where: { id: cartId },
        data: {
          status,
          itemCount: 0,
          subtotal: 0,
          discount: 0,
          fees: 0,
          tax: 0,
          total: 0,
        },
      }),
    ]);
  } catch (error) {
    logger.error("POS Cart Repository: finalizeCartCheckout failed", {
      cartId,
      error,
    });
    throw error;
  }
}
