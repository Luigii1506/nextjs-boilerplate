/**
 * 🪝 FEATURE FLAGS CLIENT HOOKS - TANSTACK OPTIMIZED
 * ==================================================
 *
 * Hooks optimizados que usan TanStack Query internamente
 * pero mantienen la API original para compatibilidad.
 *
 * Enterprise: 2025-01-17 - TanStack Query compatibility layer
 */

"use client";

// ⚡ Export optimized compatibility hooks
export {
  useIsEnabled,
  useFeatureFlags,
  useFeatureFlag,
  useToggleFlag,
  useFeatureFlagsData,
  useFeatureFlagsByCategory,
  useBatchFeatureFlags,
  useFeatureFlagsContext,
} from "./hooks/useFeatureFlagsCompatibility";
