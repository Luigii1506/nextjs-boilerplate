/**
 * 🛍️ Add Item Use-Case
 * =====================
 *
 * Handles validation and orchestration for adding an item to the active POS sale.
 */

import { AddToPOSCartSchema } from "../../../schemas";
import * as service from "../service";
import { logger } from "@/shared/utils/logger";
import { createPOSError } from "../../../errors";
import { isAppError } from "@/shared/errors";

export async function addItemUseCase(
  sessionId: string,
  productId: string,
  quantity: number
) {
  try {
    const validated = AddToPOSCartSchema.parse({
      sessionId,
      productId,
      quantity,
    });

    logger.debug("POS Sale Use-Case: add item with validation", {
      sessionId: validated.sessionId,
      productId: validated.productId,
      quantity: validated.quantity,
    });

    const { item, summary } = await service.addItemWithValidation(
      validated.sessionId,
      validated.productId,
      validated.quantity
    );

    const { sale } = await service.getSaleWithSummary(validated.sessionId);

    if (!sale) {
      throw createPOSError("SALE_NOT_FOUND", {
        context: { sessionId: validated.sessionId },
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
      context: { sessionId, productId, quantity },
    });
  }
}
