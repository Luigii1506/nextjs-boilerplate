/**
 * ⚡ FEATURE FLAGS MODULE - TANSTACK QUERY OPTIMIZED
 * ==================================================
 *
 * Módulo completamente optimizado con TanStack Query.
 * Performance enterprise, zero legacy code.
 *
 * Enterprise: 2025-01-17 - Zero legacy code, TanStack Query only
 */

// 🏠 Página principal
export { default } from "./screen";

// 🧩 Componentes
export * from "./components";

// 🎯 Configuration
export {
  FEATURE_FLAGS,
  FEATURE_CATEGORIES,
  getFeatureCategory,
  isFeatureEnabled,
  getEnabledFeatures,
  getFeaturesByCategory,
} from "./config";

// 🎯 Types
export type {
  FeatureFlag,
  FeatureCategory,
  FeatureFlagData,
  FeatureFlagCardProps,
  FeatureFlagActionResult,
  FeatureFlagBatchUpdate,
  FeatureFlagBatchResult,
  FeatureFlagFilters,
} from "./types";

// ⚡ Optimized hooks (TanStack Query only)
export {
  useFeatureFlags,
  useIsEnabled,
  useFeatureFlag,
  useToggleFlag,
  useFeatureFlagsData,
  useFeatureFlagsByCategory,
  useBatchFeatureFlags,
  useFeatureFlagsQuery,
  FEATURE_FLAGS_QUERY_KEYS,
} from "./hooks";

// 🏢 Server utilities (still needed for SSR)
export {
  getServerFeatureFlags,
  isServerFeatureEnabled,
  getMultipleServerFeatures,
  getFeatureFlagsWithMetadata,
  invalidateFeatureFlagsCache,
  FeatureFlagsDebug,
} from "./server";

// 🚀 Server actions (used by TanStack Query)
export {
  getFeatureFlagsAction,
  toggleFeatureFlagAction,
  updateFeatureFlagAction,
  batchUpdateFeatureFlagsAction,
  deleteFeatureFlagAction,
  refreshFeatureFlagsCacheAction,
} from "./actions";
