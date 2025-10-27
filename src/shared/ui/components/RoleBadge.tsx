/**
 * 👑 ROLE BADGE COMPONENT
 * =======================
 *
 * Reusable badge for displaying user roles with icons and colors
 * Centralizes role styling logic
 *
 * Created: 2025-01-27 - Shared Role Badge
 */

"use client";

import React from "react";
import { Crown, Shield, UserCheck, Users } from "lucide-react";
import { cn } from "@/shared/utils";

export type UserRole = "super_admin" | "admin" | "moderator" | "user";

export interface RoleBadgeProps {
  role: UserRole;
  showIcon?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const ROLE_CONFIG = {
  super_admin: {
    label: "Super Administrador",
    icon: Crown,
    color: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 border-red-200 dark:border-red-700",
    iconColor: "text-red-500",
  },
  admin: {
    label: "Administrador",
    icon: Shield,
    color: "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400 border-purple-200 dark:border-purple-700",
    iconColor: "text-purple-500",
  },
  moderator: {
    label: "Moderador",
    icon: UserCheck,
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 border-blue-200 dark:border-blue-700",
    iconColor: "text-blue-500",
  },
  user: {
    label: "Usuario",
    icon: Users,
    color: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600",
    iconColor: "text-gray-500",
  },
} as const;

const SIZE_CLASSES = {
  sm: "text-xs px-2 py-0.5",
  md: "text-sm px-2.5 py-1",
  lg: "text-base px-3 py-1.5",
} as const;

const ICON_SIZE_CLASSES = {
  sm: "w-3 h-3",
  md: "w-4 h-4",
  lg: "w-5 h-5",
} as const;

export const RoleBadge: React.FC<RoleBadgeProps> = ({
  role,
  showIcon = false,
  size = "md",
  className,
}) => {
  const config = ROLE_CONFIG[role] || ROLE_CONFIG.user;
  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 font-medium rounded-full border",
        config.color,
        SIZE_CLASSES[size],
        className
      )}
    >
      {showIcon && <Icon className={cn(ICON_SIZE_CLASSES[size], config.iconColor)} />}
      {config.label}
    </span>
  );
};

/**
 * Hook to get role configuration
 * Useful for custom implementations
 */
export const useRoleConfig = (role: UserRole) => {
  return ROLE_CONFIG[role] || ROLE_CONFIG.user;
};

/**
 * Get role icon component
 */
export const getRoleIcon = (role: UserRole, className?: string) => {
  const config = ROLE_CONFIG[role] || ROLE_CONFIG.user;
  const Icon = config.icon;
  return <Icon className={cn("w-5 h-5", config.iconColor, className)} />;
};

/**
 * Get role label
 */
export const getRoleLabel = (role: UserRole): string => {
  return ROLE_CONFIG[role]?.label || role;
};
