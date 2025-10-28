"use server";
/**
 * 🔐 POS Session - Database Queries
 * ==================================
 *
 * Queries para gestión de sesiones POS.
 * Manejo de apertura/cierre de caja.
 *
 * @module pos/session/server/queries
 * @version 1.0.0
 */

import { prisma } from "@/core/database/prisma";
import type { POSSessionStatus } from "../../types/models";
import { Decimal } from "@prisma/client/runtime/library";

// Helper to convert Decimal to number
function toNumber(decimal: Decimal | null | undefined): number | null {
  if (decimal === null || decimal === undefined) return null;
  return decimal.toNumber();
}

// ========================================
// GET SESSION
// ========================================

/**
 * Obtener sesión activa de un usuario
 */
export async function getActiveSessionByUser(userId: string) {
  const session = await prisma.pOSSession.findFirst({
    where: {
      userId,
      status: "OPEN",
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      startTime: "desc",
    },
  });

  if (!session) return null;

  // Convert Decimals to numbers
  return {
    ...session,
    initialCash: toNumber(session.initialCash)!,
    finalCash: toNumber(session.finalCash),
  };
}

/**
 * Obtener sesión por ID
 */
export async function getSessionById(sessionId: string) {
  const session = await prisma.pOSSession.findUnique({
    where: { id: sessionId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  if (!session) return null;

  // Convert Decimals to numbers
  return {
    ...session,
    initialCash: toNumber(session.initialCash)!,
    finalCash: toNumber(session.finalCash),
  };
}

/**
 * Obtener todas las sesiones de un usuario
 */
export async function getSessionsByUser(
  userId: string,
  limit: number = 10,
  status?: POSSessionStatus
) {
  const sessions = await prisma.pOSSession.findMany({
    where: {
      userId,
      ...(status ? { status } : {}),
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      startTime: "desc",
    },
    take: limit,
  });

  // Convert Decimals to numbers for client components
  return sessions.map((session) => ({
    ...session,
    initialCash: toNumber(session.initialCash)!,
    finalCash: toNumber(session.finalCash),
  }));
}

// ========================================
// CREATE SESSION
// ========================================

/**
 * Crear nueva sesión (abrir caja)
 */
export async function createSession(
  userId: string,
  initialCash: number,
  notes?: string
) {
  // Verificar que no haya sesión abierta
  const existingSession = await getActiveSessionByUser(userId);
  if (existingSession) {
    throw new Error(
      `User already has an active session: ${existingSession.id}`
    );
  }

  // Crear sesión
  const session = await prisma.pOSSession.create({
    data: {
      userId,
      startTime: new Date(),
      initialCash,
      status: "OPEN",
      notes,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  // Convert Decimals to numbers for client components
  return {
    ...session,
    initialCash: toNumber(session.initialCash)!,
    finalCash: toNumber(session.finalCash),
  };
}

// ========================================
// UPDATE SESSION
// ========================================

/**
 * Cerrar sesión (cerrar caja)
 */
export async function closeSession(
  sessionId: string,
  finalCash: number,
  notes?: string
) {
  // Verificar que la sesión esté abierta
  const session = await getSessionById(sessionId);
  if (!session) {
    throw new Error(`Session not found: ${sessionId}`);
  }

  if (session.status !== "OPEN") {
    throw new Error(`Session is not open: ${session.status}`);
  }

  // Cerrar sesión
  const updatedSession = await prisma.pOSSession.update({
    where: { id: sessionId },
    data: {
      endTime: new Date(),
      finalCash,
      status: "CLOSED",
      notes: notes || session.notes,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  // Convert Decimals to numbers for client components
  return {
    ...updatedSession,
    initialCash: toNumber(updatedSession.initialCash)!,
    finalCash: toNumber(updatedSession.finalCash),
  };
}

/**
 * Suspender sesión
 */
export async function suspendSession(sessionId: string, notes?: string) {
  const session = await getSessionById(sessionId);
  if (!session) {
    throw new Error(`Session not found: ${sessionId}`);
  }

  if (session.status !== "OPEN") {
    throw new Error(`Session is not open: ${session.status}`);
  }

  const updatedSession = await prisma.pOSSession.update({
    where: { id: sessionId },
    data: {
      status: "SUSPENDED",
      notes: notes || session.notes,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  // Convert Decimals to numbers for client components
  return {
    ...updatedSession,
    initialCash: toNumber(updatedSession.initialCash)!,
    finalCash: toNumber(updatedSession.finalCash),
  };
}

/**
 * Reanudar sesión suspendida
 */
export async function resumeSession(sessionId: string) {
  const session = await getSessionById(sessionId);
  if (!session) {
    throw new Error(`Session not found: ${sessionId}`);
  }

  if (session.status !== "SUSPENDED") {
    throw new Error(`Session is not suspended: ${session.status}`);
  }

  const updatedSession = await prisma.pOSSession.update({
    where: { id: sessionId },
    data: {
      status: "OPEN",
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  // Convert Decimals to numbers for client components
  return {
    ...updatedSession,
    initialCash: toNumber(updatedSession.initialCash)!,
    finalCash: toNumber(updatedSession.finalCash),
  };
}

// ========================================
// SESSION SUMMARY
// ========================================

/**
 * Calcular resumen de sesión (ventas, transacciones, etc.)
 */
export async function calculateSessionSummary(sessionId: string) {
  // Obtener todas las transacciones de la sesión
  const transactions = await prisma.pOSTransaction.findMany({
    where: { sessionId },
    include: {
      items: true,
    },
  });

  // Calcular totales
  const totalSales = transactions
    .filter((t) => t.type === "SALE")
    .reduce((sum, t) => sum + Number(t.total), 0);

  const totalVoids = transactions
    .filter((t) => t.type === "VOID")
    .reduce((sum, t) => sum + Math.abs(Number(t.total)), 0);

  const totalRefunds = transactions
    .filter((t) => t.type === "REFUND")
    .reduce((sum, t) => sum + Math.abs(Number(t.total)), 0);

  const netSales = totalSales - totalVoids - totalRefunds;

  const transactionCount = transactions.filter((t) => t.type === "SALE").length;

  const cashSales = transactions
    .filter((t) => t.type === "SALE" && t.paymentMethod === "CASH")
    .reduce((sum, t) => sum + Number(t.total), 0);

  const cardSales = transactions
    .filter((t) => t.type === "SALE" && t.paymentMethod === "CARD")
    .reduce((sum, t) => sum + Number(t.total), 0);

  const transferSales = transactions
    .filter((t) => t.type === "SALE" && t.paymentMethod === "TRANSFER")
    .reduce((sum, t) => sum + Number(t.total), 0);

  const mixedSales = transactions
    .filter((t) => t.type === "SALE" && t.paymentMethod === "MIXED")
    .reduce((sum, t) => sum + Number(t.total), 0);

  // Total items vendidos
  const totalItemsSold = transactions
    .filter((t) => t.type === "SALE")
    .reduce(
      (sum, t) => sum + t.items.reduce((s, i) => s + i.quantity, 0),
      0
    );

  return {
    transactionCount,
    totalSales,
    totalVoids,
    totalRefunds,
    netSales,
    cashSales,
    cardSales,
    transferSales,
    mixedSales,
    totalItemsSold,
    averageTicket: transactionCount > 0 ? netSales / transactionCount : 0,
  };
}

/**
 * Obtener transacciones de una sesión
 */
export async function getSessionTransactions(
  sessionId: string,
  limit?: number
) {
  const transactions = await prisma.pOSTransaction.findMany({
    where: { sessionId },
    include: {
      items: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    ...(limit ? { take: limit } : {}),
  });

  return transactions;
}
