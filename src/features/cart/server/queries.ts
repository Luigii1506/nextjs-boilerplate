/**
 * 🛒 CART QUERIES
 * ================
 *
 * Data Access Layer - Database queries for Cart operations
 * Clean Architecture: Infrastructure Layer (Database)
 * Following Feature-First v3.0.0 patterns
 *
 * @version 1.0.0 - Cart Feature
 */

import { prisma } from "@/core/database/prisma";
import type {
  Cart,
  CartWithItems,
  CartItem,
  AddToCartInput,
  UpdateCartItemInput,
  RemoveFromCartInput,
} from "../types";

// 🏷️ Raw query result interfaces (aligned with Prisma)
export interface RawCartQueryResult {
  id: string;
  sessionId: string | null;
  userId: string | null;
  subtotal: any; // Prisma Decimal
  taxAmount: any; // Prisma Decimal
  total: any; // Prisma Decimal
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date;
  items: RawCartItemQueryResult[];
}

export interface RawCartItemQueryResult {
  id: string;
  cartId: string;
  productId: string;
  quantity: number;
  unitPrice: any; // Prisma Decimal
  total: any; // Prisma Decimal
  createdAt: Date;
  updatedAt: Date;

  // Product relation (when included)
  product?: {
    id: string;
    sku: string;
    name: string;
    description: string | null;
    categoryId: string;
    price: any; // Prisma Decimal
    stock: number;
    unit: string;
    images: string[];
    tags: string[];
    isActive: boolean;
    isWishlisted?: boolean; // From wishlist join
    category?: {
      id: string;
      name: string;
      slug: string;
    };
  };
}

// 🔍 CART QUERIES
// ===============

/**
 * Get cart by user ID or session ID with all items and products
 */
