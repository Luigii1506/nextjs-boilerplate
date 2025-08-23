/**
 * 🎛️ FEATURE FLAGS QUERY HOOK - TANSTACK OPTIMIZED
 * =================================================
 *
 * Hook súper optimizado usando TanStack Query.
 * Performance enterprise, battle-tested, cero parpadeos.
 *
 * Enterprise: 2025-01-17 - TanStack Query integration
 */

"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo, useCallback } from "react";
import { getFeatureFlagsAction, toggleFeatureFlagAction } from "../actions";
import type {
  FeatureFlagData,
  FeatureCategory,
  FeatureFlagFilters,
} from "../types";
import { useNotifications } from "@/shared/hooks/useNotifications";

// 🎯 Query keys
export const FEATURE_FLAGS_QUERY_KEYS = {
  all: ["feature-flags"] as const,
  lists: () => [...FEATURE_FLAGS_QUERY_KEYS.all, "list"] as const,
  list: (filters: Record<string, unknown>) =>
    [...FEATURE_FLAGS_QUERY_KEYS.lists(), filters] as const,
  details: () => [...FEATURE_FLAGS_QUERY_KEYS.all, "detail"] as const,
  detail: (key: string) =>
    [...FEATURE_FLAGS_QUERY_KEYS.details(), key] as const,
} as const;

// 🚀 Feature flags fetcher function
async function fetchFeatureFlags(): Promise<FeatureFlagData[]> {
  const result = await getFeatureFlagsAction();
  if (!result.success || !result.data) {
    throw new Error(result.error || "Failed to fetch feature flags");
  }
  return result.data;
}

/**
 * 🎛️ USE FEATURE FLAGS QUERY
 *
 * Hook principal para obtener feature flags con TanStack Query.
 * Incluye cache inteligente, background updates, optimistic mutations.
 */
