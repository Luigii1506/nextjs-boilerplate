import { describe, expect, it, vi } from "vitest";
import { processPaymentUseCase } from "../processPayment.use-case";
import { POSPaymentMethod } from "@/features/pos/types/models";
import { prisma } from "@/core/database/prisma";
import { calculateSaleSummary } from "@/features/pos/sale/server/queries";
import { validateSaleForCheckout } from "@/features/pos/sale/server/service";
import { finalizeCartCheckout } from "@/features/pos/sale/server/cart.repository";
import { auditPaymentProcessed } from "@/features/pos/audit/posAudit.service";

vi.mock("@/core/database/prisma", () => {
  const cartFindFirst = vi.fn();
  const transactionFindFirst = vi.fn();
  const transactionCreate = vi.fn();
  const productUpdate = vi.fn();
  const transaction = vi.fn(async (callback: any) =>
    callback({
      pOSTransaction: { create: transactionCreate },
      product: { update: productUpdate },
    })
  );

  return {
    prisma: {
      pOSCart: { findFirst: cartFindFirst },
      pOSTransaction: {
        findFirst: transactionFindFirst,
      },
      $transaction: transaction,
      product: {
        update: productUpdate,
      },
    },
  };
});

vi.mock("@/features/pos/sale/server/service", () => ({
  validateSaleForCheckout: vi.fn(),
}));

vi.mock("@/features/pos/sale/server/queries", () => ({
  calculateSaleSummary: vi.fn(),
}));

vi.mock("@/features/pos/sale/server/cart.repository", () => ({
  finalizeCartCheckout: vi.fn(),
}));

vi.mock("@/features/pos/audit/posAudit.service", () => ({
  auditPaymentProcessed: vi.fn(),
}));

const prismaMock = prisma as unknown as {
  pOSCart: { findFirst: ReturnType<typeof vi.fn> };
  pOSTransaction: { findFirst: ReturnType<typeof vi.fn> };
  $transaction: ReturnType<typeof vi.fn>;
};

const validateSaleForCheckoutMock = vi.mocked(validateSaleForCheckout);
const calculateSaleSummaryMock = vi.mocked(calculateSaleSummary);
const finalizeCartCheckoutMock = vi.mocked(finalizeCartCheckout);
const auditPaymentProcessedMock = vi.mocked(auditPaymentProcessed);

const sessionId = "00000000-0000-0000-0000-000000000010";
const cartId = "00000000-0000-0000-0000-000000000011";
const productId = "00000000-0000-0000-0000-000000000012";
const cashierId = "00000000-0000-0000-0000-000000000013";

const sessionCart = {
  id: cartId,
  sessionId,
  status: "ACTIVE",
  items: [
    {
      id: "item-1",
      productId,
      productSku: "SKU-1",
      productName: "Producto",
      quantity: 2,
      unitPrice: 1000,
      discount: 0,
      subtotal: 2000,
      tax: 320,
      total: 2320,
      product: {
        id: productId,
        name: "Producto",
        sku: "SKU-1",
        stock: 5,
      },
    },
  ],
  adjustments: [],
  session: {
    id: sessionId,
    userId: cashierId,
  },
};

const saleSummary = {
  subtotal: 2000,
  discount: 0,
  tax: 320,
  total: 2320,
  itemCount: 2,
  totalSales: 2320,
  totalVoids: 0,
  totalRefunds: 0,
  netSales: 2320,
  cashSales: 2320,
  cardSales: 0,
  transferSales: 0,
  mixedSales: 0,
  totalItemsSold: 2,
  averageTicket: 2320,
};

describe("processPaymentUseCase", () => {
  it("persists the payment and triggers audit flow", async () => {
    prismaMock.pOSCart.findFirst.mockResolvedValue(sessionCart as any);
    prismaMock.pOSTransaction.findFirst.mockResolvedValue(null);
    validateSaleForCheckoutMock.mockResolvedValue({ isValid: true, errors: [] });
    calculateSaleSummaryMock.mockResolvedValue(saleSummary);
    finalizeCartCheckoutMock.mockResolvedValue(undefined);

    const createdTransaction = {
      id: "00000000-0000-0000-0000-000000000099",
      transactionNumber: "POS-20250101-001",
      type: "SALE",
      paymentMethod: POSPaymentMethod.CASH,
      subtotal: 2000,
      tax: 320,
      discount: 0,
      total: 2320,
      amountPaid: 2500,
      changeDue: 180,
      items: sessionCart.items,
      createdAt: new Date("2025-01-01T12:00:00Z"),
    };

    const transactionCreate = vi.fn().mockResolvedValue(createdTransaction);
    const productUpdate = vi.fn().mockResolvedValue(undefined);

    (prisma as any).$transaction.mockImplementation(async (cb: any) =>
      cb({
        pOSTransaction: { create: transactionCreate },
        product: { update: productUpdate },
      })
    );

    const input = {
      sessionId,
      paymentMethod: POSPaymentMethod.CASH,
      amountPaid: 2500,
      notes: "Pago en efectivo",
      referenceNumber: "REF-001",
    } as const;

    const result = await processPaymentUseCase(input, {
      userId: cashierId,
      ipAddress: "127.0.0.1",
      userAgent: "vitest",
    });

    expect(result.transaction).toMatchObject({
      id: createdTransaction.id,
      paymentMethod: POSPaymentMethod.CASH,
      total: createdTransaction.total,
    });
    expect(transactionCreate).toHaveBeenCalled();
    expect(productUpdate).toHaveBeenCalled();
    expect(finalizeCartCheckoutMock).toHaveBeenCalledWith(sessionCart.id);
    expect(auditPaymentProcessedMock).toHaveBeenCalledWith(
      expect.objectContaining({
        sessionId: input.sessionId,
        cashierId,
        transaction: expect.objectContaining({
          id: createdTransaction.id,
          total: createdTransaction.total,
        }),
        context: expect.objectContaining({
          userId: cashierId,
          ipAddress: "127.0.0.1",
        }),
      })
    );
  });

  it("throws when the amount paid is insufficient", async () => {
    prismaMock.pOSCart.findFirst.mockResolvedValue(sessionCart as any);
    validateSaleForCheckoutMock.mockResolvedValue({ isValid: true, errors: [] });
    calculateSaleSummaryMock.mockResolvedValue({ ...saleSummary, total: 3000 });

    await expect(
      processPaymentUseCase(
        {
          sessionId,
          paymentMethod: POSPaymentMethod.CASH,
          amountPaid: 1000,
        },
        { userId: cashierId }
      )
    ).rejects.toMatchObject({ code: "POS_PAYMENT_INSUFFICIENT_FUNDS" });
    expect(auditPaymentProcessedMock).not.toHaveBeenCalled();
  });

  it("throws when the sale is missing", async () => {
    prismaMock.pOSCart.findFirst.mockResolvedValue(null);
    validateSaleForCheckoutMock.mockResolvedValue({ isValid: true, errors: [] });

    await expect(
      processPaymentUseCase(
        {
          sessionId,
          paymentMethod: POSPaymentMethod.CASH,
          amountPaid: 1000,
        },
        { userId: cashierId }
      )
    ).rejects.toMatchObject({ code: "POS_SALE_NOT_FOUND" });
  });
});
