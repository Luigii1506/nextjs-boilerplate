/**
 * 🪝 USE AUDIT FILTERS
 * ====================
 *
 * Hook para gestionar filtros de auditoría.
 * Incluye estado, validación y utilidades de filtrado.
 */

"use client";

import { useState, useCallback, useMemo } from "react";
import type { UseAuditFiltersReturn, AuditFilters } from "../types";
import { DEFAULT_AUDIT_FILTERS } from "../constants";

export function useAuditFilters(
  initialFilters?: AuditFilters
): UseAuditFiltersReturn {
  const [filters, setFiltersState] = useState<AuditFilters>(
    initialFilters || DEFAULT_AUDIT_FILTERS
  );

  // 🔄 Set Filters
  const setFilters = useCallback((newFilters: AuditFilters) => {
    setFiltersState(newFilters);
  }, []);

  // 🔄 Update Single Filter
  const updateFilter = useCallback(
    <K extends keyof AuditFilters>(key: K, value: AuditFilters[K]) => {
      setFiltersState((prev) => ({
        ...prev,
        [key]: value,
      }));
    },
    []
  );

  // 🔄 Reset Filters
  const resetFilters = useCallback(() => {
    setFiltersState(DEFAULT_AUDIT_FILTERS);
  }, []);

  // 📊 Computed Values
  const activeFiltersCount = useMemo(() => {
    let count = 0;

    if (filters.action) count++;
    if (filters.resource) count++;
    if (filters.userId) count++;
    if (filters.severity) count++;
    if (filters.dateFrom) count++;
    if (filters.dateTo) count++;
    if (filters.search) count++;
    if (filters.resourceId) count++;
    if (filters.ipAddress) count++;

    return count;
  }, [filters]);

  const isFiltered = useMemo(
    () => activeFiltersCount > 0,
    [activeFiltersCount]
  );

  // 📅 Date Range Helpers
  const setDateRange = useCallback((dateFrom?: Date, dateTo?: Date) => {
    setFiltersState((prev) => ({
      ...prev,
      dateFrom,
      dateTo,
    }));
  }, []);

  const setDateRangePreset = useCallback(
    (preset: string) => {
      const now = new Date();
      let dateFrom: Date | undefined;
      let dateTo: Date | undefined = now;

      switch (preset) {
        case "1h":
          dateFrom = new Date(now.getTime() - 60 * 60 * 1000);
          break;
        case "24h":
          dateFrom = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case "7d":
          dateFrom = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case "30d":
          dateFrom = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case "90d":
          dateFrom = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        case "clear":
          dateFrom = undefined;
          dateTo = undefined;
          break;
      }

      setDateRange(dateFrom, dateTo);
    },
    [setDateRange]
  );

  // 🔍 Search Helpers
  const setSearch = useCallback(
    (search: string) => {
      updateFilter("search", search.trim() || undefined);
    },
    [updateFilter]
  );

  const clearSearch = useCallback(() => {
    updateFilter("search", undefined);
  }, [updateFilter]);

  // 🎯 Quick Filters
  const setQuickFilter = useCallback(
    (type: "today" | "yesterday" | "thisWeek" | "lastWeek" | "thisMonth") => {
      const now = new Date();
      let dateFrom: Date;
      let dateTo: Date;

      switch (type) {
        case "today":
          dateFrom = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          dateTo = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate(),
            23,
            59,
            59
          );
          break;
        case "yesterday":
          const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          dateFrom = new Date(
            yesterday.getFullYear(),
            yesterday.getMonth(),
            yesterday.getDate()
          );
          dateTo = new Date(
            yesterday.getFullYear(),
            yesterday.getMonth(),
            yesterday.getDate(),
            23,
            59,
            59
          );
          break;
        case "thisWeek":
          const startOfWeek = new Date(now);
          startOfWeek.setDate(now.getDate() - now.getDay());
          startOfWeek.setHours(0, 0, 0, 0);
          dateFrom = startOfWeek;
          dateTo = now;
          break;
        case "lastWeek":
          const lastWeekStart = new Date(now);
          lastWeekStart.setDate(now.getDate() - now.getDay() - 7);
          lastWeekStart.setHours(0, 0, 0, 0);
          const lastWeekEnd = new Date(lastWeekStart);
          lastWeekEnd.setDate(lastWeekStart.getDate() + 6);
          lastWeekEnd.setHours(23, 59, 59, 999);
          dateFrom = lastWeekStart;
          dateTo = lastWeekEnd;
          break;
        case "thisMonth":
          dateFrom = new Date(now.getFullYear(), now.getMonth(), 1);
          dateTo = now;
          break;
        default:
          return;
      }

      setDateRange(dateFrom, dateTo);
    },
    [setDateRange]
  );

  // 🎯 Filter by Resource
  const filterByResource = useCallback(
    (resource: string, resourceId?: string) => {
      setFiltersState((prev) => ({
        ...prev,
        resource: resource as any,
        resourceId,
      }));
    },
    []
  );

  // 🎯 Filter by User
  const filterByUser = useCallback(
    (userId: string) => {
      updateFilter("userId", userId);
    },
    [updateFilter]
  );

  // 🎯 Filter by Action
  const filterByAction = useCallback(
    (action: string) => {
      updateFilter("action", action as any);
    },
    [updateFilter]
  );

  // 🎯 Filter by Severity
  const filterBySeverity = useCallback(
    (severity: string) => {
      updateFilter("severity", severity as any);
    },
    [updateFilter]
  );

  // 📊 Get Filter Summary
  const getFilterSummary = useCallback(() => {
    const summary: string[] = [];

    if (filters.action) summary.push(`Acción: ${filters.action}`);
    if (filters.resource) summary.push(`Recurso: ${filters.resource}`);
    if (filters.severity) summary.push(`Severidad: ${filters.severity}`);
    if (filters.search) summary.push(`Búsqueda: "${filters.search}"`);
    if (filters.dateFrom && filters.dateTo) {
      summary.push(
        `Período: ${filters.dateFrom.toLocaleDateString()} - ${filters.dateTo.toLocaleDateString()}`
      );
    } else if (filters.dateFrom) {
      summary.push(`Desde: ${filters.dateFrom.toLocaleDateString()}`);
    } else if (filters.dateTo) {
      summary.push(`Hasta: ${filters.dateTo.toLocaleDateString()}`);
    }

    return summary;
  }, [filters]);

  // 🔄 Clone Filters
  const cloneFilters = useCallback(() => {
    return { ...filters };
  }, [filters]);

  // 📤 Export Filters (for URL params)
  const exportFilters = useCallback(() => {
    const exportableFilters: Record<string, string> = {};

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        if (value instanceof Date) {
          exportableFilters[key] = value.toISOString();
        } else {
          exportableFilters[key] = String(value);
        }
      }
    });

    return exportableFilters;
  }, [filters]);

  // 📥 Import Filters (from URL params)
  const importFilters = useCallback(
    (params: Record<string, string>) => {
      const importedFilters: AuditFilters = { ...DEFAULT_AUDIT_FILTERS };

      Object.entries(params).forEach(([key, value]) => {
        if (key === "dateFrom" || key === "dateTo") {
          importedFilters[key] = new Date(value);
        } else if (key === "page" || key === "limit") {
          importedFilters[key] = parseInt(value, 10);
        } else {
          (importedFilters as any)[key] = value;
        }
      });

      setFilters(importedFilters);
    },
    [setFilters]
  );

  return {
    filters,
    setFilters,
    updateFilter,
    resetFilters,
    activeFiltersCount,
    isFiltered,
    // Extended utilities
    setDateRange,
    setDateRangePreset,
    setSearch,
    clearSearch,
    setQuickFilter,
    filterByResource,
    filterByUser,
    filterByAction,
    filterBySeverity,
    getFilterSummary,
    cloneFilters,
    exportFilters,
    importFilters,
  } as UseAuditFiltersReturn & {
    setDateRange: (dateFrom?: Date, dateTo?: Date) => void;
    setDateRangePreset: (preset: string) => void;
    setSearch: (search: string) => void;
    clearSearch: () => void;
    setQuickFilter: (
      type: "today" | "yesterday" | "thisWeek" | "lastWeek" | "thisMonth"
    ) => void;
    filterByResource: (resource: string, resourceId?: string) => void;
    filterByUser: (userId: string) => void;
    filterByAction: (action: string) => void;
    filterBySeverity: (severity: string) => void;
    getFilterSummary: () => string[];
    cloneFilters: () => AuditFilters;
    exportFilters: () => Record<string, string>;
    importFilters: (params: Record<string, string>) => void;
  };
}
