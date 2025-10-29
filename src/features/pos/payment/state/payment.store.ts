/**
 * 💳 POS PAYMENT STORE (Zustand)
 * ==============================
 *
 * Handles payment orchestration for the POS checkout.
 * Keeps derived data (change due, canProcess, flags) as part of the store
 * so consumers can subscribe to primitives and avoid re-renders.
 */

"use client";

import { useCallback, useMemo } from "react";
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { processPaymentAction } from "../server/actions";
import {
  calculateChange,
  type POSPaymentState,
  type POSPaymentMethod,
  type ProcessPaymentInput,
  type ProcessPaymentResult,
  type POSTransactionResult,
} from "../types";
import type { POSSaleSummary } from "../../sale/types";
import { useQueryClient } from "@tanstack/react-query";
import { posKeys } from "../../hooks/queryKeys";
import { useAuth } from "@/shared/hooks/useAuth";
import { useSaleSessionId } from "../../sale/state/sale.store";
import { logger } from "@/shared/utils/logger";

interface PaymentStoreState {
  saleSummary: POSSaleSummary | null;
  paymentMethod: POSPaymentMethod | null;
  amountPaid: number;
  cashAmount: number;
  cardAmount: number;
  transferAmount: number;
  changeDue: number;

  transactionId: string | null;
  transactionNumber: string | null;
  currentTransaction: POSTransactionResult | null;

  isProcessing: boolean;
  isComplete: boolean;
  isError: boolean;
  lastError: string | null;
  canProcess: boolean;
  requiresChange: boolean;
}

interface PaymentStoreActions {
  setSaleSummary: (summary: POSSaleSummary | null) => void;
  setPaymentMethod: (method: POSPaymentMethod) => void;
  setAmountPaid: (amount: number) => void;
  setMixedPayment: (cash: number, card: number, transfer: number) => void;
  processPayment: (
    input: ProcessPaymentInput
  ) => Promise<ProcessPaymentResult>;
  resetPayment: () => void;
}

type PaymentStore = PaymentStoreState & PaymentStoreActions;

const STORE_NAME = "POS-Payment-Store";

const initialPaymentState = (): PaymentStoreState => ({
  saleSummary: null,
  paymentMethod: null,
  amountPaid: 0,
  cashAmount: 0,
  cardAmount: 0,
  transferAmount: 0,
  changeDue: 0,
  transactionId: null,
  transactionNumber: null,
  currentTransaction: null,
  isProcessing: false,
  isComplete: false,
  isError: false,
  lastError: null,
  canProcess: false,
  requiresChange: false,
});

const derivePaymentState = (
  draft: PaymentStoreState
): PaymentStoreState => {
  const saleSummary = draft.saleSummary;
  const total = saleSummary?.total ?? 0;
  const amountPaid = draft.amountPaid;
  const changeDue =
    saleSummary && amountPaid > 0
      ? calculateChange(amountPaid, total)
      : 0;

  const canProcess =
    !!draft.paymentMethod &&
    !!saleSummary &&
    amountPaid >= total &&
    !draft.isProcessing &&
    !draft.isComplete;

  return {
    ...draft,
    changeDue,
    canProcess,
    requiresChange: changeDue > 0,
  };
};

