/**
 * ⚡ AUDIT QUERY HOOK - TANSTACK OPTIMIZED
 * =======================================
 *
 * Hook súper optimizado para sistema de audit usando TanStack Query.
 * Performance enterprise, cache inteligente, reactivity automática.
 *
 * Enterprise: 2025-01-17 - TanStack Query audit optimization
 */

"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo, useCallback } from "react";
import {
  getAuditEventsAction,
  getAuditStatsAction,
  exportAuditEventsAction,
  createAuditEventAction,
} from "../server/actions";
import type {
  AuditEvent,
  AuditStats,
  AuditFilters,
  AuditExportOptions,
  AuditEventsResponse,
  CreateAuditEventData,
} from "../types";
import { DEFAULT_AUDIT_FILTERS } from "../constants";
import { useNotifications } from "@/shared/hooks/useNotifications";

// 🎯 Query Client interface for typing
interface QueryClient {
  invalidateQueries: (options: {
    queryKey: readonly unknown[];
  }) => Promise<void>;
  prefetchQuery: (options: {
    queryKey: readonly unknown[];
    queryFn: () => Promise<AuditEventsResponse>;
    staleTime: number;
  }) => Promise<void>;
  getQueryData: (
    queryKey: readonly unknown[]
  ) => AuditEventsResponse | AuditStats | undefined;
}

// 🎯 Query keys for audit system
const AUDIT_QUERY_KEYS = {
  all: ["audit"] as const,
  events: () => [...AUDIT_QUERY_KEYS.all, "events"] as const,
  eventsList: (filters: AuditFilters) =>
    [...AUDIT_QUERY_KEYS.events(), "list", filters] as const,
  event: (id: string) => [...AUDIT_QUERY_KEYS.events(), "detail", id] as const,
  stats: () => [...AUDIT_QUERY_KEYS.all, "stats"] as const,
  statsRange: (dateFrom?: Date, dateTo?: Date) =>
    [...AUDIT_QUERY_KEYS.stats(), { dateFrom, dateTo }] as const,
} as const;

// 🎯 Audit events fetcher
async function fetchAuditEvents(
  filters: AuditFilters
): Promise<AuditEventsResponse> {
  const result = await getAuditEventsAction(filters);
  if (!result.success) {
    throw new Error(result.error || "Error fetching audit events");
  }
  return result.data!;
}

// 🎯 Audit stats fetcher
async function fetchAuditStats(
  dateFrom?: Date,
  dateTo?: Date
): Promise<AuditStats> {
  const result = await getAuditStatsAction(dateFrom, dateTo);
  if (!result.success) {
    throw new Error(result.error || "Error fetching audit stats");
  }
  return result.data!;
}

// 🎯 Hook return interface
interface UseAuditQueryReturn {
  // Events data
  events: AuditEvent[];
  eventsData: AuditEventsResponse | undefined;
  totalCount: number;
  currentPage: number;
  totalPages: number;
  hasMore: boolean;

  // Stats data
  stats: AuditStats | undefined;

  // Loading states
  isEventsLoading: boolean;
  isStatsLoading: boolean;
  isExporting: boolean;
  isCreatingEvent: boolean;

  // Error states
  eventsError: string | null;
  statsError: string | null;

  // Actions
  loadEvents: (filters: AuditFilters) => void;
  loadStats: (dateFrom?: Date, dateTo?: Date) => void;
  exportEvents: (
    filters: AuditFilters,
    options: AuditExportOptions
  ) => Promise<void>;
  createEvent: (event: CreateAuditEventData) => Promise<void>;
  refreshEvents: () => void;
  refreshStats: () => void;

  // Utilities
  getEventById: (id: string) => AuditEvent | undefined;
  invalidateEvents: () => Promise<void>;
  invalidateStats: () => Promise<void>;
}

/**
 * ⚡ USE AUDIT QUERY - TANSTACK OPTIMIZED
 *
 * Hook principal para el sistema de audit optimizado con TanStack Query.
 * Incluye events, stats, export, cache inteligente y performance enterprise.
 */
