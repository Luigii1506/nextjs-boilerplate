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
import {
  CreatePOSSessionSchema,
  ClosePOSSessionSchema,
} from "../../schemas";
import type { ActionResult } from "@/shared/types";
import type { POSSessionStatus } from "../../types/models";
import { logger } from "@/shared/utils/logger";

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
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to get active session",
    };
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
      return {
        success: false,
        error: "Session not found",
      };
    }

    return {
      success: true,
      data: session,
    };
  } catch (error) {
    logger.error("POS Session Action: get session failed", { error });
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get session",
    };
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
      return {
        success: false,
        error: "Session not found",
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
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to get session summary",
    };
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
    // Validar input
    const validated = CreatePOSSessionSchema.parse({
      userId,
      initialCash,
      notes,
    });

    // Crear sesión
    const session = await queries.createSession(
      validated.userId,
      validated.initialCash,
      validated.notes
    );

    revalidatePath("/pos");

    return {
      success: true,
      data: session,
      message: "Session opened successfully",
    };
  } catch (error) {
    logger.error("POS Session Action: open session failed", { error });

    // If it's a Zod validation error, return formatted error message
    if (error && typeof error === 'object' && 'issues' in error) {
      const issues = (error as any).issues;
      const firstIssue = issues[0];
      return {
        success: false,
        error: firstIssue?.message || "Validation error",
      };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to open session",
    };
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
    // Validar input
    const validated = ClosePOSSessionSchema.parse({
      sessionId,
      finalCash,
      notes,
    });

    // Obtener resumen antes de cerrar
    const summary = await queries.calculateSessionSummary(validated.sessionId);

    // Cerrar sesión
    const session = await queries.closeSession(
      validated.sessionId,
      validated.finalCash,
      validated.notes
    );

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
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to close session",
    };
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
    const session = await queries.suspendSession(sessionId, notes);

    revalidatePath("/pos");

    return {
      success: true,
      data: session,
      message: "Session suspended successfully",
    };
  } catch (error) {
    logger.error("POS Session Action: suspend session failed", { error });
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to suspend session",
    };
  }
}

// ========================================
// RESUME SESSION
// ========================================

/**
 * Reanudar sesión suspendida
 */
export async function resumeSessionAction(
  sessionId: string
): Promise<ActionResult<SessionResumeResult>> {
  try {
    const session = await queries.resumeSession(sessionId);

    revalidatePath("/pos");

    return {
      success: true,
      data: session,
      message: "Session resumed successfully",
    };
  } catch (error) {
    logger.error("POS Session Action: resume session failed", { error });
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to resume session",
    };
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
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to get session history",
    };
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
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to get session transactions",
    };
  }
}
