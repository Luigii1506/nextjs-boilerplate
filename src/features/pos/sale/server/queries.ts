/**
 * 🛍️ POS Sale - Database Queries
 * ================================
 *
 * Prisma queries para operaciones de venta.
 *
 * @module pos/sale/server/queries
 * @version 1.0.0
 */

import { prisma } from "@/core/database/prisma";
import type { POSSaleItem, POSSaleItemWithProduct } from "../types";

// ========================================
// GET ACTIVE SALE
// ========================================

/**
 * Obtener venta activa por sessionId
 */
export async function getActiveSaleBySession(sessionId: string) {
  try {
    // Por ahora usamos la tabla Cart de storefront
    // TODO: Crear tabla POSSale específica si es necesario
    const sale = await prisma.cart.findFirst({
      where: {
        sessionId,
        // No tiene userId (es para POS)
      },
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

    return sale;
  } catch (error) {
    console.error("[POS Sale] Error getting active sale:", error);
    throw new Error("Failed to get active sale");
  }
}

// ========================================
// ADD ITEM TO SALE
// ========================================

/**
 * Agregar item a la venta
 */
export async function addItemToSale(
  sessionId: string,
  productId: string,
  quantity: number
) {
  try {
    // 1. Obtener o crear carrito
    let cart = await prisma.cart.findFirst({
      where: { sessionId },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: {
          sessionId,
          // userId es opcional para POS
        },
      });
    }

    // 2. Obtener producto con precio
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { category: true },
    });

    if (!product) {
      throw new Error("Product not found");
    }

    // 3. Verificar stock
    if (product.stock < quantity) {
      throw new Error(`Insufficient stock. Available: ${product.stock}`);
    }

    // 4. Verificar si ya existe el item
    const existingItem = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId,
      },
    });

    let cartItem;
    const unitPrice = Number(product.price);

    if (existingItem) {
      // Actualizar cantidad
      const newQuantity = existingItem.quantity + quantity;
      const subtotal = unitPrice * newQuantity;
      const total = subtotal; // Sin descuentos por ahora

      cartItem = await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: {
          quantity: newQuantity,
          unitPrice,
          subtotal,
          total,
        },
        include: {
          product: {
            include: { category: true },
          },
        },
      });
    } else {
      // Crear nuevo item
      const subtotal = unitPrice * quantity;
      const total = subtotal;

      cartItem = await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          quantity,
          unitPrice,
          subtotal,
          total,
        },
        include: {
          product: {
            include: { category: true },
          },
        },
      });
    }

    return cartItem;
  } catch (error) {
    console.error("[POS Sale] Error adding item:", error);
    throw error;
  }
}

// ========================================
// UPDATE ITEM QUANTITY
// ========================================

/**
 * Actualizar cantidad de un item
 */
export async function updateSaleItemQuantity(
  itemId: string,
  quantity: number
) {
  try {
    // 1. Obtener item actual
    const item = await prisma.cartItem.findUnique({
      where: { id: itemId },
      include: { product: true },
    });

    if (!item) {
      throw new Error("Item not found");
    }

    // 2. Verificar stock
    if (item.product.stock < quantity) {
      throw new Error(`Insufficient stock. Available: ${item.product.stock}`);
    }

    // 3. Actualizar item
    const unitPrice = Number(item.unitPrice);
    const subtotal = unitPrice * quantity;
    const total = subtotal;

    const updatedItem = await prisma.cartItem.update({
      where: { id: itemId },
      data: {
        quantity,
        subtotal,
        total,
      },
      include: {
        product: {
          include: { category: true },
        },
      },
    });

    return updatedItem;
  } catch (error) {
    console.error("[POS Sale] Error updating item:", error);
    throw error;
  }
}

// ========================================
// REMOVE ITEM
// ========================================

/**
 * Eliminar item de la venta
 */
export async function removeSaleItem(itemId: string) {
  try {
    const deletedItem = await prisma.cartItem.delete({
      where: { id: itemId },
    });

    return deletedItem;
  } catch (error) {
    console.error("[POS Sale] Error removing item:", error);
    throw error;
  }
}

// ========================================
// CLEAR SALE
// ========================================

/**
 * Limpiar toda la venta
 */
export async function clearSale(sessionId: string) {
  try {
    const cart = await prisma.cart.findFirst({
      where: { sessionId },
    });

    if (!cart) {
      return null;
    }

    // Eliminar todos los items
    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    // Eliminar el carrito
    await prisma.cart.delete({
      where: { id: cart.id },
    });

    return cart;
  } catch (error) {
    console.error("[POS Sale] Error clearing sale:", error);
    throw error;
  }
}

// ========================================
// CALCULATE SUMMARY
// ========================================

/**
 * Calcular resumen de la venta
 */
export async function calculateSaleSummary(sessionId: string) {
  try {
    const cart = await prisma.cart.findFirst({
      where: { sessionId },
      include: {
        items: true,
      },
    });

    if (!cart || cart.items.length === 0) {
      return {
        itemCount: 0,
        subtotal: 0,
        discount: 0,
        discountPercentage: 0,
        tax: 0,
        taxRate: 0.16, // 16% IVA México
        total: 0,
      };
    }

    // Calcular totales
    const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = cart.items.reduce(
      (sum, item) => sum + Number(item.subtotal),
      0
    );

    // Tax (16% IVA en México)
    const taxRate = 0.16;
    const tax = subtotal * taxRate;

    // Por ahora sin descuentos
    const discount = 0;
    const discountPercentage = 0;

    const total = subtotal + tax - discount;

    return {
      itemCount,
      subtotal,
      discount,
      discountPercentage,
      tax,
      taxRate,
      total,
    };
  } catch (error) {
    console.error("[POS Sale] Error calculating summary:", error);
    throw error;
  }
}
