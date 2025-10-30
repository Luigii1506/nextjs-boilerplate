/**
 * 🛍️ Update Item Quantity Use-Case
 * =================================
 *
 * Wraps validation and domain logic for updating an item's quantity in the POS sale.
 */

import { UpdatePOSCartItemSchema } from "../../../schemas";
import * as service from "../service";
import { logger } from "@/shared/utils/logger";
import { createPOSError } from "../../../errors";
import { isAppError } from "@/shared/errors";

export async function updateItemQuantityUseCase(
  sessionId: string,
  itemId: string,
  quantity: number
) {
  try {
    const validated = UpdatePOSCartItemSchema.parse({
      cartItemId: itemId,
      quantity,
    });

    logger.debug("POS Sale Use-Case: update quantity", {
      sessionId,
      itemId: validated.cartItemId,
      quantity: validated.quantity ?? quantity,
    });

    const { item, summary } = await service.updateQuantityWithValidation(
      sessionId,
      validated.cartItemId,
      validated.quantity ?? quantity
    );

    const { sale } = await service.getSaleWithSummary(sessionId);

    if (!sale) {
      throw createPOSError("SALE_NOT_FOUND", {
        context: { sessionId },
      });
    }

    return {
      sale,
      summary,
      item,
    };
  } catch (error) {
    if (isAppError(error)) {
      throw error;
    }

    throw createPOSError("SALE_MUTATION_FAILED", {
      cause: error,
      context: { sessionId, itemId, quantity },
    });
  }
}