export function useAuditQuery(
  initialFilters: AuditFilters = DEFAULT_AUDIT_FILTERS,
  {
    enableEvents = true,
    enableStats = true,
    dateFrom,
    dateTo,
  }: {
    enableEvents?: boolean;
    enableStats?: boolean;
    dateFrom?: Date;
    dateTo?: Date;
  } = {}
): UseAuditQueryReturn {
  const queryClient = useQueryClient();
  const { error: notifyError, success: notifySuccess } = useNotifications();

  // ⚡ TanStack Query for audit events
  const {
    data: eventsData,
    isLoading: isEventsLoading,
    error: eventsQueryError,
    refetch: refetchEvents,
  } = useQuery({
    queryKey: AUDIT_QUERY_KEYS.eventsList(initialFilters),
    queryFn: () => fetchAuditEvents(initialFilters),
    enabled: enableEvents,
    staleTime: 2 * 60 * 1000, // 2 minutes - audit data changes frequently
    gcTime: 10 * 60 * 1000, // 10 minutes cache
    retry: 2,
    refetchOnWindowFocus: true, // Audit data is important to stay current
    refetchOnMount: "always",
    throwOnError: false,
  });

  // ⚡ TanStack Query for audit stats
  const {
    data: stats,
    isLoading: isStatsLoading,
    error: statsQueryError,
    refetch: refetchStats,
  } = useQuery({
    queryKey: AUDIT_QUERY_KEYS.statsRange(dateFrom, dateTo),
    queryFn: () => fetchAuditStats(dateFrom, dateTo),
    enabled: enableStats,
    staleTime: 5 * 60 * 1000, // 5 minutes - stats change less frequently
    gcTime: 15 * 60 * 1000, // 15 minutes cache
    retry: 2,
    refetchOnWindowFocus: false, // Stats don't need immediate refresh
    refetchOnMount: false,
    throwOnError: false,
  });

  // 🚀 Export events mutation
  const exportMutation = useMutation({
    mutationFn: async ({
      filters,
      options,
    }: {
      filters: AuditFilters;
      options: AuditExportOptions;
    }) => {
      const result = await exportAuditEventsAction(filters, options.format);
      if (!result.success) {
        throw new Error(result.error || "Error exporting audit events");
      }
      return result.data;
    },
    onSuccess: (data, variables) => {
      notifySuccess(
        `Audit events exported successfully as ${variables.options.format.toUpperCase()}`
      );
    },
    onError: (error: Error) => {
      notifyError(`Export failed: ${error.message}`);
    },
  });

  // 🆕 Create audit event mutation
  const createEventMutation = useMutation({
    mutationFn: async (eventData: CreateAuditEventData) => {
      const result = await createAuditEventAction(eventData);
      if (!result.success) {
        throw new Error(result.error || "Error creating audit event");
      }
      return result.data;
    },
    onSuccess: (newEvent) => {
      // 🎯 Optimistic update: add new event to cache
      queryClient.setQueryData<AuditEventsResponse>(
        AUDIT_QUERY_KEYS.eventsList(initialFilters),
        (old) => {
          if (!old) return undefined;
          return {
            ...old,
            events: [newEvent!, ...old.events],
            totalCount: old.totalCount + 1,
          };
        }
      );
      notifySuccess("Audit event created successfully");
    },
    onError: (error: Error) => {
      notifyError(`Failed to create audit event: ${error.message}`);
    },
    onSettled: () => {
      // 🔄 Always refetch to ensure consistency
      queryClient.invalidateQueries({
        queryKey: AUDIT_QUERY_KEYS.events(),
      });
      queryClient.invalidateQueries({
        queryKey: AUDIT_QUERY_KEYS.stats(),
      });
    },
  });

  // 🎯 Computed values
  const events = useMemo(() => eventsData?.events || [], [eventsData?.events]);
  const totalCount = useMemo(
    () => eventsData?.totalCount || 0,
    [eventsData?.totalCount]
  );
  const currentPage = useMemo(
    () => eventsData?.currentPage || 1,
    [eventsData?.currentPage]
  );
  const totalPages = useMemo(
    () => eventsData?.totalPages || 1,
    [eventsData?.totalPages]
  );
  const hasMore = useMemo(
    () => eventsData?.hasMore || false,
    [eventsData?.hasMore]
  );

  // 🎯 Error handling
  const eventsError = eventsQueryError?.message || null;
  const statsError = statsQueryError?.message || null;

  // 🎯 Actions
  const loadEvents = useCallback(
    (filters: AuditFilters) => {
      queryClient.setQueryData(AUDIT_QUERY_KEYS.eventsList(filters), undefined);
      queryClient.prefetchQuery({
        queryKey: AUDIT_QUERY_KEYS.eventsList(filters),
        queryFn: () => fetchAuditEvents(filters),
        staleTime: 2 * 60 * 1000,
      });
    },
    [queryClient]
  );

  const loadStats = useCallback(
    (dateFrom?: Date, dateTo?: Date) => {
      queryClient.prefetchQuery({
        queryKey: AUDIT_QUERY_KEYS.statsRange(dateFrom, dateTo),
        queryFn: () => fetchAuditStats(dateFrom, dateTo),
        staleTime: 5 * 60 * 1000,
      });
    },
    [queryClient]
  );

  const exportEvents = useCallback(
    async (filters: AuditFilters, options: AuditExportOptions) => {
      await exportMutation.mutateAsync({ filters, options });
    },
    [exportMutation]
  );

  const createEvent = useCallback(
    async (eventData: CreateAuditEventData) => {
      await createEventMutation.mutateAsync(eventData);
    },
    [createEventMutation]
  );

  const refreshEvents = useCallback(() => {
    refetchEvents();
  }, [refetchEvents]);

  const refreshStats = useCallback(() => {
    refetchStats();
  }, [refetchStats]);

  const getEventById = useCallback(
    (id: string): AuditEvent | undefined => {
      return events.find((event) => event.id === id);
    },
    [events]
  );

  const invalidateEvents = useCallback(async () => {
    await queryClient.invalidateQueries({
      queryKey: AUDIT_QUERY_KEYS.events(),
    });
  }, [queryClient]);

  const invalidateStats = useCallback(async () => {
    await queryClient.invalidateQueries({
      queryKey: AUDIT_QUERY_KEYS.stats(),
    });
  }, [queryClient]);

  return {
    // Events data
    events,
    eventsData,
    totalCount,
    currentPage,
    totalPages,
    hasMore,

    // Stats data
    stats,

    // Loading states
    isEventsLoading,
    isStatsLoading,
    isExporting: exportMutation.isPending,
    isCreatingEvent: createEventMutation.isPending,

    // Error states
    eventsError,
    statsError,

    // Actions
    loadEvents,
    loadStats,
    exportEvents,
    createEvent,
    refreshEvents,
    refreshStats,

    // Utilities
    getEventById,
    invalidateEvents,
    invalidateStats,
  };
}

