/**
 * 👤 USER AVATAR SHARED COMPONENT
 * ===============================
 *
 * Componente avatar reutilizable para usuarios con fallback a iniciales
 *
 * Updated: 2025-01-17 - Enterprise patterns v2.0
 */

import React from "react";
import { cn } from "@/shared/utils";
import { getUserInitials, getRoleColor } from "../../../utils";

// Local avatar size configuration
const AVATAR_SIZES = {
  SM: "h-6 w-6 text-xs",
  MD: "h-8 w-8 text-sm", 
  LG: "h-10 w-10 text-base",
  XL: "h-12 w-12 text-lg",
} as const;

interface UserAvatarProps {
  user: {
    name: string;
    email: string;
    image?: string | null;
    role: string;
  };
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  showOnlineStatus?: boolean;
  isOnline?: boolean;
  onClick?: () => void;
  priority?: boolean; // Para Next.js Image optimization
}

/**
 * 👤 USER AVATAR
 *
 * Features:
 * - ✅ Fallback automático a iniciales si no hay imagen
 * - ✅ Colores basados en rol del usuario
 * - ✅ Múltiples tamaños predefinidos
 * - ✅ Status online opcional
 * - ✅ Clickable opcional
 * - ✅ Optimización de imágenes con Next.js
 */
export const UserAvatar = React.memo<UserAvatarProps>(
  ({
    user,
    size = "md",
    className,
    showOnlineStatus = false,
    isOnline = false,
    onClick,
    priority = false,
  }) => {
    const sizeClasses = AVATAR_SIZES[size.toUpperCase() as keyof typeof AVATAR_SIZES];
    const roleColors = getRoleColor(user.role);
    const initials = getUserInitials(user.name);

    // Base classes para el avatar
    const avatarClasses = cn(
      sizeClasses,
      "relative flex items-center justify-center rounded-full font-medium overflow-hidden",
      roleColors, // roleColors ya contiene tanto el color de texto como el background
      onClick && "cursor-pointer hover:opacity-80 transition-opacity",
      className
    );

    // Status indicator classes
    const statusClasses = cn(
      "absolute -bottom-0.5 -right-0.5 border-2 border-white rounded-full",
      size === "sm"
        ? "w-3 h-3"
        : size === "md"
        ? "w-4 h-4"
        : size === "lg"
        ? "w-5 h-5"
        : "w-6 h-6",
      isOnline ? "bg-green-400" : "bg-gray-400"
    );

    const handleClick = () => {
      if (onClick) {
        onClick();
      }
    };

    return (
      <div
        className={avatarClasses}
        onClick={handleClick}
        role={onClick ? "button" : undefined}
      >
        {user.image ? (
          <img
            src={user.image}
            alt={`Avatar de ${user.name}`}
            className="w-full h-full object-cover"
            loading={priority ? "eager" : "lazy"}
          />
        ) : (
          <span className="text-sm font-semibold">{initials}</span>
        )}

        {showOnlineStatus && (
          <div
            className={statusClasses}
            title={isOnline ? "En línea" : "Desconectado"}
          />
        )}
      </div>
    );
  }
);

UserAvatar.displayName = "UserAvatar";
