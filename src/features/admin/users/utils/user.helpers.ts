/**
 * 🛠️ USER HELPERS - UTILITY FUNCTIONS
 * ====================================
 *
 * Pure utility functions for user-related operations
 * Extracted from AllUsersTab for reusability
 *
 * FEATURES:
 * - Role color mapping
 * - Status color mapping
 * - Type-safe utilities
 *
 * Created: 2025-01-27 - Users Refactoring
 */

import type { User } from "../types";

/**
 * Get TailwindCSS color classes for user role badge
 *
 * @param role - User role
 * @returns Tailwind classes string
 */
export const getRoleColor = (role: User["role"]): string => {
  switch (role) {
    case "super_admin":
      return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
    case "admin":
      return "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400";
    case "moderator":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
    case "user":
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
  }
};

/**
 * Get TailwindCSS color classes for user status badge
 *
 * @param banned - Whether user is banned
 * @returns Tailwind classes string
 */
export const getStatusColor = (banned: boolean): string => {
  return banned
    ? "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
    : "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
};

/**
 * Get user avatar initials
 *
 * @param name - User name
 * @returns First letter uppercase
 */
export const getUserInitials = (name: string): string => {
  return name.charAt(0).toUpperCase();
};

/**
 * Get role display name
 *
 * @param role - User role
 * @returns Formatted role name
 */
export const getRoleDisplayName = (role: User["role"]): string => {
  const roleNames: Record<User["role"], string> = {
    super_admin: "Super Admin",
    admin: "Admin",
    moderator: "Moderador",
    user: "Usuario",
  };
  return roleNames[role] || role;
};

/**
 * Get status display name
 *
 * @param banned - Whether user is banned
 * @returns Status text
 */
export const getStatusDisplayName = (banned: boolean): string => {
  return banned ? "Baneado" : "Activo";
};
