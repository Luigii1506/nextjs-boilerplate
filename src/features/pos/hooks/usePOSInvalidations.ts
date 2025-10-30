/**
 * ♻️ usePOSInvalidations
 * =======================
 *
 * Centralises TanStack Query invalidations for the POS module.
 * Keeps stores/components slim by exposing declarative helpers
 * instead of scattering `queryClient.invalidateQueries` calls.
 */

"use client";

import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  posKeys,
  invalidateSaleQueries,
  invalidateTransactionQueries,
  invalidateDashboardQueries,
  invalidateSessionQueries,
} from "./queryKeys";

export interface TransactionListParams {
  sessionId?: string;
  userId?: string;
  limit?: number;
}

export function usePOSInvalidations() {
  const queryClient = useQueryClient();

  const invalidateSale = useCallback(
    (sessionId?: string) => invalidateSaleQueries(queryClient, sessionId),
    [queryClient]
  );

  const invalidateSaleSummary = useCallback(
    (sessionId: string) => {
      queryClient.invalidateQueries({
        queryKey: posKeys.saleWithSummary(sessionId),
      });
    },
    [queryClient]
  );

  const invalidateTransactions = useCallback(
    () => invalidateTransactionQueries(queryClient),
    [queryClient]
  );

  const invalidateTransactionList = useCallback(
    (params: TransactionListParams) => {
      queryClient.invalidateQueries({
        queryKey: posKeys.transactionList(params),
      });
    },
    [queryClient]
  );

  const invalidateDashboard = useCallback(
    (userId?: string) => invalidateDashboardQueries(queryClient, userId),
    [queryClient]
  );

  const invalidateSession = useCallback(
    (userId?: string) => invalidateSessionQueries(queryClient, userId),
    [queryClient]
  );

  const invalidateAll = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: posKeys.all });
  }, [queryClient]);

  return {
    invalidateAll,
    invalidateSale,
    invalidateSaleSummary,
    invalidateTransactions,
    invalidateTransactionList,
    invalidateDashboard,
    invalidateSession,
  };
}

export type UsePOSInvalidationsReturn = ReturnType<
  typeof usePOSInvalidations
>;
