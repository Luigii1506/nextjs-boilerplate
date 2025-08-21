/**
 * 🔐 HOOK DE PERMISOS SIMPLIFICADO
 *
 * Sistema de permisos limpio y directo.
 * Sin cache innecesario, sin complejidad extra.
 *
 * Simple: 2025-01-17 - Versión simplificada
 */

"use client";

import { useCallback, useMemo } from "react";
import { useAuth } from "./useAuth";
import {
  hasPermission,
  canManageRole,
  getRoleLevel,
  getAssignableRoles,
  type AnyPermission,
  type RoleName,
  type Permission,
} from "@/core/auth/permissions";

/**
 * 🔐 usePermissions - Hook principal de permisos
 */
export function usePermissions() {
  const { user, isAuthenticated } = useAuth();

  // 📊 Información básica del usuario
  const currentRole = (user?.role as RoleName) || "user";
  const currentLevel = getRoleLevel(currentRole);

  // 🔍 Verificación de permisos
  const checkPermission = useCallback(
    (permission: AnyPermission): boolean => {
      return hasPermission(user || {}, permission);
    },
    [user]
  );

  // 🎯 Verificación de múltiples permisos
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

  // 👑 Información de rol
  const roleInfo = useMemo(
    () => ({
      currentRole,
      currentLevel,
      isAdmin: currentRole === "admin" || currentRole === "super_admin",
      isSuperAdmin: currentRole === "super_admin",
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

  return {
    // 🔐 Verificaciones principales
    checkPermission,
    canAccess,

    // 👑 Información de rol
    ...roleInfo,

    // 🎯 Gestión de roles
    ...roleManagement,
  };
}

// Export por defecto
export default usePermissions;
