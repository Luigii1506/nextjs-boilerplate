/**
 * 🛍️ POS Sale - Database Queries
 * ================================
 *
 * Prisma queries specialized for the POS cart domain.
 * Uses the dedicated POS cart tables (pos_carts, pos_cart_items, pos_cart_adjustments)
 * introduced to decouple POS from the storefront cart implementation.
 *
 * @module pos/sale/server/queries
 * @version 2.0.0
 */

import { Prisma, POSCartStatus } from "@prisma/client";
import { prisma } from "@/core/database/prisma";
import { logger } from "@/shared/utils/logger";
import {
  computeCartTotal,
  computeLineTotals,
  roundCurrency,
} from "@/shared/utils/pricing";
import {
  type POSCartInclude,
  clearCartItems,
  createCart,
  defaultPOSCartInclude,
  findActiveCartBySession,
  recalculateCartTotals,
  removeCartItem,
  updateCart,
  upsertCartItem,
} from "./cart.repository";

const CART_EXPIRATION_DAYS = 7;
const DEFAULT_TAX_RATE = 0.16;

type POSCartWithRelations = Prisma.POSCartGetPayload<{
  include: POSCartInclude;
}>;

type LegacyCartWithItems = Prisma.CartGetPayload<{
  include: {
    items: {
      include: {
        product: {
          include: {
            category: true;
          };
        };
      };
    };
  };
}>;

const EMPTY_SUMMARY = {
  itemCount: 0,
  subtotal: 0,
  discount: 0,
  fees: 0,
  tax: 0,
  taxRate: DEFAULT_TAX_RATE,
  total: 0,
};

function computeCartExpiration(base = new Date()): Date {
  const expiresAt = new Date(base);
  expiresAt.setDate(expiresAt.getDate() + CART_EXPIRATION_DAYS);
  return expiresAt;
}

async function ensureSessionExists(sessionId: string) {
  const session = await prisma.pOSSession.findUnique({
    where: { id: sessionId },
  });

  if (!session) {
    throw new Error(`POS session ${sessionId} not found`);
  }

  return session;
}

async function fetchLegacyCart(sessionId: string): Promise<LegacyCartWithItems | null> {
  return prisma.cart.findFirst({
    where: { sessionId },
    include: {
      items: {
        include: {
          product: {
            include: {
              category: true,
            },
          },
        },
      },
    },
  });
}

async function migrateLegacyCartIfNeeded(
  sessionId: string,
  include: POSCartInclude
): Promise<POSCartWithRelations | null> {
  const legacyCart = await fetchLegacyCart(sessionId);

  if (!legacyCart) {
    return null;
  }

  logger.info("POS Sale Query: migrating legacy storefront cart to POS cart", {
    sessionId,
    cartId: legacyCart.id,
  });

  const totals = legacyCart.items.reduce(
    (acc, item) => {
      const unitPrice = Number(item.unitPrice ?? 0);
      const quantity = item.quantity ?? 0;
      const pricing = computeLineTotals({
        unitPrice,
        quantity,
        discount: 0,
        taxRate: DEFAULT_TAX_RATE,
      });
      const productSku = item.product?.sku ?? "UNKNOWN";
      const productName = item.product?.name ?? "Producto sin nombre";

      acc.items.push({
        product: {
          connect: { id: item.productId },
        },
        productName,
        productSku,
        quantity,
        unitPrice,
        discount: pricing.discount,
        tax: pricing.tax,
        subtotal: pricing.subtotal,
        total: pricing.total,
        metadata: {
          legacyCartId: legacyCart.id,
          legacyCartItemId: item.id,
        },
      });

      acc.subtotal += pricing.subtotal;
      acc.tax += pricing.tax;
      acc.total += pricing.total;
      acc.itemCount += quantity;
      return acc;
    },
    {
      items: [] as Prisma.POSCartItemCreateWithoutCartInput[],
      subtotal: 0,
      tax: 0,
      total: 0,
      itemCount: 0,
    }
  );

  const expiresAt = computeCartExpiration(legacyCart.expiresAt ?? new Date());

  const migratedCart = await prisma.$transaction(async (tx) => {
    const createdCart = await tx.pOSCart.create({
      data: {
        status: POSCartStatus.ACTIVE,
        session: {
          connect: { id: sessionId },
        },
        customerId: legacyCart.userId,
        subtotal: totals.subtotal,
        discount: 0,
        fees: 0,
        tax: totals.tax,
        total: totals.total,
        itemCount: totals.itemCount,
        expiresAt,
        items: {
          create: totals.items,
        },
      },
      include,
    });

    await tx.cartItem.deleteMany({
      where: { cartId: legacyCart.id },
    });

    await tx.cart.delete({
      where: { id: legacyCart.id },
    });

    return createdCart;
  });

  logger.info("POS Sale Query: legacy cart migrated successfully", {
    sessionId,
    migratedCartId: migratedCart.id,
  });

  return migratedCart;
}

