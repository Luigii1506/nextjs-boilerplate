/**
 * 🪝 USE AUDIT TRAIL
 * ==================
 *
 * Hook principal para gestionar eventos de auditoría.
 * Incluye paginación, filtros y operaciones CRUD.
 */

"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  getAuditEventsAction,
  exportAuditEventsAction,
} from "../server/actions";
import type {
  UseAuditTrailReturn,
  AuditEvent,
  AuditFilters,
  AuditExportOptions,
  AuditEventsResponse,
} from "../types";
import { AUDIT_CONFIG } from "../constants";

export function useAuditTrail(
  initialFilters?: AuditFilters
): UseAuditTrailReturn {
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [filters, setFilters] = useState<AuditFilters>(initialFilters || {});

  // 🔄 Load Events
  const loadEvents = useCallback(
    async (
      newFilters?: AuditFilters,
      page: number = 1,
      append: boolean = false
    ) => {
      try {
        setIsLoading(true);
        setError(null);

        const filtersToUse = newFilters || filters;
        const result = await getAuditEventsAction({
          ...filtersToUse,
          page,
          limit: filtersToUse.limit || AUDIT_CONFIG.DEFAULT_PAGE_SIZE,
        });

        if (result.success && result.data) {
          const response = result.data as AuditEventsResponse;

          if (append) {
            setEvents((prev) => [...prev, ...response.events]);
          } else {
            setEvents(response.events);
          }

          setTotalCount(response.totalCount);
          setCurrentPage(response.currentPage);
          setHasMore(response.hasMore);
        } else {
          setError(result.error || "Error al cargar eventos");
          if (!append) {
            setEvents([]);
            setTotalCount(0);
            setHasMore(false);
          }
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Error desconocido";
        setError(errorMessage);
        console.error("[useAuditTrail] Load error:", err);
      } finally {
        setIsLoading(false);
      }
    },
    [filters]
  );

  // 🔄 Load More (Pagination)
  const loadMore = useCallback(async () => {
    if (!hasMore || isLoading) return;

    const nextPage = currentPage + 1;
    await loadEvents(filters, nextPage, true);
  }, [hasMore, isLoading, currentPage, filters, loadEvents]);

  // 🔄 Refresh
  const refresh = useCallback(async () => {
    setCurrentPage(1);
    await loadEvents(filters, 1, false);
  }, [filters, loadEvents]);

  // 🔍 Apply Filters
  const applyFilters = useCallback(
    async (newFilters: AuditFilters) => {
      setFilters(newFilters);
      setCurrentPage(1);
      await loadEvents(newFilters, 1, false);
    },
    [loadEvents]
  );

  // 📤 Export Events
  const exportEvents = useCallback(async (options: AuditExportOptions) => {
    try {
      setError(null);

      const result = await exportAuditEventsAction(
        options.filters || {},
        options.format
      );

      if (result.success && result.data) {
        // Create and download file
        const blob = new Blob([result.data], {
          type: options.format === "csv" ? "text/csv" : "application/json",
        });

        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `audit-events-${
          new Date().toISOString().split("T")[0]
        }.${options.format}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } else {
        setError(result.error || "Error al exportar eventos");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error en exportación";
      setError(errorMessage);
      console.error("[useAuditTrail] Export error:", err);
    }
  }, []);

  // 🚀 Initial Load
  useEffect(() => {
    loadEvents();
  }, [loadEvents]); // Run on mount and when loadEvents changes

  // 📊 Computed Values
  const isEmpty = useMemo(
    () => events.length === 0 && !isLoading,
    [events.length, isLoading]
  );
  const isFiltered = useMemo(() => {
    return Object.keys(filters).some((key) => {
      const value = filters[key as keyof AuditFilters];
      return value !== undefined && value !== null && value !== "";
    });
  }, [filters]);

  return {
    events,
    isLoading,
    error,
    hasMore,
    totalCount,
    currentPage,
    loadEvents,
    loadMore,
    refresh,
    exportEvents,
    // Additional utilities
    applyFilters,
    isEmpty,
    isFiltered,
    filters,
  } as UseAuditTrailReturn & {
    loadEvents: (
      filters?: AuditFilters,
      page?: number,
      append?: boolean
    ) => Promise<void>;
    applyFilters: (filters: AuditFilters) => Promise<void>;
    isEmpty: boolean;
    isFiltered: boolean;
    filters: AuditFilters;
  };
}
