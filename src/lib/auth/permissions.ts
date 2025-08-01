/**
 * 🎯 BOILERPLATE PERMISSION SYSTEM
 *
 * This file extends Better Auth's Access Control with predefined permissions
 * perfect for most applications. It's designed to be:
 *
 * ✅ Ready to use out-of-the-box
 * ✅ Easily extensible
 * ✅ Type-safe
 * ✅ Well documented
 *
 * Based on Better Auth's createAccessControl system
 */

import { createAccessControl } from "better-auth/plugins/access";
import { defaultStatements } from "better-auth/plugins/admin/access";

// 📋 PREDEFINED RESOURCES AND ACTIONS
// These cover 90% of typical application needs
export const BOILERPLATE_PERMISSIONS = {
  // 🗂️ Content Management
  content: [
    "create", // Create content
    "read", // View content
    "update", // Edit content
    "delete", // Remove content
    "publish", // Publish/unpublish content
    "moderate", // Moderate user content
  ],

  // 📊 Analytics & Reports
  analytics: [
    "read", // View analytics data
    "export", // Export reports
    "create", // Create custom reports
    "delete", // Remove reports
  ],

  // ⚙️ System Settings
  settings: [
    "read", // View system configuration
    "update", // Modify system settings
    "backup", // Create system backups
    "restore", // Restore from backups
  ],

  // 🔐 Security & Audit
  security: [
    "read", // View security logs
    "audit", // Access audit trails
    "configure", // Configure security settings
  ],

  // 🎛️ API Management
  api: [
    "create", // Create API keys
    "read", // View API usage
    "update", // Update API settings
    "delete", // Revoke API access
  ],

  user: [
    "create",
    "read", // ← Adding this for user viewing
    "update",
    "delete",
    "list",
    "set-role",
    "ban",
    "impersonate",
    "set-password",
  ],
} as const;

// 🔗 MERGE WITH BETTER AUTH DEFAULTS
// This ensures compatibility with Better Auth's admin plugin
export const COMPLETE_PERMISSIONS = {
  ...defaultStatements, // Better Auth built-in permissions
  ...BOILERPLATE_PERMISSIONS, // Our custom permissions

  // 🔧 Override user permissions to include "read"
} as const;

// 🏗️ CREATE ACCESS CONTROL INSTANCE
export const accessControl = createAccessControl(COMPLETE_PERMISSIONS);

// 👑 PREDEFINED ROLES FOR BOILERPLATE
// These cover most application scenarios

/**
 * 🔴 SUPER ADMIN - Full system access
 * Use sparingly, for system owners only
 */
export const superAdminRole = accessControl.newRole({
  // Better Auth permissions
  user: [
    "create",
    "read",
    "list", // ← Required for listUsers()
    "update",
    "delete",
    "ban",
    "impersonate",
    "set-role",
    "set-password",
  ],
  session: ["list", "revoke", "delete"],

  // Custom permissions - full access
  content: ["create", "read", "update", "delete", "publish", "moderate"],
  analytics: ["read", "export", "create", "delete"],
  settings: ["read", "update", "backup", "restore"],
  security: ["read", "audit", "configure"],
  api: ["create", "read", "update", "delete"],
});

/**
 * 🟠 ADMIN - Administrative access
 * For trusted administrators
 */
export const adminRole = accessControl.newRole({
  // Better Auth admin permissions - defined explicitly
  user: [
    "create",
    "read",
    "list", // ← Required for listUsers()
    "update",
    "delete",
    "ban",
    "set-role",
    "set-password",
  ],
  session: ["list", "revoke", "delete"],

  // Content management
  content: ["create", "read", "update", "delete", "publish", "moderate"],

  // Analytics access
  analytics: ["read", "export"],

  // System settings (read-only)
  settings: ["read"],

  // Security (read-only)
  security: ["read", "audit"],

  // API management
  api: ["create", "read", "update"],
});

/**
 * 🟡 EDITOR - Content management focus
 * For content creators and editors
 */
export const editorRole = accessControl.newRole({
  // Content management (full access)
  content: ["create", "read", "update", "delete", "publish"],

  // Analytics (limited)
  analytics: ["read"],
});

/**
 * 🟢 MODERATOR - Community management
 * For community moderators
 */
export const moderatorRole = accessControl.newRole({
  // Content moderation
  content: ["read", "update", "moderate"],

  // Basic analytics
  analytics: ["read"],
});

/**
 * 🔵 USER - Basic user access
 * Default role for regular users
 */
export const userRole = accessControl.newRole({
  // Only basic read access
  content: ["read"], // Can view content
});

