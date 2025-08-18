/**
 * 📊 FEATURE-FLAGS ENTERPRISE CONSTANTS
 * =====================================
 *
 * Constants centralizados siguiendo patrón enterprise V2.0
 * Módulo tipo: Feature Flags (experimental/configurable)
 *
 * Updated: 2025-01-18 - Enterprise patterns V2.0
 */

// 🔧 ENTERPRISE CONFIG - Feature Flags Module
export const FEATURE_FLAGS_CONFIG = {
  // 🔧 Feature flags (para este módulo que maneja feature flags)
  enableOptimisticUI: true,
  enableAdvancedLogging: process.env.NODE_ENV === "development",
  enableBulkOperations: true,
  enableAutoRefresh: true,
  enableSchemaRegeneration: true,

  // ⚡ Performance settings
  debounceMs: 300,
  maxRetries: 3,
  cacheTimeout: 2 * 60 * 1000, // 2 minutes (shorter for feature flags)
  batchSize: 10,

  // 🕐 Timing constants
  toggleDelay: 100,
  refreshDelay: 500,
  retryDelayMs: 1000,
  schemaRegenerationTimeout: 30000, // 30 seconds

  // 📊 UI Constants
  maxFlagsPerPage: 50,
  categoriesPerRow: 3,
  searchMinLength: 2,
} as const;

// 🎯 ACTION CONSTANTS - Centralizados y tipados
export const FEATURE_FLAGS_ACTIONS = {
  // CRUD Operations
  CREATE_FLAG: "CREATE_FLAG",
  UPDATE_FLAG: "UPDATE_FLAG",
  DELETE_FLAG: "DELETE_FLAG",
  TOGGLE_FLAG: "TOGGLE_FLAG",

  // Batch Operations
  BATCH_UPDATE: "BATCH_UPDATE",
  RESET_ALL: "RESET_ALL",

  // System Operations
  INITIALIZE: "INITIALIZE",
  REGENERATE_SCHEMA: "REGENERATE_SCHEMA",
  INVALIDATE_CACHE: "INVALIDATE_CACHE",

  // UI Operations
  FILTER_FLAGS: "FILTER_FLAGS",
  SEARCH_FLAGS: "SEARCH_FLAGS",
} as const;

// 📊 STATUS CONSTANTS
export const FEATURE_FLAGS_STATUS = {
  ENABLED: "enabled",
  DISABLED: "disabled",
  PENDING: "pending",
  ERROR: "error",
  UPDATING: "updating",
} as const;

// 🎨 CATEGORY CONSTANTS
export const FEATURE_FLAGS_CATEGORIES = {
  CORE: "core",
  MODULE: "module",
  UI: "ui",
  EXPERIMENTAL: "experimental",
  ADMIN: "admin",
} as const;

// 🏷️ CACHE TAGS - Enterprise pattern centralized
export const FEATURE_FLAGS_CACHE_TAGS = {
  FLAGS: "feature-flags-data",
  STATS: "feature-flags-stats",
  CATEGORIES: "feature-flags-categories",
  SCHEMA: "feature-flags-schema",
  CONFIG: "feature-flags-config",
} as const;

// 🔄 PATHS for revalidation - Enterprise pattern
export const FEATURE_FLAGS_PATHS = {
  ADMIN: "/feature-flags",
  API: "/api/feature-flags",
  DASHBOARD: "/dashboard",
} as const;

// 📝 LOGGING LEVELS
export const FF_LOG_LEVELS = {
  INFO: "info",
  ERROR: "error",
  DEBUG: "debug",
  WARN: "warn",
  SECURITY: "security",
} as const;

// 🏷️ LOG PREFIXES
export const FF_LOG_PREFIXES = {
  FEATURE_FLAGS: "[FeatureFlags]",
  SERVER_ACTION: "[ServerAction]",
  SECURITY: "[Security]",
  PERFORMANCE: "[Performance]",
} as const;

// 🔐 PERMISSION LEVELS
export const FF_PERMISSIONS = {
  READ: "feature_flags:read",
  WRITE: "feature_flags:write",
  DELETE: "feature_flags:delete",
  ADMIN: "feature_flags:admin",
  SCHEMA: "feature_flags:schema",
} as const;

// ⚡ PERFORMANCE THRESHOLDS
export const FF_PERFORMANCE = {
  MAX_FLAGS_WARNING: 100,
  BULK_OPERATION_THRESHOLD: 10,
  CACHE_WARNING_SIZE: 1024 * 1024, // 1MB
  SCHEMA_TIMEOUT_WARNING: 10000, // 10 seconds
} as const;

// 🎯 VALIDATION RULES
export const FF_VALIDATION = {
  KEY_MIN_LENGTH: 1,
  KEY_MAX_LENGTH: 50,
  NAME_MIN_LENGTH: 1,
  NAME_MAX_LENGTH: 100,
  DESCRIPTION_MAX_LENGTH: 500,
  ROLLOUT_MIN: 0,
  ROLLOUT_MAX: 100,
} as const;

// 📊 ROLLOUT PERCENTAGES (common values)
export const FF_ROLLOUT_PRESETS = {
  DISABLED: 0,
  BETA: 5,
  LIMITED: 25,
  HALF: 50,
  MAJORITY: 75,
  FULL: 100,
} as const;

// 🔄 AUTO-REFRESH INTERVALS
export const FF_REFRESH_INTERVALS = {
  FAST: 5000, // 5 seconds
  NORMAL: 15000, // 15 seconds
  SLOW: 60000, // 1 minute
} as const;
