/**
 * 🧾 POS Audit Helpers
 * ====================
 *
 * Centralised helpers to record critical POS events in the shared
 * audit trail. Keeps mutation use-cases focused on their domain
 * while guaranteeing consistent metadata and severity policies.
 */

import { AuditService } from "@/features/audit/server/service";
import type { CreateAuditEventData } from "@/features/audit/types";
import { getUserById } from "@/features/admin/users/server/queries";
import type { UserRole } from "@/features/admin/users/constants";
import type { POSSession } from "../types/models";
import type { POSTransactionResult } from "../payment/types";
import { logger } from "@/shared/utils/logger";

export interface POSAuditContext {
  userId: string;
  userRole?: UserRole;
  ipAddress?: string;
  userAgent?: string;
}

export type POSAuditContextInput = Partial<POSAuditContext>;

async function resolveAuditService(
  context: POSAuditContext
): Promise<AuditService> {
  let effectiveRole: UserRole | undefined = context.userRole;

  if (!effectiveRole) {
    try {
      const user = await getUserById(context.userId);
      effectiveRole = (user?.role as UserRole) ?? "user";
    } catch (error) {
      logger.warn("POS Audit: failed to resolve user role, defaulting to user", {
        error,
        userId: context.userId,
      });
      effectiveRole = "user";
    }
  }

  return new AuditService({
    currentUserId: context.userId,
    currentUserRole: effectiveRole,
  });
}

async function recordPOSAuditEvent(
  context: POSAuditContext,
  data: CreateAuditEventData
) {
  try {
    console.log("[POS AUDIT] Recording event", {
      userId: context.userId,
      action: data.action,
      resource: data.resource,
      resourceId: data.resourceId,
    });
    const service = await resolveAuditService(context);
    await service.createAuditEvent(data, {
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
    });
    console.log("[POS AUDIT] Event recorded successfully", {
      resourceId: data.resourceId,
      action: data.action,
    });
  } catch (error) {
    console.error("[POS AUDIT] Failed to record event", error, {
      action: data.action,
      resource: data.resource,
      resourceId: data.resourceId,
    });
    logger.error("POS Audit: failed to record event", {
      error,
      action: data.action,
      resource: data.resource,
      resourceId: data.resourceId,
      userId: context.userId,
    });
  }
}

export async function auditSessionOpened(params: {
  session: POSSession;
  context: POSAuditContext;
}): Promise<void> {
  const { session, context } = params;
  const metadata = {
    sessionId: session.id,
    startTime: session.startTime,
    initialCash: session.initialCash,
    notes: session.notes,
  };

  await recordPOSAuditEvent(context, {
    action: "open_register",
    resource: "pos_session",
    resourceId: session.id,
    resourceName: `POS Session ${session.id}`,
    description: `Caja abierta con $${session.initialCash.toFixed(2)}`,
    severity: "medium",
    metadata,
    changes: [
      {
        field: "status",
        fieldLabel: "Status",
        oldValue: "CLOSED",
        newValue: session.status,
      },
      {
        field: "initialCash",
        fieldLabel: "Initial Cash",
        oldValue: 0,
        newValue: session.initialCash,
      },
    ],
  });
}

export async function auditSessionClosed(params: {
  session: POSSession;
  totals: {
    totalSales: number;
    totalVoids: number;
    totalRefunds: number;
    netSales: number;
  };
  context: POSAuditContext;
}): Promise<void> {
  const { session, totals, context } = params;
  const metadata = {
    sessionId: session.id,
    startTime: session.startTime,
    endTime: session.endTime,
    initialCash: session.initialCash,
    finalCash: session.finalCash,
    expectedCash: session.expectedCash,
    cashDifference: session.cashDifference,
    totals,
    notes: session.notes,
  };

  await recordPOSAuditEvent(context, {
    action: "close_register",
    resource: "pos_session",
    resourceId: session.id,
    resourceName: `POS Session ${session.id}`,
    description: `Caja cerrada con $${(session.finalCash ?? 0).toFixed(2)}`,
    severity: "high",
    metadata,
    changes: [
      {
        field: "status",
        fieldLabel: "Status",
        oldValue: "OPEN",
        newValue: session.status,
      },
      {
        field: "finalCash",
        fieldLabel: "Final Cash",
        oldValue: session.initialCash,
        newValue: session.finalCash,
      },
      {
        field: "cashDifference",
        fieldLabel: "Cash Difference",
        oldValue: 0,
        newValue: session.cashDifference,
      },
    ],
  });
}

