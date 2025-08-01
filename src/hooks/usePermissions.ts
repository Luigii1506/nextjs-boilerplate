/**
 * 🎯 PERMISSION HOOKS
 *
 * These hooks integrate with Better Auth's permission system
 * to provide easy-to-use permission checking in React components
 */

import { useCallback } from "react";
import { authClient } from "@/lib/auth-client";
import { useAuth } from "@/hooks/useAuth";
import {
  accessControl,
  PREDEFINED_ROLES,
  ROLE_HIERARCHY,
  canManageRole,
  getRoleLevel,
  getAssignableRoles,
} from "@/lib/auth/permissions";

export type Permission = Record<string, string[]>;
export type RoleName = keyof typeof PREDEFINED_ROLES;

/**
 * 🔐 usePermissions - Main permission hook
 *
 * Provides methods to check permissions for the current user
 */
export function usePermissions() {
  const { user } = useAuth();

  /**
   * Check if current user has specific permissions
   */
  const hasPermission = useCallback(
    async (permissions: Permission): Promise<boolean> => {
      if (!user) return false;

      try {
        const result = await authClient.admin.hasPermission({
          permissions,
        });

        return result.data?.success || false;
      } catch (error) {
        console.error("Error checking permissions:", error);
        return false;
      }
    },
    [user]
  );

  /**
   * Check if current user has specific permissions (synchronous, role-based)
   * This uses local role checking without server round-trip
   */
  const canAccess = useCallback(
    (permissions: Permission): boolean => {
      if (!user?.role) return false;

      try {
        const result = authClient.admin.checkRolePermission({
          permissions,
          role: user.role as RoleName,
        });

        return result;
      } catch (error) {
        console.error("Error checking role permissions:", error);
        return false;
      }
    },
    [user?.role]
  );

  /**
   * Check if user can manage another role
   */
  const canManageUserRole = useCallback(
    (targetRole: RoleName): boolean => {
      if (!user?.role) return false;

      return canManageRole(user.role as RoleName, targetRole);
    },
    [user?.role]
  );

  /**
   * Get roles that current user can assign
   */
  const getManageableRoles = useCallback((): RoleName[] => {
    if (!user?.role) return [];

    return getAssignableRoles(user.role as RoleName);
  }, [user?.role]);

  /**
   * Check if user is admin or higher
   */
  const isAdmin = useCallback((): boolean => {
    if (!user?.role) return false;

    return getRoleLevel(user.role as RoleName) >= getRoleLevel("admin");
  }, [user?.role]);

  /**
   * Check if user is super admin
   */
  const isSuperAdmin = useCallback((): boolean => {
    if (!user?.role) return false;

    return user.role === "super_admin";
  }, [user?.role]);

  /**
   * Get current user's role level
   */
  const getUserLevel = useCallback((): number => {
    if (!user?.role) return 0;

    return getRoleLevel(user.role as RoleName);
  }, [user?.role]);

  return {
    // Async permission checking (server-side)
    hasPermission,

    // Sync permission checking (client-side)
    canAccess,

    // Role management
    canManageUserRole,
    getManageableRoles,

    // Convenience methods
    isAdmin,
    isSuperAdmin,
    getUserLevel,

    // Current user info
    currentRole: user?.role as RoleName,
    currentLevel: getUserLevel(),
  };
}

/**
 * 👥 useUserManagement - Hook for user management operations
 */
export function useUserManagement() {
  const { hasPermission, canAccess } = usePermissions();

  return {
    // Check specific user management permissions
    canCreateUsers: () => canAccess({ user: ["create"] }),
    canEditUsers: () => canAccess({ user: ["update"] }),
    canDeleteUsers: () => canAccess({ user: ["delete"] }),
    canBanUsers: () => canAccess({ user: ["ban"] }),
    canImpersonateUsers: () => canAccess({ user: ["impersonate"] }),
    canSetUserRoles: () => canAccess({ user: ["set-role"] }),
    canSetUserPasswords: () => canAccess({ user: ["set-password"] }),

    // Session management
    canViewSessions: () => canAccess({ session: ["list"] }),
    canRevokeSessions: () => canAccess({ session: ["revoke"] }),
    canDeleteSessions: () => canAccess({ session: ["delete"] }),

    // Async checks (for server validation)
    hasUserCreatePermission: () => hasPermission({ user: ["create"] }),
    hasUserUpdatePermission: () => hasPermission({ user: ["update"] }),
    hasUserDeletePermission: () => hasPermission({ user: ["delete"] }),
  };
}

