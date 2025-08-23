/**
 * 👥 USERS CONSTANTS - CLEAN & ESSENTIAL
 * ====================================
 *
 * Solo constantes esenciales para TanStack Query optimizado.
 * Zero over-engineering, máxima simplicidad.
 *
 * Enterprise: 2025-01-17 - Clean architecture
 */

// 🎭 User roles (esencial para permisos)
export const USER_ROLES = {
  USER: "user",
  ADMIN: "admin",
  SUPER_ADMIN: "super_admin",
} as const;

// 📊 User status (básico para UI)
export const USER_STATUS = {
  ACTIVE: "active",
  BANNED: "banned",
} as const;

// 🏷️ TanStack Query cache tags (crítico para invalidación)
export const USERS_CACHE_TAGS = {
  USERS: "users",
  USER_DETAILS: "user-details",
  USER_STATS: "user-stats",
} as const;

// ⚙️ Basic config for TanStack Query
export const USERS_CONFIG = {
  // React Query defaults
  STALE_TIME: 30 * 1000, // 30s
  CACHE_TIME: 5 * 60 * 1000, // 5min

  // UI defaults
  DEFAULT_PAGE_SIZE: 20,
  SEARCH_DEBOUNCE_MS: 300,

  // Validation
  MIN_PASSWORD_LENGTH: 8,
  MIN_NAME_LENGTH: 2,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
} as const;

// 🎨 Role colors para UI (solo lo necesario)
export const ROLE_COLORS = {
  [USER_ROLES.USER]: "text-blue-600 bg-blue-50",
  [USER_ROLES.ADMIN]: "text-purple-600 bg-purple-50",
  [USER_ROLES.SUPER_ADMIN]: "text-red-600 bg-red-50",
} as const;

// 📋 Filter options para UI
export const FILTER_OPTIONS = {
  ROLES: [
    { value: "all", label: "Todos los roles" },
    { value: USER_ROLES.USER, label: "Usuario" },
    { value: USER_ROLES.ADMIN, label: "Admin" },
    { value: USER_ROLES.SUPER_ADMIN, label: "Super Admin" },
  ],

  STATUS: [
    { value: "all", label: "Todos" },
    { value: USER_STATUS.ACTIVE, label: "Activos" },
    { value: USER_STATUS.BANNED, label: "Baneados" },
  ],
} as const;

// Type exports
export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];
export type UserStatus = (typeof USER_STATUS)[keyof typeof USER_STATUS];
