/**
 * 🔐 ADVANCED PERMISSION HOOKS
 *
 * Sistema completo de permisos con cache, analytics y funcionalidades avanzadas
 */

import { useCallback, useMemo, useState, useEffect } from "react";
import { authClient } from "@/core/auth/auth-client";
import { useAuth } from "@/shared/hooks/useAuth";
import {
  PREDEFINED_ROLES,
  canManageRole,
  getRoleLevel,
  getAssignableRoles,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  type AnyPermission,
  type RoleName,
} from "@/core/auth/config/permissions";

export type Permission = Record<string, string[]>;

// 🎯 Contexto de permisos para optimizaciones
interface PermissionContext {
  cacheEnabled: boolean;
  cacheTimeout: number;
  logPermissions: boolean;
}

const DEFAULT_CONTEXT: PermissionContext = {
  cacheEnabled: true,
  cacheTimeout: 5 * 60 * 1000, // 5 minutos
  logPermissions: process.env.NODE_ENV === "development",
};

// 📊 Cache de permisos
const permissionCache = new Map<
  string,
  { result: boolean; timestamp: number }
>();

/**
 * 🔐 usePermissions - Hook principal de permisos
 */
export function usePermissions(context: Partial<PermissionContext> = {}) {
  const { user } = useAuth();
  const config = { ...DEFAULT_CONTEXT, ...context };

  // 🎯 Estados internos
  const [permissionChecks, setPermissionChecks] = useState<string[]>([]);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  // 📊 Información básica del usuario
  const currentRole = (user?.role as RoleName) || "user";
  const currentLevel = getRoleLevel(currentRole);
  const isAuthenticated = Boolean(user);

  // 🔍 Función de verificación con cache
  const checkPermissionWithCache = useCallback(
    (permission: AnyPermission): boolean => {
      const cacheKey = `${user?.id}-${permission}`;

      // 📊 Verificar cache si está habilitado
      if (config.cacheEnabled) {
        const cached = permissionCache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < config.cacheTimeout) {
          return cached.result;
        }
      }

      // 🔍 Verificar permiso
      const result = hasPermission(user || {}, permission);

      // 💾 Guardar en cache
      if (config.cacheEnabled) {
        permissionCache.set(cacheKey, {
          result,
          timestamp: Date.now(),
        });
      }

      // 📝 Log en desarrollo
      if (config.logPermissions) {
        console.log(
          `🔐 Permission check: ${permission} = ${result ? "✅" : "❌"}`
        );
      }

      return result;
    },
    [user, config]
  );

  // 🔐 Verificación de permisos async
  const hasPermissionAsync = useCallback(
    async (permissions: Permission): Promise<boolean> => {
      if (!user) return false;

      // 📝 Trackear verificación
      const permissionString = JSON.stringify(permissions);
      setPermissionChecks((prev) => [...prev, permissionString]);
      setLastCheck(new Date());

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

  // 🎯 Verificación rápida client-side
  const canAccess = useCallback(
    (permissions: Permission): boolean => {
      if (!user?.role) return false;

      // Super admin siempre tiene acceso
      if (user.role === "super_admin") return true;

      try {
        // 🔍 Verificar cada recurso y acción
        for (const [resource, actions] of Object.entries(permissions)) {
          for (const action of actions) {
            const permission = `${resource}:${action}` as AnyPermission;
            if (!checkPermissionWithCache(permission)) {
              return false;
            }
          }
        }
        return true;
      } catch (error) {
        console.error("Error checking role permissions:", error);
        return false;
      }
    },
    [user, checkPermissionWithCache]
  );

  // 👑 Funciones de rol
  const isAdmin = useCallback(
    () => currentRole === "admin" || currentRole === "super_admin",
    [currentRole]
  );

  const isSuperAdmin = useCallback(
    () => currentRole === "super_admin",
    [currentRole]
  );

  const canManageUserRole = useCallback(
    (targetRole: RoleName): boolean => {
      if (!user?.role) return false;
      return canManageRole(user.role as RoleName, targetRole);
    },
    [user?.role]
  );

  // 📋 Roles manejables
  const getManageableRoles = useCallback(
    () => getAssignableRoles(currentRole),
    [currentRole]
  );

  // 🎯 Verificaciones específicas comunes
  const commonPermissions = useMemo(
    () => ({
      // 👥 Usuarios
      canCreateUsers: () => canAccess({ user: ["create"] }),
      canEditUsers: () => canAccess({ user: ["update"] }),
      canDeleteUsers: () => canAccess({ user: ["delete"] }),
      canBanUsers: () => canAccess({ user: ["ban"] }),
      canSetUserRoles: () => canAccess({ user: ["set-role"] }),
      canImpersonateUsers: () => canAccess({ user: ["impersonate"] }),

      // 🔐 Sesiones
      canViewSessions: () => canAccess({ session: ["list"] }),
      canRevokeSessions: () => canAccess({ session: ["revoke"] }),
      canDeleteSessions: () => canAccess({ session: ["delete"] }),

      // 📁 Archivos
      canViewFiles: () => canAccess({ files: ["read"] }),
      canUploadFiles: () => canAccess({ files: ["upload"] }),
      canDeleteFiles: () => canAccess({ files: ["delete"] }),

      // 🚩 Feature Flags
      canViewFeatureFlags: () => canAccess({ feature_flags: ["read"] }),
      canManageFeatureFlags: () => canAccess({ feature_flags: ["write"] }),
    }),
    [canAccess]
  );

  // 🧹 Limpiar cache cuando cambie el usuario
  useEffect(() => {
    if (user?.id) {
      // Limpiar entradas de cache de otros usuarios
      for (const [key] of permissionCache) {
        if (!key.startsWith(`${user.id}-`)) {
          permissionCache.delete(key);
        }
      }
    }
  }, [user?.id]);

  // 📊 Estadísticas de uso
  const getPermissionStats = useCallback(
    () => ({
      totalChecks: permissionChecks.length,
      lastCheck,
      cacheSize: permissionCache.size,
      currentRole,
      currentLevel,
      isAuthenticated,
    }),
    [
      permissionChecks.length,
      lastCheck,
      currentRole,
      currentLevel,
      isAuthenticated,
    ]
  );

  // 🧹 Utilidades
  const clearPermissionCache = useCallback(() => {
    permissionCache.clear();
    console.log("🧹 Permission cache cleared");
  }, []);

  const refreshPermissions = useCallback(() => {
    clearPermissionCache();
    setLastCheck(new Date());
    console.log("🔄 Permissions refreshed");
  }, [clearPermissionCache]);

  return {
    // 🔐 Verificaciones básicas
    hasPermissionAsync,
    canAccess,

    // 👑 Información de rol
    currentRole,
    currentLevel,
    isAdmin,
    isSuperAdmin,
    isAuthenticated,

    // 🎯 Gestión de roles
    canManageUserRole,
    getManageableRoles,

    // 🚀 Verificaciones comunes
    ...commonPermissions,

    // 📊 Utilidades y debug
    getPermissionStats,
    clearPermissionCache,
    refreshPermissions,

    // 📝 Información de debug (solo desarrollo)
    ...(process.env.NODE_ENV === "development" && {
      debugInfo: {
        permissionChecks,
        lastCheck,
        cacheSize: permissionCache.size,
      },
    }),
  };
}

/**
 * 🎯 usePermissionValidator - Hook para validar múltiples permisos
 */
export function usePermissionValidator() {
  const { canAccess } = usePermissions();

  return useCallback(
    (
      validations: Array<{
        name: string;
        permissions: Permission;
        required?: boolean;
      }>
    ) => {
      const results = validations.map((validation) => ({
        name: validation.name,
        hasAccess: canAccess(validation.permissions),
        required: validation.required || false,
      }));

      const allRequired = results
        .filter((r) => r.required)
        .every((r) => r.hasAccess);

      const someOptional = results
        .filter((r) => !r.required)
        .some((r) => r.hasAccess);

      return {
        results,
        allRequired,
        someOptional,
        canProceed:
          allRequired &&
          (results.some((r) => !r.required) ? someOptional : true),
      };
    },
    [canAccess]
  );
}

/**
 * 👥 useUserManagement - Hook específico para gestión de usuarios
 */
export function useUserManagement() {
  const {
    canCreateUsers,
    canEditUsers,
    canDeleteUsers,
    canBanUsers,
    canSetUserRoles,
    canImpersonateUsers,
    hasPermissionAsync,
  } = usePermissions();

  return {
    // 🔍 Verificaciones síncronas
    canCreateUsers,
    canEditUsers,
    canDeleteUsers,
    canBanUsers,
    canSetUserRoles,
    canImpersonateUsers,

    // 🔍 Verificaciones asíncronas
    hasUserCreatePermission: () => hasPermissionAsync({ user: ["create"] }),
    hasUserUpdatePermission: () => hasPermissionAsync({ user: ["update"] }),
    hasUserDeletePermission: () => hasPermissionAsync({ user: ["delete"] }),
    hasUserBanPermission: () => hasPermissionAsync({ user: ["ban"] }),
    hasUserRolePermission: () => hasPermissionAsync({ user: ["set-role"] }),
    hasUserImpersonatePermission: () =>
      hasPermissionAsync({ user: ["impersonate"] }),
  };
}

/**
 * 📁 useFileManagement - Hook específico para gestión de archivos
 */
export function useFileManagement() {
  const { canViewFiles, canUploadFiles, canDeleteFiles, hasPermissionAsync } =
    usePermissions();

  return {
    // 🔍 Verificaciones síncronas
    canViewFiles,
    canUploadFiles,
    canDeleteFiles,

    // 🔍 Verificaciones asíncronas
    hasFileReadPermission: () => hasPermissionAsync({ files: ["read"] }),
    hasFileUploadPermission: () => hasPermissionAsync({ files: ["upload"] }),
    hasFileDeletePermission: () => hasPermissionAsync({ files: ["delete"] }),
  };
}

/**
 * 🔐 useSessionManagement - Hook específico para gestión de sesiones
 */
export function useSessionManagement() {
  const {
    canViewSessions,
    canRevokeSessions,
    canDeleteSessions,
    hasPermissionAsync,
  } = usePermissions();

  return {
    // 🔍 Verificaciones síncronas
    canViewSessions,
    canRevokeSessions,
    canDeleteSessions,

    // 🔍 Verificaciones asíncronas
    hasSessionListPermission: () => hasPermissionAsync({ session: ["list"] }),
    hasSessionRevokePermission: () =>
      hasPermissionAsync({ session: ["revoke"] }),
    hasSessionDeletePermission: () =>
      hasPermissionAsync({ session: ["delete"] }),
  };
}

// 🎯 Export alias para compatibilidad temporal
export { usePermissions as useEnhancedPermissions };

// 🎯 Export default
export default usePermissions;
