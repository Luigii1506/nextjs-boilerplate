/**
 * 💳 USE STRIPE PAYMENT HOOK
 * ==========================
 *
 * React hook for handling Stripe payments.
 * Provides a unified interface for payment processing across features.
 *
 * @version 2.0.0 - Core Infrastructure
 */

"use client";

import { useState, useCallback } from "react";
import { createPaymentIntent, type CreatePaymentIntentParams } from "../stripe/server";

// 🏷️ HOOK TYPES
// ==============

export interface UseStripePaymentOptions {
  /** Callback when payment intent is created */
  onPaymentIntentCreated?: (clientSecret: string, paymentIntentId: string) => void;
  /** Callback when payment succeeds */
  onPaymentSuccess?: (paymentIntentId: string) => void;
  /** Callback when payment fails */
  onPaymentError?: (error: string) => void;
}

export interface PaymentState {
  /** Client secret for Stripe Elements */
  clientSecret: string | null;
  /** Payment Intent ID */
  paymentIntentId: string | null;
  /** Is creating payment intent */
  isCreating: boolean;
  /** Is processing payment */
  isProcessing: boolean;
  /** Error message if any */
  error: string | null;
  /** Payment succeeded */
  succeeded: boolean;
}

export interface UseStripePaymentReturn {
  /** Current payment state */
  state: PaymentState;
  /** Create a payment intent */
  createIntent: (params: CreatePaymentIntentParams) => Promise<void>;
  /** Mark payment as succeeded */
  markSucceeded: (paymentIntentId: string) => void;
  /** Mark payment as failed */
  markFailed: (error: string) => void;
  /** Reset payment state */
  reset: () => void;
}

// 🎯 HOOK IMPLEMENTATION
// ======================

/**
 * Hook for managing Stripe payments
 *
 * @example
 * ```tsx
 * const { state, createIntent, markSucceeded } = useStripePayment({
 *   onPaymentSuccess: (id) => console.log('Payment succeeded:', id),
 * });
 *
 * // Create payment intent
 * await createIntent({ amount: 19.99, currency: 'usd' });
 *
 * // After Stripe confirms payment
 * markSucceeded(paymentIntentId);
 * ```
 */
export function useStripePayment(
  options: UseStripePaymentOptions = {}
): UseStripePaymentReturn {
  const { onPaymentIntentCreated, onPaymentSuccess, onPaymentError } = options;

  // 🎯 State
  const [state, setState] = useState<PaymentState>({
    clientSecret: null,
    paymentIntentId: null,
    isCreating: false,
    isProcessing: false,
    error: null,
    succeeded: false,
  });

  // 🎯 Create Payment Intent
  const createIntent = useCallback(
    async (params: CreatePaymentIntentParams) => {
      setState((prev) => ({
        ...prev,
        isCreating: true,
        error: null,
      }));

      try {
        const result = await createPaymentIntent(params);

        if (result.success && result.clientSecret && result.paymentIntentId) {
          setState((prev) => ({
            ...prev,
            clientSecret: result.clientSecret!,
            paymentIntentId: result.paymentIntentId!,
            isCreating: false,
          }));

          onPaymentIntentCreated?.(result.clientSecret, result.paymentIntentId);
        } else {
          const error = result.error || "Failed to create payment intent";
          setState((prev) => ({
            ...prev,
            isCreating: false,
            error,
          }));

          onPaymentError?.(error);
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "An unexpected error occurred";

        setState((prev) => ({
          ...prev,
          isCreating: false,
          error: errorMessage,
        }));

        onPaymentError?.(errorMessage);
      }
    },
    [onPaymentIntentCreated, onPaymentError]
  );

  // 🎯 Mark Payment as Succeeded
  const markSucceeded = useCallback(
    (paymentIntentId: string) => {
      setState((prev) => ({
        ...prev,
        succeeded: true,
        isProcessing: false,
        error: null,
      }));

      onPaymentSuccess?.(paymentIntentId);
    },
    [onPaymentSuccess]
  );

  // 🎯 Mark Payment as Failed
  const markFailed = useCallback(
    (error: string) => {
      setState((prev) => ({
        ...prev,
        isProcessing: false,
        error,
        succeeded: false,
      }));

      onPaymentError?.(error);
    },
    [onPaymentError]
  );

  // 🎯 Reset State
  const reset = useCallback(() => {
    setState({
      clientSecret: null,
      paymentIntentId: null,
      isCreating: false,
      isProcessing: false,
      error: null,
      succeeded: false,
    });
  }, []);

  return {
    state,
    createIntent,
    markSucceeded,
    markFailed,
    reset,
  };
}
