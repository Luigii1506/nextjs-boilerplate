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
import { POSCartStatus, type Prisma } from "@prisma/client";
import { CreatePOSTransactionSchema } from "../../schemas";
import { calculateChangeDue, generateTransactionNumber } from "../../schemas";
import { validateSaleForCheckout } from "../../sale/server/service";
import { calculateSaleSummary } from "../../sale/server/queries";
import { finalizeCartCheckout } from "../../sale/server/cart.repository";
import { roundCurrency } from "@/shared/utils/pricing";
import type { ActionResult } from "@/shared/types";
import type { ProcessPaymentInput, ProcessPaymentResult } from "../types";
import { logger } from "@/shared/utils/logger";

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
    const { sessionId, paymentMethod, amountPaid, notes, referenceNumber } =
      input;

    // 1. Validar que la venta esté lista
    const validation = await validateSaleForCheckout(sessionId);
    if (!validation.isValid) {
      return {
        success: false,
        error: `Sale validation failed: ${validation.errors.join(", ")}`,
      };
    }

    // 2. Obtener el carrito/sale activo (POS cart domain)
    const cart = await prisma.pOSCart.findFirst({
      where: {
        sessionId,
        status: POSCartStatus.ACTIVE,
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        adjustments: true,
      },
    });

    if (!cart || cart.items.length === 0) {
      return {
        success: false,
        error: "No active sale found",
      };
    }

    // 3. Calcular summary final
    const summary = await calculateSaleSummary(sessionId);

    // 4. Validar monto pagado
    if (amountPaid < summary.total) {
      return {
        success: false,
        error: `Insufficient payment. Required: $${summary.total.toFixed(2)}, Paid: $${amountPaid.toFixed(2)}`,
      };
    }

    // 5. Calcular cambio
    const changeDue = calculateChangeDue(amountPaid, summary.total);

    // 6. Generar número de transacción
    // Obtener el último número de secuencia
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

    const transactionNumber = generateTransactionNumber(sequenceNumber);

    // 7. Validar con schema
    const normalizedItems = cart.items.map((item) => {
      const unitPrice = Number(item.unitPrice ?? 0);
      const quantity = item.quantity ?? 0;
      const discount = Number(item.discount ?? 0);
      const subtotal =
        item.subtotal !== undefined && item.subtotal !== null
          ? Number(item.subtotal)
          : Math.round(unitPrice * quantity * 100) / 100;
      const tax =
        item.tax !== undefined && item.tax !== null
          ? Number(item.tax)
          : Math.round(subtotal * (summary.taxRate ?? 0) * 100) / 100;
      const total =
        item.total !== undefined && item.total !== null
          ? Number(item.total)
          : Math.round((subtotal - discount + tax) * 100) / 100;

      return {
        productId: item.productId,
        productSku: item.productSku ?? item.product?.sku ?? "UNKNOWN",
        productName: item.productName ?? item.product?.name ?? "Producto",
        quantity,
        unitPrice,
        discount,
        subtotal,
        tax,
        total,
      };
    });

    const parsedInput = {
      sessionId,
      cartId: cart.id,
      type: "SALE",
      paymentMethod,
      subtotal: summary.subtotal,
      tax: summary.tax,
      discount: summary.discount,
      total: summary.total,
      amountPaid,
      changeDue,
      notes,
      paymentReference: referenceNumber,
      items: normalizedItems,
    };

    logger.debug("POS Payment Action: parsed payload before validation", {
      payload: parsedInput,
    });

    CreatePOSTransactionSchema.parse(parsedInput);

    logger.debug("POS Payment Action: payload validated successfully");
    const roundedSubtotal = roundCurrency(summary.subtotal ?? 0);
    const roundedTax = roundCurrency(summary.tax ?? 0);
    const roundedDiscount = roundCurrency(summary.discount ?? 0);
    const roundedTotal = roundCurrency(summary.total ?? 0);
    const roundedAmountPaid = roundCurrency(parsedInput.amountPaid ?? amountPaid);
    const roundedChangeDue = roundCurrency(changeDue);

    logger.debug("POS Payment Action: totals derived for persistence", {
      roundedSubtotal,
      roundedTax,
      roundedDiscount,
      roundedTotal,
      roundedAmountPaid,
      roundedChangeDue,
    });

    // 8. Crear transacción en la DB
    const transaction = await prisma.pOSTransaction.create({
      data: {
        sessionId: parsedInput.sessionId,
        transactionNumber,
        type: parsedInput.type,
        paymentMethod: parsedInput.paymentMethod,
        subtotal: roundedSubtotal || 0,
        tax: roundedTax || 0,
        discount: roundedDiscount || 0,
        total: roundedTotal || 0,
        amountPaid: roundedAmountPaid || 0,
        changeDue: roundedChangeDue || 0,
        notes: parsedInput.notes,
        paymentReference: parsedInput.paymentReference ?? null,
        items: {
          create: normalizedItems.map((item) => ({
            productId: item.productId,
            productSku: item.productSku,
            productName: item.productName,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            discount: item.discount,
            subtotal: item.subtotal,
            tax: item.tax,
            total: item.total,
          })),
        },
      },
      include: {
        items: true,
      },
    });

    // 9. Reducir stock de los productos
    for (const item of cart.items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            decrement: item.quantity,
          },
        },
      });
    }

    // 10. Finalizar carrito (marcar como checked-out y limpiar)
    await finalizeCartCheckout(cart.id);

    // 11. Revalidar
    revalidatePath("/pos");

    // 12. Retornar resultado
    return {
      success: true,
      data: {
        success: true,
        transaction: {
          id: transaction.id,
          transactionNumber: transaction.transactionNumber,
          type: transaction.type,
          paymentMethod: transaction.paymentMethod,
          subtotal: Number(transaction.subtotal),
          tax: Number(transaction.tax),
          discount: Number(transaction.discount),
          total: Number(transaction.total),
          amountPaid: Number(transaction.amountPaid),
          changeDue: Number(transaction.changeDue),
          itemCount: transaction.items.length,
          createdAt: transaction.createdAt,
        },
        error: null,
      },
      message: `Payment processed successfully. Transaction: ${transactionNumber}`,
    };
  } catch (error) {
    logger.error("POS Payment Action: process payment failed", { error });
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to process payment",
    };
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
      return {
        success: false,
        error: "Transaction not found",
      };
    }

    return {
      success: true,
      data: transaction,
    };
  } catch (error) {
    logger.error("POS Payment Action: get transaction failed", { error });
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to get transaction",
    };
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
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to get recent transactions",
    };
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
      return {
        success: false,
        error: "Transaction not found",
      };
    }

    if (originalTransaction.type === "VOID") {
      return {
        success: false,
        error: "Transaction is already voided",
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
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to void transaction",
    };
  }
}
