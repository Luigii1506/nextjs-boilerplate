/**
 * 🎛️ FEATURE FLAGS - BARREL EXPORTS
 * =================================
 *
 * Centralized exports for the simplified feature flags system.
 * Clean API for consuming components.
 *
 * Simple: 2025-01-17 - Barrel exports
 */

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
  FeatureFlagBroadcastData,
  FeatureFlagsContextType,
  FeatureFlagFilters,
} from "./types";

// 🪝 Client hooks
export {
  FeatureFlagsProvider,
  useFeatureFlags,
  useIsEnabled,
  useToggleFlag,
  useFeatureFlagsData,
  useFeatureFlag,
  useFeatureFlagsByCategory,
  useBatchFeatureFlags,
} from "./hooks";

// 🏢 Server utilities
export {
  getServerFeatureFlags,
  isServerFeatureEnabled,
  getMultipleServerFeatures,
  getFeatureFlagsWithMetadata,
  invalidateFeatureFlagsCache,
  FeatureFlagsDebug,
} from "./server";

// 🚀 Server actions
export {
  getFeatureFlagsAction,
  toggleFeatureFlagAction,
  updateFeatureFlagAction,
  batchUpdateFeatureFlagsAction,
  deleteFeatureFlagAction,
  refreshFeatureFlagsCacheAction,
} from "./actions";

