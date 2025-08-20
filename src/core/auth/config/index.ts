/**
 * 🔐 AUTH CONFIG INDEX
 *
 * Punto de entrada centralizado para toda la configuración de autenticación y permisos
 */

// Re-exportar todo desde permissions.ts (que ya actúa como barrel)
export * from "./permissions";

// Exportar tipos específicos si necesitas importarlos directamente
export type {
  Resource,
  ActionOf,
  AnyPermission,
  RoleName,
  PermissionUser,
  Permission,
} from "./types";

// Exportar utilidades específicas si necesitas importarlas directamente
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
