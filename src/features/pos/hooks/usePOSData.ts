"use client";
/**
 * 🎣 usePOSData Hook
 * ==================
 *
 * Hook principal para cargar datos del POS con TanStack Query.
 * Similar a useStorefrontData pero optimizado para POS.
 *
 * @module pos/hooks/usePOSData
 * @version 1.0.0
 */

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/shared/hooks/useAuth";
import { posKeys } from "./queryKeys";
import { getActiveSessionAction } from "../session/server/actions";
import * as actions from "../server/actions";
import type { UsePOSDataResult } from "../types/queries";

export interface UsePOSDataOptions {
  enabled?: boolean;
  refetchInterval?: number;
}

/**
 * Hook para cargar datos iniciales del POS
 */
export function usePOSData(options: UsePOSDataOptions = {}) {
  const { enabled = true, refetchInterval } = options;
  const { user, isAuthenticated } = useAuth();

  return useQuery<UsePOSDataResult>({
    queryKey: posKeys.dashboardData(user?.id || ""),
    queryFn: async (): Promise<UsePOSDataResult> => {
      if (!user?.id) {
        return {
          activeSession: null,
          products: [],
          categories: [],
          recentTransactions: [],
          dailyStats: null,
        };
      }

      // Cargar datos del dashboard
      const dashboardResult = await actions.getDashboardDataAction(
        session.user.id
      );

      if (!dashboardResult.success || !dashboardResult.data) {
        throw new Error(
          dashboardResult.error || "Failed to load POS dashboard data"
        );
      }

      const { activeSession, dailyStats, topProducts, recentTransactions } =
        dashboardResult.data;

      // Cargar categorías
      const categoriesResult = await actions.getCategoriesAction();
      const categories = categoriesResult.success
        ? categoriesResult.data
        : [];

      // Cargar productos (primeros 20)
      const productsResult = await actions.searchProductsAction({
        page: 1,
        pageSize: 20,
      });
      const products = productsResult.success
        ? productsResult.data.products
        : [];

      return {
        activeSession,
        products,
        categories,
        recentTransactions,
        dailyStats,
        topProducts,
      };
    },
    enabled: enabled && !!user?.id,
    refetchInterval,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}

/**
 * Hook para buscar productos
 */
export function useSearchProducts(options: {
  search?: string;
  categoryId?: string;
  page?: number;
  pageSize?: number;
  enabled?: boolean;
}) {
  const { search, categoryId, page = 1, pageSize = 20, enabled = true } = options;

  return useQuery({
    queryKey: posKeys.productList({ search, categoryId, page }),
    queryFn: async () => {
      const result = await actions.searchProductsAction({
        search,
        categoryId,
        page,
        pageSize,
      });

      if (!result.success) {
        throw new Error(result.error || "Failed to search products");
      }

      return result.data;
    },
    enabled,
    staleTime: 1000 * 60 * 2, // 2 minutos
  });
}

/**
 * Hook para obtener categorías
 */
export function useCategories(options: { enabled?: boolean } = {}) {
  const { enabled = true } = options;

  return useQuery({
    queryKey: posKeys.categoryList(),
    queryFn: async () => {
      const result = await actions.getCategoriesAction();

      if (!result.success) {
        throw new Error(result.error || "Failed to get categories");
      }

      return result.data;
    },
    enabled,
    staleTime: 1000 * 60 * 10, // 10 minutos
  });
}

/**
 * Hook para obtener sesión activa
 */
export function useActiveSession(options: { enabled?: boolean } = {}) {
  const { enabled = true } = options;
  const { user, isAuthenticated } = useAuth();

  return useQuery({
    queryKey: posKeys.activeSession(user?.id || ""),
    queryFn: async () => {
      if (!user?.id) {
        return null;
      }

      const result = await getActiveSessionAction(session.user.id);

      if (!result.success) {
        return null;
      }

      return result.data;
    },
    enabled: enabled && !!user?.id,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}

/**
 * Hook para obtener estadísticas diarias
 */
export function useDailyStats(options: { date?: Date; enabled?: boolean } = {}) {
  const { date, enabled = true } = options;
  const dateString = date?.toISOString().split("T")[0];

  return useQuery({
    queryKey: posKeys.dailyStats(dateString),
    queryFn: async () => {
      const result = await actions.getDailyStatsAction(date);

      if (!result.success) {
        throw new Error(result.error || "Failed to get daily stats");
      }

      return result.data;
    },
    enabled,
    refetchInterval: 1000 * 60 * 5, // Refrescar cada 5 minutos
    staleTime: 1000 * 60 * 2, // 2 minutos
  });
}

/**
 * Hook para obtener transacciones recientes
 */
export function useRecentTransactions(options: {
  sessionId?: string;
  userId?: string;
  limit?: number;
  enabled?: boolean;
} = {}) {
  const { sessionId, userId, limit = 10, enabled = true } = options;

  return useQuery({
    queryKey: posKeys.transactionList({ sessionId, userId, limit }),
    queryFn: async () => {
      const result = await actions.getRecentTransactionsAction({
        sessionId,
        userId,
        limit,
      });

      if (!result.success) {
        throw new Error(result.error || "Failed to get recent transactions");
      }

      return result.data;
    },
    enabled,
    staleTime: 1000 * 60, // 1 minuto
  });
}

/**
 * Hook para obtener top productos
 */
export function useTopProducts(options: {
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  enabled?: boolean;
} = {}) {
  const { startDate, endDate, limit = 10, enabled = true } = options;

  const startDateString = startDate?.toISOString().split("T")[0];
  const endDateString = endDate?.toISOString().split("T")[0];

  return useQuery({
    queryKey: posKeys.topProducts({ startDate: startDateString, endDate: endDateString }),
    queryFn: async () => {
      const result = await actions.getTopSellingProductsAction({
        startDate,
        endDate,
        limit,
      });

      if (!result.success) {
        throw new Error(result.error || "Failed to get top products");
      }

      return result.data;
    },
    enabled,
    staleTime: 1000 * 60 * 30, // 30 minutos
  });
}
