/**
 * 🔄 AUDIT COMPATIBILITY HOOKS - TANSTACK TRANSITION
 * ==================================================
 *
 * Hooks de compatibilidad que mantienen la API original
 * pero usan TanStack Query internamente para máxima performance.
 *
 * Enterprise: 2025-01-17 - Backward compatibility with TanStack Query
 */

"use client";

import React, { useCallback, useMemo } from "react";
import { useAuditQuery } from "./useAuditQuery";
import type {
  UseAuditTrailReturn,
  UseAuditStatsReturn,
  UseAuditFiltersReturn,
  AuditFilters,
  AuditExportOptions,
} from "../types";
import { DEFAULT_AUDIT_FILTERS } from "../constants";

/**
 * ⚡ USE AUDIT TRAIL - TANSTACK OPTIMIZED (COMPATIBILITY)
 *
 * Hook de compatibilidad para useAuditTrail que mantiene la API original
 * pero usa TanStack Query internamente para performance enterprise.
 */
export function useAuditTrail(
  initialFilters?: AuditFilters
): UseAuditTrailReturn {
  // ⚡ Use TanStack Query optimized hook internally
  const {
    events,
    totalCount,
    currentPage,
    hasMore,
    isEventsLoading,
    eventsError,
    loadEvents,
    exportEvents,
    refreshEvents,
    getEventById,
  } = useAuditQuery(initialFilters || DEFAULT_AUDIT_FILTERS, {
    enableEvents: true,
    enableStats: false, // Only events for this hook
  });

  // 🔄 Maintain original API methods
  const loadEventsCompatible = useCallback(
    async (
      newFilters?: AuditFilters,
      page: number = 1
      // append parameter ignored - TanStack Query handles pagination differently
    ) => {
      const filtersToUse =
        newFilters || initialFilters || DEFAULT_AUDIT_FILTERS;
      const paginatedFilters = {
        ...filtersToUse,
        page,
        pageSize: filtersToUse.pageSize || 20,
      };

      // TanStack Query replaces the data automatically (no append needed)
      loadEvents(paginatedFilters);
    },
    [initialFilters, loadEvents]
  );

  const exportEventsCompatible = useCallback(
    async (filters: AuditFilters, format: "csv" | "json" = "csv") => {
      const exportOptions: AuditExportOptions = {
        format,
        includeMetadata: true,
        includeChanges: true,
      };
      await exportEvents(filters, exportOptions);
    },
    [exportEvents]
  );

  // 🔄 Return same interface as original hook
  return {
    events,
    isLoading: isEventsLoading,
    error: eventsError,
    totalCount,
    currentPage,
    hasMore,
    filters: initialFilters || DEFAULT_AUDIT_FILTERS,
    loadEvents: loadEventsCompatible,
    exportEvents: exportEventsCompatible,
    // Additional methods from original interface
    nextPage: () => loadEventsCompatible(undefined, currentPage + 1),
    prevPage: () =>
      loadEventsCompatible(undefined, Math.max(1, currentPage - 1)),
    goToPage: (page: number) => loadEventsCompatible(undefined, page),
    refresh: refreshEvents,
    getEvent: getEventById,
    setFilters: (filters: AuditFilters) => loadEventsCompatible(filters),
    resetFilters: () => loadEventsCompatible(DEFAULT_AUDIT_FILTERS),
  };
}

/**
 * ⚡ USE AUDIT STATS - TANSTACK OPTIMIZED (COMPATIBILITY)
 *
 * Hook de compatibilidad para useAuditStats que mantiene la API original
 * pero usa TanStack Query internamente para performance enterprise.
 */
export function useAuditStats(
  dateFrom?: Date,
  dateTo?: Date,
  autoRefresh: boolean = false,
  refreshInterval: number = 30000
): UseAuditStatsReturn {
  // ⚡ Use TanStack Query optimized hook internally
  const { stats, isStatsLoading, statsError, loadStats, refreshStats } =
    useAuditQuery(DEFAULT_AUDIT_FILTERS, {
      enableEvents: false, // Only stats for this hook
      enableStats: true,
      dateFrom,
      dateTo,
    });

  // 🎯 Auto-refresh capability (using TanStack Query's built-in refetch)
  // Note: TanStack Query handles this better with refetchInterval
  // We could enhance this in the future

  // 🔄 Maintain original API methods
  const loadStatsCompatible = useCallback(async () => {
    loadStats(dateFrom, dateTo);
  }, [dateFrom, dateTo, loadStats]);

  const refreshStatsCompatible = useCallback(async () => {
    refreshStats();
  }, [refreshStats]);

  // 📊 Computed values to maintain original interface
  const isStale = useMemo(() => {
    // In TanStack Query, we can determine staleness based on query state
    // For now, we'll return false as TanStack Query handles staleness internally
    return false;
  }, []);

  const lastUpdated = useMemo(() => {
    // TanStack Query tracks this internally, we could expose it if needed
    return stats ? new Date() : null;
  }, [stats]);

  // 🔄 Return same interface as original hook
  return {
    stats,
    isLoading: isStatsLoading,
    error: statsError,
    isStale,
    lastUpdated,
    refresh: refreshStatsCompatible,
    load: loadStatsCompatible,
    // Additional computed values
    hasData: !!stats,
    isEmpty: !stats || Object.keys(stats).length === 0,
  };
}