export const usePaymentStore = create<PaymentStore>()(
  devtools(
    (set, get) => ({
      ...initialPaymentState(),

      setSaleSummary: (summary) =>
        set((state) => {
          const next: PaymentStoreState = derivePaymentState({
            ...state,
            saleSummary: summary,
          });
          return {
            ...state,
            ...next,
          };
        }),

      setPaymentMethod: (method) =>
        set((state) => {
          const next: PaymentStoreState = derivePaymentState({
            ...state,
            paymentMethod: method,
            lastError: null,
            isError: false,
            isComplete: false,
            currentTransaction: null,
            transactionId: null,
            transactionNumber: null,
          });
          return {
            ...state,
            ...next,
          };
        }),

      setAmountPaid: (amount) =>
        set((state) => {
          const next: PaymentStoreState = derivePaymentState({
            ...state,
            amountPaid: amount,
            cashAmount:
              state.paymentMethod === "CASH" ? amount : state.cashAmount,
            cardAmount:
              state.paymentMethod === "CARD" ? amount : state.cardAmount,
            transferAmount:
              state.paymentMethod === "TRANSFER"
                ? amount
                : state.transferAmount,
            lastError: null,
            isError: false,
            isComplete: false,
          });
          return {
            ...state,
            ...next,
          };
        }),

      setMixedPayment: (cash, card, transfer) =>
        set((state) => {
          const totalMixed = cash + card + transfer;
          const next: PaymentStoreState = derivePaymentState({
            ...state,
            paymentMethod: "MIXED",
            cashAmount: cash,
            cardAmount: card,
            transferAmount: transfer,
            amountPaid: totalMixed,
            lastError: null,
            isError: false,
            isComplete: false,
          });

          return {
            ...state,
            ...next,
          };
        }),

      processPayment: async (input) => {
        const { paymentMethod } = input;
        set((state) => ({
          ...state,
          isProcessing: true,
          isError: false,
          lastError: null,
        }));

        try {
          const result = await processPaymentAction(input);

          if (result.success && result.data) {
            const transaction = result.data.transaction;

            set((state) => ({
              ...state,
              isProcessing: false,
              isComplete: true,
              currentTransaction: transaction,
              transactionId: transaction?.id ?? null,
              transactionNumber: transaction?.transactionNumber ?? null,
              changeDue: transaction?.changeDue ?? state.changeDue,
              requiresChange:
                (transaction?.changeDue ?? state.changeDue) > 0,
              canProcess: false,
            }));

            return {
              success: true,
              transaction: transaction ?? null,
              error: null,
            };
          }

          const errorMessage =
            result.error ?? "Payment processing failed";

          set((state) => ({
            ...state,
            isProcessing: false,
            isComplete: false,
            isError: true,
            lastError: errorMessage,
          }));

          return {
            success: false,
            transaction: null,
            error: errorMessage,
          };
        } catch (error) {
          logger.error("POS Payment Store: process payment failed", {
            error,
          });
          const message =
            error instanceof Error
              ? error.message
              : "Payment processing error";

          set((state) => ({
            ...state,
            isProcessing: false,
            isComplete: false,
            isError: true,
            lastError: message,
          }));

          return {
            success: false,
            transaction: null,
            error: message,
          };
        }
      },

      resetPayment: () =>
        set(() => ({
          ...initialPaymentState(),
        })),
    }),
    { name: STORE_NAME }
  )
);

// ---------------------------------------------------------------------------
// SELECTORS
// ---------------------------------------------------------------------------

export const usePaymentState = () => {
  const saleSummary = usePaymentStore((state) => state.saleSummary);
  const paymentMethod = usePaymentStore((state) => state.paymentMethod);
  const amountPaid = usePaymentStore((state) => state.amountPaid);
  const cashAmount = usePaymentStore((state) => state.cashAmount);
  const cardAmount = usePaymentStore((state) => state.cardAmount);
  const transferAmount = usePaymentStore(
    (state) => state.transferAmount
  );
  const changeDue = usePaymentStore((state) => state.changeDue);
  const currentTransaction = usePaymentStore(
    (state) => state.currentTransaction
  );
  const transactionId = usePaymentStore((state) => state.transactionId);
  const transactionNumber = usePaymentStore(
    (state) => state.transactionNumber
  );

  return useMemo(
    () => ({
      saleSummary,
      paymentMethod,
      amountPaid,
      cashAmount,
      cardAmount,
      transferAmount,
      changeDue,
      currentTransaction,
      transactionId,
      transactionNumber,
    }),
    [
      amountPaid,
      cardAmount,
      cashAmount,
      changeDue,
      currentTransaction,
      paymentMethod,
      saleSummary,
      transactionId,
      transactionNumber,
      transferAmount,
    ]
  );
};

