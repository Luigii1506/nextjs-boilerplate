/**
 * 🛍️ Remove Item Use-Case
 * ========================
 *
 * Handles orchestrating removal of an item from the POS sale.
 */

import * as service from "../service";
import { logger } from "@/shared/utils/logger";
import { createPOSError } from "../../../errors";
import { isAppError } from "@/shared/errors";

export async function removeItemUseCase(sessionId: string, itemId: string) {
  logger.debug("POS Sale Use-Case: remove item", { sessionId, itemId });
  try {
    const { summary, isEmpty } = await service.removeItemWithCleanup(
    sessionId,
    itemId
  );

    const saleSnapshot = isEmpty
      ? null
      : await service.getSaleWithSummary(sessionId);

    return {
      sale: saleSnapshot?.sale ?? null,
      summary,
      isEmpty,
    };
  } catch (error) {
    if (isAppError(error)) {
      throw error;
    }

    throw createPOSError("SALE_MUTATION_FAILED", {
      cause: error,
      context: { sessionId, itemId },
    });
  }
}
