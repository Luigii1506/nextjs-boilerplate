"use client";
/**
 * 🎣 useTransactions Hook
 * =======================
 *
 * Hook para gestionar transacciones en POS.
 * Búsqueda, visualización y operaciones sobre transacciones.
 *
 * @module pos/hooks/useTransactions
 * @version 1.0.0
 */

import { useQuery, useMutation } from "@tanstack/react-query";
import { posKeys } from "./queryKeys";
import * as actions from "../server/actions";
import { voidTransactionAction } from "../payment/server/actions";
import { getSessionTransactionsAction } from "../session/server/actions";
import { usePOSInvalidations } from "./usePOSInvalidations";

// ========================================
// QUERY HOOKS
// ========================================

/**
 * Hook para obtener detalles de una transacción
 */
export function useTransactionDetails(
  transactionId: string,
  options: { enabled?: boolean } = {}
) {
  const { enabled = true } = options;

  return useQuery({
    queryKey: posKeys.transactionDetails(transactionId),
    queryFn: async () => {
      const result = await actions.getTransactionDetailsAction(transactionId);

      if (!result.success) {
        throw new Error(result.error || "Failed to get transaction details");
      }

      return result.data;
    },
    enabled: enabled && !!transactionId,
    staleTime: 1000 * 60 * 10, // 10 minutos (las transacciones no cambian)
  });
}

/**
 * Hook para buscar transacción por número
 */
export function useTransactionByNumber(
  transactionNumber: string,
  options: { enabled?: boolean } = {}
) {
  const { enabled = true } = options;

  return useQuery({
    queryKey: posKeys.transactionByNumber(transactionNumber),
    queryFn: async () => {
      const result = await actions.findTransactionByNumberAction(
        transactionNumber
      );

      if (!result.success) {
        throw new Error(result.error || "Failed to find transaction");
      }

      return result.data;
    },
    enabled: enabled && !!transactionNumber,
    staleTime: 1000 * 60 * 10, // 10 minutos
  });
}

/**
 * Hook para obtener transacciones de una sesión
 */
export function useSessionTransactions(
  sessionId: string,
  options: { enabled?: boolean } = {}
) {
  const { enabled = true } = options;

  return useQuery({
    queryKey: posKeys.sessionTransactions(sessionId),
    queryFn: async () => {
      const result = await getSessionTransactionsAction(sessionId);

      if (!result.success) {
        throw new Error(result.error || "Failed to get session transactions");
      }

      return result.data;
    },
    enabled: enabled && !!sessionId,
    staleTime: 1000 * 60, // 1 minuto
  });
}

// ========================================
// MUTATION HOOKS
// ========================================

/**
 * Hook para anular una transacción
 */
export function useVoidTransaction() {
  const { invalidateTransactions } = usePOSInvalidations();

  return useMutation({
    mutationFn: async ({
      transactionId,
      reason,
    }: {
      transactionId: string;
      reason: string;
    }) => {
      const result = await voidTransactionAction(
        transactionId,
        reason
      );

      if (!result.success) {
        throw new Error(result.error || "Failed to void transaction");
      }

      return result.data;
    },
    onSuccess: () => {
      invalidateTransactions();
    },
  });
}

/**
 * Hook para generar reporte de ventas
 */
export function useGenerateSalesReport() {
  return useMutation({
    mutationFn: async ({
      startDate,
      endDate,
      groupBy,
    }: {
      startDate: Date;
      endDate: Date;
      groupBy?: "day" | "week" | "month";
    }) => {
      const result = await actions.generateSalesReportAction({
        startDate,
        endDate,
        groupBy,
      });

      if (!result.success) {
        throw new Error(result.error || "Failed to generate sales report");
      }

      return result.data;
    },
  });
}

// ========================================
// COMBINED HOOKS
// ========================================

/**
 * Hook completo para gestionar transacciones
 * Combina queries y mutations en una sola interfaz
 */
export function useTransactionManager(transactionId?: string) {
  const { invalidateTransactions } = usePOSInvalidations();

  const transactionDetails = useTransactionDetails(transactionId || "", {
    enabled: !!transactionId,
  });

  const voidMutation = useVoidTransaction();

  const generateReportMutation = useGenerateSalesReport();

  return {
    // Query state
    transaction: transactionDetails.data,
    isLoading: transactionDetails.isLoading,
    error: transactionDetails.error,
    refetch: transactionDetails.refetch,

    // Mutations
    voidTransaction: async (transactionId: string, reason: string) => {
      return voidMutation.mutateAsync({ transactionId, reason });
    },
    isVoiding: voidMutation.isPending,
    voidError: voidMutation.error,

    generateReport: async (
      startDate: Date,
      endDate: Date,
      groupBy?: "day" | "week" | "month"
    ) => {
      return generateReportMutation.mutateAsync({ startDate, endDate, groupBy });
    },
    isGeneratingReport: generateReportMutation.isPending,
    reportError: generateReportMutation.error,

    // Helpers
    canVoid: transactionDetails.data?.canVoid || false,
    canRefund: transactionDetails.data?.canRefund || false,

    // Utilities
    invalidate: async () => invalidateTransactions(),
  };
}

/**
 * Hook para búsqueda de transacciones con filtros
 */
export function useTransactionSearch(options: {
  sessionId?: string;
  userId?: string;
  limit?: number;
  enabled?: boolean;
} = {}) {
  const { sessionId, userId, limit = 20, enabled = true } = options;

  return useQuery({
    queryKey: posKeys.transactionList({ sessionId, userId, limit }),
    queryFn: async () => {
      const result = await actions.getRecentTransactionsAction({
        sessionId,
        userId,
        limit,
      });

      if (!result.success) {
        throw new Error(result.error || "Failed to search transactions");
      }

      return result.data;
    },
    enabled,
    staleTime: 1000 * 60, // 1 minuto
  });
}
