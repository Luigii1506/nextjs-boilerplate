/**
 * 🛍️ POS Sale - Server Actions
 * ==============================
 *
 * Server Actions para operaciones de venta POS.
 * Similar a cart actions pero optimizado para POS.
 *
 * @module pos/sale/server/actions
 * @version 1.0.0
 */

"use server";

import { revalidatePath } from "next/cache";
import * as service from "./service";
import * as queries from "./queries";
import {
  AddToPOSCartSchema,
  UpdatePOSCartItemSchema,
  RemoveFromPOSCartSchema,
  ClearPOSCartSchema,
} from "../../schemas";
import type { ActionResult } from "@/shared/types";

// ========================================
// GET ACTIVE SALE
// ========================================

/**
 * Obtener venta activa
 */
export async function getActiveSaleAction(
  sessionId: string
): Promise<ActionResult<any>> {
  try {
    const { sale, summary } = await service.getSaleWithSummary(sessionId);

    return {
      success: true,
      data: {
        sale,
        summary,
      },
    };
  } catch (error) {
    console.error("[POS Sale Action] Get sale error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to get active sale",
    };
  }
}

// ========================================
// ADD TO SALE
// ========================================

/**
 * Agregar producto a la venta
 */
export async function addToSaleAction(
  sessionId: string,
  productId: string,
  quantity: number = 1
): Promise<ActionResult<any>> {
  try {
    // Validar input
    const validated = AddToPOSCartSchema.parse({
      sessionId,
      productId,
      quantity,
    });

    console.log("🧠 [POS Sale Action] addToSaleAction | validated", validated);

    // Agregar item
    const { item, summary } = await service.addItemWithValidation(
      validated.sessionId,
      validated.productId,
      validated.quantity
    );

    console.log("🧠 [POS Sale Action] addToSaleAction | item", item);
    console.log("🧠 [POS Sale Action] addToSaleAction | summary", summary);

    // Obtener sale completa actualizada
    const { sale } = await service.getSaleWithSummary(validated.sessionId);

    console.log("🧠 [POS Sale Action] addToSaleAction | full sale", sale);

    // Revalidate (opcional, depende de tu setup)
    revalidatePath("/pos");

    return {
      success: true,
      data: {
        sale,
        summary,
        addedItem: item,
      },
      message: `${item.product.name} added to sale`,
    };
  } catch (error) {
    console.error("[POS Sale Action] Add to sale error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to add item to sale",
    };
  }
}

// ========================================
// UPDATE QUANTITY
// ========================================

/**
 * Actualizar cantidad de un item
 */
export async function updateSaleQuantityAction(
  sessionId: string,
  itemId: string,
  quantity: number
): Promise<ActionResult<any>> {
  try {
    // Validar input
    const validated = UpdatePOSCartItemSchema.parse({
      cartItemId: itemId,
      quantity,
    });

    // Actualizar item
    const { item, summary } = await service.updateQuantityWithValidation(
      sessionId,
      validated.cartItemId,
      validated.quantity!
    );

    // Obtener sale completa actualizada
    const { sale } = await service.getSaleWithSummary(sessionId);

    revalidatePath("/pos");

    return {
      success: true,
      data: {
        sale,
        summary,
        updatedItem: item,
      },
      message: "Quantity updated",
    };
  } catch (error) {
    console.error("[POS Sale Action] Update quantity error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to update item quantity",
    };
  }
}

// ========================================
// REMOVE ITEM
// ========================================

/**
 * Eliminar item de la venta
 */
export async function removeFromSaleAction(
  sessionId: string,
  itemId: string
): Promise<ActionResult<any>> {
  try {
    // Validar input
    const validated = RemoveFromPOSCartSchema.parse({
      cartItemId: itemId,
    });

    // Eliminar item
    const { summary, isEmpty } = await service.removeItemWithCleanup(
      sessionId,
      validated.cartItemId
    );

    // Si quedó vacío, retornar null
    if (isEmpty) {
      revalidatePath("/pos");
      return {
        success: true,
        data: {
          sale: null,
          summary,
        },
        message: "Item removed. Sale is now empty",
      };
    }

    // Obtener sale actualizada
    const { sale } = await service.getSaleWithSummary(sessionId);

    revalidatePath("/pos");

    return {
      success: true,
      data: {
        sale,
        summary,
        removedItemId: itemId,
      },
      message: "Item removed from sale",
    };
  } catch (error) {
    console.error("[POS Sale Action] Remove item error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to remove item from sale",
    };
  }
}

// ========================================
// CLEAR SALE
// ========================================

/**
 * Limpiar toda la venta
 */
export async function clearSaleAction(
  sessionId: string
): Promise<ActionResult<void>> {
  try {
    // Validar input
    const validated = ClearPOSCartSchema.parse({
      sessionId,
    });

    // Limpiar venta
    await queries.clearSale(validated.sessionId);

    revalidatePath("/pos");

    return {
      success: true,
      message: "Sale cleared successfully",
    };
  } catch (error) {
    console.error("[POS Sale Action] Clear sale error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to clear sale",
    };
  }
}

// ========================================
// APPLY DISCOUNT
// ========================================

/**
 * Aplicar descuento a la venta
 */
export async function applyDiscountAction(
  sessionId: string,
  type: "percentage" | "fixed",
  value: number
): Promise<ActionResult<any>> {
  try {
    const { summary, message } = await service.applyDiscountToSale(
      sessionId,
      type,
      value
    );

    // Obtener sale actualizada
    const { sale } = await service.getSaleWithSummary(sessionId);

    revalidatePath("/pos");

    return {
      success: true,
      data: {
        sale,
        summary,
      },
      message,
    };
  } catch (error) {
    console.error("[POS Sale Action] Apply discount error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to apply discount",
    };
  }
}

// ========================================
// VALIDATE FOR CHECKOUT
// ========================================

/**
 * Validar venta para checkout
 */
export async function validateSaleForCheckoutAction(
  sessionId: string
): Promise<ActionResult<any>> {
  try {
    const validation = await service.validateSaleForCheckout(sessionId);

    return {
      success: validation.isValid,
      data: validation,
      error: validation.isValid ? undefined : validation.errors.join(", "),
    };
  } catch (error) {
    console.error("[POS Sale Action] Validate sale error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Validation failed",
    };
  }
}
