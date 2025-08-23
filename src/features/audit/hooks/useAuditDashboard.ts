/**
 * 🏛️ AUDIT DASHBOARD HOOK - TANSTACK OPTIMIZED
 * ============================================
 *
 * Hook específico para AuditDashboard con TanStack Query.
 * Optimiza la carga de datos, filtros y acciones del dashboard.
 *
 * Enterprise: 2025-01-17 - AuditDashboard TanStack optimization
 */

"use client";

import { useState, useCallback, useMemo } from "react";
import { useAuditQuery } from "./useAuditQuery";
import { useAuditFilters } from "./useAuditFilters";
import type { AuditFilters, AuditEvent, AuditStats } from "../types";
import { DEFAULT_AUDIT_FILTERS } from "../constants";

// 🎯 Dashboard tab types
type DashboardTab = "overview" | "events";

// 🎯 Hook props interface
interface UseAuditDashboardProps {
  initialTab?: DashboardTab;
  initialFilters?: AuditFilters;
  enableAutoRefresh?: boolean;
  refreshInterval?: number;
}

// 🎯 Hook return interface
interface UseAuditDashboardReturn {
  // Tab management
  activeTab: DashboardTab;
  setActiveTab: (tab: DashboardTab) => void;
  handleTabChange: (tab: DashboardTab) => void;

  // Data
  events: AuditEvent[];
  stats: AuditStats | undefined;
  totalCount: number;
  currentPage: number;
  totalPages: number;
  hasMore: boolean;

  // Filters
  filters: AuditFilters;
  updateFilter: ReturnType<typeof useAuditFilters>["updateFilter"];
  resetFilters: ReturnType<typeof useAuditFilters>["resetFilters"];
  applyPreset: ReturnType<typeof useAuditFilters>["applyPreset"];
  activeFiltersCount: number;
  hasActiveFilters: boolean;

  // Loading states
  isEventsLoading: boolean;
  isStatsLoading: boolean;
  isExporting: boolean;

  // Error states
  eventsError: string | null;
  statsError: string | null;
  hasErrors: boolean;

  // Actions
  handleFiltersChange: (newFilters: AuditFilters) => void;
  handlePageChange: (page: number) => void;
  handleRefresh: () => void;
  handleExport: (format: "csv" | "json") => Promise<void>;
  handleViewEvent: (event: AuditEvent) => void;

  // Utilities
  getPageInfo: () => {
    current: number;
    total: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  getActiveFiltersDisplay: () => string[];
  canExport: boolean;
}

/**
 * ⚡ USE AUDIT DASHBOARD - TANSTACK OPTIMIZED
 *
 * Hook optimizado para AuditDashboard que maneja toda la lógica
 * de datos y UI state con TanStack Query.
 */
export function useAuditDashboard({
  initialTab = "overview",
  initialFilters = DEFAULT_AUDIT_FILTERS,
}: UseAuditDashboardProps = {}): UseAuditDashboardReturn {
  // 🎛️ UI State
  const [activeTab, setActiveTab] = useState<DashboardTab>(initialTab);

  // 🎯 Filters management
  const {
    filters,
    updateFilter,
    resetFilters,
    applyPreset,
    activeFiltersCount,
    hasActiveFilters,
  } = useAuditFilters(initialFilters);

  // ⚡ TanStack Query optimized audit data
  const {
    // Events data
    events,
    totalCount,
    currentPage,
    totalPages,
    hasMore,

    // Stats data
    stats,

    // Loading states
    isEventsLoading,
    isStatsLoading,
    isExporting,

    // Error states
    eventsError,
    statsError,

    // Actions
    loadEvents,
    exportEvents,
    refreshEvents,
    refreshStats,
  } = useAuditQuery(filters, {
    enableEvents: true,
    enableStats: true,
  });

  // 🎯 Tab management
  const handleTabChange = useCallback(
    (tab: DashboardTab) => {
      setActiveTab(tab);
      if (tab === "events" && events.length === 0) {
        loadEvents(filters);
      }
    },
    [events.length, filters, loadEvents]
  );

  // 🎯 Filters management
  const handleFiltersChange = useCallback(
    (newFilters: AuditFilters) => {
      updateFilter("action", newFilters.action);
      updateFilter("resource", newFilters.resource);
      updateFilter("severity", newFilters.severity);
      updateFilter("userId", newFilters.userId);
      updateFilter("dateFrom", newFilters.dateFrom);
      updateFilter("dateTo", newFilters.dateTo);
      updateFilter("search", newFilters.search);
      updateFilter("page", newFilters.page);
      updateFilter("pageSize", newFilters.pageSize);

      if (activeTab === "events") {
        loadEvents(newFilters);
      }
    },
    [updateFilter, activeTab, loadEvents]
  );

  const handlePageChange = useCallback(
    (page: number) => {
      const newFilters = { ...filters, page };
      handleFiltersChange(newFilters);
    },
    [filters, handleFiltersChange]
  );

  // 🎯 Actions
  const handleRefresh = useCallback(() => {
    if (activeTab === "overview") {
      refreshStats();
    } else {
      refreshEvents();
    }
  }, [activeTab, refreshStats, refreshEvents]);

  const handleExport = useCallback(
    async (format: "csv" | "json") => {
      const exportOptions = {
        format,
        includeMetadata: true,
        includeChanges: true,
        filename: `audit-events-${
          new Date().toISOString().split("T")[0]
        }.${format}`,
      };
      await exportEvents(filters, exportOptions);
    },
    [exportEvents, filters]
  );

  const handleViewEvent = useCallback((event: AuditEvent) => {
    // TODO: Implement event details modal or navigation
    console.log("View event:", event);
    // This could be enhanced to show a modal, navigate to detail page, etc.
  }, []);

  // 📊 Computed values
  const hasErrors = useMemo(() => {
    return !!(eventsError || statsError);
  }, [eventsError, statsError]);

  const getPageInfo = useCallback(
    () => ({
      current: currentPage,
      total: totalPages,
      hasNext: currentPage < totalPages,
      hasPrev: currentPage > 1,
    }),
    [currentPage, totalPages]
  );

  const getActiveFiltersDisplay = useCallback((): string[] => {
    const display: string[] = [];

    if (filters.action) display.push(`Action: ${filters.action}`);
    if (filters.resource) display.push(`Resource: ${filters.resource}`);
    if (filters.severity) display.push(`Severity: ${filters.severity}`);
    if (filters.dateFrom)
      display.push(`From: ${filters.dateFrom.toLocaleDateString()}`);
    if (filters.dateTo)
      display.push(`To: ${filters.dateTo.toLocaleDateString()}`);
    if (filters.search) display.push(`Search: "${filters.search}"`);

    return display;
  }, [filters]);

  const canExport = useMemo(() => {
    return events.length > 0 && !isEventsLoading && !isExporting;
  }, [events.length, isEventsLoading, isExporting]);

  return {
    // Tab management
    activeTab,
    setActiveTab,
    handleTabChange,

    // Data
    events,
    stats,
    totalCount,
    currentPage,
    totalPages,
    hasMore,

    // Filters
    filters,
    updateFilter,
    resetFilters,
    applyPreset,
    activeFiltersCount,
    hasActiveFilters,

    // Loading states
    isEventsLoading,
    isStatsLoading,
    isExporting,

    // Error states
    eventsError,
    statsError,
    hasErrors,

    // Actions
    handleFiltersChange,
    handlePageChange,
    handleRefresh,
    handleExport,
    handleViewEvent,

    // Utilities
    getPageInfo,
    getActiveFiltersDisplay,
    canExport,
  };
}
