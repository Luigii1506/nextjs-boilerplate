/**
 * 🔐 HOOK DE PERMISOS SIMPLIFICADO
 *
 * Sistema de permisos limpio y directo al grano
 */

import { useCallback, useMemo, useEffect } from "react";
import { authClient } from "@/core/auth/auth-client";
import { useAuth } from "@/shared/hooks/useAuth";
import {
  canManageRole,
  getRoleLevel,
  getAssignableRoles,
  hasPermission,
  type AnyPermission,
  type RoleName,
  type Permission,
} from "@/core/auth/config/permissions";

// 🎯 Configuración del hook
interface PermissionHookOptions {
  cacheTimeout?: number;
  logPermissions?: boolean;
}

const DEFAULT_OPTIONS: PermissionHookOptions = {
  cacheTimeout: 5 * 60 * 1000, // 5 minutos
  logPermissions: process.env.NODE_ENV === "development",
};

// 📊 Cache simple de permisos
const permissionCache = new Map<
  string,
  { result: boolean; timestamp: number }
>();

/**
 * 🔐 usePermissions - Hook principal de permisos
 */
export function usePermissions(options: PermissionHookOptions = {}) {
  const { user } = useAuth();
  const config = useMemo(() => ({ ...DEFAULT_OPTIONS, ...options }), [options]);

  // 📊 Información básica del usuario
  const currentRole = (user?.role as RoleName) || "user";
  const currentLevel = getRoleLevel(currentRole);
  const isAuthenticated = Boolean(user);

  // 🔍 Verificación con cache optimizada
  const checkPermission = useCallback(
    (permission: AnyPermission): boolean => {
      const cacheKey = `${user?.id}-${permission}`;

      // Verificar cache
      const cached = permissionCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < config.cacheTimeout!) {
        return cached.result;
      }

      // Verificar permiso
      const result = hasPermission(user || {}, permission);

      // Guardar en cache
      permissionCache.set(cacheKey, { result, timestamp: Date.now() });

      // Log en desarrollo
      if (config.logPermissions) {
        console.log(`🔐 ${permission}: ${result ? "✅" : "❌"}`);
      }

      return result;
    },
    [user, config]
  );

  // 🎯 Verificación rápida de múltiples permisos
  const canAccess = useCallback(
    (permissions: Permission): boolean => {
      if (!user?.role) return false;
      if (user.role === "super_admin") return true;

      return Object.entries(permissions).every(([resource, actions]) =>
        actions.every((action) =>
          checkPermission(`${resource}:${action}` as AnyPermission)
        )
      );
    },
    [user, checkPermission]
  );

  // 🔐 Verificación asíncrona (solo para casos críticos)
  const hasPermissionAsync = useCallback(
    async (permissions: Permission): Promise<boolean> => {
      if (!user) return false;

      try {
        const result = await authClient.admin.hasPermission({ permissions });
        return result.data?.success || false;
      } catch (error) {
        console.error("Error checking permissions:", error);
        return false;
      }
    },
    [user]
  );

  // 👑 Información de rol
  const roleInfo = useMemo(
    () => ({
      currentRole,
      currentLevel,
      isAdmin: () => currentRole === "admin" || currentRole === "super_admin",
      isSuperAdmin: () => currentRole === "super_admin",
      isAuthenticated,
    }),
    [currentRole, currentLevel, isAuthenticated]
  );

  // 🎯 Gestión de roles
  const roleManagement = useMemo(
    () => ({
      canManageRole: (targetRole: RoleName) =>
        user?.role ? canManageRole(user.role as RoleName, targetRole) : false,
      getManageableRoles: () => getAssignableRoles(currentRole),
    }),
    [user?.role, currentRole]
  );

  // 🧹 Utilidades de cache
  const cacheUtils = useCallback(() => {
    const clearCache = () => {
      permissionCache.clear();
      if (config.logPermissions) console.log("🧹 Permission cache cleared");
    };

    const getCacheStats = () => ({
      size: permissionCache.size,
      keys: Array.from(permissionCache.keys()),
    });

    return { clearCache, getCacheStats };
  }, [config.logPermissions]);

  // 🧹 Limpiar cache cuando cambie el usuario
  useEffect(() => {
    if (user?.id) {
      for (const [key] of permissionCache) {
        if (!key.startsWith(`${user.id}-`)) {
          permissionCache.delete(key);
        }
      }
    }
  }, [user?.id]);

  return {
    // 🔐 Verificaciones principales
    checkPermission,
    canAccess,
    hasPermissionAsync,

    // 👑 Información de rol
    ...roleInfo,

    // 🎯 Gestión de roles
    ...roleManagement,

    // 🧹 Utilidades
    ...cacheUtils(),
  };
}

// Export por defecto
export default usePermissions;