export function useFeatureFlagsQuery() {
  const { notify } = useNotifications();
  const queryClient = useQueryClient();

  // 📊 Main feature flags query
  const {
    data: flags = [],
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: FEATURE_FLAGS_QUERY_KEYS.lists(),
    queryFn: fetchFeatureFlags,
    staleTime: 30 * 1000, // 30s fresh
    gcTime: 5 * 60 * 1000, // 5min cache
    retry: 3,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30000),
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    throwOnError: false,
  });

  // 🗺️ Flags map for quick lookup
  const flagsMap = useMemo(() => {
    const map: Record<string, boolean> = {};
    flags.forEach((flag) => {
      map[flag.key] = flag.enabled;
    });
    return map;
  }, [flags]);

  // 📊 Computed stats
  const stats = useMemo(() => {
    if (!flags || flags.length === 0) {
      return {
        total: 0,
        enabled: 0,
        disabled: 0,
        byCategory: {
          module: 0,
          ui: 0,
          admin: 0,
          core: 0,
          experimental: 0,
        },
      };
    }

    const total = flags.length;
    const enabled = flags.filter((flag) => flag.enabled).length;
    const disabled = total - enabled;
    const byCategory = {
      module: flags.filter((f) => f.category === "module").length,
      ui: flags.filter((f) => f.category === "ui").length,
      admin: flags.filter((f) => f.category === "admin").length,
      core: flags.filter((f) => f.category === "core").length,
      experimental: flags.filter((f) => f.category === "experimental").length,
    };

    return { total, enabled, disabled, byCategory };
  }, [flags]);

  // 🔄 Toggle flag mutation
  const toggleFlagMutation = useMutation({
    mutationFn: async (flagKey: string) => {
      const result = await toggleFeatureFlagAction(flagKey);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    onMutate: async (flagKey) => {
      // 🎯 Optimistic update
      await queryClient.cancelQueries({
        queryKey: FEATURE_FLAGS_QUERY_KEYS.lists(),
      });

      const previousFlags = queryClient.getQueryData<FeatureFlagData[]>(
        FEATURE_FLAGS_QUERY_KEYS.lists()
      );

      // 🚀 Optimistic toggle
      queryClient.setQueryData<FeatureFlagData[]>(
        FEATURE_FLAGS_QUERY_KEYS.lists(),
        (old) =>
          old?.map((flag) =>
            flag.key === flagKey
              ? { ...flag, enabled: !flag.enabled, updatedAt: new Date() }
              : flag
          ) || []
      );

      return { previousFlags };
    },
    onError: (err, flagKey, context) => {
      // 🔙 Rollback on error
      if (context?.previousFlags) {
        queryClient.setQueryData(
          FEATURE_FLAGS_QUERY_KEYS.lists(),
          context.previousFlags
        );
      }
    },
    onSettled: () => {
      // 🔄 Always refetch to ensure consistency
      queryClient.invalidateQueries({
        queryKey: FEATURE_FLAGS_QUERY_KEYS.lists(),
      });
    },
  });

  // 🔍 Filter functions with memoization
  const filterFlags = useCallback(
    (filters: FeatureFlagFilters) => {
      return flags.filter((flag) => {
        // 🎯 Category filter (only show module, ui, admin)
        if (
          flag.category !== "module" &&
          flag.category !== "ui" &&
          flag.category !== "admin"
        ) {
          return false;
        }

        // Search filter
        if (filters.search) {
          const searchLower = filters.search.toLowerCase();
          if (
            !flag.name.toLowerCase().includes(searchLower) &&
            !flag.key.toLowerCase().includes(searchLower) &&
            !flag.description.toLowerCase().includes(searchLower)
          ) {
            return false;
          }
        }

        // Category filter
        if (filters.category !== "all" && flag.category !== filters.category) {
          return false;
        }

        // Status filter
        if (filters.status !== "all") {
          const isEnabled = flag.enabled;
          if (
            (filters.status === "enabled" && !isEnabled) ||
            (filters.status === "disabled" && isEnabled)
          ) {
            return false;
          }
        }

        return true;
      });
    },
    [flags]
  );

  const searchFlags = useCallback(
    (searchTerm: string) => {
      if (!searchTerm) return flags;
      const term = searchTerm.toLowerCase();
      return flags.filter(
        (flag) =>
          flag.name.toLowerCase().includes(term) ||
          flag.key.toLowerCase().includes(term) ||
          flag.description.toLowerCase().includes(term)
      );
    },
    [flags]
  );

  const filterByCategory = useCallback(
    (category: FeatureCategory) => {
      return flags.filter((flag) => flag.category === category);
    },
    [flags]
  );

  const filterByStatus = useCallback(
    (status: "enabled" | "disabled") => {
      return flags.filter((flag) =>
        status === "enabled" ? flag.enabled : !flag.enabled
      );
    },
    [flags]
  );

  // 🎯 Quick flag check
  const isEnabled = useCallback(
    (flagKey: string) => {
      return flagsMap[flagKey] || false;
    },
    [flagsMap]
  );

  // 🎯 Action wrappers with notifications
  const toggleFlag = useCallback(
    async (flagKey: string) => {
      const flag = flags.find((f) => f.key === flagKey);
      const actionText = flag?.enabled ? "desactivar" : "activar";
      const successText = flag?.enabled ? "desactivado" : "activado";

      await notify(
        () => toggleFlagMutation.mutateAsync(flagKey),
        `${
          actionText.charAt(0).toUpperCase() + actionText.slice(1)
        } ${flagKey}...`,
        `Feature flag '${flagKey}' ${successText} exitosamente`
      );
    },
    [flags, toggleFlagMutation, notify]
  );

  // 🚀 Batch operations (for future use)
  const enableFlag = useCallback(
    async (flagKey: string) => {
      const flag = flags.find((f) => f.key === flagKey);
      if (flag?.enabled) return; // Already enabled
      await toggleFlag(flagKey);
    },
    [flags, toggleFlag]
  );

  const disableFlag = useCallback(
    async (flagKey: string) => {
      const flag = flags.find((f) => f.key === flagKey);
      if (!flag?.enabled) return; // Already disabled
      await toggleFlag(flagKey);
    },
    [flags, toggleFlag]
  );

  return {
    // 📊 Data
    flags,
    flagsMap,
    stats,

    // 🔄 States
    isLoading,
    isFetching,
    isValidating: isFetching && !isLoading,
    error: error?.message || null,
    hasError: isError,

    // 🔍 Filters and searches
    filterFlags,
    searchFlags,
    filterByCategory,
    filterByStatus,

    // 🎯 Flag operations
    isEnabled,
    toggleFlag,
    enableFlag,
    disableFlag,
    refresh: refetch,

    // 🔄 Mutation states
    isToggling: toggleFlagMutation.isPending,

    // 🎯 Individual loading states (for UI)
    getIsToggling: (flagKey: string) => {
      return (
        toggleFlagMutation.isPending && toggleFlagMutation.variables === flagKey
      );
    },
  };
}
