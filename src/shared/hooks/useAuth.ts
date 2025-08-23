/**
 * 🔐 USE AUTH - TANSTACK QUERY OPTIMIZED
 * =====================================
 *
 * Hook de autenticación completamente migrado a TanStack Query.
 * Performance empresarial, cache inteligente, session management reactivo.
 *
 * Enterprise: 2025-01-17 - Complete TanStack Query migration
 */

"use client";

// Re-export everything from the optimized TanStack Query version
export {
  useAuth,
  useAuthQuery,
  useProtectedPage,
  useAdminPage,
  usePublicPage,
  useRefreshAuth,
  useLogout,
  useAuthRoles,
  AUTH_QUERY_KEYS,
  type AuthState,
  type AuthActions,
  type AuthHookReturn,
} from "./useAuthQuery";

// Auth invalidation utilities
export {
  useAuthInvalidation,
  useAuthInvalidationListener,
  createAuthInvalidationTrigger,
} from "./useAuthInvalidation";

// 🔐 Reactive permissions system
export {
  usePermissions,
  useResourcePermissions,
  usePermissionGuard,
  useUserPermissions,
  useFilePermissions,
  useSessionPermissions,
  useFeatureFlagPermissions,
  usePermissionDebugger,
} from "./usePermissions";

// 🎯 Legacy compatibility - all hooks now use TanStack Query internally

// 🎯 All hooks are now exported from useAuthQuery.ts
// This ensures 100% compatibility while using TanStack Query internally
