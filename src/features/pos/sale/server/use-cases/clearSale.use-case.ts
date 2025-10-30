/**
 * 🛍️ Clear Sale Use-Case
 * =======================
 *
 * Coordinates clearing the current POS sale.
 */

import { ClearPOSCartSchema } from "../../../schemas";
import { logger } from "@/shared/utils/logger";
import * as queries from "../queries";
import { createPOSError } from "../../../errors";
import { isAppError } from "@/shared/errors";

export async function clearSaleUseCase(sessionId: string) {
  try {
    const validated = ClearPOSCartSchema.parse({ sessionId });

    logger.info("POS Sale Use-Case: clearing sale", {
      sessionId: validated.sessionId,
    });

    await queries.clearSale(validated.sessionId);
  } catch (error) {
    if (isAppError(error)) {
      throw error;
    }

    throw createPOSError("SALE_MUTATION_FAILED", {
      cause: error,
      context: { sessionId },
    });
  }
}