/**
 * ⚡ USE AUDIT FILTERS - ENHANCED COMPATIBILITY
 *
 * Hook de compatibilidad mejorado para useAuditFilters con TanStack Query integration.
 */
export function useAuditFilters(
  initialFilters?: AuditFilters
): UseAuditFiltersReturn {
  // For filters, we maintain the original implementation but could enhance
  // with TanStack Query for filter presets and saved filters in the future

  // 🎯 Simple state management (original approach is still optimal for filters)
  const [filters, setFiltersState] = React.useState<AuditFilters>(
    initialFilters || DEFAULT_AUDIT_FILTERS
  );

  // 🔄 Original methods
  const setFilters = useCallback((newFilters: AuditFilters) => {
    setFiltersState(newFilters);
  }, []);

  const updateFilter = useCallback(
    <K extends keyof AuditFilters>(key: K, value: AuditFilters[K]) => {
      setFiltersState((prev) => ({
        ...prev,
        [key]: value,
      }));
    },
    []
  );

  const resetFilters = useCallback(() => {
    setFiltersState(DEFAULT_AUDIT_FILTERS);
  }, []);

  // 📊 Enhanced computed values
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.action) count++;
    if (filters.resource) count++;
    if (filters.userId) count++;
    if (filters.severity) count++;
    if (filters.dateFrom) count++;
    if (filters.dateTo) count++;
    if (filters.search) count++;
    return count;
  }, [filters]);

  const hasActiveFilters = useMemo(
    () => activeFiltersCount > 0,
    [activeFiltersCount]
  );

  const isDefaultFilters = useMemo(() => {
    return JSON.stringify(filters) === JSON.stringify(DEFAULT_AUDIT_FILTERS);
  }, [filters]);

  // 🎯 Enhanced preset functionality
  const applyPreset = useCallback(
    (presetName: string) => {
      switch (presetName) {
        case "today":
          setFilters({
            ...DEFAULT_AUDIT_FILTERS,
            dateFrom: new Date(new Date().setHours(0, 0, 0, 0)),
            dateTo: new Date(new Date().setHours(23, 59, 59, 999)),
          });
          break;
        case "last7days":
          setFilters({
            ...DEFAULT_AUDIT_FILTERS,
            dateFrom: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            dateTo: new Date(),
          });
          break;
        case "critical":
          setFilters({
            ...DEFAULT_AUDIT_FILTERS,
            severity: "critical",
          });
          break;
        case "user_actions":
          setFilters({
            ...DEFAULT_AUDIT_FILTERS,
            resource: "user",
          });
          break;
        default:
          console.warn(`Unknown preset: ${presetName}`);
      }
    },
    [setFilters]
  );

  // 🔄 Return enhanced interface maintaining original compatibility
  return {
    filters,
    setFilters,
    updateFilter,
    resetFilters,
    applyPreset,
    activeFiltersCount,
    hasActiveFilters,
    isDefaultFilters,
    // Enhanced utilities
    getFilterSummary: () => {
      const summary: string[] = [];
      if (filters.action) summary.push(`Action: ${filters.action}`);
      if (filters.resource) summary.push(`Resource: ${filters.resource}`);
      if (filters.severity) summary.push(`Severity: ${filters.severity}`);
      if (filters.dateFrom)
        summary.push(`From: ${filters.dateFrom.toLocaleDateString()}`);
      if (filters.dateTo)
        summary.push(`To: ${filters.dateTo.toLocaleDateString()}`);
      return summary.join(", ");
    },
    isValidDateRange: () => {
      if (!filters.dateFrom || !filters.dateTo) return true;
      return filters.dateFrom <= filters.dateTo;
    },
  };
}
