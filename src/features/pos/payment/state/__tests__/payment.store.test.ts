import { describe, expect, it, vi, beforeEach } from "vitest";
import { usePaymentStore } from "../payment.store";
import { processPaymentAction } from "../../server/actions";
import type { POSSaleSummary } from "@/features/pos/sale/types";
import { createPOSError } from "@/features/pos/errors";

vi.mock("../../server/actions", () => ({
  processPaymentAction: vi.fn(),
}));

const mockSummary: POSSaleSummary = {
  itemCount: 2,
  subtotal: 2000,
  discount: 0,
  fees: 0,
  tax: 320,
  taxRate: 0.16,
  total: 2320,
};

const mockTransaction = {
  id: "trx-123",
  transactionNumber: "POS-20250101-001",
  type: "SALE" as const,
  paymentMethod: "CASH" as const,
  subtotal: 2000,
  tax: 320,
  discount: 0,
  total: 2320,
  amountPaid: 2500,
  changeDue: 180,
  itemCount: 2,
  createdAt: new Date("2025-01-01T12:00:00Z"),
};

const initialState = usePaymentStore.getState();

const resetStore = () => {
  usePaymentStore.setState(initialState, true);
};

describe("Payment Store", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetStore();
  });

  describe("Initial State", () => {
    it("has correct initial state", () => {
      const state = usePaymentStore.getState();

      expect(state.saleSummary).toBeNull();
      expect(state.paymentMethod).toBeNull();
      expect(state.amountPaid).toBe(0);
      expect(state.cashAmount).toBe(0);
      expect(state.cardAmount).toBe(0);
      expect(state.transferAmount).toBe(0);
      expect(state.changeDue).toBe(0);
      expect(state.transactionId).toBeNull();
      expect(state.transactionNumber).toBeNull();
      expect(state.currentTransaction).toBeNull();
      expect(state.isProcessing).toBe(false);
      expect(state.isComplete).toBe(false);
      expect(state.isError).toBe(false);
      expect(state.lastError).toBeNull();
      expect(state.canProcess).toBe(false);
      expect(state.requiresChange).toBe(false);
    });
  });

  describe("setSaleSummary", () => {
    it("sets sale summary and recalculates derived state", () => {
      usePaymentStore.getState().setSaleSummary(mockSummary);

      const state = usePaymentStore.getState();
      expect(state.saleSummary).toEqual(mockSummary);
    });

    it("updates changeDue when amount paid is set", () => {
      usePaymentStore.getState().setSaleSummary(mockSummary);
      usePaymentStore.getState().setPaymentMethod("CASH");
      usePaymentStore.getState().setAmountPaid(3000);

      const state = usePaymentStore.getState();
      expect(state.changeDue).toBe(680); // 3000 - 2320
    });

    it("sets changeDue to 0 when no summary", () => {
      usePaymentStore.getState().setPaymentMethod("CASH");
      usePaymentStore.getState().setAmountPaid(3000);

      const state = usePaymentStore.getState();
      expect(state.changeDue).toBe(0);
    });
  });

  describe("setPaymentMethod", () => {
    it("sets payment method and resets transaction state", () => {
      // Set initial transaction state
      usePaymentStore.setState({
        isComplete: true,
        currentTransaction: mockTransaction,
        transactionId: "trx-123",
        transactionNumber: "POS-001",
        lastError: "Some error",
        isError: true,
      });

      usePaymentStore.getState().setPaymentMethod("CASH");

      const state = usePaymentStore.getState();
      expect(state.paymentMethod).toBe("CASH");
      expect(state.isComplete).toBe(false);
      expect(state.currentTransaction).toBeNull();
      expect(state.transactionId).toBeNull();
      expect(state.transactionNumber).toBeNull();
      expect(state.lastError).toBeNull();
      expect(state.isError).toBe(false);
    });

    it("updates canProcess when conditions are met", () => {
      usePaymentStore.getState().setSaleSummary(mockSummary);
      usePaymentStore.getState().setPaymentMethod("CASH");
      usePaymentStore.getState().setAmountPaid(2500);

      const state = usePaymentStore.getState();
      expect(state.canProcess).toBe(true);
    });
  });

  describe("setAmountPaid", () => {
    it("sets amount paid and updates corresponding payment method amount", () => {
      usePaymentStore.getState().setPaymentMethod("CASH");
      usePaymentStore.getState().setAmountPaid(2500);

      const state = usePaymentStore.getState();
      expect(state.amountPaid).toBe(2500);
      expect(state.cashAmount).toBe(2500);
    });

    it("updates card amount for CARD payment method", () => {
      usePaymentStore.getState().setPaymentMethod("CARD");
      usePaymentStore.getState().setAmountPaid(2320);

      const state = usePaymentStore.getState();
      expect(state.cardAmount).toBe(2320);
      expect(state.cashAmount).toBe(0);
    });

    it("updates transfer amount for TRANSFER payment method", () => {
      usePaymentStore.getState().setPaymentMethod("TRANSFER");
      usePaymentStore.getState().setAmountPaid(2320);

      const state = usePaymentStore.getState();
      expect(state.transferAmount).toBe(2320);
      expect(state.cashAmount).toBe(0);
    });

    it("calculates change correctly", () => {
      usePaymentStore.getState().setSaleSummary(mockSummary);
      usePaymentStore.getState().setPaymentMethod("CASH");
      usePaymentStore.getState().setAmountPaid(3000);

      const state = usePaymentStore.getState();
      expect(state.changeDue).toBe(680);
      expect(state.requiresChange).toBe(true);
    });

    it("resets error state", () => {
      usePaymentStore.setState({ isError: true, lastError: "Error" });
      usePaymentStore.getState().setAmountPaid(2500);

      const state = usePaymentStore.getState();
      expect(state.isError).toBe(false);
      expect(state.lastError).toBeNull();
    });
  });

  describe("setMixedPayment", () => {
    it("sets mixed payment amounts and updates state", () => {
      usePaymentStore.getState().setSaleSummary(mockSummary);
      usePaymentStore.getState().setMixedPayment(1000, 1000, 320);

      const state = usePaymentStore.getState();
      expect(state.paymentMethod).toBe("MIXED");
      expect(state.cashAmount).toBe(1000);
      expect(state.cardAmount).toBe(1000);
      expect(state.transferAmount).toBe(320);
      expect(state.amountPaid).toBe(2320);
    });

    it("calculates change for mixed payment", () => {
      usePaymentStore.getState().setSaleSummary(mockSummary);
      usePaymentStore.getState().setMixedPayment(1500, 1000, 0);

      const state = usePaymentStore.getState();
      expect(state.amountPaid).toBe(2500);
      expect(state.changeDue).toBe(180);
    });

    it("enables canProcess when mixed payment is sufficient", () => {
      usePaymentStore.getState().setSaleSummary(mockSummary);
      usePaymentStore.getState().setMixedPayment(1000, 1000, 320);

      const state = usePaymentStore.getState();
      expect(state.canProcess).toBe(true);
    });

    it("resets error state", () => {
      usePaymentStore.setState({ isError: true, lastError: "Error" });
      usePaymentStore.getState().setMixedPayment(1000, 1000, 320);

      const state = usePaymentStore.getState();
      expect(state.isError).toBe(false);
      expect(state.lastError).toBeNull();
    });
  });

  describe("processPayment", () => {
    it("processes payment successfully", async () => {
      vi.mocked(processPaymentAction).mockResolvedValue({
        success: true,
        data: { transaction: mockTransaction },
      });

      usePaymentStore.getState().setSaleSummary(mockSummary);
      usePaymentStore.getState().setPaymentMethod("CASH");
      usePaymentStore.getState().setAmountPaid(2500);

      const result = await usePaymentStore.getState().processPayment({
        sessionId: "session-123",
        paymentMethod: "CASH",
        amountPaid: 2500,
      });

      expect(result.success).toBe(true);
      expect(result.transaction).toEqual(mockTransaction);

      const state = usePaymentStore.getState();
      expect(state.isProcessing).toBe(false);
      expect(state.isComplete).toBe(true);
      expect(state.currentTransaction).toEqual(mockTransaction);
      expect(state.transactionId).toBe("trx-123");
      expect(state.transactionNumber).toBe("POS-20250101-001");
      expect(state.changeDue).toBe(180);
      expect(state.canProcess).toBe(false);
    });

    it("sets isProcessing during payment", async () => {
      vi.mocked(processPaymentAction).mockImplementation(
        () =>
          new Promise((resolve) => {
            const state = usePaymentStore.getState();
            expect(state.isProcessing).toBe(true);
            resolve({ success: true, data: { transaction: mockTransaction } });
          })
      );

      await usePaymentStore.getState().processPayment({
        sessionId: "session-123",
        paymentMethod: "CASH",
        amountPaid: 2500,
      });
    });

    it("handles payment failure with error result", async () => {
      vi.mocked(processPaymentAction).mockResolvedValue({
        success: false,
        error: createPOSError("PAYMENT_INSUFFICIENT_FUNDS").toJSON(),
      });

      const result = await usePaymentStore.getState().processPayment({
        sessionId: "session-123",
        paymentMethod: "CASH",
        amountPaid: 2000,
      });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();

      const state = usePaymentStore.getState();
      expect(state.isProcessing).toBe(false);
      expect(state.isComplete).toBe(false);
      expect(state.isError).toBe(true);
      expect(state.lastError).toBeDefined();
    });

    it("handles thrown errors during payment", async () => {
      vi.mocked(processPaymentAction).mockRejectedValue(
        new Error("Network error")
      );

      const result = await usePaymentStore.getState().processPayment({
        sessionId: "session-123",
        paymentMethod: "CASH",
        amountPaid: 2500,
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe("Network error");

      const state = usePaymentStore.getState();
      expect(state.isProcessing).toBe(false);
      expect(state.isError).toBe(true);
      expect(state.lastError).toBe("Network error");
    });

    it("handles non-Error thrown values", async () => {
      vi.mocked(processPaymentAction).mockRejectedValue("String error");

      const result = await usePaymentStore.getState().processPayment({
        sessionId: "session-123",
        paymentMethod: "CASH",
        amountPaid: 2500,
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe("Payment processing error");
    });
  });

  describe("resetPayment", () => {
    it("resets all state to initial values", () => {
      // Set various state values
      usePaymentStore.setState({
        saleSummary: mockSummary,
        paymentMethod: "CASH",
        amountPaid: 2500,
        cashAmount: 2500,
        changeDue: 180,
        transactionId: "trx-123",
        transactionNumber: "POS-001",
        currentTransaction: mockTransaction,
        isProcessing: false,
        isComplete: true,
        isError: false,
        lastError: null,
        canProcess: false,
        requiresChange: true,
      });

      usePaymentStore.getState().resetPayment();

      const state = usePaymentStore.getState();
      expect(state).toEqual(initialState);
    });
  });

  describe("Derived State - canProcess", () => {
    it("is false when payment method is not set", () => {
      usePaymentStore.getState().setSaleSummary(mockSummary);
      usePaymentStore.getState().setAmountPaid(2500);

      const state = usePaymentStore.getState();
      expect(state.canProcess).toBe(false);
    });

    it("is false when sale summary is not set", () => {
      usePaymentStore.getState().setPaymentMethod("CASH");
      usePaymentStore.getState().setAmountPaid(2500);

      const state = usePaymentStore.getState();
      expect(state.canProcess).toBe(false);
    });

    it("is false when amount paid is insufficient", () => {
      usePaymentStore.getState().setSaleSummary(mockSummary);
      usePaymentStore.getState().setPaymentMethod("CASH");
      usePaymentStore.getState().setAmountPaid(2000);

      const state = usePaymentStore.getState();
      expect(state.canProcess).toBe(false);
    });

    it("is false when payment is processing", () => {
      usePaymentStore.setState({
        saleSummary: mockSummary,
        paymentMethod: "CASH",
        amountPaid: 2500,
        isProcessing: true,
      });

      // Trigger derived state calculation
      usePaymentStore.getState().setAmountPaid(2500);

      const state = usePaymentStore.getState();
      expect(state.canProcess).toBe(false);
    });

    it("is false when payment is complete", async () => {
      // Mock successful payment
      vi.mocked(processPaymentAction).mockResolvedValue({
        success: true,
        data: { transaction: mockTransaction },
      });

      // Set initial state with all conditions met
      usePaymentStore.getState().setSaleSummary(mockSummary);
      usePaymentStore.getState().setPaymentMethod("CASH");
      usePaymentStore.getState().setAmountPaid(2500);

      // Process payment (which marks as complete)
      await usePaymentStore.getState().processPayment({
        sessionId: "session-123",
        paymentMethod: "CASH",
        amountPaid: 2500,
      });

      const state = usePaymentStore.getState();
      expect(state.isComplete).toBe(true);
      expect(state.canProcess).toBe(false);
    });

    it("is true when all conditions are met", () => {
      usePaymentStore.getState().setSaleSummary(mockSummary);
      usePaymentStore.getState().setPaymentMethod("CASH");
      usePaymentStore.getState().setAmountPaid(2500);

      const state = usePaymentStore.getState();
      expect(state.canProcess).toBe(true);
    });
  });

  describe("Derived State - requiresChange", () => {
    it("is false when no change is due", () => {
      usePaymentStore.getState().setSaleSummary(mockSummary);
      usePaymentStore.getState().setPaymentMethod("CASH");
      usePaymentStore.getState().setAmountPaid(2320);

      const state = usePaymentStore.getState();
      expect(state.requiresChange).toBe(false);
      expect(state.changeDue).toBe(0);
    });

    it("is true when change is due", () => {
      usePaymentStore.getState().setSaleSummary(mockSummary);
      usePaymentStore.getState().setPaymentMethod("CASH");
      usePaymentStore.getState().setAmountPaid(3000);

      const state = usePaymentStore.getState();
      expect(state.requiresChange).toBe(true);
      expect(state.changeDue).toBe(680);
    });
  });

  describe("Edge Cases", () => {
    it("handles exact payment amount", () => {
      usePaymentStore.getState().setSaleSummary(mockSummary);
      usePaymentStore.getState().setPaymentMethod("CARD");
      usePaymentStore.getState().setAmountPaid(2320);

      const state = usePaymentStore.getState();
      expect(state.changeDue).toBe(0);
      expect(state.requiresChange).toBe(false);
      expect(state.canProcess).toBe(true);
    });

    it("handles zero amount paid", () => {
      usePaymentStore.getState().setSaleSummary(mockSummary);
      usePaymentStore.getState().setPaymentMethod("CASH");
      usePaymentStore.getState().setAmountPaid(0);

      const state = usePaymentStore.getState();
      expect(state.canProcess).toBe(false);
    });

    it("handles null transaction in success response", async () => {
      vi.mocked(processPaymentAction).mockResolvedValue({
        success: true,
        data: { transaction: null },
      });

      const result = await usePaymentStore.getState().processPayment({
        sessionId: "session-123",
        paymentMethod: "CASH",
        amountPaid: 2500,
      });

      expect(result.success).toBe(true);
      expect(result.transaction).toBeNull();

      const state = usePaymentStore.getState();
      expect(state.transactionId).toBeNull();
      expect(state.transactionNumber).toBeNull();
    });
  });
});
