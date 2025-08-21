"use client";

import { useActionState, useOptimistic, useTransition } from "react";
import {
  getDashboardStatsAction,
  getRecentUsersAction,
  refreshDashboardAction,
  getDashboardActivityAction,
} from "../dashboard.actions";
import {
  DashboardHookState,
  OptimisticDashboardState,
} from "../dashboard.types";
import { User, UserStats } from "@/shared/types/user";

/**
 * 🎯 HOOK PRINCIPAL DEL DASHBOARD
 *
 * Hook personalizado para manejar el estado y las acciones del dashboard.
 * Utiliza React 19 features: useActionState, useOptimistic, useTransition.
 */

export function useDashboard(): DashboardHookState {
  // 🚀 REACT 19: useActionState for dashboard stats
  const [statsState, statsAction, isStatsLoading] = useActionState(async () => {
    const result = await getDashboardStatsAction();
    return result;
  }, null);

  // 🚀 REACT 19: useActionState for recent users
  const [usersState, usersAction, isUsersLoading] = useActionState(async () => {
    const result = await getRecentUsersAction(5);
    return result;
  }, null);

  // 🚀 REACT 19: useActionState for activity data
  const [activityState, activityAction, isActivityLoading] = useActionState(
    async () => {
      const result = await getDashboardActivityAction();
      return result;
    },
    null
  );

  // ⚡ REACT 19: useTransition for refresh
  const [isRefreshing, startRefresh] = useTransition();

  // 🎯 REACT 19: useOptimistic for instant UI feedback
  const [optimisticState, setOptimisticState] = useOptimistic(
    {
      stats: statsState?.success ? (statsState.data as UserStats) : null,
      recentUsers: usersState?.success ? (usersState.data as User[]) : [],
      isRefreshing: false,
    } as OptimisticDashboardState,
    (
      state: OptimisticDashboardState,
      optimisticValue: Partial<OptimisticDashboardState>
    ) => ({
      ...state,
      ...optimisticValue,
    })
  );

  // 🔄 Refresh handler with optimistic UI
  const refresh = async () => {
    // Optimistic: show refreshing state immediately
    startRefresh(() => {
      setOptimisticState({ isRefreshing: true });
    });

    startRefresh(async () => {
      try {
        await refreshDashboardAction();
        // Reload all data after refresh
        statsAction();
        usersAction();
        activityAction();
      } finally {
        startRefresh(() => {
          setOptimisticState({ isRefreshing: false });
        });
      }
    });
  };

  // 📊 Computed values
  const isLoading = isStatsLoading || isUsersLoading || isActivityLoading;
  const hasError =
    statsState?.success === false ||
    usersState?.success === false ||
    activityState?.success === false;

  const error = hasError
    ? statsState?.error ||
      usersState?.error ||
      activityState?.error ||
      "Error desconocido"
    : null;

  return {
    stats: optimisticState.stats,
    recentUsers: optimisticState.recentUsers,
    activityData: activityState?.success
      ? (activityState.data as Record<string, unknown>)
      : null,
    isLoading: isLoading && !optimisticState.stats, // Only show loading on initial load
    isRefreshing: isRefreshing || optimisticState.isRefreshing,
    error,
    refresh,
  };
}

/**
 * 📊 HOOK PARA ESTADÍSTICAS ESPECÍFICAS
 *
 * Hook más específico si solo necesitas las estadísticas.
 */
export function useDashboardStats() {
  const [state, action, isPending] = useActionState(
    getDashboardStatsAction,
    null
  );

  return {
    stats: state?.success ? state.data : null,
    error: state?.success === false ? state.error : null,
    isLoading: isPending,
    refresh: action,
  };
}

/**
 * 👥 HOOK PARA USUARIOS RECIENTES
 *
 * Hook específico para usuarios recientes.
 */
export function useRecentUsers(limit: number = 5) {
  const [state, action, isPending] = useActionState(async () => {
    return await getRecentUsersAction(limit);
  }, null);

  return {
    users: state?.success ? state.data : [],
    error: state?.success === false ? state.error : null,
    isLoading: isPending,
    refresh: action,
  };
}
