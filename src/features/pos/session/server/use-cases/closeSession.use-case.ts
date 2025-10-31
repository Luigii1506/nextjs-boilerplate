/**
 * 🏪 Close Session Use-Case
 * =========================
 *
 * Encapsulates validation, summary calculation and persistence for
 * closing an active POS session.
 */

import { ClosePOSSessionSchema } from "../../../schemas";
import * as queries from "../queries";
import { logger } from "@/shared/utils/logger";
import { createPOSError } from "../../../errors";
import { isAppError } from "@/shared/errors";
import { ZodError } from "zod";
import {
  auditSessionClosed,
  type POSAuditContextInput,
} from "../../../audit/posAudit.service";

export interface CloseSessionInput {
  sessionId: string;
  finalCash: number;
  notes?: string;
}

export interface CloseSessionResult {
  session: Awaited<ReturnType<typeof queries.closeSession>>;
  summary: Awaited<ReturnType<typeof queries.calculateSessionSummary>>;
}

export async function closeSessionUseCase(
  input: CloseSessionInput,
  auditContext?: POSAuditContextInput
): Promise<CloseSessionResult> {
  try {
    const validated = ClosePOSSessionSchema.parse(input);

    logger.info("POS Session Use-Case: closing session", {
      sessionId: validated.sessionId,
    });

    const summary = await queries.calculateSessionSummary(validated.sessionId);
    const session = await queries.closeSession(
      validated.sessionId,
      validated.finalCash,
      validated.notes
    );

    console.log("[POS AUDIT] closeSessionUseCase closed session", {
      sessionId: session.id,
    });

    await auditSessionClosed({
      session,
      totals: {
        totalSales: summary.totalSales,
        totalVoids: summary.totalVoids,
        totalRefunds: summary.totalRefunds,
        netSales: summary.netSales,
      },
      context: {
        userId: session.userId,
        userRole: auditContext?.userRole,
        ipAddress: auditContext?.ipAddress,
        userAgent: auditContext?.userAgent,
      },
    });

    console.log("[POS AUDIT] closeSessionUseCase audit dispatched", {
      sessionId: session.id,
    });

    return { session, summary };
  } catch (error) {
    if (error instanceof ZodError) {
      throw createPOSError("SESSION_VALIDATION_FAILED", {
        hint: error.issues[0]?.message,
        context: { issues: error.issues },
      });
    }

    if (isAppError(error)) {
      throw error;
    }

    throw createPOSError("SESSION_CLOSE_FAILED", {
      cause: error,
      context: { sessionId: input.sessionId },
    });
  }
}
