/**
 * RBAC tipado y utilities.
 * - Validación en compile-time: las acciones de roles deben existir para el recurso.
 * - Helpers: hasPermission / hasAny / hasAll / ensurePermission (server).
 */

import { createAccessControl } from "better-auth/plugins/access";
import { defaultStatements } from "better-auth/plugins/admin/access";

/* ================================
 * 1) Declaración de permisos base
 * ================================ */

// Recurso → acciones. Extiende lo built-in de Better Auth.
export const PERMISSIONS = {
  ...defaultStatements, // (user, session, etc.) según Better Auth

  // Override / extend de ejemplo (añadimos "read" en user)
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
  // Si quieres agregar otros recursos del dominio, hazlo aquí:
  // files: ["read", "upload", "delete"],
  // feature_flags: ["read", "write"],
} as const;

// Uniones de tipos derivadas automáticamente
export type Resource = keyof typeof PERMISSIONS;
export type ActionOf<R extends Resource> = (typeof PERMISSIONS)[R][number];

// Permiso serializado "recurso:acción" (útil para UI / logging)
export type AnyPermission = {
  [R in Resource]: `${R}:${ActionOf<R>}`;
}[Resource];

/* ==================================================
 * 2) Declaración tipada de roles → statements puros
 *    (aquí validamos compile-time contra PERMISSIONS)
 * ================================================== */

const ROLE_STATEMENTS = {
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
    // files: ["read", "upload", "delete"],
    // feature_flags: ["read", "write"],
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
    // files: ["read", "upload"],
    // feature_flags: ["read"],
  },
  user: {
    session: ["list", "revoke", "delete"],
    // files: ["read"],
  },
} satisfies {
  // Validación: cada recurso debe existir en PERMISSIONS y
  // cada acción debe pertenecer a las acciones permitidas del recurso.
  [role: string]: Partial<{ [R in Resource]: readonly ActionOf<R>[] }>;
};

export const ROLES = ["super_admin", "admin", "user"] as const;
export type RoleName = (typeof ROLES)[number];

/* ===========================================
 * 3) Instanciación de AccessControl (Better Auth)
 * =========================================== */

export const ac = createAccessControl(PERMISSIONS);

// Si quieres mantener objetos "role" del plugin:
export const PREDEFINED_ROLES = {
  super_admin: ac.newRole(ROLE_STATEMENTS.super_admin),
  admin: ac.newRole(ROLE_STATEMENTS.admin),
  user: ac.newRole(ROLE_STATEMENTS.user),
} as const;

/* =========================
 * 4) Info visual de los roles
 * ========================= */

export const ROLE_HIERARCHY = {
  super_admin: 100,
  admin: 80,
  user: 20,
} as const;

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

/* =========================
 * 5) Utilities de roles
 * ========================= */

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

/* ===========================================
 * 6) Helpers de permisos (server y client-safe)
 * =========================================== */

// Normaliza "user:read" -> ["user","read"]
function splitPermission(perm: AnyPermission): [Resource, string] {
  const idx = perm.indexOf(":");
  const res = perm.slice(0, idx) as Resource;
  const act = perm.slice(idx + 1);
  return [res, act];
}

// hasPermission: primero mira permisos directos del usuario (si los guardas como strings "res:act"),
// luego revisa lo que su rol permite según ROLE_STATEMENTS.
export function hasPermission(
  user: { role?: string | null; permissions?: string[] | readonly string[] },
  perm: AnyPermission
): boolean {
  if (!user) return false;

  // 1) permisos directos (ej. otorgados granularmente)
  if (user.permissions?.includes(perm)) return true;

  // 2) permisos por rol
  const roleName = (user.role ?? "user") as RoleName;
  const statements = ROLE_STATEMENTS[roleName];
  if (!statements) return false;

  const [resource, action] = splitPermission(perm);
  const allowed = statements[resource as keyof typeof statements] as
    | readonly string[]
    | undefined;

  return Boolean(allowed?.includes(action));
}

export function hasAnyPermission(
  user: { role?: string | null; permissions?: string[] | readonly string[] },
  perms: AnyPermission[]
): boolean {
  return perms.some((p) => hasPermission(user, p));
}

export function hasAllPermissions(
  user: { role?: string | null; permissions?: string[] | readonly string[] },
  perms: AnyPermission[]
): boolean {
  return perms.every((p) => hasPermission(user, p));
}

/* ===========================================
 * 7) Guard de servidor (para layouts/pages)
 * =========================================== */

export async function ensurePermission(
  user: { role?: string | null; permissions?: string[] | readonly string[] },
  perm: AnyPermission
) {
  if (!hasPermission(user, perm)) {
    const { redirect } = await import("next/navigation");
    redirect("/unauthorized");
  }
}
