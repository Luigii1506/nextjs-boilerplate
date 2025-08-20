/**
 * 🔐 UTILIDADES DE PERMISOS
 *
 * Funciones de validación y helpers para el sistema de permisos
 */

import { ROLE_STATEMENTS } from "./roles";
import type {
  AnyPermission,
  PermissionUser,
  RoleName,
  Resource,
} from "./types";

// Normaliza "user:read" -> ["user","read"]
function splitPermission(perm: AnyPermission): [Resource, string] {
  const idx = perm.indexOf(":");
  const res = perm.slice(0, idx) as Resource;
  const act = perm.slice(idx + 1);
  return [res, act];
}

/**
 * Verifica si un usuario tiene un permiso específico
 * Primero revisa permisos directos, luego permisos por rol
 */
export function hasPermission(
  user: PermissionUser,
  perm: AnyPermission
): boolean {
  if (!user) return false;

  // 1) Permisos directos del usuario
  if (user.permissions?.includes(perm)) return true;

  // 2) Permisos por rol
  const roleName = (user.role ?? "user") as RoleName;
  const statements = ROLE_STATEMENTS[roleName];
  if (!statements) return false;

  const [resource, action] = splitPermission(perm);
  const allowed = statements[resource as keyof typeof statements] as
    | readonly string[]
    | undefined;

  return Boolean(allowed?.includes(action));
}

/**
 * Verifica si un usuario tiene al menos uno de los permisos especificados
 */
export function hasAnyPermission(
  user: PermissionUser,
  perms: AnyPermission[]
): boolean {
  return perms.some((p) => hasPermission(user, p));
}

/**
 * Verifica si un usuario tiene todos los permisos especificados
 */
export function hasAllPermissions(
  user: PermissionUser,
  perms: AnyPermission[]
): boolean {
  return perms.every((p) => hasPermission(user, p));
}

/**
 * Guard de servidor - redirige si no tiene permisos
 */
export async function ensurePermission(
  user: PermissionUser,
  perm: AnyPermission
) {
  if (!hasPermission(user, perm)) {
    const { redirect } = await import("next/navigation");
    redirect("/unauthorized");
  }
}

/**
 * Genera las verificaciones de permisos más comunes para un recurso
 */
export function createPermissionCheckers<T extends Resource>(resource: T) {
  return {
    canCreate: (user: PermissionUser) =>
      hasPermission(user, `${resource}:create` as AnyPermission),
    canRead: (user: PermissionUser) =>
      hasPermission(user, `${resource}:read` as AnyPermission),
    canUpdate: (user: PermissionUser) =>
      hasPermission(user, `${resource}:update` as AnyPermission),
    canDelete: (user: PermissionUser) =>
      hasPermission(user, `${resource}:delete` as AnyPermission),
    canList: (user: PermissionUser) =>
      hasPermission(user, `${resource}:list` as AnyPermission),
  };
}
