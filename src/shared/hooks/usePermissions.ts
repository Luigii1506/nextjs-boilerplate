/**
 * 🔐 USE PERMISSIONS - TANSTACK QUERY REACTIVE
 * ============================================
 *
 * Hook de permisos reactivo integrado con TanStack Query.
 * Los permisos se actualizan automáticamente cuando cambian los roles.
 *
 * Enterprise: 2025-01-17 - Reactive permissions system
 */

"use client";

import React, { useMemo, useCallback } from "react";
import { useAuth } from "./useAuth";
import {
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  createPermissionCheckers,
  type AnyPermission,
  type PermissionUser,
  type Resource,
} from "@/core/auth/permissions";

/**
 * 🔐 USE PERMISSIONS
 *
 * Hook reactivo para verificación de permisos.
 * Se actualiza automáticamente cuando cambia el rol del usuario.
 */
export function usePermissions() {
  const { user, isLoading } = useAuth();

  // 🎯 Memoized user object para optimizar re-renders
  const permissionUser = useMemo(
    (): PermissionUser => ({
      id: user?.id,
      role: user?.role,
      permissions: user?.permissions || [], // Si el usuario tiene permisos directos
    }),
    [user?.id, user?.role, user?.permissions]
  );

  // 🔍 Verificaciones de permisos reactivas
  const can = useCallback(
    (permission: AnyPermission) => {
      if (isLoading) return false;
      return hasPermission(permissionUser, permission);
    },
    [permissionUser, isLoading]
  );

  const canAny = useCallback(
    (permissions: AnyPermission[]) => {
      if (isLoading) return false;
      return hasAnyPermission(permissionUser, permissions);
    },
    [permissionUser, isLoading]
  );

  const canAll = useCallback(
    (permissions: AnyPermission[]) => {
      if (isLoading) return false;
      return hasAllPermissions(permissionUser, permissions);
    },
    [permissionUser, isLoading]
  );

  // 🎯 Shortcuts para operaciones comunes
  const canCreate = useCallback(
    (resource: Resource) => {
      return can(`${resource}:create` as AnyPermission);
    },
    [can]
  );

  const canRead = useCallback(
    (resource: Resource) => {
      return can(`${resource}:read` as AnyPermission);
    },
    [can]
  );

  const canUpdate = useCallback(
    (resource: Resource) => {
      return can(`${resource}:update` as AnyPermission);
    },
    [can]
  );

  const canDelete = useCallback(
    (resource: Resource) => {
      return can(`${resource}:delete` as AnyPermission);
    },
    [can]
  );

  const canList = useCallback(
    (resource: Resource) => {
      return can(`${resource}:list` as AnyPermission);
    },
    [can]
  );

  // 🏗️ Permission checkers por recurso (disponibles via createCheckers si se necesitan)

  // 🎯 Verificaciones reactivas usando el user actual
  const permissions = useMemo(
    () => ({
      // ✅ Usuarios
      users: {
        canCreate: canCreate("user"),
        canRead: canRead("user"),
        canUpdate: canUpdate("user"),
        canDelete: canDelete("user"),
        canList: canList("user"),
        canSetRole: can("user:set-role"),
        canBan: can("user:ban"),
        canImpersonate: can("user:impersonate"),
        canSetPassword: can("user:set-password"),
      },

      // 📁 Archivos
      files: {
        canRead: canRead("files"),
        canUpload: can("files:upload"),
        canDelete: canDelete("files"),
      },

      // 🔐 Sesiones
      sessions: {
        canList: can("session:list"),
        canRevoke: can("session:revoke"),
        canDelete: can("session:delete"),
      },

      // 🚩 Feature Flags
      featureFlags: {
        canRead: can("feature_flags:read"),
        canWrite: can("feature_flags:write"),
      },
    }),
    [can, canCreate, canRead, canUpdate, canDelete, canList]
  );

  return {
    // 🎯 Core permission functions (reactivas)
    can,
    canAny,
    canAll,

    // 🔧 CRUD shortcuts
    canCreate,
    canRead,
    canUpdate,
    canDelete,
    canList,

    // 📊 Structured permissions (reactivas)
    permissions,

    // 🏗️ Permission checker factories
    createCheckers: createPermissionCheckers,

    // 🔍 Raw data
    user: permissionUser,
    isLoading,
  };
}

/**
 * 🎯 USE RESOURCE PERMISSIONS
 *
 * Hook especializado para permisos de un recurso específico.
 */
export function useResourcePermissions<T extends Resource>(resource: T) {
  const { can, canCreate, canRead, canUpdate, canDelete, canList } =
    usePermissions();

  return useMemo(
    () => ({
      canCreate: canCreate(resource),
      canRead: canRead(resource),
      canUpdate: canUpdate(resource),
      canDelete: canDelete(resource),
      canList: canList(resource),

      // Permisos específicos del recurso
      can: (action: string) => can(`${resource}:${action}` as AnyPermission),
    }),
    [resource, can, canCreate, canRead, canUpdate, canDelete, canList]
  );
}

/**
 * 🏗️ USE PERMISSION GUARD
 *
 * Hook para renderizado condicional basado en permisos.
 */
export function usePermissionGuard(permission: AnyPermission) {
  const { can, isLoading } = usePermissions();

  const hasPermission = useMemo(() => {
    if (isLoading) return false;
    return can(permission);
  }, [can, permission, isLoading]);

  const Guard = useCallback(
    ({
      children,
      fallback = null,
    }: {
      children: React.ReactNode;
      fallback?: React.ReactNode;
    }) => {
      if (isLoading) return fallback as React.ReactElement;
      return hasPermission
        ? (children as React.ReactElement)
        : (fallback as React.ReactElement);
    },
    [hasPermission, isLoading]
  );

  return {
    hasPermission,
    isLoading,
    Guard,
  };
}

/**
 * 🎭 Hooks especializados por recurso
 */
export const useUserPermissions = () => useResourcePermissions("user");
export const useFilePermissions = () => useResourcePermissions("files");
export const useSessionPermissions = () => useResourcePermissions("session");
export const useFeatureFlagPermissions = () =>
  useResourcePermissions("feature_flags");

/**
 * 🔧 Helper para debugging permisos
 */
export function usePermissionDebugger() {
  const { user, permissions } = usePermissions();

  const debugInfo = useMemo(
    () => ({
      currentUser: user,
      currentRole: user?.role || "user",
      allPermissions: permissions,
      timestamp: new Date().toISOString(),
    }),
    [user, permissions]
  );

  return {
    debugInfo,
    logPermissions: () => console.log("🔍 Permissions Debug:", debugInfo),
  };
}
