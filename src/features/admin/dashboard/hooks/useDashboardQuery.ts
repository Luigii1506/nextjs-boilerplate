/**
 * 📊 DASHBOARD TANSTACK QUERY HOOK
 * ===============================
 *
 * Hook principal optimizado con TanStack Query para el Dashboard.
 * Módulo pequeño con cache inteligente y performance empresarial.
 *
 * Enterprise: 2025-01-17 - TanStack Query migration
 */

import { useQuery, useQueries, useQueryClient } from "@tanstack/react-query";
import { useNotifications } from "@/shared/hooks/useNotifications";
import { DASHBOARD_QUERY_KEYS, DASHBOARD_CONFIG } from "../constants";
import {
  getDashboardStatsAction,
  getRecentUsersAction,
  getDashboardActivityAction,
} from "../actions";
import type { UserStats, User } from "@/shared/types/user";
import type { DashboardHookState } from "../types";

// 🎯 HOOK PRINCIPAL DASHBOARD - TANSTACK QUERY OPTIMIZADO
export const useDashboardQuery = () => {
  const queryClient = useQueryClient();
  const { notify } = useNotifications();

  // 📊 QUERY - Dashboard Stats (optimized cache)
  const {
    data: statsData,
    isLoading: isStatsLoading,
    error: statsError,
    refetch: refetchStats,
  } = useQuery({
    queryKey: DASHBOARD_QUERY_KEYS.stats(),
    queryFn: async () => {
      const result = await getDashboardStatsAction();

      if (!result.success) {
        throw new Error(result.error || "Error obteniendo estadísticas");
      }

      return result.data!;
    },
    staleTime: DASHBOARD_CONFIG.STATS_STALE_TIME,
    gcTime: DASHBOARD_CONFIG.STATS_CACHE_TIME,
    retry: DASHBOARD_CONFIG.RETRY_COUNT,
    retryDelay: DASHBOARD_CONFIG.RETRY_DELAY,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    networkMode: "always",
  });

  // 👥 QUERY - Recent Users (longer cache)
  const {
    data: usersData,
    isLoading: isUsersLoading,
    error: usersError,
    refetch: refetchUsers,
  } = useQuery({
    queryKey: DASHBOARD_QUERY_KEYS.recentUsers(
      DASHBOARD_CONFIG.DEFAULT_RECENT_USERS_LIMIT
    ),
    queryFn: async () => {
      const result = await getRecentUsersAction(
        DASHBOARD_CONFIG.DEFAULT_RECENT_USERS_LIMIT
      );

      if (!result.success) {
        throw new Error(result.error || "Error obteniendo usuarios recientes");
      }

      return result.data!;
    },
    staleTime: DASHBOARD_CONFIG.RECENT_USERS_STALE_TIME,
    gcTime: DASHBOARD_CONFIG.RECENT_USERS_CACHE_TIME,
    retry: DASHBOARD_CONFIG.RETRY_COUNT,
    retryDelay: DASHBOARD_CONFIG.RETRY_DELAY,
    refetchOnWindowFocus: false, // Users don't change as frequently
    refetchOnReconnect: true,
    networkMode: "always",
  });

  // 📈 QUERY - Activity Data (most stable cache)
  const {
    data: activityData,
    isLoading: isActivityLoading,
    error: activityError,
    refetch: refetchActivity,
  } = useQuery({
    queryKey: DASHBOARD_QUERY_KEYS.activity(),
    queryFn: async () => {
      const result = await getDashboardActivityAction();

      if (!result.success) {
        throw new Error(result.error || "Error obteniendo datos de actividad");
      }

      return result.data!;
    },
    staleTime: DASHBOARD_CONFIG.ACTIVITY_STALE_TIME,
    gcTime: DASHBOARD_CONFIG.ACTIVITY_CACHE_TIME,
    retry: DASHBOARD_CONFIG.RETRY_COUNT,
    retryDelay: DASHBOARD_CONFIG.RETRY_DELAY,
    refetchOnWindowFocus: false, // Historical data is stable
    refetchOnReconnect: true,
    networkMode: "always",
  });

  // 🔄 REFRESH ALL - Intelligent refresh with error handling
  const refreshDashboard = async () => {
    try {
      // Invalidate all dashboard queries for fresh data
      await queryClient.invalidateQueries({
        queryKey: DASHBOARD_QUERY_KEYS.all,
        type: "active", // Only invalidate active queries
      });

      // Also prefetch for instant UI response
      await Promise.allSettled([
        queryClient.prefetchQuery({
          queryKey: DASHBOARD_QUERY_KEYS.stats(),
          queryFn: async () => {
            const result = await getDashboardStatsAction();
            return result.success ? result.data! : null;
          },
          staleTime: 0, // Force fresh data
        }),
        queryClient.prefetchQuery({
          queryKey: DASHBOARD_QUERY_KEYS.recentUsers(
            DASHBOARD_CONFIG.DEFAULT_RECENT_USERS_LIMIT
          ),
          queryFn: async () => {
            const result = await getRecentUsersAction(
              DASHBOARD_CONFIG.DEFAULT_RECENT_USERS_LIMIT
            );
            return result.success ? result.data! : null;
          },
          staleTime: 0,
        }),
      ]);

      notify(
        async () => Promise.resolve(),
        "Dashboard actualizado exitosamente"
      );
    } catch (error) {
      console.error("Error refreshing dashboard:", error);
      console.error("Error refreshing dashboard:", error);
      notify(
        async () => {
          throw error;
        },
        "Actualizando dashboard...",
        "Dashboard actualizado"
      ).catch(() => {}); // Handle error internally
    }
  };

  // 🧮 COMPUTED STATE
  const isLoading = isStatsLoading || isUsersLoading || isActivityLoading;
  const isRefreshing =
    queryClient.isFetching({ queryKey: DASHBOARD_QUERY_KEYS.all }) > 0;
  const hasError = statsError || usersError || activityError;

  // Extract stats with defaults
  const stats: UserStats = statsData || {
    total: 0,
    active: 0,
    banned: 0,
    admins: 0,
    activePercentage: 0,
    adminPercentage: 0,
  };

  // Extract users with defaults
  const recentUsers: User[] = usersData || [];

  // 📊 RETURN INTERFACE compatible with existing screen
  return {
    // Data
    stats,
    recentUsers,
    activityData: activityData || null,

    // Loading states
    isLoading,
    isRefreshing,

    // Error state (simplified)
    error: hasError
      ? statsError?.message ||
        usersError?.message ||
        activityError?.message ||
        "Error desconocido"
      : null,

    // Actions
    refresh: refreshDashboard,

    // Individual refetch functions for granular control
    refetchStats,
    refetchUsers,
    refetchActivity,
  } satisfies DashboardHookState;
};