async function ensureActiveCart(
  sessionId: string,
  include: POSCartInclude = defaultPOSCartInclude
): Promise<POSCartWithRelations> {
  const existingCart = await findActiveCartBySession(sessionId, include);
  if (existingCart) {
    return existingCart;
  }

  await ensureSessionExists(sessionId);

  const migrated = await migrateLegacyCartIfNeeded(sessionId, include);
  if (migrated) {
    return migrated;
  }

  const expiresAt = computeCartExpiration();

  return createCart(
    {
      status: POSCartStatus.ACTIVE,
      session: {
        connect: { id: sessionId },
      },
      expiresAt,
    },
    include
  );
}

// ========================================
// GET ACTIVE SALE
// ========================================

export async function getActiveSaleBySession(
  sessionId: string,
  include: POSCartInclude = defaultPOSCartInclude
) {
  try {
    return await ensureActiveCart(sessionId, include);
  } catch (error) {
    logger.error("POS Sale Query: get active sale failed", { sessionId, error });
    throw error;
  }
}

// ========================================
// ADD ITEM TO SALE
// ========================================

export async function addItemToSale(
  sessionId: string,
  productId: string,
  quantity: number
) {
  try {
    if (quantity <= 0) {
      throw new Error("Quantity must be greater than zero");
    }

    const cart = await ensureActiveCart(sessionId);

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        category: true,
      },
    });

    if (!product) {
      throw new Error("Product not found");
    }

    if (!product.isActive) {
      throw new Error("Product is not available for sale");
    }

    const existingItem = cart.items.find((item) => item.productId === productId);
    const newQuantity = (existingItem?.quantity ?? 0) + quantity;

    if (newQuantity <= 0) {
      throw new Error("Resulting quantity must be greater than zero");
    }

    if (product.stock < newQuantity) {
      throw new Error(`Insufficient stock. Available: ${product.stock}`);
    }

    const unitPrice = Number(product.price ?? 0);
    const pricing = computeLineTotals({
      unitPrice,
      quantity: newQuantity,
      discount: Number(existingItem?.discount ?? 0),
      taxRate: DEFAULT_TAX_RATE,
    });

    logger.debug("POS Sale Query: computed line totals", {
      sessionId,
      productId,
      unitPrice,
      quantity: newQuantity,
      pricing,
    });

    const updatedItem = await upsertCartItem(cart.id, productId, {
      cart: {
        connect: { id: cart.id },
      },
      product: {
        connect: { id: productId },
      },
      productName: product.name,
      productSku: product.sku,
      quantity: newQuantity,
      unitPrice,
      discount: pricing.discount,
      tax: pricing.tax,
      subtotal: pricing.subtotal,
      total: pricing.total,
      metadata: existingItem?.metadata as Prisma.InputJsonValue | undefined,
    });

    await recalculateCartTotals(cart.id);

    return updatedItem;
  } catch (error) {
    logger.error("POS Sale Query: add item failed", {
      sessionId,
      productId,
      quantity,
      error,
    });
    throw error;
  }
}

// ========================================
// UPDATE ITEM QUANTITY
// ========================================