export const usePaymentStatus = () => {
  const isProcessing = usePaymentStore((state) => state.isProcessing);
  const isComplete = usePaymentStore((state) => state.isComplete);
  const isError = usePaymentStore((state) => state.isError);
  const lastError = usePaymentStore((state) => state.lastError);
  const canProcess = usePaymentStore((state) => state.canProcess);
  const requiresChange = usePaymentStore(
    (state) => state.requiresChange
  );

  return useMemo(
    () => ({
      isProcessing,
      isComplete,
      isError,
      lastError,
      canProcess,
      requiresChange,
    }),
    [canProcess, isComplete, isError, isProcessing, lastError, requiresChange]
  );
};

export const useCurrentTransaction = () =>
  usePaymentStore((state) => state.currentTransaction);

export const useChangeDue = () =>
  usePaymentStore((state) => state.changeDue);

export const useCanProcessPayment = () =>
  usePaymentStore((state) => state.canProcess);

export const usePaymentProcessing = () =>
  usePaymentStore((state) => state.isProcessing);

export const usePaymentComplete = () =>
  usePaymentStore((state) => state.isComplete);

export const usePaymentError = () =>
  usePaymentStore((state) => state.lastError);

// ---------------------------------------------------------------------------
// ACTION HOOKS
// ---------------------------------------------------------------------------

export const usePaymentActions = () => {
  const setSaleSummary = usePaymentStore((state) => state.setSaleSummary);
  const setPaymentMethod = usePaymentStore(
    (state) => state.setPaymentMethod
  );
  const setAmountPaid = usePaymentStore((state) => state.setAmountPaid);
  const setMixedPayment = usePaymentStore(
    (state) => state.setMixedPayment
  );
  const storeProcessPayment = usePaymentStore(
    (state) => state.processPayment
  );
  const resetPayment = usePaymentStore((state) => state.resetPayment);
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const defaultSessionId = useSaleSessionId();

  const processPayment = useCallback(
    async (input: ProcessPaymentInput) => {
      const result = await storeProcessPayment(input);

      if (result.success) {
        const sessionId = input.sessionId ?? defaultSessionId ?? undefined;

        // Invalidate recent transactions for history tab
        queryClient.invalidateQueries({
          queryKey: posKeys.transactionList({
            sessionId,
            userId: user?.id,
            limit: 50,
          }),
        });

        queryClient.invalidateQueries({ queryKey: posKeys.transactions() });

        if (sessionId) {
          queryClient.invalidateQueries({
            queryKey: posKeys.saleWithSummary(sessionId),
          });
          queryClient.invalidateQueries({
            queryKey: posKeys.activeSale(sessionId),
          });
        }

        if (user?.id) {
          queryClient.invalidateQueries({
            queryKey: posKeys.dashboardData(user.id),
          });
        }
      }

      return result;
    },
    [storeProcessPayment, queryClient, user?.id, defaultSessionId]
  );

  return useMemo(
    () => ({
      setSaleSummary,
      setPaymentMethod,
      setAmountPaid,
      setMixedPayment,
      processPayment,
      resetPayment,
    }),
    [
      processPayment,
      resetPayment,
      setAmountPaid,
      setMixedPayment,
      setPaymentMethod,
      setSaleSummary,
    ]
  );
};

/**
 * Convenience hook mirroring the legacy context API.
 */
export const usePaymentStoreFacade = () => {
  const state = usePaymentState();
  const status = usePaymentStatus();
  const actions = usePaymentActions();

  return useMemo(
    () => ({
      ...state,
      ...status,
      ...actions,
    }),
    [actions, state, status]
  );
};

export type { PaymentStoreState };
