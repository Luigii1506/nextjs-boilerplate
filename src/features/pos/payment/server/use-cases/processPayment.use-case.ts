/**
 * 💳 Process Payment Use-Case
 * ===========================
 *
 * Domain-level orchestration for completing a POS payment.
 * Keeps server actions thin by encapsulating validation, persistence,
 * and side-effects (stock updates, cart finalisation) in one place.
 */

import { prisma } from "@/core/database/prisma";
import {
  CreatePOSTransactionSchema,
  calculateChangeDue,
  generateTransactionNumber,
} from "../../../schemas";
import { validateSaleForCheckout } from "../../../sale/server/service";
import { calculateSaleSummary } from "../../../sale/server/queries";
import { finalizeCartCheckout } from "../../../sale/server/cart.repository";
import type {
  POSTransactionResult,
  ProcessPaymentInput,
} from "../../types";
import { roundCurrency } from "@/shared/utils/pricing";
import { logger } from "@/shared/utils/logger";
import type { Prisma } from "@prisma/client";
import { createPOSError } from "../../../errors";
import { isAppError } from "@/shared/errors";
import { ZodError, type z } from "zod";
import {
  auditPaymentProcessed,
  type POSAuditContextInput,
} from "../../../audit/posAudit.service";

type TransactionWithItems = Prisma.POSTransactionGetPayload<{
  include: {
    items: true;
  };
}>;

export interface ProcessPaymentUseCaseResult {
  transaction: POSTransactionResult;
}

type ParsedTransactionInput = z.infer<typeof CreatePOSTransactionSchema>;

