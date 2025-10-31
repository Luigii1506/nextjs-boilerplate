/**
 * 💤 Suspend Session Use-Case
 * ===========================
 */

import * as queries from "../queries";
import { logger } from "@/shared/utils/logger";
import { createPOSError } from "../../../errors";
import { isAppError } from "@/shared/errors";
import {
  auditSessionSuspended,
  type POSAuditContextInput,
} from "../../../audit/posAudit.service";

export async function suspendSessionUseCase(
  sessionId: string,
  notes?: string,
  auditContext?: POSAuditContextInput
) {
  try {
    logger.info("POS Session Use-Case: suspending session", { sessionId });
    const session = await queries.suspendSession(sessionId, notes);

    console.log("[POS AUDIT] suspendSessionUseCase suspended session", {
      sessionId: session.id,
    });

    await auditSessionSuspended({
      session,
      context: {
        userId: session.userId,
        userRole: auditContext?.userRole,
        ipAddress: auditContext?.ipAddress,
        userAgent: auditContext?.userAgent,
      },
    });

    console.log("[POS AUDIT] suspendSessionUseCase audit dispatched", {
      sessionId: session.id,
    });

    return session;
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
