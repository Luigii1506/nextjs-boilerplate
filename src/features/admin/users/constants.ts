/**
 * 👥 USERS CORE CONSTANTS
 * =======================
 *
 * Configuración centralizada para el módulo CORE de usuarios
 * Sin feature flags - Funcionalidades siempre activas
 *
 * Updated: 2025-01-17 - Enterprise patterns v2.0
 */

// 🏗️ CORE CONFIGURATION (Sin feature flags - módulo crítico)
export const USERS_CORE_CONFIG = {
  // ⚡ Performance settings (siempre habilitadas)
  debounceMs: 300,
  maxRetries: 3,
  cacheTimeout: 10 * 60 * 1000, // 10 minutes (crítico - cache más largo)

  // 🕐 Timing constants
  refreshDelayMs: 1000,
  retryDelayMs: 2000, // Mayor delay para operaciones críticas

  // 📊 UI Constants
  itemsPerPage: 20,
  maxUsersPerBatch: 50, // Para bulk operations
  updateInterval: 300, // Más lento para usuarios
  searchMinChars: 2,

  // 🔧 Core features (siempre habilitadas)
  advancedLogging: process.env.NODE_ENV === "development",
  performanceTracking: true,
  optimisticUpdates: true, // Crítico para UX
  autoRefresh: true,

  // 🛡️ Security settings
  maxLoginAttempts: 5,
  banDurationHours: 24,
  sessionTimeout: 2 * 60 * 60 * 1000, // 2 hours

  // 📧 Validation rules
  validation: {
    email: {
      minLength: 5,
      maxLength: 100,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    name: {
      minLength: 2,
      maxLength: 50,
    },
    password: {
      minLength: 8,
      maxLength: 100,
    },
  },
} as const;

// 🎯 Action constants - TIPADOS Y CENTRALIZADOS
export const USERS_ACTIONS = {
  // User operations
  CREATE_USER: "CREATE_USER",
  UPDATE_USER: "UPDATE_USER",
  DELETE_USER: "DELETE_USER",
  BAN_USER: "BAN_USER",
  UNBAN_USER: "UNBAN_USER",
  UPDATE_ROLE: "UPDATE_ROLE",

  // Bulk operations
  BULK_UPDATE: "BULK_UPDATE",
  BULK_DELETE: "BULK_DELETE",

  // UI operations
  START_LOADING: "START_LOADING",
  COMPLETE_LOADING: "COMPLETE_LOADING",
  FAIL_LOADING: "FAIL_LOADING",
  CLEAR_ERRORS: "CLEAR_ERRORS",
  REFRESH_DATA: "REFRESH_DATA",
} as const;

// 🎭 Status constants
export const USERS_STATUS = {
  // User states
  ACTIVE: "active",
  BANNED: "banned",
  PENDING: "pending",
  SUSPENDED: "suspended",

  // Operation states
  LOADING: "loading",
  SUCCESS: "success",
  ERROR: "error",
  IDLE: "idle",
} as const;

// 🎪 Role constants with hierarchy
export const USERS_ROLES = {
  USER: "user",
  ADMIN: "admin",
  SUPER_ADMIN: "super_admin",
} as const;

// 🏷️ Role hierarchy for permissions
export const ROLE_HIERARCHY = {
  [USERS_ROLES.USER]: 0,
  [USERS_ROLES.ADMIN]: 1,
  [USERS_ROLES.SUPER_ADMIN]: 2,
} as const;

// 🔄 Cache tags para revalidation
export const USERS_CACHE_TAGS = {
  USERS: "users",
  USER_DETAILS: "user-details",
  USER_STATS: "user-stats",
  USER_ANALYTICS: "user-analytics",
  USER_PERMISSIONS: "user-permissions",
} as const;

// 📝 Logging levels
export const LOG_LEVELS = {
  INFO: "INFO",
  ERROR: "ERROR",
  DEBUG: "DEBUG",
  WARN: "WARN",
  SECURITY: "SECURITY", // Especial para usuarios
} as const;

// 🔍 Search configurations
export const SEARCH_CONFIG = {
  FIELDS: {
    EMAIL: "email",
    NAME: "name",
    ALL: "all",
  } as const,

  OPERATORS: {
    CONTAINS: "contains",
    EQUALS: "equals",
    STARTS_WITH: "startsWith",
    ENDS_WITH: "endsWith",
  } as const,

  SORT_OPTIONS: {
    NAME_ASC: "name_asc",
    NAME_DESC: "name_desc",
    EMAIL_ASC: "email_asc",
    EMAIL_DESC: "email_desc",
    CREATED_ASC: "created_asc",
    CREATED_DESC: "created_desc",
    LAST_LOGIN_ASC: "lastLogin_asc",
    LAST_LOGIN_DESC: "lastLogin_desc",
  } as const,
} as const;

// 📊 UI Filter constants
export const FILTER_OPTIONS = {
  ROLES: [
    { value: "all", label: "Todos los roles" },
    { value: USERS_ROLES.USER, label: "Usuario" },
    { value: USERS_ROLES.ADMIN, label: "Administrador" },
    { value: USERS_ROLES.SUPER_ADMIN, label: "Super Admin" },
  ] as const,

  STATUS: [
    { value: "all", label: "Todos los estados" },
    { value: USERS_STATUS.ACTIVE, label: "Activo" },
    { value: USERS_STATUS.BANNED, label: "Baneado" },
    { value: USERS_STATUS.PENDING, label: "Pendiente" },
  ] as const,
} as const;

// 🎨 UI Theme constants
export const UI_CONFIG = {
  COLORS: {
    USER: {
      bg: "bg-blue-100",
      text: "text-blue-700",
      border: "border-blue-200",
      hover: "hover:bg-blue-200",
    },
    ADMIN: {
      bg: "bg-purple-100",
      text: "text-purple-700",
      border: "border-purple-200",
      hover: "hover:bg-purple-200",
    },
    SUPER_ADMIN: {
      bg: "bg-red-100",
      text: "text-red-700",
      border: "border-red-200",
      hover: "hover:bg-red-200",
    },
    BANNED: {
      bg: "bg-gray-100",
      text: "text-gray-700",
      border: "border-gray-200",
      hover: "hover:bg-gray-200",
    },
  } as const,

  SIZES: {
    AVATAR: {
      SM: "w-8 h-8",
      MD: "w-10 h-10",
      LG: "w-12 h-12",
      XL: "w-16 h-16",
    },
    MODAL: {
      SM: "max-w-md",
      MD: "max-w-lg",
      LG: "max-w-2xl",
      XL: "max-w-4xl",
    },
  } as const,
} as const;

// 🚨 Error codes específicos para usuarios
export const USERS_ERROR_CODES = {
  // Authentication errors
  UNAUTHORIZED: "USERS_UNAUTHORIZED",
  FORBIDDEN: "USERS_FORBIDDEN",
  INVALID_SESSION: "USERS_INVALID_SESSION",

  // User errors
  USER_NOT_FOUND: "USER_NOT_FOUND",
  USER_ALREADY_EXISTS: "USER_ALREADY_EXISTS",
  USER_BANNED: "USER_BANNED",

  // Permission errors
  INSUFFICIENT_PERMISSIONS: "INSUFFICIENT_PERMISSIONS",
  CANNOT_MODIFY_SELF: "CANNOT_MODIFY_SELF",
  CANNOT_MODIFY_HIGHER_ROLE: "CANNOT_MODIFY_HIGHER_ROLE",

  // Validation errors
  INVALID_EMAIL: "INVALID_EMAIL",
  INVALID_PASSWORD: "INVALID_PASSWORD",
  INVALID_ROLE: "INVALID_ROLE",

  // Operation errors
  BULK_OPERATION_FAILED: "BULK_OPERATION_FAILED",
  DELETE_OPERATION_FAILED: "DELETE_OPERATION_FAILED",
} as const;

// 📊 Analytics events
export const ANALYTICS_EVENTS = {
  USER_CREATED: "user_created",
  USER_UPDATED: "user_updated",
  USER_DELETED: "user_deleted",
  USER_BANNED: "user_banned",
  USER_UNBANNED: "user_unbanned",
  ROLE_CHANGED: "role_changed",
  BULK_UPDATE: "bulk_update",
  SEARCH_PERFORMED: "search_performed",
  FILTER_APPLIED: "filter_applied",
} as const;

// 🔐 Permission constants
export const PERMISSIONS = {
  VIEW_USERS: "view_users",
  CREATE_USERS: "create_users",
  UPDATE_USERS: "update_users",
  DELETE_USERS: "delete_users",
  BAN_USERS: "ban_users",
  CHANGE_ROLES: "change_roles",
  VIEW_ANALYTICS: "view_analytics",
  BULK_OPERATIONS: "bulk_operations",
} as const;

// 🎯 Role permissions mapping
export const ROLE_PERMISSIONS = {
  [USERS_ROLES.USER]: [],
  [USERS_ROLES.ADMIN]: [
    PERMISSIONS.VIEW_USERS,
    PERMISSIONS.CREATE_USERS,
    PERMISSIONS.UPDATE_USERS,
    PERMISSIONS.BAN_USERS,
  ],
  [USERS_ROLES.SUPER_ADMIN]: [
    PERMISSIONS.VIEW_USERS,
    PERMISSIONS.CREATE_USERS,
    PERMISSIONS.UPDATE_USERS,
    PERMISSIONS.DELETE_USERS,
    PERMISSIONS.BAN_USERS,
    PERMISSIONS.CHANGE_ROLES,
    PERMISSIONS.VIEW_ANALYTICS,
    PERMISSIONS.BULK_OPERATIONS,
  ],
} as const;

// 📏 Pagination constants
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  MIN_PAGE_SIZE: 5,
  SIZES: [5, 10, 20, 50, 100] as const,
} as const;