export async function auditSessionSuspended(params: {
  session: POSSession;
  context: POSAuditContext;
}): Promise<void> {
  const { session, context } = params;
  await recordPOSAuditEvent(context, {
    action: "suspend_register",
    resource: "pos_session",
    resourceId: session.id,
    resourceName: `POS Session ${session.id}`,
    description: "Caja suspendida temporalmente",
    severity: "medium",
    metadata: {
      sessionId: session.id,
      notes: session.notes,
      status: session.status,
    },
    changes: [
      {
        field: "status",
        fieldLabel: "Status",
        oldValue: "OPEN",
        newValue: session.status,
      },
    ],
  });
}

export async function auditSessionResumed(params: {
  session: POSSession;
  context: POSAuditContext;
}): Promise<void> {
  const { session, context } = params;
  await recordPOSAuditEvent(context, {
    action: "resume_register",
    resource: "pos_session",
    resourceId: session.id,
    resourceName: `POS Session ${session.id}`,
    description: "Caja reanudada",
    severity: "medium",
    metadata: {
      sessionId: session.id,
      status: session.status,
    },
    changes: [
      {
        field: "status",
        fieldLabel: "Status",
        oldValue: "SUSPENDED",
        newValue: session.status,
      },
    ],
  });
}

export async function auditPaymentProcessed(params: {
  sessionId: string;
  cashierId: string;
  transaction: POSTransactionResult;
  cartId: string;
  context: POSAuditContext;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  const { sessionId, cashierId, transaction, cartId, context, metadata } =
    params;

  await recordPOSAuditEvent(
    { ...context, userId: cashierId },
    {
      action: "process_pos_payment",
      resource: "pos_transaction",
      resourceId: transaction.id,
      resourceName: transaction.transactionNumber,
      description: `Pago procesado (${transaction.paymentMethod}) por $${transaction.total.toFixed(
        2
      )}`,
      severity: "high",
      metadata: {
        sessionId,
        cartId,
        paymentMethod: transaction.paymentMethod,
        totals: {
          subtotal: transaction.subtotal,
          tax: transaction.tax,
          discount: transaction.discount,
          total: transaction.total,
          amountPaid: transaction.amountPaid,
          changeDue: transaction.changeDue,
        },
        itemCount: transaction.itemCount,
        ...metadata,
      },
      changes: [
        {
          field: "status",
          fieldLabel: "Transaction Type",
          oldValue: null,
          newValue: transaction.type,
        },
      ],
    }
  );
}

export async function auditTransactionVoided(params: {
  transactionId: string;
  originalTransactionNumber: string;
  sessionId: string;
  cashierId: string;
  reason: string;
  totals: {
    total: number;
    subtotal: number;
    tax: number;
    discount: number;
  };
  context: POSAuditContext;
}): Promise<void> {
  const { transactionId, originalTransactionNumber, sessionId, cashierId, reason, totals, context } =
    params;

  await recordPOSAuditEvent(
    { ...context, userId: cashierId },
    {
      action: "void_pos_transaction",
      resource: "pos_transaction",
      resourceId: transactionId,
      resourceName: `VOID of ${originalTransactionNumber}`,
      description: `Transacción anulada (${originalTransactionNumber})`,
      severity: "high",
      metadata: {
        sessionId,
        originalTransactionNumber,
        reason,
        totals,
      },
      changes: [
        {
          field: "type",
          fieldLabel: "Transaction Type",
          oldValue: "SALE",
          newValue: "VOID",
        },
      ],
    }
  );
}
