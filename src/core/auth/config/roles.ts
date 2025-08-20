/**
 * 🔐 CONFIGURACIÓN DE ROLES
 *
 * Definición centralizada de roles, jerarquía y permisos por rol
 */

import type { RoleName, Resource, ActionOf, ROLES } from "./types";

// Re-exportar ROLES para usar en otros archivos
export { ROLES } from "./types";

// Jerarquía de roles (mayor número = más permisos)
export const ROLE_HIERARCHY = {
  super_admin: 100,
  admin: 80,
  user: 20,
} as const;

// Información visual de los roles
export const ROLE_INFO = {
  super_admin: {
    name: "Super Administrador",
    description: "Acceso completo al sistema",
    color: "red",
    icon: "👑",
  },
  admin: {
    name: "Administrador",
    description: "Gestión de usuarios",
    color: "orange",
    icon: "🛡️",
  },
  user: {
    name: "Usuario",
    description: "Usuario estándar",
    color: "green",
    icon: "👤",
  },
} as const;

// Definición de permisos por rol (validada por tipos)
export const ROLE_STATEMENTS = {
  super_admin: {
    user: [
      "create",
      "read",
      "list",
      "update",
      "delete",
      "ban",
      "impersonate",
      "set-role",
      "set-password",
    ],
    session: ["list", "revoke", "delete"],
    files: ["read", "upload", "delete"],
    feature_flags: ["read", "write"],
  },
  admin: {
    user: [
      "create",
      "read",
      "list",
      "update",
      "delete",
      "ban",
      "set-role",
      "set-password",
    ],
    session: ["list", "revoke", "delete"],
    files: ["read", "upload"],
    feature_flags: ["read"],
  },
  user: {
    session: ["list", "revoke", "delete"],
    files: ["read"],
  },
} satisfies {
  [role in RoleName]: Partial<{ [R in Resource]: readonly ActionOf<R>[] }>;
};

// Utilities de roles
export function getRoleLevel(role: keyof typeof ROLE_HIERARCHY): number {
  return ROLE_HIERARCHY[role] || 0;
}

export function canManageRole(
  managerRole: keyof typeof ROLE_HIERARCHY,
  targetRole: keyof typeof ROLE_HIERARCHY
): boolean {
  return getRoleLevel(managerRole) > getRoleLevel(targetRole);
}

export function getAssignableRoles(
  currentUserRole: keyof typeof ROLE_HIERARCHY
): Array<keyof typeof ROLE_HIERARCHY> {
  const currentLevel = getRoleLevel(currentUserRole);
  return Object.entries(ROLE_HIERARCHY)
    .filter(([, level]) => level < currentLevel)
    .map(([role]) => role as keyof typeof ROLE_HIERARCHY);
}
