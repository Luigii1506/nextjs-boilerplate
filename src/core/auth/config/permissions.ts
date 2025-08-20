/**
 * 🔐 SISTEMA DE PERMISOS PRINCIPAL
 *
 * Configuración de Better Auth y exportación de utilidades centralizadas
 */

import { createAccessControl } from "better-auth/plugins/access";
import { defaultStatements } from "better-auth/plugins/admin/access";

// Importaciones de configuración separada
import { PERMISSIONS } from "./types";
import { ROLE_STATEMENTS } from "./roles";

// Re-exportaciones de tipos y utilidades
export type {
  Resource,
  ActionOf,
  AnyPermission,
  RoleName,
  PermissionUser,
  Permission,
} from "./types";

export {
  ROLES,
  ROLE_HIERARCHY,
  ROLE_INFO,
  getRoleLevel,
  canManageRole,
  getAssignableRoles,
} from "./roles";

export {
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  ensurePermission,
  createPermissionCheckers,
} from "./utils";

// Configuración de Better Auth AccessControl
export const ac = createAccessControl({
  ...defaultStatements,
  ...PERMISSIONS,
});

// Roles predefinidos para Better Auth
export const PREDEFINED_ROLES = {
  super_admin: ac.newRole(ROLE_STATEMENTS.super_admin),
  admin: ac.newRole(ROLE_STATEMENTS.admin),
  user: ac.newRole(ROLE_STATEMENTS.user),
} as const;
