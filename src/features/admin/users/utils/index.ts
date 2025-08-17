/**
 * 👥 USERS UTILITIES
 * ==================
 *
 * Funciones utilitarias compartidas para el módulo de usuarios
 *
 * Updated: 2025-01-17 - Enterprise patterns v2.0
 */

import { USERS_ROLES, ROLE_HIERARCHY, UI_CONFIG } from "../constants";

// 🎭 Role utilities
export function getRoleHierarchy(role: string): number {
  return ROLE_HIERARCHY[role as keyof typeof ROLE_HIERARCHY] ?? -1;
}

export function canManageUser(
  currentUserRole: string,
  targetUserRole: string
): boolean {
  const currentLevel = getRoleHierarchy(currentUserRole);
  const targetLevel = getRoleHierarchy(targetUserRole);
  return currentLevel > targetLevel;
}

export function getRoleLabel(role: string): string {
  switch (role) {
    case USERS_ROLES.USER:
      return "Usuario";
    case USERS_ROLES.ADMIN:
      return "Administrador";
    case USERS_ROLES.SUPER_ADMIN:
      return "Super Admin";
    default:
      return role;
  }
}

export function getRoleColor(role: string) {
  switch (role) {
    case USERS_ROLES.USER:
      return UI_CONFIG.COLORS.USER;
    case USERS_ROLES.ADMIN:
      return UI_CONFIG.COLORS.ADMIN;
    case USERS_ROLES.SUPER_ADMIN:
      return UI_CONFIG.COLORS.SUPER_ADMIN;
    default:
      return UI_CONFIG.COLORS.USER;
  }
}

// 👤 User utilities
export function getUserInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export function getUserDisplayName(user: {
  name: string;
  email: string;
}): string {
  return user.name || user.email.split("@")[0];
}

export function formatUserRole(role: string): string {
  return getRoleLabel(role);
}

// 🕐 Date utilities
export function formatLastLogin(lastLogin?: string): string {
  if (!lastLogin) return "Nunca";

  const date = new Date(lastLogin);
  const now = new Date();
  const diffInHours = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60 * 60)
  );

  if (diffInHours < 1) return "Hace menos de 1 hora";
  if (diffInHours < 24) return `Hace ${diffInHours} horas`;
  if (diffInHours < 48) return "Ayer";

  return date.toLocaleDateString("es-ES");
}

export function formatUserDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// ✅ Validation utilities
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePassword(password: string): boolean {
  return password.length >= 8;
}

export function validateUserName(name: string): boolean {
  return name.length >= 2 && name.length <= 50;
}

// 🎨 Status utilities
export function getUserStatusColor(banned: boolean) {
  return banned ? UI_CONFIG.COLORS.BANNED : UI_CONFIG.COLORS.USER;
}

export function getUserStatusLabel(banned: boolean): string {
  return banned ? "Baneado" : "Activo";
}

// 🔍 Search utilities
export function normalizeSearchTerm(term: string): string {
  return term.toLowerCase().trim();
}

export function matchesSearchTerm(
  user: { name: string; email: string },
  searchTerm: string,
  searchField: "email" | "name" | "all" = "all"
): boolean {
  const normalizedTerm = normalizeSearchTerm(searchTerm);

  switch (searchField) {
    case "email":
      return user.email.toLowerCase().includes(normalizedTerm);
    case "name":
      return user.name.toLowerCase().includes(normalizedTerm);
    case "all":
      return (
        user.email.toLowerCase().includes(normalizedTerm) ||
        user.name.toLowerCase().includes(normalizedTerm)
      );
    default:
      return false;
  }
}

// 📊 Analytics utilities
export function calculateUserStats(
  users: Array<{ role: string; banned: boolean }>
) {
  const total = users.length;
  const active = users.filter((u) => !u.banned).length;
  const banned = users.filter((u) => u.banned).length;
  const admins = users.filter(
    (u) => u.role === USERS_ROLES.ADMIN || u.role === USERS_ROLES.SUPER_ADMIN
  ).length;

  return {
    total,
    active,
    banned,
    admins,
    activePercentage: total > 0 ? Math.round((active / total) * 100) : 0,
    adminPercentage: total > 0 ? Math.round((admins / total) * 100) : 0,
  };
}

// 🛡️ Permission utilities
export function hasPermission(userRole: string, requiredRole: string): boolean {
  const userLevel = getRoleHierarchy(userRole);
  const requiredLevel = getRoleHierarchy(requiredRole);
  return userLevel >= requiredLevel;
}

export function canDeleteUser(
  currentUserRole: string,
  targetUserRole: string
): boolean {
  // Solo super admin puede eliminar usuarios
  return (
    currentUserRole === USERS_ROLES.SUPER_ADMIN &&
    targetUserRole !== USERS_ROLES.SUPER_ADMIN
  );
}

export function canChangeBanStatus(
  currentUserRole: string,
  targetUserRole: string
): boolean {
  return canManageUser(currentUserRole, targetUserRole);
}

export function canChangeRole(
  currentUserRole: string,
  targetUserRole: string,
  newRole: string
): boolean {
  const canManageTarget = canManageUser(currentUserRole, targetUserRole);
  const canAssignNewRole = canManageUser(currentUserRole, newRole);
  return canManageTarget && canAssignNewRole;
}

// 🎯 Filter utilities
export function filterUsersByRole(
  users: Array<{ role: string }>,
  roleFilter: string
): Array<{ role: string }> {
  if (roleFilter === "all") return users;
  return users.filter((user) => user.role === roleFilter);
}

export function filterUsersByStatus(
  users: Array<{ banned: boolean }>,
  statusFilter: string
): Array<{ banned: boolean }> {
  if (statusFilter === "all") return users;
  const isBanned = statusFilter === "banned";
  return users.filter((user) => user.banned === isBanned);
}

// 🔄 Sorting utilities
export function sortUsers<
  T extends { name: string; email: string; createdAt: string }
>(users: T[], sortBy: string): T[] {
  switch (sortBy) {
    case "name_asc":
      return [...users].sort((a, b) => a.name.localeCompare(b.name));
    case "name_desc":
      return [...users].sort((a, b) => b.name.localeCompare(a.name));
    case "email_asc":
      return [...users].sort((a, b) => a.email.localeCompare(b.email));
    case "email_desc":
      return [...users].sort((a, b) => b.email.localeCompare(a.email));
    case "created_asc":
      return [...users].sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
    case "created_desc":
      return [...users].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    default:
      return users;
  }
}

// 📝 Form utilities
export function sanitizeUserInput(input: string): string {
  return input.trim().replace(/[<>]/g, "");
}

export function generateTempUserId(): string {
  return `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
