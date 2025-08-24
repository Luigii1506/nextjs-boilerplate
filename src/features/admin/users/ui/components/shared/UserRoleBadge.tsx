/**
 * 🎭 USER ROLE BADGE SHARED COMPONENT
 * ===================================
 *
 * Componente badge reutilizable para mostrar roles de usuario
 *
 * Updated: 2025-01-17 - Enterprise patterns v2.0
 */

import React from "react";
import { cn } from "@/shared/utils";
import { USER_ROLES } from "../../../constants";
import { getRoleLabel, getRoleColor } from "../../../utils";

interface UserRoleBadgeProps {
  role: string;
  size?: "sm" | "md" | "lg";
  variant?: "solid" | "outline" | "subtle";
  className?: string;
  showIcon?: boolean;
  clickable?: boolean;
  onClick?: () => void;
}

// 🎨 Role icons
const roleIcons = {
  [USER_ROLES.USER]: "👤",
  [USER_ROLES.ADMIN]: "🛡️",
  [USER_ROLES.SUPER_ADMIN]: "👑",
} as const;

/**
 * 🎭 USER ROLE BADGE
 *
 * Features:
 * - ✅ Colores automáticos basados en rol
 * - ✅ Múltiples variantes (solid, outline, subtle)
 * - ✅ Tamaños responsivos
 * - ✅ Iconos opcionales por rol
 * - ✅ Clickable opcional
 * - ✅ Accesibilidad completa
 */
export const UserRoleBadge = React.memo<UserRoleBadgeProps>(
  ({
    role,
    size = "md",
    variant = "solid",
    className,
    showIcon = true,
    clickable = false,
    onClick,
  }) => {
    const roleColors = getRoleColor(role);
    const roleLabel = getRoleLabel(role);
    const roleIcon = roleIcons[role as keyof typeof roleIcons] || "📋";

    // Size classes
    const sizeClasses = {
      sm: "px-2 py-1 text-xs",
      md: "px-3 py-1.5 text-sm",
      lg: "px-4 py-2 text-base",
    };

    // Variant classes
    const getVariantClasses = () => {
      switch (variant) {
        case "solid":
          return roleColors; // roleColors ya contiene las clases completas
        case "outline":
          return cn(
            "bg-transparent border border-current",
            roleColors.replace("bg-", "border-").replace("-50", "-200")
          );
        case "subtle":
          return roleColors.replace("-50", "-100");
        default:
          return roleColors;
      }
    };

    // Base classes
    const baseClasses = cn(
      "inline-flex items-center gap-1.5 rounded-full font-medium whitespace-nowrap",
      sizeClasses[size],
      getVariantClasses(),
      clickable && "cursor-pointer hover:opacity-80 transition-opacity",
      className
    );

    const handleClick = () => {
      if (onClick && clickable) {
        onClick();
      }
    };

    return (
      <span
        className={baseClasses}
        onClick={handleClick}
        role={clickable ? "button" : undefined}
        tabIndex={clickable ? 0 : undefined}
        onKeyDown={
          clickable
            ? (e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleClick();
                }
              }
            : undefined
        }
        title={`Rol: ${roleLabel}`}
      >
        {showIcon && (
          <span
            className="flex-shrink-0"
            role="img"
            aria-label={`Icono de ${roleLabel}`}
          >
            {roleIcon}
          </span>
        )}
        <span>{roleLabel}</span>
      </span>
    );
  }
);

UserRoleBadge.displayName = "UserRoleBadge";
