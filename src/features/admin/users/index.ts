/**
 * 👥 USERS CORE MODULE - ENTERPRISE
 * =================================
 *
 * Main barrel export for users core module following Enterprise patterns v2.0
 * Hexagonal Architecture + React 19 + Enterprise patterns
 *
 * Updated: 2025-01-17 - Enterprise patterns v2.0
 */

// 🏗️ Core Hooks (Enterprise Enhanced)
export { useUsers } from "./hooks/useUsers";
export type { UseUsersReturn } from "./hooks/useUsers";

// 📝 Types & Interfaces (Enhanced)
export * from "./types";

// 📋 Validation Schemas
export * from "./schemas";

// 🏗️ Enterprise Configuration System
export {
  type UsersModuleConfig,
  UsersConfigManager,
  usersConfig,
  adaptConfigForHook,
  quickConfig,
  SORT_OPTIONS,
} from "./config";

// 📊 Enterprise Constants
export {
  USERS_ACTIONS,
  USERS_STATUS,
  USERS_ROLES,
  ROLE_HIERARCHY,
  USERS_CACHE_TAGS,
  LOG_LEVELS,
  SEARCH_CONFIG,
  FILTER_OPTIONS,
  UI_CONFIG,
  USERS_ERROR_CODES,
  ANALYTICS_EVENTS,
  PERMISSIONS,
  ROLE_PERMISSIONS,
  PAGINATION,
} from "./constants";

// 📝 Enterprise Logging System
export {
  createUsersLogger,
  usersHookLogger,
  usersServerActionLogger,
  usersOptimisticLogger,
  usersServiceLogger,
  usersUILogger,
  usersSecurityLogger,
  usersAnalyticsLogger,
} from "./utils/logger";

// 🔄 State Management (Optimistic Updates)
export {
  usersOptimisticReducer,
  createInitialUsersOptimisticState,
  usersOptimisticSelectors,
  type UsersOptimisticState,
  type UsersOptimisticAction,
} from "./reducers";

// 🎯 Server Layer (Enhanced with Logging)
export * from "./server";

// 🧩 UI Components (Enterprise Ready)
export * from "./ui";

// 🧩 Shared Components (Reusable)
export {
  UserAvatar,
  UserRoleBadge,
  UserStatusBadge,
  UserInfo,
} from "./ui/components/shared";

// 🔧 Utilities (Enhanced)
export {
  getRoleHierarchy,
  canManageUser,
  getRoleLabel,
  getRoleColor,
  getUserInitials,
  getUserDisplayName,
  formatUserRole,
  formatLastLogin,
  formatUserDate,
  validateEmail,
  validatePassword,
  validateUserName,
  getUserStatusColor,
  getUserStatusLabel,
  normalizeSearchTerm,
  matchesSearchTerm,
  calculateUserStats,
  hasPermission,
  canDeleteUser,
  canChangeBanStatus,
  canChangeRole,
  filterUsersByRole,
  filterUsersByStatus,
  sortUsers,
  sanitizeUserInput,
  generateTempUserId,
} from "./utils";
