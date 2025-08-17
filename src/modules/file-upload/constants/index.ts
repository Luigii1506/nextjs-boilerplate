// 🏆 ENTERPRISE CONSTANTS - Configuración centralizada
// ====================================================

export const ENTERPRISE_CONFIG = {
  // 🔧 Feature flags
  enableOptimisticUI: true,
  enableAdvancedLogging: process.env.NODE_ENV === "development",
  enableProgressTracking: true,
  enableAutoRefresh: true,
  enableRetryOnFailure: false,

  // ⚡ Performance settings
  debounceMs: 300,
  maxRetries: 3,
  cacheTimeout: 5 * 60 * 1000, // 5 minutes

  // 🕐 Timing constants
  uploadProgressDelay: 50,
  clearCompletedDelay: 2000,
  retryDelayMs: 1000,

  // 📊 UI Constants
  maxFilesPerBatch: 10,
  maxFileSize: 50 * 1024 * 1024, // 50MB
  progressUpdateInterval: 100,

  // 🗂️ File handling
  allowedMimeTypes: [
    "image/*",
    "application/pdf",
    "text/*",
    "video/*",
    "audio/*",
  ],

  // 🔄 Auto-refresh settings
  refreshAfterUpload: true,
  refreshAfterDelete: true,
  backgroundRefreshInterval: 30000, // 30 seconds
} as const;

export const FILE_UPLOAD_ACTIONS = {
  START_UPLOAD: "START_UPLOAD",
  UPDATE_PROGRESS: "UPDATE_PROGRESS",
  COMPLETE_UPLOAD: "COMPLETE_UPLOAD",
  FAIL_UPLOAD: "FAIL_UPLOAD",
  CLEAR_COMPLETED: "CLEAR_COMPLETED",
} as const;

export const FILE_UPLOAD_STATUS = {
  PENDING: "pending",
  UPLOADING: "uploading",
  COMPLETED: "completed",
  ERROR: "error",
} as const;

export const DEFAULT_PROVIDERS = {
  LOCAL: "local",
  S3: "s3",
  CLOUDINARY: "cloudinary",
} as const;

// 🏷️ Cache tags for revalidation
export const CACHE_TAGS = {
  FILES: "user-files",
  STATS: "file-stats",
  CATEGORIES: "file-categories",
} as const;

// 📝 Logging levels and prefixes
export const LOG_LEVELS = {
  INFO: "info",
  ERROR: "error",
  DEBUG: "debug",
  WARN: "warn",
} as const;

export const LOG_PREFIXES = {
  FILE_UPLOAD: "[FileUpload]",
  SERVER_ACTION: "[ServerAction]",
  OPTIMISTIC: "[Optimistic]",
  CACHE: "[Cache]",
} as const;
