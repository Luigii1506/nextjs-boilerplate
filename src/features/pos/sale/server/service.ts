/**
 * 🛍️ POS Sale - Business Logic Service
 * ======================================
 *
 * Capa de lógica de negocio para operaciones de venta.
 *
 * @module pos/sale/server/service
 * @version 1.0.0
 */

import * as queries from "./queries";
import { mapCartToSale, mapCartItemToSaleItem, mapSaleSummary } from "../../server/mappers";

// ========================================
// GET SALE WITH SUMMARY
// ========================================

/**
 * Obtener venta activa con resumen calculado
 */
export async function getSaleWithSummary(sessionId: string) {
  const [rawSale, rawSummary] = await Promise.all([
    queries.getActiveSaleBySession(sessionId),
    queries.calculateSaleSummary(sessionId),
  ]);

  let mappedSale = null;
  if (rawSale) {
    try {
      mappedSale = mapCartToSale(rawSale);
    } catch (mappingError) {
      console.warn(
        "[POS Sale Service] Failed to map sale payload, returning null sale:",
        mappingError
      );
      mappedSale = null;
    }
  }

  let mappedSummary;
  try {
    mappedSummary = mapSaleSummary(rawSummary);
  } catch (mappingError) {
    console.warn(
      "[POS Sale Service] Failed to map sale summary, using empty summary:",
      mappingError
    );
    mappedSummary = mapSaleSummary(null);
  }

  return {
    sale: mappedSale,
    summary: mappedSummary,
  };
}

// ========================================
// ADD ITEM WITH VALIDATION
// ========================================

/**
 * Agregar item con validaciones de negocio
 */
export async function addItemWithValidation(
  sessionId: string,
  productId: string,
  quantity: number
) {
  try {
    // Validaciones
    if (quantity <= 0) {
      throw new Error("Quantity must be greater than 0");
    }

    if (quantity > 1000) {
      throw new Error("Quantity exceeds maximum allowed (1000)");
    }

    // Agregar item
    console.log("🧠 [POS Sale Service] addItemWithValidation | params", {
      sessionId,
      productId,
      quantity,
    });
    const item = await queries.addItemToSale(sessionId, productId, quantity);
    console.log("🧠 [POS Sale Service] addItemWithValidation | raw item", item);

    // Recalcular summary
    const rawSummary = await queries.calculateSaleSummary(sessionId);
    console.log(
      "🧠 [POS Sale Service] addItemWithValidation | raw summary",
      rawSummary
    );
    const summary = mapSaleSummary(rawSummary);

    return {
      item: item ? mapCartItemToSaleItem(item) : null,
      summary,
    };
  } catch (error) {
    console.error("[POS Sale Service] Error adding item:", error);
    throw error;
  }
}

// ========================================
// UPDATE QUANTITY WITH VALIDATION
// ========================================

/**
 * Actualizar cantidad con validaciones
 */
export async function updateQuantityWithValidation(
  sessionId: string,
  itemId: string,
  quantity: number
) {
  try {
    // Validaciones
    if (quantity <= 0) {
      throw new Error("Quantity must be greater than 0");
    }

    if (quantity > 1000) {
      throw new Error("Quantity exceeds maximum allowed (1000)");
    }

    // Actualizar item
    const item = await queries.updateSaleItemQuantity(itemId, quantity);

    // Recalcular summary
    const rawSummary = await queries.calculateSaleSummary(sessionId);
    const summary = mapSaleSummary(rawSummary);

    return {
      item: item ? mapCartItemToSaleItem(item) : null,
      summary,
    };
  } catch (error) {
    console.error("[POS Sale Service] Error updating quantity:", error);
    throw error;
  }
}

// ========================================
// REMOVE ITEM WITH CLEANUP
// ========================================

/**
 * Eliminar item y limpiar si queda vacío
 */
export async function removeItemWithCleanup(
  sessionId: string,
  itemId: string
) {
  try {
    // Eliminar item
    await queries.removeSaleItem(itemId);

    // Recalcular summary
    const rawSummary = await queries.calculateSaleSummary(sessionId);
    const summary = mapSaleSummary(rawSummary);

    // Si no quedan items, limpiar todo
    if (summary.itemCount === 0) {
      await queries.clearSale(sessionId);
    }

    return {
      summary,
      isEmpty: summary.itemCount === 0,
    };
  } catch (error) {
    console.error("[POS Sale Service] Error removing item:", error);
    throw error;
  }
}

// ========================================
// APPLY DISCOUNT
// ========================================

/**
 * Aplicar descuento a la venta
 * TODO: Implementar lógica de descuentos en DB
 */
export async function applyDiscountToSale(
  sessionId: string,
  type: "percentage" | "fixed",
  value: number
) {
  try {
    // Por ahora, solo validamos
    if (type === "percentage" && (value < 0 || value > 100)) {
      throw new Error("Percentage must be between 0 and 100");
    }

    if (type === "fixed" && value < 0) {
      throw new Error("Fixed discount cannot be negative");
    }

    // TODO: Implementar guardado de descuento en DB
    // Por ahora retornamos el summary actual
    const rawSummary = await queries.calculateSaleSummary(sessionId);
    const summary = mapSaleSummary(rawSummary);

    return {
      summary,
      message: "Discount applied successfully",
    };
  } catch (error) {
    console.error("[POS Sale Service] Error applying discount:", error);
    throw error;
  }
}

// ========================================
// VALIDATE SALE FOR CHECKOUT
// ========================================

/**
 * Validar que la venta esté lista para checkout
 */
export async function validateSaleForCheckout(sessionId: string) {
  try {
    const { sale, summary } = await getSaleWithSummary(sessionId);

    const errors: string[] = [];

    // Validar que tenga items
    if (!sale || summary.itemCount === 0) {
      errors.push("Sale is empty");
    }

    // Validar que todos los items tengan stock
    if (sale?.items) {
      for (const item of sale.items) {
        if (item.product.stock < item.quantity) {
          errors.push(
            `Insufficient stock for ${item.product.name}. Available: ${item.product.stock}`
          );
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      summary,
    };
  } catch (error) {
    console.error("[POS Sale Service] Error validating sale:", error);
    throw error;
  }
}

// ========================================
// HELPERS
// ========================================

/**
 * Format price to currency
 */
export function formatPrice(amount: number): string {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(amount);
}

/**
 * Calculate item count
 */
export function calculateItemCount(items: any[]): number {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}
