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
import type { ActionResult } from "@/shared/types";
import { logger } from "@/shared/utils/logger";
import {
  addItemUseCase,
  updateItemQuantityUseCase,
  removeItemUseCase,
  clearSaleUseCase,
  applyDiscountUseCase,
} from "./use-cases";
import type {
  SaleWithSummaryResult,
  SaleItemMutationResult,
  SaleQuantityMutationResult,
  SaleValidationResult,
} from "./service";
import { mapErrorToActionResult } from "@/shared/errors";
import { createPOSError } from "../../errors";

type SaleSnapshot = SaleWithSummaryResult["sale"];
type SaleSummary = SaleWithSummaryResult["summary"];

type AddToSaleData = {
  sale: SaleSnapshot;
  summary: SaleSummary;
  addedItem: SaleItemMutationResult["item"] | null;
};

type UpdateSaleQuantityData = {
  sale: SaleSnapshot;
  summary: SaleSummary;
  updatedItem: SaleQuantityMutationResult["item"] | null;
};

type RemoveFromSaleData = {
  sale: SaleSnapshot;
  summary: SaleSummary;
  removedItemId: string;
};

// ========================================
// GET ACTIVE SALE
// ========================================

/**
 * Obtener venta activa
 */
export async function getActiveSaleAction(
  sessionId: string
): Promise<ActionResult<SaleWithSummaryResult>> {
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
    logger.error("POS Sale Action: get sale failed", { error });
    const fallback = createPOSError("SALE_FETCH_FAILED", {
      context: { sessionId },
    });
    return mapErrorToActionResult<SaleWithSummaryResult>(
      error,
      fallback.toJSON()
    );
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
): Promise<ActionResult<AddToSaleData>> {
  try {
    const { sale, summary, item } = await addItemUseCase(
      sessionId,
      productId,
      quantity
    );

    revalidatePath("/pos");

    const message = item?.product?.name
      ? `${item.product.name} added to sale`
      : undefined;

    return {
      success: true,
      data: {
        sale,
        summary,
        addedItem: item ?? null,
      },
      message,
    };
  } catch (error) {
    logger.error("POS Sale Action: add to sale failed", { error });
    const fallback = createPOSError("SALE_MUTATION_FAILED", {
      context: { sessionId, productId, quantity },
    });
    return mapErrorToActionResult<AddToSaleData>(error, fallback.toJSON());
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
): Promise<ActionResult<UpdateSaleQuantityData>> {
  try {
    const { sale, summary, item } = await updateItemQuantityUseCase(
      sessionId,
      itemId,
      quantity
    );

    revalidatePath("/pos");

    const message = item?.product?.name ? "Quantity updated" : undefined;

    return {
      success: true,
      data: {
        sale,
        summary,
        updatedItem: item ?? null,
      },
      message,
    };
  } catch (error) {
    logger.error("POS Sale Action: update quantity failed", { error });
    const fallback = createPOSError("SALE_MUTATION_FAILED", {
      context: { sessionId, itemId, quantity },
    });
    return mapErrorToActionResult<UpdateSaleQuantityData>(
      error,
      fallback.toJSON()
    );
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
): Promise<ActionResult<RemoveFromSaleData>> {
  try {
    const { sale, summary, isEmpty } = await removeItemUseCase(
      sessionId,
      itemId
    );

    revalidatePath("/pos");

    return {
      success: true,
      data: {
        sale,
        summary,
        removedItemId: itemId,
      },
      message: isEmpty
        ? "Item removed. Sale is now empty"
        : "Item removed from sale",
    };
  } catch (error) {
    logger.error("POS Sale Action: remove item failed", { error });
    const fallback = createPOSError("SALE_MUTATION_FAILED", {
      context: { sessionId, itemId },
    });
    return mapErrorToActionResult<RemoveFromSaleData>(
      error,
      fallback.toJSON()
    );
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
    await clearSaleUseCase(sessionId);

    revalidatePath("/pos");

    return {
      success: true,
      message: "Sale cleared successfully",
    };
  } catch (error) {
    logger.error("POS Sale Action: clear sale failed", { error });
    const fallback = createPOSError("SALE_MUTATION_FAILED", {
      context: { sessionId },
    });
    return mapErrorToActionResult<void>(error, fallback.toJSON());
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
): Promise<ActionResult<SaleWithSummaryResult>> {
  try {
    const { sale, summary, message } = await applyDiscountUseCase(
      sessionId,
      type,
      value
    );

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
    logger.error("POS Sale Action: apply discount failed", { error });
    const fallback = createPOSError("SALE_MUTATION_FAILED", {
      context: { sessionId, type, value },
    });
    return mapErrorToActionResult<SaleWithSummaryResult>(
      error,
      fallback.toJSON()
    );
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
): Promise<ActionResult<SaleValidationResult>> {
  try {
    const validation = await service.validateSaleForCheckout(sessionId);

    if (!validation.isValid) {
      const validationError = createPOSError("SALE_VALIDATION_FAILED", {
        hint: validation.errors.join(", "),
        context: { sessionId, validationErrors: validation.errors },
      });

      return {
        success: false,
        data: validation,
        error: validationError.toJSON(),
      };
    }

    return {
      success: true,
      data: validation,
    };
  } catch (error) {
    logger.error("POS Sale Action: validate sale failed", { error });
    const fallback = createPOSError("SALE_FETCH_FAILED", {
      context: { sessionId },
    });
    return mapErrorToActionResult<SaleValidationResult>(
      error,
      fallback.toJSON()
    );
  }
}
