/**
 * 📊 USER STATUS BADGE SHARED COMPONENT
 * =====================================
 *
 * Componente badge reutilizable para mostrar estado de usuario (activo/baneado)
 *
 * Updated: 2025-01-17 - Enterprise patterns v2.0
 */

import React from "react";
import { cn } from "@/shared/utils";
import {
  getUserStatusColor,
  getUserStatusLabel,
  formatLastLogin,
} from "../../../utils";

interface UserStatusBadgeProps {
  user: {
    banned: boolean;
    banReason?: string | null;
    banExpires?: string | null;
    lastLogin?: string;
  };
  size?: "sm" | "md" | "lg";
  variant?: "solid" | "outline" | "subtle";
  className?: string;
  showDetails?: boolean;
  showLastLogin?: boolean;
}

/**
 * 📊 USER STATUS BADGE
 *
 * Features:
 * - ✅ Estados automáticos (activo/baneado)
 * - ✅ Colores y variantes consistentes
 * - ✅ Información adicional en tooltip
 * - ✅ Última conexión opcional
 * - ✅ Razón de ban si aplicable
 * - ✅ Accesibilidad completa
 */
export const UserStatusBadge = React.memo<UserStatusBadgeProps>(
  ({
    user,
    size = "md",
    variant = "solid",
    className,
    showDetails = false,
    showLastLogin = false,
  }) => {
    const statusColors = getUserStatusColor(user.banned);
    const statusLabel = getUserStatusLabel(user.banned);
    const statusIcon = user.banned ? "🚫" : "✅";

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
          return cn(statusColors.bg, statusColors.text);
        case "outline":
          return cn(
            "bg-transparent border",
            statusColors.border,
            statusColors.text
          );
        case "subtle":
          return cn(statusColors.bg.replace("-100", "-50"), statusColors.text);
        default:
          return cn(statusColors.bg, statusColors.text);
      }
    };

    // Build tooltip content
    const getTooltipContent = () => {
      const parts: string[] = [];

      parts.push(`Estado: ${statusLabel}`);

      if (user.banned && user.banReason) {
        parts.push(`Razón: ${user.banReason}`);
      }

      if (user.banned && user.banExpires) {
        const expirationDate = new Date(user.banExpires);
        parts.push(`Expira: ${expirationDate.toLocaleDateString("es-ES")}`);
      }

      if (showLastLogin && user.lastLogin) {
        parts.push(`Última conexión: ${formatLastLogin(user.lastLogin)}`);
      }

      return parts.join("\n");
    };

    // Base classes
    const baseClasses = cn(
      "inline-flex items-center gap-1.5 rounded-full font-medium whitespace-nowrap",
      sizeClasses[size],
      getVariantClasses(),
      className
    );

    const badge = (
      <span
        className={baseClasses}
        title={showDetails ? getTooltipContent() : statusLabel}
      >
        <span
          className="flex-shrink-0"
          role="img"
          aria-label={`Estado: ${statusLabel}`}
        >
          {statusIcon}
        </span>
        <span>{statusLabel}</span>
      </span>
    );

    // If showing details, wrap in a container with additional info
    if (showDetails && (user.banned || showLastLogin)) {
      return (
        <div className="flex flex-col gap-1">
          {badge}

          {/* Additional details */}
          <div className="text-xs text-gray-500">
            {user.banned && user.banReason && (
              <div className="truncate">
                <span className="font-medium">Razón:</span> {user.banReason}
              </div>
            )}

            {user.banned && user.banExpires && (
              <div>
                <span className="font-medium">Expira:</span>{" "}
                {new Date(user.banExpires).toLocaleDateString("es-ES")}
              </div>
            )}

            {showLastLogin && user.lastLogin && (
              <div>
                <span className="font-medium">Última conexión:</span>{" "}
                {formatLastLogin(user.lastLogin)}
              </div>
            )}

            {showLastLogin && !user.lastLogin && (
              <div className="text-gray-400">
                <span className="font-medium">Última conexión:</span> Nunca
              </div>
            )}
          </div>
        </div>
      );
    }

    return badge;
  }
);

UserStatusBadge.displayName = "UserStatusBadge";
