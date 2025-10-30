"use server";
/**
 * 🔐 POS Session - Server Actions
 * ================================
 *
 * Server Actions para gestión de sesiones POS.
 *
 * @module pos/session/server/actions
 * @version 1.0.0
 */

import { revalidatePath } from "next/cache";
import * as queries from "./queries";
import type { ActionResult } from "@/shared/types";
import type { POSSessionStatus } from "../../types/models";
import { logger } from "@/shared/utils/logger";
import { openSessionUseCase, closeSessionUseCase, suspendSessionUseCase, resumeSessionUseCase } from "./use-cases";
import { mapErrorToActionResult } from "@/shared/errors";
import { createPOSError } from "../../errors";

type ActiveSessionResult = Awaited<
  ReturnType<typeof queries.getActiveSessionByUser>
>;
type SessionEntity = Awaited<ReturnType<typeof queries.getSessionById>>;
type SessionSummaryResult = Awaited<
  ReturnType<typeof queries.calculateSessionSummary>
>;
type SessionCreateResult = Awaited<ReturnType<typeof queries.createSession>>;
type SessionUpdateResult = Awaited<ReturnType<typeof queries.closeSession>>;
type SessionSuspendResult = Awaited<ReturnType<typeof queries.suspendSession>>;
type SessionResumeResult = Awaited<ReturnType<typeof queries.resumeSession>>;
type SessionHistoryResult = Awaited<
  ReturnType<typeof queries.getSessionsByUser>
>;
type SessionTransactionsResult = Awaited<
  ReturnType<typeof queries.getSessionTransactions>
>;

type SessionWithSummaryResult = {
  session: NonNullable<SessionEntity>;
  summary: SessionSummaryResult;
};

type SessionDetail = NonNullable<SessionEntity>;

// ========================================
// GET ACTIVE SESSION
// ========================================

/**
 * Obtener sesión activa del usuario
 */
export async function getActiveSessionAction(
  userId: string
): Promise<ActionResult<ActiveSessionResult>> {
  try {
    const session = await queries.getActiveSessionByUser(userId);

    return {
      success: true,
      data: session,
    };
  } catch (error) {
    logger.error("POS Session Action: get active session failed", { error });
    const fallback = createPOSError("SESSION_FETCH_FAILED", {
      context: { userId },
    });
    return mapErrorToActionResult<ActiveSessionResult>(
      error,
      fallback.toJSON()
    );
  }
}

// ========================================
// GET SESSION BY ID
// ========================================

/**
 * Obtener sesión por ID
 */
export async function getSessionAction(
  sessionId: string
): Promise<ActionResult<SessionDetail>> {
  try {
    const session = await queries.getSessionById(sessionId);

    if (!session) {
      const notFound = createPOSError("SESSION_NOT_FOUND", {
        context: { sessionId },
      });
      return {
        success: false,
        error: notFound.toJSON(),
      };
    }

    return {
      success: true,
      data: session,
    };
  } catch (error) {
    logger.error("POS Session Action: get session failed", { error });
    const fallback = createPOSError("SESSION_FETCH_FAILED", {
      context: { sessionId },
    });
    return mapErrorToActionResult<SessionDetail>(error, fallback.toJSON());
  }
}

// ========================================
// GET SESSION WITH SUMMARY
// ========================================

/**
 * Obtener sesión con resumen de ventas
 */
export async function getSessionWithSummaryAction(
  sessionId: string
): Promise<ActionResult<SessionWithSummaryResult>> {
  try {
    const session = await queries.getSessionById(sessionId);

    if (!session) {
      const notFound = createPOSError("SESSION_NOT_FOUND", {
        context: { sessionId },
      });
      return {
        success: false,
        error: notFound.toJSON(),
      };
    }

    const summary = await queries.calculateSessionSummary(sessionId);

    return {
      success: true,
      data: {
        session,
        summary,
      },
    };
  } catch (error) {
    logger.error("POS Session Action: get session with summary failed", {
      error,
    });
    const fallback = createPOSError("SESSION_FETCH_FAILED", {
      context: { sessionId },
    });
    return mapErrorToActionResult<SessionWithSummaryResult>(
      error,
      fallback.toJSON()
    );
  }
}

// ========================================
// CREATE SESSION (OPEN REGISTER)
// ========================================

/**
 * Abrir nueva sesión (abrir caja)
 */
