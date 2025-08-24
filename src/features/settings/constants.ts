/**
 * ⚙️ SETTINGS CONSTANTS
 * ====================
 *
 * Constantes y configuraciones del módulo de settings
 */

import type { SettingCategory } from "./types";

// 🎯 Cache tags para settings
export const SETTINGS_CACHE_TAGS = {
  SETTINGS: "settings",
  CATEGORY: (category: SettingCategory) => `settings-${category}`,
  STATS: "settings-stats",
} as const;

// 🎯 Settings defaults
export const SETTINGS_DEFAULTS = {
  QUERY_STALE_TIME: 30 * 1000, // 30 seconds
  QUERY_GC_TIME: 5 * 60 * 1000, // 5 minutes
  STATS_STALE_TIME: 2 * 60 * 1000, // 2 minutes
} as const;