// 🚀 HOOK OPTIMIZADO PARA OVERVIEW - Parallel fetching
export const useDashboardOverview = () => {
  const { notify } = useNotifications();

  // 📊 PARALLEL QUERIES - Fetch all data simultaneously
  const results = useQueries({
    queries: [
      {
        queryKey: DASHBOARD_QUERY_KEYS.stats(),
        queryFn: async () => {
          const result = await getDashboardStatsAction();
          if (!result.success) throw new Error(result.error || "Error stats");
          return result.data!;
        },
        staleTime: DASHBOARD_CONFIG.OVERVIEW_STALE_TIME,
        gcTime: DASHBOARD_CONFIG.OVERVIEW_CACHE_TIME,
      },
      {
        queryKey: DASHBOARD_QUERY_KEYS.recentUsers(5),
        queryFn: async () => {
          const result = await getRecentUsersAction(5);
          if (!result.success) throw new Error(result.error || "Error users");
          return result.data!;
        },
        staleTime: DASHBOARD_CONFIG.OVERVIEW_STALE_TIME,
        gcTime: DASHBOARD_CONFIG.OVERVIEW_CACHE_TIME,
      },
      {
        queryKey: DASHBOARD_QUERY_KEYS.activity(),
        queryFn: async () => {
          const result = await getDashboardActivityAction();
          if (!result.success)
            throw new Error(result.error || "Error activity");
          return result.data!;
        },
        staleTime: DASHBOARD_CONFIG.OVERVIEW_STALE_TIME,
        gcTime: DASHBOARD_CONFIG.OVERVIEW_CACHE_TIME,
      },
    ],
  });

  const [statsQuery, usersQuery, activityQuery] = results;

  return {
    stats: statsQuery.data || {
      total: 0,
      active: 0,
      banned: 0,
      admins: 0,
      activePercentage: 0,
      adminPercentage: 0,
    },
    recentUsers: usersQuery.data || [],
    activityData: activityQuery.data || null,
    isLoading: results.some((query) => query.isLoading),
    isRefreshing: results.some((query) => query.isFetching && !query.isLoading),
    error: results.find((query) => query.error)?.error?.message || null,
    refresh: () => {
      results.forEach((query) => query.refetch());
      notify(async () => Promise.resolve(), "Dashboard actualizado");
    },
  };
};

// 🎛️ Export query keys for external use
export { DASHBOARD_QUERY_KEYS } from "../constants";