export async function processPaymentUseCase(
  input: ProcessPaymentInput,
  auditContext?: POSAuditContextInput
): Promise<ProcessPaymentUseCaseResult> {
  try {
    const { sessionId, paymentMethod, amountPaid, notes, referenceNumber } =
      input;

    logger.debug("POS Payment Use-Case: processing payment", {
      sessionId,
      paymentMethod,
      amountPaid,
    });

    const validation = await validateSaleForCheckout(sessionId);
    if (!validation.isValid) {
      throw createPOSError("SALE_VALIDATION_FAILED", {
        hint: validation.errors.join("\n"),
        context: { sessionId, validationErrors: validation.errors },
      });
    }

    const cart = await prisma.pOSCart.findFirst({
      where: {
        sessionId,
        status: "ACTIVE",
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        adjustments: true,
        session: {
          select: {
            id: true,
            userId: true,
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      throw createPOSError("SALE_NOT_FOUND", {
        context: { sessionId },
      });
    }

    const summary = await calculateSaleSummary(sessionId);
    if (amountPaid < summary.total) {
      throw createPOSError("PAYMENT_INSUFFICIENT_FUNDS", {
        hint: `Required: $${summary.total.toFixed(
          2
        )}, paid: $${amountPaid.toFixed(2)}`,
        context: { sessionId, summaryTotal: summary.total, amountPaid },
      });
    }

    const changeDue = calculateChangeDue(amountPaid, summary.total);

    const lastTransaction = await prisma.pOSTransaction.findFirst({
      orderBy: { createdAt: "desc" },
      select: { transactionNumber: true },
    });

    let sequenceNumber = 1;
    if (lastTransaction?.transactionNumber) {
      const lastSeq = parseInt(
        lastTransaction.transactionNumber.split("-").pop() || "0",
        10
      );
      sequenceNumber = lastSeq + 1;
    }

    const transactionNumber = generateTransactionNumber(sequenceNumber);

    const normalizedItems = cart.items.map((item) => ({
      productId: item.productId,
      productSku: item.productSku ?? item.product?.sku ?? "UNKNOWN",
      productName: item.productName ?? item.product?.name ?? "Producto",
      quantity: item.quantity,
      unitPrice: roundCurrency(Number(item.unitPrice ?? 0)),
      discount: roundCurrency(Number(item.discount ?? 0)),
      subtotal: roundCurrency(Number(item.subtotal ?? 0)),
      tax: roundCurrency(Number(item.tax ?? 0)),
      total: roundCurrency(Number(item.total ?? 0)),
    }));

    const parsedTransactionInput = CreatePOSTransactionSchema.parse({
      sessionId,
      cartId: cart.id,
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
    });

    logger.debug("POS Payment Use-Case: payload validated successfully", {
      sessionId,
      transactionNumber,
    });

    const transaction = await persistTransaction({
      cart,
      summary,
      amountPaid,
      changeDue,
      transactionNumber,
      parsedTransactionInput,
    });

    await finalizeCart(cart.id, sessionId);

    const transactionResult = mapTransactionToResult(transaction);

    logger.info("POS Payment Use-Case: payment processed", {
      sessionId,
      transactionId: transaction.id,
      transactionNumber,
    });

    const cashierId = cart.session?.userId;
    if (cashierId) {
      console.log("[POS AUDIT] processPaymentUseCase preparing audit", {
        transactionId: transaction.id,
        sessionId,
      });
      await auditPaymentProcessed({
        sessionId,
        cashierId,
        transaction: transactionResult,
        cartId: cart.id,
        context: {
          userId: cashierId,
          userRole: auditContext?.userRole,
          ipAddress: auditContext?.ipAddress,
          userAgent: auditContext?.userAgent,
        },
        metadata: {
          referenceNumber,
          adjustments: cart.adjustments?.length ?? 0,
          notes,
        },
      });
      console.log("[POS AUDIT] processPaymentUseCase audit dispatched", {
        transactionId: transaction.id,
        sessionId,
      });
    } else {
      logger.warn("POS Payment Use-Case: missing cashierId for audit log", {
        sessionId,
        cartId: cart.id,
      });
    }

    return {
      transaction: transactionResult,
    };
  } catch (error) {
    if (error instanceof ZodError) {
      throw createPOSError("SALE_VALIDATION_FAILED", {
        hint: error.issues[0]?.message,
        context: { issues: error.issues },
      });
    }

    if (isAppError(error)) {
      throw error;
    }

    throw createPOSError("PAYMENT_PERSISTENCE_FAILED", {
      cause: error,
      context: { sessionId: input.sessionId },
      message: "No fue posible completar el pago. Intenta nuevamente.",
    });
  }
}

interface PersistTransactionParams {
  cart: Awaited<ReturnType<typeof prisma.pOSCart.findFirst>>;
  summary: Awaited<ReturnType<typeof calculateSaleSummary>>;
  amountPaid: number;
  changeDue: number;
  transactionNumber: string;
  parsedTransactionInput: ParsedTransactionInput;
}

async function persistTransaction({
  cart,
  summary,
  amountPaid,
  changeDue,
  transactionNumber,
  parsedTransactionInput,
}: PersistTransactionParams): Promise<TransactionWithItems> {
  if (!cart) {
    throw createPOSError("SALE_NOT_FOUND", {
      context: { sessionId: parsedTransactionInput.sessionId },
    });
  }

  try {
    return await prisma.$transaction(async (tx) => {
      const createdTx = await tx.pOSTransaction.create({
        data: {
          sessionId: parsedTransactionInput.sessionId,
          transactionNumber,
          type: "SALE",
          paymentMethod: parsedTransactionInput.paymentMethod,
          subtotal: roundCurrency(summary.subtotal ?? 0),
          tax: roundCurrency(summary.tax ?? 0),
          discount: roundCurrency(summary.discount ?? 0),
          total: roundCurrency(summary.total ?? 0),
          amountPaid: roundCurrency(amountPaid),
          changeDue: roundCurrency(changeDue),
          notes: parsedTransactionInput.notes,
          paymentReference: parsedTransactionInput.paymentReference ?? null,
          items: {
            create: parsedTransactionInput.items.map((item) => ({
              productId: item.productId,
              productSku: item.productSku,
              productName: item.productName,
              quantity: item.quantity,
              unitPrice: roundCurrency(item.unitPrice),
              discount: roundCurrency(item.discount),
              subtotal: roundCurrency(item.subtotal),
              tax: roundCurrency(item.tax),
              total: roundCurrency(item.total),
            })),
          },
        },
        include: {
          items: true,
        },
      });

      for (const item of cart.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });
      }

      return createdTx;
    });
  } catch (error) {
    throw createPOSError("PAYMENT_PERSISTENCE_FAILED", {
      cause: error,
      context: {
        sessionId: parsedTransactionInput.sessionId,
        cartId: parsedTransactionInput.cartId,
      },
    });
  }
}

async function finalizeCart(cartId: string, sessionId: string) {
  try {
    await finalizeCartCheckout(cartId);
  } catch (error) {
    throw createPOSError("PAYMENT_PERSISTENCE_FAILED", {
      cause: error,
      context: { cartId, sessionId },
      hint: "No fue posible limpiar el carrito después del pago.",
    });
  }
}

function mapTransactionToResult(
  transaction: TransactionWithItems
): POSTransactionResult {
  return {
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
  };
}