/**
 * ⚪ GUEST - Minimal access
 * For unauthenticated or restricted users
 */
export const guestRole = accessControl.newRole({
  // Minimal read-only access
  content: ["read"],
});

// 📦 ROLES COLLECTION
export const PREDEFINED_ROLES = {
  super_admin: superAdminRole,
  admin: adminRole,
  editor: editorRole,
  moderator: moderatorRole,
  user: userRole,
  guest: guestRole,
} as const;

// 📋 ROLE HIERARCHY (for UI and logic)
export const ROLE_HIERARCHY = {
  super_admin: 100,
  admin: 80,
  editor: 60,
  moderator: 40,
  user: 20,
  guest: 0,
} as const;

// 🎨 ROLE DISPLAY INFO (for UI)
export const ROLE_INFO = {
  super_admin: {
    name: "Super Administrador",
    description: "Acceso completo al sistema",
    color: "red",
    icon: "👑",
  },
  admin: {
    name: "Administrador",
    description: "Gestión de usuarios y configuración",
    color: "orange",
    icon: "🛡️",
  },
  editor: {
    name: "Editor",
    description: "Gestión de contenido",
    color: "blue",
    icon: "✏️",
  },
  moderator: {
    name: "Moderador",
    description: "Moderación de comunidad",
    color: "purple",
    icon: "🛡️",
  },
  user: {
    name: "Usuario",
    description: "Usuario estándar",
    color: "green",
    icon: "👤",
  },
  guest: {
    name: "Invitado",
    description: "Acceso limitado",
    color: "gray",
    icon: "👁️",
  },
} as const;

// 🔧 UTILITY FUNCTIONS

/**
 * Get role hierarchy level
 */
export function getRoleLevel(role: keyof typeof ROLE_HIERARCHY): number {
  return ROLE_HIERARCHY[role] || 0;
}

/**
 * Check if role A can manage role B
 */
export function canManageRole(
  managerRole: keyof typeof ROLE_HIERARCHY,
  targetRole: keyof typeof ROLE_HIERARCHY
): boolean {
  return getRoleLevel(managerRole) > getRoleLevel(targetRole);
}

/**
 * Get available roles for assignment
 */
export function getAssignableRoles(
  currentUserRole: keyof typeof ROLE_HIERARCHY
): Array<keyof typeof ROLE_HIERARCHY> {
  const currentLevel = getRoleLevel(currentUserRole);

  return Object.entries(ROLE_HIERARCHY)
    .filter(([_, level]) => level < currentLevel)
    .map(([role, _]) => role as keyof typeof ROLE_HIERARCHY);
}

/**
 * Check if resource:action exists in permissions
 */
export function isValidPermission(resource: string, action: string): boolean {
  return (
    resource in COMPLETE_PERMISSIONS &&
    (COMPLETE_PERMISSIONS as Record<string, readonly string[]>)[
      resource
    ].includes(action)
  );
}

// 🚀 EXTENSIBILITY HELPERS

/**
 * Extend permissions with custom resources/actions
 *
 * Example:
 * ```ts
 * const customPermissions = extendPermissions({
 *   blog: ["create", "publish", "schedule"],
 *   comments: ["create", "read", "moderate", "delete"]
 * });
 * ```
 */
export function extendPermissions<T extends Record<string, readonly string[]>>(
  customPermissions: T
) {
  const extended = {
    ...COMPLETE_PERMISSIONS,
    ...customPermissions,
  } as const;

  return createAccessControl(extended);
}

// 📊 PERMISSION GROUPS (for UI organization)
export const PERMISSION_GROUPS = {
  "👥 Gestión de Usuarios": {
    resources: ["user"],
    description: "Crear, editar y gestionar usuarios del sistema",
  },
  "🔐 Sesiones": {
    resources: ["session"],
    description: "Gestión de sesiones de usuario",
  },
  "🗂️ Contenido": {
    resources: ["content"],
    description: "Gestión de contenido y publicaciones",
  },
  "📊 Análisis": {
    resources: ["analytics"],
    description: "Reportes y análisis de datos",
  },
  "⚙️ Configuración": {
    resources: ["settings", "security"],
    description: "Configuración del sistema y seguridad",
  },
  "🔧 API": {
    resources: ["api"],
    description: "Gestión de APIs del sistema",
  },
} as const;

// 🎯 EXPORT EVERYTHING FOR EASY IMPORT
export {
  accessControl as ac,
  COMPLETE_PERMISSIONS as permissions,
  PREDEFINED_ROLES as roles,
};

// 📝 EXPORT TYPES
export type RoleName = keyof typeof ROLE_INFO;
