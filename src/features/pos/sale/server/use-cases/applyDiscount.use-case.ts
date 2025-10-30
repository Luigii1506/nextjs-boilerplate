/**
 * 🛍️ Apply Discount Use-Case
 * ===========================
 *
 * Delegates to sale service to apply a discount and returns updated snapshot.
 */

import * as service from "../service";
import { logger } from "@/shared/utils/logger";
import { createPOSError } from "../../../errors";
import { isAppError } from "@/shared/errors";

export async function applyDiscountUseCase(
  sessionId: string,
  type: "percentage" | "fixed",
  value: number
) {
  try {
    logger.debug("POS Sale Use-Case: apply discount", {
      sessionId,
      type,
      value,
    });

    const { summary, message } = await service.applyDiscountToSale(
      sessionId,
      type,
      value
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
      message,
    };
  } catch (error) {
    if (isAppError(error)) {
      throw error;
    }

    throw createPOSError("SALE_MUTATION_FAILED", {
      cause: error,
      context: { sessionId, type, value },
    });
  }
}
