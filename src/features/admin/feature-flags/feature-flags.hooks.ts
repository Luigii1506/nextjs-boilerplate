/**
 * 🪝 FEATURE FLAGS HOOKS
 * =====================
 *
 * Todos los hooks de feature flags en un solo archivo.
 * Hooks pequeños y cohesivos relacionados con feature flags.
 *
 * Simple: 2025-01-17 - Hooks consolidados
 */

"use client";

import { useMemo, useCallback } from "react";
import { useFeatureFlagsContext } from "./feature-flags.provider";
import { batchUpdateFeatureFlagsAction } from "./feature-flags.actions";
import type {
  FeatureFlag,
  FeatureFlagBatchUpdate,
} from "./feature-flags.types";

// 🎯 Hook principal - acceso completo al contexto
export function useFeatureFlags() {
  return useFeatureFlagsContext();
}

// 🔍 Hook de verificación - el más común
export function useIsEnabled() {
  const { isEnabled } = useFeatureFlagsContext();
  return isEnabled;
}

// 🎯 Hook para un flag específico - con metadata
export function useFeatureFlag(flagKey: FeatureFlag) {
  const { isEnabled, flags } = useFeatureFlagsContext();

  return useMemo(
    () => ({
      enabled: isEnabled(flagKey),
      data: flags.find((flag) => flag.key === flagKey),
    }),
    [isEnabled, flags, flagKey]
  );
}

// 🔄 Hook de toggle - para operaciones
export function useToggleFlag() {
  const { toggleFlag } = useFeatureFlagsContext();
  return toggleFlag;
}

// 📊 Hook de datos - para listados/admin
export function useFeatureFlagsData() {
  const { flags, isLoading, error, refreshFlags } = useFeatureFlagsContext();
  return { flags, isLoading, error, refreshFlags };
}

// 📂 Hook por categoría - para filtros
export function useFeatureFlagsByCategory(category: string) {
  const { flags } = useFeatureFlagsContext();

  return useMemo(
    () => flags.filter((flag) => flag.category === category),
    [flags, category]
  );
}

// 🔄 Hook de operaciones en lote - para admin
export function useBatchFeatureFlags() {
  const { refreshFlags } = useFeatureFlagsContext();

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
