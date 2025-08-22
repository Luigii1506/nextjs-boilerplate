/**
 * 🪝 USE AUDIT STATS
 * ==================
 *
 * Hook para estadísticas de auditoría.
 * Incluye métricas, gráficos y análisis de actividad.
 */

"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { getAuditStatsAction } from "../server/actions";
import type { UseAuditStatsReturn, AuditStats } from "../types";

export function useAuditStats(
  dateFrom?: Date,
  dateTo?: Date,
  autoRefresh: boolean = false,
  refreshInterval: number = 30000 // 30 seconds
): UseAuditStatsReturn {
  const [stats, setStats] = useState<AuditStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // 📊 Load Stats
  const loadStats = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await getAuditStatsAction(dateFrom, dateTo);

      if (result.success && result.data) {
        setStats(result.data);
        setLastUpdated(new Date());
      } else {
        setError(result.error || "Error al cargar estadísticas");
        setStats(null);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error desconocido";
      setError(errorMessage);
      setStats(null);
      console.error("[useAuditStats] Load error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [dateFrom, dateTo]);

  // 🔄 Refresh
  const refresh = useCallback(async () => {
    await loadStats();
  }, [loadStats]);

  // 🚀 Initial Load
  useEffect(() => {
    loadStats();
  }, [loadStats]);

  // ⏰ Auto Refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      loadStats();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, loadStats]);

  // 📊 Computed Stats
  const computedStats = useMemo(() => {
    if (!stats) return null;

    // Calculate percentages for actions
    const actionPercentages = Object.entries(stats.byAction).map(
      ([action, count]) => ({
        action,
        count,
        percentage:
          stats.total > 0 ? Math.round((count / stats.total) * 100) : 0,
      })
    );

    // Calculate percentages for resources
    const resourcePercentages = Object.entries(stats.byResource).map(
      ([resource, count]) => ({
        resource,
        count,
        percentage:
          stats.total > 0 ? Math.round((count / stats.total) * 100) : 0,
      })
    );

    // Calculate percentages for severities
    const severityPercentages = Object.entries(stats.bySeverity).map(
      ([severity, count]) => ({
        severity,
        count,
        percentage:
          stats.total > 0 ? Math.round((count / stats.total) * 100) : 0,
      })
    );

    // Top actions (sorted by count)
    const topActions = actionPercentages
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Top resources (sorted by count)
    const topResources = resourcePercentages
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Top users (already sorted from server)
    const topUsers = stats.byUser.slice(0, 10);

    // Activity trends (if we have recent activity)
    const activityTrends = stats.recentActivity.reduce((acc, event) => {
      const hour = new Date(event.createdAt).getHours();
      acc[hour] = (acc[hour] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    return {
      ...stats,
      actionPercentages,
      resourcePercentages,
      severityPercentages,
      topActions,
      topResources,
      topUsers,
      activityTrends,
    };
  }, [stats]);

  // 📈 Chart Data
  const chartData = useMemo(() => {
    if (!computedStats) return null;

    return {
      // Pie chart for actions
      actionsChart: computedStats.topActions.map((item) => ({
        name: item.action,
        value: item.count,
        percentage: item.percentage,
      })),

      // Pie chart for resources
      resourcesChart: computedStats.topResources.map((item) => ({
        name: item.resource,
        value: item.count,
        percentage: item.percentage,
      })),

      // Bar chart for severities
      severitiesChart: computedStats.severityPercentages.map((item) => ({
        name: item.severity,
        value: item.count,
        percentage: item.percentage,
      })),

      // Bar chart for top users
      usersChart: computedStats.topUsers.map((user) => ({
        name: user.userName,
        value: user.eventCount,
        userId: user.userId,
      })),

      // Line chart for activity trends (hourly)
      activityChart: Object.entries(computedStats.activityTrends)
        .map(([hour, count]) => ({
          hour: parseInt(hour),
          count,
          label: `${hour}:00`,
        }))
        .sort((a, b) => a.hour - b.hour),
    };
  }, [computedStats]);

  // 📊 Summary Metrics
  const summaryMetrics = useMemo(() => {
    if (!computedStats) return null;

    const totalEvents = computedStats.total;
    const uniqueUsers = computedStats.byUser.length;
    const mostActiveUser = computedStats.byUser[0];
    const mostCommonAction = computedStats.topActions[0];
    const mostCommonResource = computedStats.topResources[0];

    // Calculate activity rate (events per user)
    const activityRate =
      uniqueUsers > 0 ? Math.round(totalEvents / uniqueUsers) : 0;

    // Calculate severity distribution
    const criticalEvents = computedStats.bySeverity.critical || 0;
    const highEvents = computedStats.bySeverity.high || 0;
    const mediumEvents = computedStats.bySeverity.medium || 0;
    const lowEvents = computedStats.bySeverity.low || 0;

    const criticalPercentage =
      totalEvents > 0 ? Math.round((criticalEvents / totalEvents) * 100) : 0;
    const highPercentage =
      totalEvents > 0 ? Math.round((highEvents / totalEvents) * 100) : 0;

    return {
      totalEvents,
      uniqueUsers,
      activityRate,
      mostActiveUser,
      mostCommonAction,
      mostCommonResource,
      criticalEvents,
      highEvents,
      mediumEvents,
      lowEvents,
      criticalPercentage,
      highPercentage,
      recentActivityCount: computedStats.recentActivity.length,
    };
  }, [computedStats]);

  // 🎯 Helper Functions
  const getActionCount = useCallback(
    (action: string): number => {
      return stats?.byAction[action as keyof typeof stats.byAction] || 0;
    },
    [stats]
  );

  const getResourceCount = useCallback(
    (resource: string): number => {
      return stats?.byResource[resource as keyof typeof stats.byResource] || 0;
    },
    [stats]
  );

  const getSeverityCount = useCallback(
    (severity: string): number => {
      return stats?.bySeverity[severity as keyof typeof stats.bySeverity] || 0;
    },
    [stats]
  );

  const getUserActivity = useCallback(
    (userId: string) => {
      return stats?.byUser.find((user) => user.userId === userId);
    },
    [stats]
  );

  // 📅 Date Range Info
  const dateRangeInfo = useMemo(() => {
    if (!dateFrom && !dateTo) {
      return "Todos los eventos";
    }

    if (dateFrom && dateTo) {
      return `${dateFrom.toLocaleDateString()} - ${dateTo.toLocaleDateString()}`;
    }

    if (dateFrom) {
      return `Desde ${dateFrom.toLocaleDateString()}`;
    }

    if (dateTo) {
      return `Hasta ${dateTo.toLocaleDateString()}`;
    }

    return "Rango personalizado";
  }, [dateFrom, dateTo]);

  return {
    stats,
    isLoading,
    error,
    refresh,
    // Extended data
    computedStats,
    chartData,
    summaryMetrics,
    lastUpdated,
    dateRangeInfo,
    // Helper functions
    getActionCount,
    getResourceCount,
    getSeverityCount,
    getUserActivity,
  } as UseAuditStatsReturn & {
    computedStats: typeof computedStats;
    chartData: typeof chartData;
    summaryMetrics: typeof summaryMetrics;
    lastUpdated: Date | null;
    dateRangeInfo: string;
    getActionCount: (action: string) => number;
    getResourceCount: (resource: string) => number;
    getSeverityCount: (severity: string) => number;
    getUserActivity: (userId: string) => any;
  };
}
