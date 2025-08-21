/**
 * 🪝 FEATURE FLAGS CLIENT HOOKS
 * =============================
 *
 * Simple, reactive, broadcast-enabled client hooks.
 * Provides context and utilities for feature flag usage.
 *
 * Simple: 2025-01-17 - Client hooks
 */

"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
  useMemo,
} from "react";
import { useFeatureFlagsBroadcast } from "@/shared/hooks/useBroadcast";
import { FEATURE_FLAGS } from "./config";
import {
  getFeatureFlagsAction,
  toggleFeatureFlagAction,
  batchUpdateFeatureFlagsAction,
} from "./actions";
import type {
  FeatureFlag,
  FeatureFlagData,
  FeatureFlagsContextType,
  FeatureFlagBatchUpdate,
} from "./types";

// 🎯 Context
const FeatureFlagsContext = createContext<FeatureFlagsContextType | null>(null);

// 🌐 Provider component
export function FeatureFlagsProvider({ children }: { children: ReactNode }) {
  const [flags, setFlags] = useState<FeatureFlagData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 📡 Broadcast for cross-tab sync - HOOK ESPECIALIZADO
  const { notifyFlagChange, onFlagChange } = useFeatureFlagsBroadcast();

  // 🗺️ Create flags map for fast lookups
  const flagsMap = useMemo(() => {
    const map: Record<string, boolean> = { ...FEATURE_FLAGS };
    flags.forEach((flag) => {
      map[flag.key] = flag.enabled;
    });
    return map;
  }, [flags]);

  // 🔄 Load flags from server
  const refreshFlags = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await getFeatureFlagsAction();

      if (result.success && result.data) {
        setFlags(result.data);
      } else {
        setError(result.error || "Failed to load flags");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      console.error("[FeatureFlags] Load error:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 🔄 Toggle single flag
  const toggleFlag = useCallback(
    async (flagKey: string) => {
      try {
        const result = await toggleFeatureFlagAction(flagKey);

        if (result.success) {
          // 📡 Broadcast FIRST (before state update)
          notifyFlagChange(flagKey);

          // 🔄 Refresh local state
          await refreshFlags();
        } else {
          setError(result.error || "Failed to toggle flag");
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error";
        setError(errorMessage);
        console.error("[FeatureFlags] Toggle error:", err);
      }
    },
    [notifyFlagChange, refreshFlags]
  );

  // 🔄 Batch update flags
  const batchUpdateFlags = useCallback(
    async (updates: FeatureFlagBatchUpdate[]) => {
      try {
        const result = await batchUpdateFeatureFlagsAction(updates);

        if (result.success) {
          // 📡 Broadcast batch update (notify each flag)
          updates.forEach((update) => notifyFlagChange(update.key));

          await refreshFlags();
          return result;
        } else {
          setError(result.error || "Failed to update flags");
          return result;
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error";
        setError(errorMessage);
        console.error("[FeatureFlags] Batch update error:", err);
        return { success: false, error: errorMessage };
      }
    },
    [notifyFlagChange, refreshFlags]
  );

  // 🎯 Check if feature is enabled
  const isEnabled = useCallback(
    (flag: FeatureFlag): boolean => {
      return flagsMap[flag] || false;
    },
    [flagsMap]
  );

  // 🔍 Get flag data (internal use only)
  const getFlagData = useCallback(
    (flagKey: FeatureFlag): FeatureFlagData | undefined => {
      return flags.find((flag) => flag.key === flagKey);
    },
    [flags]
  );

  // 📊 Get flags by category (internal use only)
  const getFlagsByCategory = useCallback(
    (category: string) => {
      return flags.filter((flag) => flag.category === category);
    },
    [flags]
  );

  // 📡 Listen to broadcasts from other tabs
  useEffect(() => {
    return onFlagChange((flagKey) => {
      console.log(
        `🎛️ Feature flag '${flagKey}' changed in another tab - refreshing`
      );
      refreshFlags(); // Refresh when other tabs change flags
    });
  }, [onFlagChange, refreshFlags]);

  // 🚀 Initial load
  useEffect(() => {
    refreshFlags();
  }, [refreshFlags]);

  // 🎯 Context value
  const value: FeatureFlagsContextType = {
    flags,
    flagsMap,
    isEnabled,
    toggleFlag,
    refreshFlags,
    isLoading,
    error,
  };

  return React.createElement(FeatureFlagsContext.Provider, { value }, children);
}

// 🪝 Main hook
export function useFeatureFlags() {
  const context = useContext(FeatureFlagsContext);
  if (!context) {
    throw new Error("useFeatureFlags must be used within FeatureFlagsProvider");
  }
  return context;
}

// 🎯 Simple checker hook (most common use case)
export function useIsEnabled() {
  const { isEnabled } = useFeatureFlags();
  return isEnabled;
}

// 🔄 Toggle hook
export function useToggleFlag() {
  const { toggleFlag } = useFeatureFlags();
  return toggleFlag;
}

// 📊 Flags data hook
export function useFeatureFlagsData() {
  const { flags, isLoading, error, refreshFlags } = useFeatureFlags();
  return { flags, isLoading, error, refreshFlags };
}

// 🎯 Single flag hook
export function useFeatureFlag(flagKey: FeatureFlag) {
  const { isEnabled, flags } = useFeatureFlags();

  return useMemo(
    () => ({
      enabled: isEnabled(flagKey),
      data: flags.find((flag) => flag.key === flagKey),
    }),
    [isEnabled, flags, flagKey]
  );
}

// 📊 Category hook
export function useFeatureFlagsByCategory(category: string) {
  const { flags } = useFeatureFlags();
  return useMemo(
    () => flags.filter((flag) => flag.category === category),
    [flags, category]
  );
}

// 🔄 Batch operations hook
export function useBatchFeatureFlags() {
  const { refreshFlags } = useFeatureFlags();

  const batchUpdateFlags = useCallback(
    async (updates: FeatureFlagBatchUpdate[]) => {
      try {
        const result = await batchUpdateFeatureFlagsAction(updates);
        if (result.success) {
          await refreshFlags();
        }
        return result;
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    },
    [refreshFlags]
  );

  const enableAll = useCallback(
    async (flagKeys: string[]) => {
      const updates = flagKeys.map((key) => ({ key, enabled: true }));
      return batchUpdateFlags(updates);
    },
    [batchUpdateFlags]
  );

  const disableAll = useCallback(
    async (flagKeys: string[]) => {
      const updates = flagKeys.map((key) => ({ key, enabled: false }));
      return batchUpdateFlags(updates);
    },
    [batchUpdateFlags]
  );

  return { batchUpdateFlags, enableAll, disableAll };
}
