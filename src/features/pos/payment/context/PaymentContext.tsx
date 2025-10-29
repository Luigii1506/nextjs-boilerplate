"use client";
/**
 * 💳 POS Payment Context
 * ======================
 *
 * Context provider para gestionar pagos en POS.
 * Similar a CheckoutContext pero optimizado para punto de venta.
 *
 * @module pos/payment/context/PaymentContext
 * @version 1.0.0
 */

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
} from "react";
import { logger } from "@/shared/utils/logger";
import * as actions from "../server/actions";
import type {
  POSPaymentContextValue,
  POSPaymentState,
  ProcessPaymentInput,
  ProcessPaymentResult,
  POSTransactionResult,
} from "../types";
import { calculateChange } from "../types";
import type { POSPaymentMethod } from "../../types/models";

// ========================================
// CONTEXT
// ========================================

const PaymentContext = createContext<POSPaymentContextValue | null>(null);

// ========================================
// INITIAL STATE
// ========================================

const INITIAL_PAYMENT_STATE: POSPaymentState = {
  saleSummary: null,
  paymentMethod: null,
  amountPaid: 0,
  changeDue: 0,
  cashAmount: 0,
  cardAmount: 0,
  transferAmount: 0,
  transactionId: null,
  transactionNumber: null,
  isProcessing: false,
  isComplete: false,
  error: null,
};

// ========================================
// PROVIDER
// ========================================

interface PaymentProviderProps {
  children: React.ReactNode;
}

export function PaymentProvider({ children }: PaymentProviderProps) {
  // ========================================
  // STATE
  // ========================================

  const [paymentState, setPaymentState] =
    useState<POSPaymentState>(INITIAL_PAYMENT_STATE);

  const [currentTransaction, setCurrentTransaction] =
    useState<POSTransactionResult | null>(null);

  // ========================================
  // COMPUTED VALUES
  // ========================================

  const isProcessing = useMemo(
    () => paymentState.isProcessing,
    [paymentState.isProcessing]
  );

  const isComplete = useMemo(
    () => paymentState.isComplete,
    [paymentState.isComplete]
  );

  const error = useMemo(() => paymentState.error, [paymentState.error]);

  const canProcess = useMemo(() => {
    if (!paymentState.paymentMethod) return false;
    if (!paymentState.saleSummary) return false;
    if (paymentState.amountPaid < paymentState.saleSummary.total) return false;
    if (isProcessing) return false;
    return true;
  }, [
    paymentState.paymentMethod,
    paymentState.saleSummary,
    paymentState.amountPaid,
    isProcessing,
  ]);

  const changeDue = useMemo(() => {
    if (!paymentState.saleSummary) return 0;
    return calculateChange(
      paymentState.amountPaid,
      paymentState.saleSummary.total
    );
  }, [paymentState.amountPaid, paymentState.saleSummary]);

  const requiresChange = useMemo(() => {
    return changeDue > 0;
  }, [changeDue]);

  // ========================================
  // ACTIONS
  // ========================================

  /**
   * Establecer método de pago
   */
  const setPaymentMethod = useCallback((method: POSPaymentMethod) => {
    setPaymentState((prev) => ({
      ...prev,
      paymentMethod: method,
      error: null,
    }));
  }, []);

  /**
   * Establecer monto pagado
   */
  const setAmountPaid = useCallback((amount: number) => {
    setPaymentState((prev) => ({
      ...prev,
      amountPaid: amount,
      changeDue: prev.saleSummary
        ? calculateChange(amount, prev.saleSummary.total)
        : 0,
    }));
  }, []);

  /**
   * Establecer pago mixto
   */
  const setMixedPayment = useCallback(
    (cash: number, card: number, transfer: number) => {
      const total = cash + card + transfer;
      setPaymentState((prev) => ({
        ...prev,
        paymentMethod: "MIXED",
        cashAmount: cash,
        cardAmount: card,
        transferAmount: transfer,
        amountPaid: total,
        changeDue: prev.saleSummary
          ? calculateChange(total, prev.saleSummary.total)
          : 0,
      }));
    },
    []
  );

  /**
   * Procesar pago
   */
  const processPayment = useCallback(
    async (input: ProcessPaymentInput): Promise<ProcessPaymentResult> => {
      try {
        // Update state: processing
        setPaymentState((prev) => ({
          ...prev,
          isProcessing: true,
          error: null,
        }));

        // Call server action
        const result = await actions.processPaymentAction(input);

        if (result.success && result.data) {
          const { transaction } = result.data;

          if (transaction) {
            // Update state: success
            setPaymentState((prev) => ({
              ...prev,
              isProcessing: false,
              isComplete: true,
              transactionId: transaction.id,
              transactionNumber: transaction.transactionNumber,
            }));

            setCurrentTransaction(transaction);

            return {
              success: true,
              transaction,
              error: null,
            };
          }
        }

        // Update state: error
        setPaymentState((prev) => ({
          ...prev,
          isProcessing: false,
          error: result.error || "Payment failed",
        }));

        return {
          success: false,
          transaction: null,
          error: result.error || "Payment failed",
        };
      } catch (error) {
        logger.error("PaymentContext: process payment error", { error });

        const errorMessage =
          error instanceof Error ? error.message : "Payment failed";

        setPaymentState((prev) => ({
          ...prev,
          isProcessing: false,
          error: errorMessage,
        }));

        return {
          success: false,
          transaction: null,
          error: errorMessage,
        };
      }
    },
    []
  );

  /**
   * Resetear estado de pago
   */
  const resetPayment = useCallback(() => {
    setPaymentState(INITIAL_PAYMENT_STATE);
    setCurrentTransaction(null);
  }, []);

  // ========================================
  // CONTEXT VALUE
  // ========================================

  const value: POSPaymentContextValue = {
    // State
    paymentState,
    isProcessing,
    isComplete,
    error,
    currentTransaction,

    // Actions
    setPaymentMethod,
    setAmountPaid,
    setMixedPayment,
    processPayment,
    resetPayment,

    // Computed
    canProcess,
    changeDue,
    requiresChange,
  };

  return (
    <PaymentContext.Provider value={value}>{children}</PaymentContext.Provider>
  );
}

// ========================================
// HOOK
// ========================================

/**
 * Hook para acceder al contexto de Payment
 *
 * @throws Error si se usa fuera del PaymentProvider
 */
export function usePaymentContext(): POSPaymentContextValue {
  const context = useContext(PaymentContext);

  if (!context) {
    throw new Error("usePaymentContext must be used within a PaymentProvider");
  }

  return context;
}