/**
 * 🗂️ useContentManagement - Hook for content management operations
 */
export function useContentManagement() {
  const { canAccess, hasPermission } = usePermissions();

  return {
    // Content permissions
    canCreateContent: () => canAccess({ content: ["create"] }),
    canEditContent: () => canAccess({ content: ["update"] }),
    canDeleteContent: () => canAccess({ content: ["delete"] }),
    canPublishContent: () => canAccess({ content: ["publish"] }),
    canModerateContent: () => canAccess({ content: ["moderate"] }),
    canViewContent: () => canAccess({ content: ["read"] }),

    // Async checks
    hasContentCreatePermission: () => hasPermission({ content: ["create"] }),
    hasContentUpdatePermission: () => hasPermission({ content: ["update"] }),
    hasContentDeletePermission: () => hasPermission({ content: ["delete"] }),
  };
}

/**
 * 📊 useAnalytics - Hook for analytics permissions
 */
export function useAnalytics() {
  const { canAccess, hasPermission } = usePermissions();

  return {
    // Analytics permissions
    canViewAnalytics: () => canAccess({ analytics: ["read"] }),
    canExportReports: () => canAccess({ analytics: ["export"] }),
    canCreateReports: () => canAccess({ analytics: ["create"] }),
    canDeleteReports: () => canAccess({ analytics: ["delete"] }),

    // Async checks
    hasAnalyticsReadPermission: () => hasPermission({ analytics: ["read"] }),
    hasAnalyticsExportPermission: () =>
      hasPermission({ analytics: ["export"] }),
  };
}

/**
 * ⚙️ useSystemManagement - Hook for system management permissions
 */
export function useSystemManagement() {
  const { canAccess, hasPermission } = usePermissions();

  return {
    // Settings permissions
    canViewSettings: () => canAccess({ settings: ["read"] }),
    canUpdateSettings: () => canAccess({ settings: ["update"] }),
    canBackupSystem: () => canAccess({ settings: ["backup"] }),
    canRestoreSystem: () => canAccess({ settings: ["restore"] }),

    // Security permissions
    canViewSecurityLogs: () => canAccess({ security: ["read"] }),
    canAuditSystem: () => canAccess({ security: ["audit"] }),
    canConfigureSecurity: () => canAccess({ security: ["configure"] }),

    // API permissions
    canCreateApiKeys: () => canAccess({ api: ["create"] }),
    canViewApiUsage: () => canAccess({ api: ["read"] }),
    canUpdateApiSettings: () => canAccess({ api: ["update"] }),
    canDeleteApiKeys: () => canAccess({ api: ["delete"] }),

    // Async checks
    hasSettingsUpdatePermission: () => hasPermission({ settings: ["update"] }),
    hasSecurityConfigurePermission: () =>
      hasPermission({ security: ["configure"] }),
  };
}

/**
 * 🎛️ useFeatureFlags - Hook for feature-based access control
 *
 * This provides high-level feature access based on multiple permissions
 */
export function useFeatureFlags() {
  const { canAccess, isAdmin, isSuperAdmin } = usePermissions();

  return {
    // High-level feature access
    showAdminPanel: isAdmin(),
    showUserManagement: isAdmin(),
    showSystemSettings: isSuperAdmin(),
    showAdvancedAnalytics: () => canAccess({ analytics: ["create", "export"] }),
    showContentModeration: () => canAccess({ content: ["moderate"] }),
    showApiManagement: () => canAccess({ api: ["create", "read"] }),

    // Dashboard sections
    showDashboardUsers: () =>
      canAccess({ user: ["create", "update"] }) ||
      canAccess({ session: ["list"] }),
    showDashboardContent: () =>
      canAccess({ content: ["create", "update", "moderate"] }),
    showDashboardAnalytics: () => canAccess({ analytics: ["read"] }),
    showDashboardSettings: () =>
      canAccess({ settings: ["read"] }) || canAccess({ security: ["read"] }),
  };
}

/**
 * 🔄 usePermissionState - Hook for reactive permission state
 *
 * Provides loading states and error handling for permission checks
 */
export function usePermissionState() {
  const { user } = useAuth();

  return {
    isLoading: !user, // Simple loading state based on user
    hasUser: !!user,
    userRole: (user?.role as RoleName) || "guest",
    isAuthenticated: !!user,
  };
}
