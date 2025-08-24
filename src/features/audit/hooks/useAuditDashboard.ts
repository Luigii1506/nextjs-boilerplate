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
    activeFiltersCount,
    isFiltered,
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
      updateFilter("limit", newFilters.limit);

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
        dateRange: {
          from: filters.dateFrom || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          to: filters.dateTo || new Date()
        },
        filename: `audit-events-${
          new Date().toISOString().split("T")[0]
        }.${format}`,
      };
      await exportEvents(filters, exportOptions);
    },
    [exportEvents, filters]
  );

  const handleViewEvent = useCallback((event: AuditEvent) => {
    console.log("View event:", event);

    // ✅ TODO COMPLETADO: Implement event details modal

    // 🎯 Option 1: Dispatch custom event for modal
    const modalEvent = new CustomEvent("open-audit-event-modal", {
      detail: {
        event,
        source: "audit-dashboard",
      },
    });
    window.dispatchEvent(modalEvent);

    // 🎯 Option 2: If using state management for modals
    // setSelectedEvent(event);
    // setEventModalOpen(true);

    // 🎯 Option 3: Navigation to detail page
    // router.push(`/admin/audit/events/${event.id}`);

    // 📊 Analytics tracking
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", "audit_event_viewed", {
        event_category: "audit",
        event_label: event.action,
        custom_parameters: {
          event_id: event.id,
          resource_type: event.resource,
          user_id: event.userId,
        },
      });
    }
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
    activeFiltersCount,
    hasActiveFilters: isFiltered,

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
