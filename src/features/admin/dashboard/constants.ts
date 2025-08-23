/**
 * 📊 DASHBOARD CONSTANTS - CLEAN & ESSENTIAL
 * ============================================
 *
 * Solo constantes esenciales para TanStack Query optimizado.
 * Módulo pequeño, configuración simple y efectiva.
 *
 * Enterprise: 2025-01-17 - Clean architecture
 */

// 🏷️ TanStack Query keys (crítico para cache inteligente)
export const DASHBOARD_QUERY_KEYS = {
  all: ["dashboard"] as const,
  stats: () => ["dashboard", "stats"] as const,
  recentUsers: (limit: number = 5) =>
    ["dashboard", "recent-users", limit] as const,
  activity: () => ["dashboard", "activity"] as const,
  // Combined data key for parallel fetching
  overview: () => ["dashboard", "overview"] as const,
} as const;

// 🏷️ Cache tags para Next.js revalidation
export const DASHBOARD_CACHE_TAGS = {
  DASHBOARD: "dashboard",
  STATS: "dashboard-stats",
  RECENT_USERS: "dashboard-recent-users",
  ACTIVITY: "dashboard-activity",
} as const;

// ⚙️ TanStack Query config optimizado para Dashboard
export const DASHBOARD_CONFIG = {
  // 📊 Stats cache (datos que cambian frecuentemente)
  STATS_STALE_TIME: 30 * 1000, // 30s - Stats need to be fresh
  STATS_CACHE_TIME: 5 * 60 * 1000, // 5min

  // 👥 Recent users cache (datos más estables)
  RECENT_USERS_STALE_TIME: 60 * 1000, // 1min
  RECENT_USERS_CACHE_TIME: 10 * 60 * 1000, // 10min

  // 📈 Activity cache (datos históricos más estables)
  ACTIVITY_STALE_TIME: 2 * 60 * 1000, // 2min
  ACTIVITY_CACHE_TIME: 15 * 60 * 1000, // 15min

  // 🔄 Overview combined cache
  OVERVIEW_STALE_TIME: 45 * 1000, // 45s
  OVERVIEW_CACHE_TIME: 5 * 60 * 1000, // 5min

  // 🎛️ UI Configuration
  DEFAULT_RECENT_USERS_LIMIT: 5,
  MAX_RECENT_USERS_LIMIT: 10,
  REFRESH_DEBOUNCE_MS: 1000,

  // 🔄 Retry configuration
  RETRY_COUNT: 2,
  RETRY_DELAY: (attemptIndex: number) =>
    Math.min(1000 * 2 ** attemptIndex, 5000),
} as const;

// 🎨 Dashboard UI constants
export const DASHBOARD_UI = {
  STATS_CARD_COLORS: {
    TOTAL: "blue",
    ACTIVE: "green",
    BANNED: "red",
    ADMINS: "amber",
  },
  TREND_COLORS: {
    UP: "text-green-600",
    DOWN: "text-red-600",
    STABLE: "text-gray-600",
  },
} as const;

// 📊 Activity trend thresholds
export const ACTIVITY_THRESHOLDS = {
  HIGH_ACTIVITY: 100,
  MEDIUM_ACTIVITY: 50,
  LOW_ACTIVITY: 10,
} as const;

// 🔗 Export types for better TypeScript support
export type DashboardQueryKey =
  (typeof DASHBOARD_QUERY_KEYS)[keyof typeof DASHBOARD_QUERY_KEYS];
export type DashboardCacheTag =
  (typeof DASHBOARD_CACHE_TAGS)[keyof typeof DASHBOARD_CACHE_TAGS];
export type StatsCardColor =
  (typeof DASHBOARD_UI.STATS_CARD_COLORS)[keyof typeof DASHBOARD_UI.STATS_CARD_COLORS];
