/**
 * 🔄 FEATURE FLAGS COMPATIBILITY HOOKS
 * ====================================
 *
 * Hooks de compatibilidad que mantienen la misma API
 * pero usan TanStack Query internamente para máxima performance.
 *
 * Enterprise: 2025-01-17 - Backward compatibility with TanStack Query
 */

"use client";

import { useCallback } from "react";
import { useFeatureFlagsQuery } from "./useFeatureFlagsQuery";
import type { FeatureFlag, FeatureCategory } from "../types";

/**
 * 🎯 USE IS ENABLED - Compatibility Hook
 *
 * Hook de compatibilidad para verificar si un feature flag está habilitado.
 * Usa TanStack Query internamente pero mantiene la API original.
 */
export function useIsEnabled() {
  const { flagsMap } = useFeatureFlagsQuery();

  const isEnabled = useCallback(
    (flagKey: FeatureFlag) => {
      return flagsMap[flagKey] || false;
    },
    [flagsMap]
  );

  return isEnabled;
}

/**
 * 🎛️ USE FEATURE FLAGS - Compatibility Hook
 *
 * Hook de compatibilidad que devuelve el contexto completo.
 * Usa TanStack Query internamente pero mantiene la API original.
 */
export function useFeatureFlags() {
  const { flags, flagsMap, isLoading, error, toggleFlag, refresh } =
    useFeatureFlagsQuery();

  const isEnabled = useCallback(
    (flagKey: FeatureFlag) => {
      return flagsMap[flagKey] || false;
    },
    [flagsMap]
  );

  return {
    flags,
    flagsMap,
    isEnabled,
    toggleFlag,
    refreshFlags: refresh,
    isLoading,
    error,
  };
}

/**
 * 🔍 USE FEATURE FLAG - Compatibility Hook
 *
 * Hook para obtener un feature flag específico.
 */
export function useFeatureFlag(flagKey: FeatureFlag) {
  const { flags, flagsMap, toggleFlag } = useFeatureFlagsQuery();

  const flag = flags.find((f) => f.key === flagKey);
  const isEnabled = flagsMap[flagKey] || false;

  const toggle = useCallback(async () => {
    await toggleFlag(flagKey);
  }, [toggleFlag, flagKey]);

  return {
    flag,
    isEnabled,
    toggle,
  };
}

/**
 * 🔄 USE TOGGLE FLAG - Compatibility Hook
 *
 * Hook para toggle un feature flag específico.
 */
export function useToggleFlag() {
  const { toggleFlag } = useFeatureFlagsQuery();
  return toggleFlag;
}

/**
 * 📊 USE FEATURE FLAGS DATA - Compatibility Hook
 *
 * Hook para obtener todos los datos de feature flags.
 */
export function useFeatureFlagsData() {
  const { flags, isLoading, error } = useFeatureFlagsQuery();

  return {
    flags,
    isLoading,
    error,
  };
}

/**
 * 🏷️ USE FEATURE FLAGS BY CATEGORY - Compatibility Hook
 *
 * Hook para obtener feature flags filtrados por categoría.
 */
export function useFeatureFlagsByCategory(category: string) {
  const { filterByCategory } = useFeatureFlagsQuery();
  return filterByCategory(category as FeatureCategory);
}

/**
 * 📦 USE BATCH FEATURE FLAGS - Compatibility Hook
 *
 * Hook para operaciones en lote (funcionalidad futura).
 */
export function useBatchFeatureFlags() {
  // Para implementar en el futuro si es necesario
  const { flags, toggleFlag } = useFeatureFlagsQuery();

  const batchToggle = useCallback(
    async (flagKeys: FeatureFlag[]) => {
      const promises = flagKeys.map((key) => toggleFlag(key));
      await Promise.all(promises);
    },
    [toggleFlag]
  );

  return {
    flags,
    batchToggle,
  };
}

// 🔄 Context compatibility (deprecated but maintained for backward compatibility)
export function useFeatureFlagsContext() {
  console.warn(
    "[FeatureFlags] useFeatureFlagsContext is deprecated. Use useFeatureFlags instead."
  );
  return useFeatureFlags();
}