export async function getCartQuery(options: {
  userId?: string;
  sessionId?: string;
  includeInactive?: boolean;
}): Promise<RawCartQueryResult | null> {
  const { userId, sessionId, includeInactive = false } = options;

  if (!userId && !sessionId) {
    throw new Error("Either userId or sessionId is required");
  }

  console.log("🔍 [CART QUERY] Getting cart:", {
    userId,
    sessionId,
    includeInactive,
  });

  try {
    const cart = await prisma.cart.findFirst({
      where: {
        OR: [
          ...(userId ? [{ userId }] : []),
          ...(sessionId ? [{ sessionId }] : []),
        ],
        // Only get non-expired carts
        expiresAt: {
          gt: new Date(),
        },
      },
      include: {
        items: {
          include: {
            product: {
              include: {
                category: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
          orderBy: {
            createdAt: "asc", // Oldest items first
          },
        },
      },
      orderBy: {
        updatedAt: "desc", // Most recently updated cart
      },
    });

    if (!cart) {
      console.log("🔍 [CART QUERY] No cart found");
      return null;
    }

    // Filter out items with inactive products if not including inactive
    if (!includeInactive) {
      cart.items = cart.items.filter((item) => item.product?.isActive);
    }

    console.log("✅ [CART QUERY] Cart found:", {
      cartId: cart.id,
      itemsCount: cart.items.length,
      total: cart.total,
    });

    return cart;
  } catch (error) {
    console.error("❌ [CART QUERY] Error getting cart:", error);
    throw error;
  }
}

/**
 * Add item to cart - creates cart if doesn't exist
 */
export async function addToCartQuery(input: AddToCartInput): Promise<{
  cart: RawCartQueryResult;
  addedItem: RawCartItemQueryResult;
  isNewCart: boolean;
}> {
  const { productId, quantity = 1, userId, sessionId } = input;

  if (!userId && !sessionId) {
    throw new Error("Either userId or sessionId is required");
  }

  console.log("➕ [ADD TO CART] Starting:", {
    productId,
    quantity,
    userId,
    sessionId,
  });

  try {
    return await prisma.$transaction(async (tx) => {
      // 1. Verify product exists and get current price
      const product = await tx.product.findUnique({
        where: { id: productId },
        select: {
          id: true,
          name: true,
          price: true,
          stock: true,
          isActive: true,
        },
      });

      if (!product) {
        throw new Error(`Product with ID ${productId} not found`);
      }

      if (!product.isActive) {
        throw new Error(`Product ${product.name} is not active`);
      }

      if (product.stock < quantity) {
        throw new Error(
          `Insufficient stock. Available: ${product.stock}, requested: ${quantity}`
        );
      }

      const unitPrice = Number(product.price);
      const totalPrice = unitPrice * quantity;

      // 2. Find or create cart
      let cart = await tx.cart.findFirst({
        where: {
          OR: [
            ...(userId ? [{ userId }] : []),
            ...(sessionId ? [{ sessionId }] : []),
          ],
          expiresAt: {
            gt: new Date(),
          },
        },
        include: {
          items: true,
        },
      });

      let isNewCart = false;

      if (!cart) {
        // Create new cart
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30); // 30 days expiry

        cart = await tx.cart.create({
          data: {
            userId,
            sessionId,
            subtotal: totalPrice,
            taxAmount: 0, // Will be calculated in service layer
            total: totalPrice,
            expiresAt,
          },
          include: {
            items: true,
          },
        });

        isNewCart = true;
        console.log("🆕 [ADD TO CART] Created new cart:", cart.id);
      }

      // 3. Check if item already exists in cart
      const existingItem = await tx.cartItem.findUnique({
        where: {
          cartId_productId: {
            cartId: cart.id,
            productId,
          },
        },
      });

      let addedItem: RawCartItemQueryResult;

      if (existingItem) {
        // Update existing item
        const newQuantity = existingItem.quantity + quantity;
        const newTotal = unitPrice * newQuantity;

        addedItem = await tx.cartItem.update({
          where: { id: existingItem.id },
          data: {
            quantity: newQuantity,
            total: newTotal,
          },
          include: {
            product: {
              include: {
                category: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        });

        console.log("🔄 [ADD TO CART] Updated existing item:", {
          itemId: existingItem.id,
          oldQuantity: existingItem.quantity,
          newQuantity,
        });
      } else {
        // Create new cart item
        addedItem = await tx.cartItem.create({
          data: {
            cartId: cart.id,
            productId,
            quantity,
            unitPrice,
            total: totalPrice,
          },
          include: {
            product: {
              include: {
                category: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        });

        console.log("➕ [ADD TO CART] Created new item:", addedItem.id);
      }

      // 4. Recalculate cart totals
      const cartItems = await tx.cartItem.findMany({
        where: { cartId: cart.id },
      });

      const newSubtotal = cartItems.reduce(
        (sum, item) => sum + Number(item.total),
        0
      );
      const newTaxAmount = 0; // TODO: Calculate tax
      const newTotal = newSubtotal + newTaxAmount;

      // 5. Update cart totals
      const updatedCart = await tx.cart.update({
        where: { id: cart.id },
        data: {
          subtotal: newSubtotal,
          taxAmount: newTaxAmount,
          total: newTotal,
        },
        include: {
          items: {
            include: {
              product: {
                include: {
                  category: {
                    select: {
                      id: true,
                      name: true,
                    },
                  },
                },
              },
            },
            orderBy: {
              createdAt: "asc",
            },
          },
        },
      });

      console.log("✅ [ADD TO CART] Success:", {
        cartId: cart.id,
        itemId: addedItem.id,
        newSubtotal,
        newTotal,
        isNewCart,
      });

      return {
        cart: updatedCart,
        addedItem,
        isNewCart,
      };
    });
  } catch (error) {
    console.error("❌ [ADD TO CART] Error:", error);
    throw error;
  }
}

/**
 * Update cart item quantity
 */
export async function updateCartItemQuery(input: UpdateCartItemInput): Promise<{
  cart: RawCartQueryResult;
  updatedItem: RawCartItemQueryResult;
}> {
  const { cartItemId, quantity, userId, sessionId } = input;

  console.log("🔄 [UPDATE CART ITEM] Starting:", {
    cartItemId,
    quantity,
    userId,
    sessionId,
  });

  try {
    return await prisma.$transaction(async (tx) => {
      // 1. Find cart item and verify ownership
      const cartItem = await tx.cartItem.findUnique({
        where: { id: cartItemId },
        include: {
          cart: true,
          product: {
            select: {
              id: true,
              name: true,
              price: true,
              stock: true,
              isActive: true,
            },
          },
        },
      });

      if (!cartItem) {
        throw new Error(`Cart item with ID ${cartItemId} not found`);
      }

      // Verify cart ownership
      const cart = cartItem.cart;
      if (userId && cart.userId !== userId) {
        throw new Error("Cart does not belong to user");
      }
      if (sessionId && cart.sessionId !== sessionId) {
        throw new Error("Cart does not belong to session");
      }

      // Check if cart is expired
      if (cart.expiresAt <= new Date()) {
        throw new Error("Cart has expired");
      }

      const product = cartItem.product;
      if (!product?.isActive) {
        throw new Error(`Product ${product?.name || "Unknown"} is not active`);
      }

      if (product.stock < quantity) {
        throw new Error(
          `Insufficient stock. Available: ${product.stock}, requested: ${quantity}`
        );
      }

      // 2. Update cart item
      const unitPrice = Number(product.price);
      const newTotal = unitPrice * quantity;

      const updatedItem = await tx.cartItem.update({
        where: { id: cartItemId },
        data: {
          quantity,
          unitPrice, // Update price in case it changed
          total: newTotal,
        },
        include: {
          product: {
            include: {
              category: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      });

      // 3. Recalculate cart totals
      const cartItems = await tx.cartItem.findMany({
        where: { cartId: cart.id },
      });

      const newSubtotal = cartItems.reduce(
        (sum, item) => sum + Number(item.total),
        0
      );
      const newTaxAmount = 0; // TODO: Calculate tax
      const newCartTotal = newSubtotal + newTaxAmount;

      // 4. Update cart totals
      const updatedCart = await tx.cart.update({
        where: { id: cart.id },
        data: {
          subtotal: newSubtotal,
          taxAmount: newTaxAmount,
          total: newCartTotal,
        },
        include: {
          items: {
            include: {
              product: {
                include: {
                  category: {
                    select: {
                      id: true,
                      name: true,
                    },
                  },
                },
              },
            },
            orderBy: {
              createdAt: "asc",
            },
          },
        },
      });

      console.log("✅ [UPDATE CART ITEM] Success:", {
        itemId: cartItemId,
        oldQuantity: cartItem.quantity,
        newQuantity: quantity,
        newTotal: newCartTotal,
      });

      return {
        cart: updatedCart,
        updatedItem,
      };
    });
  } catch (error) {
    console.error("❌ [UPDATE CART ITEM] Error:", error);
    throw error;
  }
}

/**
 * Remove item from cart
 */
export async function removeFromCartQuery(input: RemoveFromCartInput): Promise<{
  cart: RawCartQueryResult;
  removedItemId: string;
}> {
  const { cartItemId, userId, sessionId } = input;

  console.log("🗑️ [REMOVE FROM CART] Starting:", {
    cartItemId,
    userId,
    sessionId,
  });

  try {
    return await prisma.$transaction(async (tx) => {
      // 1. Find cart item and verify ownership
      const cartItem = await tx.cartItem.findUnique({
        where: { id: cartItemId },
        include: {
          cart: true,
        },
      });

      if (!cartItem) {
        throw new Error(`Cart item with ID ${cartItemId} not found`);
      }

      // Verify cart ownership
      const cart = cartItem.cart;
      if (userId && cart.userId !== userId) {
        throw new Error("Cart does not belong to user");
      }
      if (sessionId && cart.sessionId !== sessionId) {
        throw new Error("Cart does not belong to session");
      }

      // 2. Remove cart item
      await tx.cartItem.delete({
        where: { id: cartItemId },
      });

      // 3. Recalculate cart totals
      const remainingItems = await tx.cartItem.findMany({
        where: { cartId: cart.id },
      });

      const newSubtotal = remainingItems.reduce(
        (sum, item) => sum + Number(item.total),
        0
      );
      const newTaxAmount = 0; // TODO: Calculate tax
      const newTotal = newSubtotal + newTaxAmount;

      // 4. Update cart totals
      const updatedCart = await tx.cart.update({
        where: { id: cart.id },
        data: {
          subtotal: newSubtotal,
          taxAmount: newTaxAmount,
          total: newTotal,
        },
        include: {
          items: {
            include: {
              product: {
                include: {
                  category: {
                    select: {
                      id: true,
                      name: true,
                    },
                  },
                },
              },
            },
            orderBy: {
              createdAt: "asc",
            },
          },
        },
      });

      console.log("✅ [REMOVE FROM CART] Success:", {
        removedItemId: cartItemId,
        remainingItems: remainingItems.length,
        newTotal,
      });

      return {
        cart: updatedCart,
        removedItemId: cartItemId,
      };
    });
  } catch (error) {
    console.error("❌ [REMOVE FROM CART] Error:", error);
    throw error;
  }
}

/**
 * Clear entire cart
 */
export async function clearCartQuery(options: {
  userId?: string;
  sessionId?: string;
}): Promise<{
  cart: RawCartQueryResult;
  removedCount: number;
}> {
  const { userId, sessionId } = options;

  if (!userId && !sessionId) {
    throw new Error("Either userId or sessionId is required");
  }

  console.log("🧹 [CLEAR CART] Starting:", { userId, sessionId });

  try {
    return await prisma.$transaction(async (tx) => {
      // 1. Find cart
      const cart = await tx.cart.findFirst({
        where: {
          OR: [
            ...(userId ? [{ userId }] : []),
            ...(sessionId ? [{ sessionId }] : []),
          ],
          expiresAt: {
            gt: new Date(),
          },
        },
        include: {
          items: true,
        },
      });

      if (!cart) {
        throw new Error("Cart not found");
      }

      const removedCount = cart.items.length;

      // 2. Remove all cart items
      await tx.cartItem.deleteMany({
        where: { cartId: cart.id },
      });

      // 3. Update cart totals to zero
      const updatedCart = await tx.cart.update({
        where: { id: cart.id },
        data: {
          subtotal: 0,
          taxAmount: 0,
          total: 0,
        },
        include: {
          items: {
            include: {
              product: {
                include: {
                  category: {
                    select: {
                      id: true,
                      name: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      console.log("✅ [CLEAR CART] Success:", {
        cartId: cart.id,
        removedCount,
      });

      return {
        cart: updatedCart,
        removedCount,
      };
    });
  } catch (error) {
    console.error("❌ [CLEAR CART] Error:", error);
    throw error;
  }
}

/**
 * Cleanup expired carts (utility function)
 */
export async function cleanupExpiredCartsQuery(): Promise<number> {
  console.log("🧹 [CLEANUP EXPIRED CARTS] Starting cleanup...");

  try {
    const result = await prisma.cart.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });

    console.log(
      `✅ [CLEANUP EXPIRED CARTS] Removed ${result.count} expired carts`
    );
    return result.count;
  } catch (error) {
    console.error("❌ [CLEANUP EXPIRED CARTS] Error:", error);
    throw error;
  }
}
