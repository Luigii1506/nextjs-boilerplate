/**
 * 📊 DASHBOARD HOOKS INDEX - TANSTACK ONLY
 * ========================================
 *
 * Solo hooks optimizados con TanStack Query.
 * Zero legacy code, máxima performance empresarial.
 *
 * Enterprise: 2025-01-17 - TanStack Query migration
 */

// 🎯 Core TanStack Query hooks
export {
  useDashboardQuery,
  useDashboardOverview,
  DASHBOARD_QUERY_KEYS,
} from "./useDashboardQuery";

// Import hooks for presets
import { useDashboardQuery, useDashboardOverview } from "./useDashboardQuery";

// 🎛️ Hook presets for different scenarios
export const DashboardHookPresets = {
  // 💻 Standard dashboard view
  STANDARD: {
    hook: useDashboardQuery,
    description: "Hook estándar para vista de dashboard con cache inteligente",
  },

  // ⚡ High performance overview
  HIGH_PERFORMANCE: {
    hook: useDashboardOverview,
    description:
      "Hook optimizado con parallel fetching para máximo rendimiento",
  },
} as const;

// 📊 Re-export constants for convenience
export { DASHBOARD_CONFIG, DASHBOARD_CACHE_TAGS } from "../constants";
