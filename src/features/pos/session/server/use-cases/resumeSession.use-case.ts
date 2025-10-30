/**
 * ▶️ Resume Session Use-Case
 * ==========================
 */

import * as queries from "../queries";
import { logger } from "@/shared/utils/logger";
import { createPOSError } from "../../../errors";
import { isAppError } from "@/shared/errors";

export async function resumeSessionUseCase(sessionId: string, notes?: string) {
  try {
    logger.info("POS Session Use-Case: resuming session", {
      sessionId,
      notes,
    });
    return await queries.resumeSession(sessionId);
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

      if (error.message.includes("not suspended")) {
        const statusMatch = error.message.match(
          /Session is not suspended: (.+)$/
        );
        throw createPOSError("SESSION_INVALID_STATUS", {
          context: {
            sessionId,
            expectedStatus: "SUSPENDED",
            currentStatus: statusMatch?.[1],
          },
          hint: "La sesión debe estar suspendida para poder reanudarla.",
        });
      }
    }

    throw createPOSError("SESSION_RESUME_FAILED", {
      cause: error,
      context: { sessionId, notes },
    });
  }
}
