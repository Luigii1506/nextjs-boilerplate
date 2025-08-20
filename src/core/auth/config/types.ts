/**
 * 🔐 TIPOS DE PERMISOS Y ROLES
 *
 * Definiciones centralizadas de tipos para el sistema de permisos
 */

// Definición base de permisos por recurso
export const PERMISSIONS = {
  user: [
    "create",
    "read",
    "list",
    "set-role",
    "ban",
    "impersonate",
    "delete",
    "set-password",
    "update",
  ],
  session: ["list", "revoke", "delete"],
  files: ["read", "upload", "delete"],
  feature_flags: ["read", "write"],
} as const;

// Tipos derivados automáticamente
export type Resource = keyof typeof PERMISSIONS;
export type ActionOf<R extends Resource> = (typeof PERMISSIONS)[R][number];

// Permiso serializado "recurso:acción"
export type AnyPermission = {
  [R in Resource]: `${R}:${ActionOf<R>}`;
}[Resource];

// Roles disponibles
export const ROLES = ["super_admin", "admin", "user"] as const;
export type RoleName = (typeof ROLES)[number];

// Estructura de permisos para verificaciones
export type Permission = Record<string, string[]>;

// Usuario base para verificaciones
export interface PermissionUser {
  role?: string | null;
  permissions?: string[] | readonly string[];
  id?: string | number;
}
