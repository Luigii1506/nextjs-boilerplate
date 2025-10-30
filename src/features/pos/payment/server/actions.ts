"use server";
/**
 * 💳 POS Payment - Server Actions
 * ================================
 *
 * Server Actions para procesar pagos en POS.
 * Similar a checkout actions pero optimizado para POS.
 *
 * @module pos/payment/server/actions
 * @version 1.0.0
 */

import { revalidatePath } from "next/cache";
import { prisma } from "@/core/database/prisma";
import type { Prisma } from "@prisma/client";
import type { ActionResult } from "@/shared/types";
import type { ProcessPaymentInput, ProcessPaymentResult } from "../types";
import { logger } from "@/shared/utils/logger";
import { processPaymentUseCase } from "./use-cases/processPayment.use-case";
import { mapErrorToActionResult } from "@/shared/errors";
import { createPOSError } from "../../errors";
import { generateTransactionNumber } from "../../schemas";

type TransactionWithSession = Prisma.POSTransactionGetPayload<{
  include: {
    items: true;
    session: {
      include: {
        user: {
          select: {
            id: true;
            name: true;
            email: true;
          };
        };
      };
    };
  };
}>;

type TransactionWithItems = Prisma.POSTransactionGetPayload<{
  include: {
    items: true;
  };
}>;

// ========================================
// PROCESS PAYMENT
// ========================================

/**
 * Procesar pago y crear transacción
 */
export async function processPaymentAction(
  input: ProcessPaymentInput
): Promise<ActionResult<ProcessPaymentResult>> {
  try {
    const { transaction } = await processPaymentUseCase(input);

    revalidatePath("/pos");

    return {
      success: true,
      data: {
        success: true,
        transaction,
        error: null,
      },
      message: `Payment processed successfully. Transaction: ${transaction.transactionNumber}`,
    };
  } catch (error) {
    logger.error("POS Payment Action: process payment failed", { error });
    const fallback = createPOSError("PAYMENT_PERSISTENCE_FAILED", {
      context: { sessionId: input.sessionId },
    });
    return mapErrorToActionResult<ProcessPaymentResult>(
      error,
      fallback.toJSON()
    );
  }
}

// ========================================
// GET TRANSACTION
// ========================================

/**
 * Obtener una transacción por ID
 */
export async function getTransactionAction(
  transactionId: string
): Promise<ActionResult<TransactionWithSession>> {
  try {
    const transaction = await prisma.pOSTransaction.findUnique({
      where: { id: transactionId },
      include: {
        items: true,
        session: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!transaction) {
      const notFound = createPOSError("PAYMENT_FETCH_FAILED", {
        context: { transactionId },
        hint: "La transacción solicitada no existe.",
      });
      return {
        success: false,
        error: notFound.toJSON(),
      };
    }

    return {
      success: true,
      data: transaction,
    };
  } catch (error) {
    logger.error("POS Payment Action: get transaction failed", { error });
    const fallback = createPOSError("PAYMENT_FETCH_FAILED", {
      context: { transactionId },
    });
    return mapErrorToActionResult<TransactionWithSession>(
      error,
      fallback.toJSON()
    );
  }
}

// ========================================
// GET RECENT TRANSACTIONS
// ========================================

/**
 * Obtener transacciones recientes de una sesión
 */
export async function getRecentTransactionsAction(
  sessionId: string,
  limit: number = 10
): Promise<ActionResult<TransactionWithItems[]>> {
  try {
    const transactions = await prisma.pOSTransaction.findMany({
      where: { sessionId },
      include: {
        items: true,
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return {
      success: true,
      data: transactions,
    };
  } catch (error) {
    logger.error("POS Payment Action: get recent transactions failed", {
      error,
    });
    const fallback = createPOSError("PAYMENT_FETCH_FAILED", {
      context: { sessionId, limit },
    });
    return mapErrorToActionResult<TransactionWithItems[]>(
      error,
      fallback.toJSON()
    );
  }
}

// ========================================
// VOID TRANSACTION
// ========================================

/**
 * Anular una transacción (crear transacción de tipo VOID)
 */
export async function voidTransactionAction(
  transactionId: string,
  reason: string
): Promise<ActionResult<TransactionWithItems>> {
  try {
    // 1. Obtener la transacción original
    const originalTransaction = await prisma.pOSTransaction.findUnique({
      where: { id: transactionId },
      include: {
        items: true,
      },
    });

    if (!originalTransaction) {
      const notFound = createPOSError("PAYMENT_FETCH_FAILED", {
        context: { transactionId },
        hint: "La transacción que intentas anular no existe.",
      });
      return {
        success: false,
        error: notFound.toJSON(),
      };
    }

    if (originalTransaction.type === "VOID") {
      const alreadyVoided = createPOSError("PAYMENT_VOID_FAILED", {
        context: { transactionId },
        hint: "La transacción ya había sido anulada previamente.",
        severity: "low",
      });
      return {
        success: false,
        error: alreadyVoided.toJSON(),
      };
    }

    // 2. Generar número de transacción para VOID
    const lastTransaction = await prisma.pOSTransaction.findFirst({
      orderBy: { createdAt: "desc" },
      select: { transactionNumber: true },
    });

    let sequenceNumber = 1;
    if (lastTransaction?.transactionNumber) {
      const lastSeq = parseInt(
        lastTransaction.transactionNumber.split("-").pop() || "0"
      );
      sequenceNumber = lastSeq + 1;
    }

    const voidTransactionNumber = generateTransactionNumber(sequenceNumber);

    // 3. Crear transacción VOID
    const voidTransaction = await prisma.pOSTransaction.create({
      data: {
        sessionId: originalTransaction.sessionId,
        transactionNumber: voidTransactionNumber,
        type: "VOID",
        paymentMethod: originalTransaction.paymentMethod,
        subtotal: -Number(originalTransaction.subtotal),
        tax: -Number(originalTransaction.tax),
        discount: -Number(originalTransaction.discount),
        total: -Number(originalTransaction.total),
        amountPaid: -Number(originalTransaction.amountPaid),
        changeDue: 0,
        notes: `VOID of ${originalTransaction.transactionNumber}. Reason: ${reason}`,
        paymentReference: originalTransaction.paymentReference ?? originalTransaction.transactionNumber,
        items: {
          create: originalTransaction.items.map((item) => ({
            productId: item.productId,
            productSku: item.productSku,
            productName: item.productName,
            quantity: -item.quantity,
            unitPrice: Number(item.unitPrice),
            discount: Number(item.discount),
            subtotal: -Number(item.subtotal),
            tax: -Number(item.tax),
            total: -Number(item.total),
          })),
        },
      },
      include: {
        items: true,
      },
    });

    // 4. Restaurar stock
    for (const item of originalTransaction.items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            increment: item.quantity,
          },
        },
      });
    }

    revalidatePath("/pos");

    return {
      success: true,
      data: voidTransaction,
      message: `Transaction ${originalTransaction.transactionNumber} voided successfully`,
    };
  } catch (error) {
    logger.error("POS Payment Action: void transaction failed", { error });
    const fallback = createPOSError("PAYMENT_VOID_FAILED", {
      context: { transactionId, reason },
    });
    return mapErrorToActionResult<TransactionWithItems>(
      error,
      fallback.toJSON()
    );
  }
}