export async function openSessionAction(
  userId: string,
  initialCash: number,
  notes?: string
): Promise<ActionResult<SessionCreateResult>> {
  try {
    const session = await openSessionUseCase({
      userId,
      initialCash,
      notes,
    });

    revalidatePath("/pos");

    return {
      success: true,
      data: session,
      message: "Session opened successfully",
    };
  } catch (error) {
    logger.error("POS Session Action: open session failed", { error });
    const fallback = createPOSError("SESSION_OPEN_FAILED", {
      context: { userId, notes },
    });
    return mapErrorToActionResult<SessionCreateResult>(
      error,
      fallback.toJSON()
    );
  }
}

// ========================================
// CLOSE SESSION (CLOSE REGISTER)
// ========================================

/**
 * Cerrar sesión (cerrar caja)
 */
export async function closeSessionAction(
  sessionId: string,
  finalCash: number,
  notes?: string
): Promise<
  ActionResult<{ session: SessionUpdateResult; summary: SessionSummaryResult }>
> {
  try {
    const { session, summary } = await closeSessionUseCase({
      sessionId,
      finalCash,
      notes,
    });

    revalidatePath("/pos");

    return {
      success: true,
      data: {
        session,
        summary,
      },
      message: "Session closed successfully",
    };
  } catch (error) {
    logger.error("POS Session Action: close session failed", { error });
    const fallback = createPOSError("SESSION_CLOSE_FAILED", {
      context: { sessionId, notes, finalCash },
    });
    return mapErrorToActionResult<{
      session: SessionUpdateResult;
      summary: SessionSummaryResult;
    }>(error, fallback.toJSON());
  }
}

// ========================================
// SUSPEND SESSION
// ========================================

/**
 * Suspender sesión
 */
export async function suspendSessionAction(
  sessionId: string,
  notes?: string
): Promise<ActionResult<SessionSuspendResult>> {
  try {
    const session = await suspendSessionUseCase(sessionId, notes);

    revalidatePath("/pos");

    return {
      success: true,
      data: session,
      message: "Session suspended successfully",
    };
  } catch (error) {
    logger.error("POS Session Action: suspend session failed", { error });
    const fallback = createPOSError("SESSION_SUSPEND_FAILED", {
      context: { sessionId, notes },
    });
    return mapErrorToActionResult<SessionSuspendResult>(
      error,
      fallback.toJSON()
    );
  }
}

// ========================================
// RESUME SESSION
// ========================================

/**
 * Reanudar sesión suspendida
 */
export async function resumeSessionAction(
  sessionId: string,
  notes?: string
): Promise<ActionResult<SessionResumeResult>> {
  try {
    const session = await resumeSessionUseCase(sessionId, notes);

    revalidatePath("/pos");

    return {
      success: true,
      data: session,
      message: "Session resumed successfully",
    };
  } catch (error) {
    logger.error("POS Session Action: resume session failed", { error });
    const fallback = createPOSError("SESSION_RESUME_FAILED", {
      context: { sessionId, notes },
    });
    return mapErrorToActionResult<SessionResumeResult>(
      error,
      fallback.toJSON()
    );
  }
}

// ========================================
// GET SESSION HISTORY
// ========================================

/**
 * Obtener historial de sesiones del usuario
 */
export async function getSessionHistoryAction(
  userId: string,
  limit: number = 10,
  status?: POSSessionStatus
): Promise<ActionResult<SessionHistoryResult>> {
  try {
    const sessions = await queries.getSessionsByUser(userId, limit, status);

    return {
      success: true,
      data: sessions,
    };
  } catch (error) {
    logger.error("POS Session Action: get session history failed", { error });
    const fallback = createPOSError("SESSION_HISTORY_FAILED", {
      context: { userId, status, limit },
    });
    return mapErrorToActionResult<SessionHistoryResult>(
      error,
      fallback.toJSON()
    );
  }
}

// ========================================
// GET SESSION TRANSACTIONS
// ========================================

/**
 * Obtener transacciones de una sesión
 */
export async function getSessionTransactionsAction(
  sessionId: string,
  limit?: number
): Promise<ActionResult<SessionTransactionsResult>> {
  try {
    const transactions = await queries.getSessionTransactions(
      sessionId,
      limit
    );

    return {
      success: true,
      data: transactions,
    };
  } catch (error) {
    logger.error("POS Session Action: get session transactions failed", {
      error,
    });
    const fallback = createPOSError("SESSION_TRANSACTIONS_FAILED", {
      context: { sessionId, limit },
    });
    return mapErrorToActionResult<SessionTransactionsResult>(
      error,
      fallback.toJSON()
    );
  }
}