/**
 * 🔧 Audit Query Utilities
 */
export const auditQueryUtils = {
  // Invalidate all audit cache
  invalidateAllAudit: async (queryClient: QueryClient) => {
    await queryClient.invalidateQueries({
      queryKey: AUDIT_QUERY_KEYS.all,
    });
  },

  // Prefetch audit events for specific filters
  prefetchAuditEvents: async (
    queryClient: QueryClient,
    filters: AuditFilters
  ) => {
    await queryClient.prefetchQuery({
      queryKey: AUDIT_QUERY_KEYS.eventsList(filters),
      queryFn: () => fetchAuditEvents(filters),
      staleTime: 2 * 60 * 1000,
    });
  },

  // Get cached audit events
  getCachedAuditEvents: (
    queryClient: QueryClient,
    filters: AuditFilters
  ): AuditEventsResponse | undefined => {
    return queryClient.getQueryData(AUDIT_QUERY_KEYS.eventsList(filters)) as
      | AuditEventsResponse
      | undefined;
  },

  // Get cached audit stats
  getCachedAuditStats: (
    queryClient: QueryClient,
    dateFrom?: Date,
    dateTo?: Date
  ): AuditStats | undefined => {
    return queryClient.getQueryData(
      AUDIT_QUERY_KEYS.statsRange(dateFrom, dateTo)
    ) as AuditStats | undefined;
  },
};
