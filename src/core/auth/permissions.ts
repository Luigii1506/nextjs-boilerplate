/**
 * 🔐 SISTEMA DE PERMISOS CONSOLIDADO
 * ==================================
 *
 * Configuración completa de roles, permisos y utilidades.
 * Todo en un solo lugar para máxima simplicidad.
 *
 * Simple: 2025-01-17 - Consolidación completa
 */

import { createAccessControl } from "better-auth/plugins/access";
import { defaultStatements } from "better-auth/plugins/admin/access";

// 🎯 TIPOS BASE
// =============

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
  // 📦 INVENTORY MANAGEMENT
  inventory_product: [
    "create",
    "read",
    "list",
    "update",
    "delete",
    "set-stock",
    "view-cost",
    "view-profit",
  ],
  inventory_category: ["create", "read", "list", "update", "delete"],
  inventory_supplier: ["create", "read", "list", "update", "delete"],
  inventory_stock_movement: [
    "create",
    "read",
    "list",
    "adjustment",
    "view-history",
  ],
  inventory_analytics: ["read", "export", "advanced-reports"],
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

// 👑 CONFIGURACIÓN DE ROLES
// =========================

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
    // 📦 INVENTORY - Full access for super admin
    inventory_product: [
      "create",
      "read",
      "list",
      "update",
      "delete",
      "set-stock",
      "view-cost",
      "view-profit",
    ],
    inventory_category: ["create", "read", "list", "update", "delete"],
    inventory_supplier: ["create", "read", "list", "update", "delete"],
    inventory_stock_movement: [
      "create",
      "read",
      "list",
      "adjustment",
      "view-history",
    ],
    inventory_analytics: ["read", "export", "advanced-reports"],
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
    // 📦 INVENTORY - Admin access (no delete sensitive items)
    inventory_product: [
      "create",
      "read",
      "list",
      "update",
      "delete",
      "set-stock",
      "view-cost",
      "view-profit",
    ],
    inventory_category: ["create", "read", "list", "update", "delete"],
    inventory_supplier: ["create", "read", "list", "update", "delete"],
    inventory_stock_movement: [
      "create",
      "read",
      "list",
      "adjustment",
      "view-history",
    ],
    inventory_analytics: ["read", "export"],
  },
  user: {
    session: ["list", "revoke", "delete"],
    files: ["read"],
    // 📦 INVENTORY - Limited read access for regular users
    inventory_product: ["read", "list"],
    inventory_category: ["read", "list"],
    inventory_supplier: ["read", "list"],
    inventory_stock_movement: ["read", "list"],
    inventory_analytics: ["read"],
  },
} satisfies {
  [role in RoleName]: Partial<{ [R in Resource]: readonly ActionOf<R>[] }>;
};

// 🔧 UTILIDADES DE ROLES
// =======================

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

// 🔍 UTILIDADES DE PERMISOS
// ==========================

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

// 📦 INVENTORY PERMISSION HELPERS
// Helpers específicos para módulo de inventory
export const inventoryPermissions = {
  // Products
  canCreateProduct: (user: PermissionUser) =>
    hasPermission(user, "inventory_product:create"),
  canReadProduct: (user: PermissionUser) =>
    hasPermission(user, "inventory_product:read"),
  canUpdateProduct: (user: PermissionUser) =>
    hasPermission(user, "inventory_product:update"),
  canDeleteProduct: (user: PermissionUser) =>
    hasPermission(user, "inventory_product:delete"),
  canListProducts: (user: PermissionUser) =>
    hasPermission(user, "inventory_product:list"),
  canSetStock: (user: PermissionUser) =>
    hasPermission(user, "inventory_product:set-stock"),
  canViewCost: (user: PermissionUser) =>
    hasPermission(user, "inventory_product:view-cost"),
  canViewProfit: (user: PermissionUser) =>
    hasPermission(user, "inventory_product:view-profit"),

  // Categories
  canCreateCategory: (user: PermissionUser) =>
    hasPermission(user, "inventory_category:create"),
  canDeleteCategory: (user: PermissionUser) =>
    hasPermission(user, "inventory_category:delete"),

  // Suppliers
  canCreateSupplier: (user: PermissionUser) =>
    hasPermission(user, "inventory_supplier:create"),
  canDeleteSupplier: (user: PermissionUser) =>
    hasPermission(user, "inventory_supplier:delete"),

  // Stock Movements
  canCreateStockMovement: (user: PermissionUser) =>
    hasPermission(user, "inventory_stock_movement:create"),
  canMakeAdjustment: (user: PermissionUser) =>
    hasPermission(user, "inventory_stock_movement:adjustment"),

  // Analytics
  canViewAnalytics: (user: PermissionUser) =>
    hasPermission(user, "inventory_analytics:read"),
  canExportReports: (user: PermissionUser) =>
    hasPermission(user, "inventory_analytics:export"),
} as const;

// 🔌 BETTER AUTH INTEGRATION
// ===========================

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
