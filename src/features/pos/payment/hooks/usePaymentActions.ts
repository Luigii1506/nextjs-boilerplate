/**
 * 💳 usePaymentActions / usePaymentFacade
 * ======================================
 *
 * Orchestrates payment store actions with auth context, sale session
 * and cache invalidations. Keeps the Zustand store focused on state only.
 */

"use client";

import { useCallback, useMemo } from "react";
import { useAuth } from "@/shared/hooks/useAuth";
import { useSaleSessionId } from "../../sale/state/sale.store";
import { usePOSInvalidations } from "../../hooks";
import type { ProcessPaymentInput } from "../types";
import {
  usePaymentStoreActions,
  usePaymentState,
  usePaymentStatus,
} from "../state/payment.store";

export function usePaymentActions() {
  const {
    setSaleSummary,
    setPaymentMethod,
    setAmountPaid,
    setMixedPayment,
    processPayment: storeProcessPayment,
    resetPayment,
  } = usePaymentStoreActions();

  const { user } = useAuth();
  const defaultSessionId = useSaleSessionId();
  const {
    invalidateSale,
    invalidateSaleSummary,
    invalidateTransactions,
    invalidateTransactionList,
    invalidateDashboard,
  } = usePOSInvalidations();

  const processPayment = useCallback(
    async (input: ProcessPaymentInput) => {
      const result = await storeProcessPayment(input);

      if (result.success) {
        const sessionId = input.sessionId ?? defaultSessionId ?? undefined;

        invalidateTransactionList({
          sessionId,
          userId: user?.id,
          limit: 50,
        });

        invalidateTransactions();

        if (sessionId) {
          invalidateSaleSummary(sessionId);
          invalidateSale(sessionId);
        }

        if (user?.id) {
          invalidateDashboard(user.id);
        }
      }

      return result;
    },
    [
      defaultSessionId,
      invalidateDashboard,
      invalidateSale,
      invalidateSaleSummary,
      invalidateTransactionList,
      invalidateTransactions,
      storeProcessPayment,
      user?.id,
    ]
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
}

export function usePaymentFacade() {
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
}
