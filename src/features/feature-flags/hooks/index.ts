/**
 * 🎛️ FEATURE FLAGS HOOKS - TANSTACK QUERY OPTIMIZED
 * ==================================================
 *
 * Solo hooks optimizados con TanStack Query.
 * Zero legacy code, máxima performance empresarial.
 *
 * Enterprise: 2025-01-17 - TanStack Query only
 */

// 🎯 Core TanStack Query hook
export {
  useFeatureFlagsQuery,
  FEATURE_FLAGS_QUERY_KEYS,
} from "./useFeatureFlagsQuery";

// 📊 Re-export utility functions from TanStack Query hook for convenience
import { useFeatureFlagsQuery } from "./useFeatureFlagsQuery";
import { useCallback } from "react";
import type { FeatureFlag, FeatureCategory } from "../types";

/**
 * 🎯 USE IS ENABLED - Direct TanStack Query Hook
 *
 * Hook optimizado para verificar si un feature flag está habilitado.
 * Usa TanStack Query directamente sin capa de compatibilidad.
 */
export function useIsEnabled() {
  const { flagsMap } = useFeatureFlagsQuery();

  return useCallback(
    (flagKey: FeatureFlag) => {
      return flagsMap[flagKey] || false;
    },
    [flagsMap]
  );
}

/**
 * 🎛️ USE FEATURE FLAGS - Direct TanStack Query Hook
 *
 * Hook optimizado que devuelve el contexto completo.
 * Usa TanStack Query directamente sin capa de compatibilidad.
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
    isLoading,
    error,
    toggleFlag,
    refresh,
  };
}

/**
 * 🎯 USE FEATURE FLAG - Direct TanStack Query Hook
 *
 * Hook optimizado para un flag específico.
 */
export function useFeatureFlag(flagKey: FeatureFlag) {
  const { flagsMap, toggleFlag } = useFeatureFlagsQuery();

  return {
    isEnabled: flagsMap[flagKey] || false,
    toggle: () => toggleFlag(flagKey),
  };
}

/**
 * 🔄 USE TOGGLE FLAG - Direct TanStack Query Hook
 *
 * Hook optimizado para toggle operations.
 */
export function useToggleFlag() {
  const { toggleFlag } = useFeatureFlagsQuery();
  return toggleFlag;
}

/**
 * 📊 USE FEATURE FLAGS DATA - Direct TanStack Query Hook
 *
 * Hook optimizado para obtener datos completos.
 */
export function useFeatureFlagsData() {
  const { flags, isLoading, error, refresh } = useFeatureFlagsQuery();

  return {
    data: flags,
    isLoading,
    error,
    refresh,
  };
}

/**
 * 🏷️ USE FEATURE FLAGS BY CATEGORY - Direct TanStack Query Hook
 *
 * Hook optimizado para filtrar por categoría.
 */
export function useFeatureFlagsByCategory(category?: FeatureCategory) {
  const { filterFlags } = useFeatureFlagsQuery();

  return useCallback(() => {
    return filterFlags({ category });
  }, [filterFlags, category]);
}

/**
 * 📦 USE BATCH FEATURE FLAGS - Direct TanStack Query Hook
 *
 * Hook optimizado para operaciones batch.
 */
export function useBatchFeatureFlags() {
  const { batchUpdate } = useFeatureFlagsQuery();
  return { batchUpdate };
}
