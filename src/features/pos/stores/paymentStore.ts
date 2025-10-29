/**
 * 💳 POS Payment Store (Zustand)
 * ===============================
 *
 * Global state management for POS payments using Zustand.
 * Replaces the old PaymentProvider with a centralized store.
 *
 * @module pos/stores/paymentStore
 * @version 3.0.0
 * Updated: 2025-10-28 - Added computed selectors and stabilized action hooks for React 19
 */

'use client';

import { useMemo } from 'react';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import * as actions from '../payment/server/actions';
import type {
  POSPaymentState,
  ProcessPaymentInput,
  ProcessPaymentResult,
  POSTransactionResult,
} from '../payment/types';
import { calculateChange } from '../payment/types';
import type { POSPaymentMethod } from '../types/models';
import type { POSSaleSummary } from '../sale/types';

// ========================================
// TYPES
// ========================================

interface PaymentStoreState {
  // State
  paymentState: POSPaymentState;
  currentTransaction: POSTransactionResult | null;

  // Computed selectors (stable functions)
  isProcessing: () => boolean;
  isComplete: () => boolean;
  error: () => string | null;
  changeDue: () => number;
  canProcess: () => boolean;
  requiresChange: () => boolean;

  // Actions
  setPaymentMethod: (method: POSPaymentMethod) => void;
  setAmountPaid: (amount: number) => void;
  setMixedPayment: (cash: number, card: number, transfer: number) => void;
  setSaleSummary: (summary: POSSaleSummary) => void;
  processPayment: (input: ProcessPaymentInput) => Promise<ProcessPaymentResult>;
  resetPayment: () => void;
}

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
// STORE
// ========================================

export const usePaymentStore = create<PaymentStoreState>()(
  devtools(
    (set, get) => ({
      // ========================================
      // INITIAL STATE
      // ========================================

      paymentState: INITIAL_PAYMENT_STATE,
      currentTransaction: null,

      // ========================================
      // ACTIONS
      // ========================================

      /**
       * Set payment method
       */
      setPaymentMethod: (method: POSPaymentMethod) => {
        set({
          paymentState: {
            ...get().paymentState,
            paymentMethod: method,
            error: null,
          },
        });
      },

      /**
       * Set amount paid
       */
      setAmountPaid: (amount: number) => {
        const state = get().paymentState;

        set({
          paymentState: {
            ...state,
            amountPaid: amount,
            changeDue: state.saleSummary
              ? calculateChange(amount, state.saleSummary.total)
              : 0,
          },
        });
      },

      /**
       * Set mixed payment (cash + card + transfer)
       */
      setMixedPayment: (cash: number, card: number, transfer: number) => {
        const total = cash + card + transfer;
        const state = get().paymentState;

        set({
          paymentState: {
            ...state,
            paymentMethod: 'MIXED',
            cashAmount: cash,
            cardAmount: card,
            transferAmount: transfer,
            amountPaid: total,
            changeDue: state.saleSummary
              ? calculateChange(total, state.saleSummary.total)
              : 0,
          },
        });
      },

      /**
       * Set sale summary (from cart)
       */
      setSaleSummary: (summary: POSSaleSummary) => {
        set({
          paymentState: {
            ...get().paymentState,
            saleSummary: summary,
          },
        });
      },

      /**
       * Process payment
       */
      processPayment: async (input: ProcessPaymentInput) => {
        const state = get().paymentState;

        // Update state to processing
        set({
          paymentState: {
            ...state,
            isProcessing: true,
            error: null,
          },
        });

        try {
          const result = await actions.processPaymentAction(input);

          if (result.success && result.data) {
            // Payment successful
            set({
              paymentState: {
                ...state,
                isProcessing: false,
                isComplete: true,
                transactionId: result.data.transaction.id,
                transactionNumber: result.data.transaction.transactionNumber,
                error: null,
              },
              currentTransaction: result.data,
            });

            console.log('[PaymentStore] Payment processed successfully');

            return {
              success: true,
              data: result.data,
              message: result.message,
            };
          } else {
            // Payment failed
            set({
              paymentState: {
                ...state,
                isProcessing: false,
                isComplete: false,
                error: result.error || 'Payment failed',
              },
            });

            console.error('[PaymentStore] Payment failed:', result.error);

            return {
              success: false,
              error: result.error || 'Payment failed',
            };
          }
        } catch (error) {
          console.error('[PaymentStore] Process payment error:', error);

          const errorMsg = error instanceof Error ? error.message : 'Payment processing error';

          set({
            paymentState: {
              ...state,
              isProcessing: false,
              isComplete: false,
              error: errorMsg,
            },
          });

          return {
            success: false,
            error: errorMsg,
          };
        }
      },

      /**
       * Reset payment state (for new transaction)
       */
      resetPayment: () => {
        set({
          paymentState: INITIAL_PAYMENT_STATE,
          currentTransaction: null,
        });
      },

      // ========================================
      // COMPUTED SELECTORS
      // ========================================

      /**
       * Check if payment is being processed
       */
      isProcessing: () => {
        return get().paymentState.isProcessing;
      },

      /**
       * Check if payment is complete
       */
      isComplete: () => {
        return get().paymentState.isComplete;
      },

      /**
       * Get error message
       */
      error: () => {
        return get().paymentState.error;
      },

      /**
       * Get change due
       */
      changeDue: () => {
        return get().paymentState.changeDue;
      },

      /**
       * Check if can process payment
       */
      canProcess: () => {
        const { paymentMethod, saleSummary, amountPaid, isProcessing } = get().paymentState;
        return !!(paymentMethod && saleSummary && amountPaid >= saleSummary.total && !isProcessing);
      },

      /**
       * Check if requires change
       */
      requiresChange: () => {
        return get().paymentState.changeDue > 0;
      },
    }),
    { name: 'POS-Payment' } // DevTools name
  )
);

// ========================================
// SELECTORS & ACTION HOOKS
// ========================================

/**
 * Stable payment actions hook
 * ---------------------------
 * React 19 calls getSnapshot twice during render.
 * Creating a new object in the selector breaks caching.
 * We subscribe to each action individually and memoize the aggregated object.
 */
export const usePaymentActions = () => {
  const setPaymentMethod = usePaymentStore((state) => state.setPaymentMethod);
  const setAmountPaid = usePaymentStore((state) => state.setAmountPaid);
  const setMixedPayment = usePaymentStore((state) => state.setMixedPayment);
  const setSaleSummary = usePaymentStore((state) => state.setSaleSummary);
  const processPayment = usePaymentStore((state) => state.processPayment);
  const resetPayment = usePaymentStore((state) => state.resetPayment);

  return useMemo(
    () => ({
      setPaymentMethod,
      setAmountPaid,
      setMixedPayment,
      setSaleSummary,
      processPayment,
      resetPayment,
    }),
    [setPaymentMethod, setAmountPaid, setMixedPayment, setSaleSummary, processPayment, resetPayment]
  );
};

/**
 * Selector hooks for convenience
 */
export const useCurrentTransaction = () => usePaymentStore((state) => state.currentTransaction);
export const usePaymentProcessing = () => usePaymentStore((state) => state.isProcessing());
export const usePaymentComplete = () => usePaymentStore((state) => state.isComplete());
export const usePaymentError = () => usePaymentStore((state) => state.error());
export const useChangeDue = () => usePaymentStore((state) => state.changeDue());
export const useCanProcessPayment = () => usePaymentStore((state) => state.canProcess());

export type { PaymentStoreState };
