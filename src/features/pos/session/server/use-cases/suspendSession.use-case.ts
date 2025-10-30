/**
 * 💤 Suspend Session Use-Case
 * ===========================
 */

import * as queries from "../queries";
import { logger } from "@/shared/utils/logger";
import { createPOSError } from "../../../errors";
import { isAppError } from "@/shared/errors";

export async function suspendSessionUseCase(sessionId: string, notes?: string) {
  try {
    logger.info("POS Session Use-Case: suspending session", { sessionId });
    return await queries.suspendSession(sessionId, notes);
  } catch (error) {
    if (isAppError(error)) {
      throw error;
    }

    if (error instanceof Error) {
      if (error.message.includes("not found")) {
        throw createPOSError("SESSION_NOT_FOUND", {
          context: { sessionId },
        });
      }

      if (error.message.includes("not open")) {
        const statusMatch = error.message.match(/Session is not open: (.+)$/);
        throw createPOSError("SESSION_INVALID_STATUS", {
          context: {
            sessionId,
            currentStatus: statusMatch?.[1],
            expectedStatus: "OPEN",
          },
          hint: "La sesión debe estar abierta para poder suspenderla.",
        });
      }
    }

    throw createPOSError("SESSION_SUSPEND_FAILED", {
      cause: error,
      context: { sessionId, notes },
    });
  }
}