export async function updateSaleItemQuantity(
  sessionId: string,
  itemId: string,
  quantity: number
) {
  try {
    if (quantity <= 0) {
      throw new Error("Quantity must be greater than zero");
    }

    const item = await prisma.pOSCartItem.findUnique({
      where: { id: itemId },
      include: {
        cart: true,
        product: {
          include: {
            category: true,
          },
        },
      },
    });

    if (!item || item.cart.sessionId !== sessionId) {
      throw new Error("Cart item not found for this session");
    }

    const product = item.product;

    if (!product) {
      throw new Error("Product not found");
    }

    if (product.stock < quantity) {
      throw new Error(`Insufficient stock. Available: ${product.stock}`);
    }

    const pricing = computeLineTotals({
      unitPrice: Number(item.unitPrice ?? 0),
      quantity,
      discount: Number(item.discount ?? 0),
      taxRate: DEFAULT_TAX_RATE,
    });

    logger.debug("POS Sale Query: recomputed line totals on update", {
      sessionId,
      itemId,
      quantity,
      pricing,
    });

    const updatedItem = await prisma.pOSCartItem.update({
      where: { id: itemId },
      data: {
        quantity,
        subtotal: pricing.subtotal,
        tax: pricing.tax,
        total: pricing.total,
      },
      include: {
        product: {
          include: {
            category: true,
          },
        },
      },
    });

    await recalculateCartTotals(item.cartId);

    return updatedItem;
  } catch (error) {
    logger.error("POS Sale Query: update item failed", {
      sessionId,
      itemId,
      quantity,
      error,
    });
    throw error;
  }
}

// ========================================
// REMOVE ITEM
// ========================================

export async function removeSaleItem(sessionId: string, itemId: string) {
  try {
    const item = await prisma.pOSCartItem.findUnique({
      where: { id: itemId },
      include: {
        cart: true,
      },
    });

    if (!item || item.cart.sessionId !== sessionId) {
      throw new Error("Cart item not found for this session");
    }

    const deletedItem = await removeCartItem(itemId);
    await recalculateCartTotals(item.cartId);

    return deletedItem;
  } catch (error) {
    logger.error("POS Sale Query: remove item failed", {
      sessionId,
      itemId,
      error,
    });
    throw error;
  }
}

// ========================================
// CLEAR SALE
// ========================================

export async function clearSale(sessionId: string) {
  try {
    const cart = await findActiveCartBySession(sessionId);

    if (!cart) {
      return null;
    }

    await clearCartItems(cart.id);

    await updateCart(cart.id, {
      status: POSCartStatus.ACTIVE,
      adjustments: {
        deleteMany: {},
      },
    });

    return cart;
  } catch (error) {
    logger.error("POS Sale Query: clear sale failed", {
      sessionId,
      error,
    });
    throw error;
  }
}

// ========================================
// CALCULATE SUMMARY
// ========================================

export async function calculateSaleSummary(sessionId: string) {
  try {
    const cart = await findActiveCartBySession(sessionId);

    if (!cart || cart.items.length === 0) {
      return { ...EMPTY_SUMMARY };
    }

    const subtotal = roundCurrency(Number(cart.subtotal ?? 0));
    const discount = roundCurrency(Number(cart.discount ?? 0));
    const fees = roundCurrency(Number(cart.fees ?? 0));
    const tax = roundCurrency(Number(cart.tax ?? 0));
    const total = roundCurrency(Number(cart.total ?? 0));

    const taxableBase = Math.max(subtotal - discount + fees, 0);
    const taxRate =
      taxableBase > 0 ? roundCurrency(tax / taxableBase, 4) : DEFAULT_TAX_RATE;

    return {
      itemCount: cart.itemCount ?? cart.items.reduce((sum, item) => sum + item.quantity, 0),
      subtotal,
      discount,
      fees,
      tax,
      taxRate,
      total,
    };
  } catch (error) {
    logger.error("POS Sale Query: calculate summary failed", {
      sessionId,
      error,
    });
    throw error;
  }
}
