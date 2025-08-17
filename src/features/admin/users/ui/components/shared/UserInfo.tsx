/**
 * 👤 USER INFO SHARED COMPONENT
 * =============================
 *
 * Componente compuesto para mostrar información completa de usuario
 *
 * Updated: 2025-01-17 - Enterprise patterns v2.0
 */

import React from "react";
import { cn } from "@/shared/utils";
import { UserAvatar } from "./UserAvatar";
import { UserRoleBadge } from "./UserRoleBadge";
import { UserStatusBadge } from "./UserStatusBadge";
import { formatUserDate, getUserDisplayName } from "../../../utils";
import type { User } from "../../../types";

interface UserInfoProps {
  user: User;
  layout?: "horizontal" | "vertical" | "compact";
  showAvatar?: boolean;
  showRole?: boolean;
  showStatus?: boolean;
  showEmail?: boolean;
  showDates?: boolean;
  showLastLogin?: boolean;
  avatarSize?: "sm" | "md" | "lg" | "xl";
  className?: string;
  clickable?: boolean;
  onUserClick?: (user: User) => void;
  onAvatarClick?: (user: User) => void;
  priority?: boolean; // Para optimización de imágenes
}

/**
 * 👤 USER INFO
 *
 * Features:
 * - ✅ Layout flexible (horizontal, vertical, compact)
 * - ✅ Componentes modulares (avatar, rol, status)
 * - ✅ Información configurable
 * - ✅ Clickable opcional
 * - ✅ Responsive design
 * - ✅ Accesibilidad completa
 */
export const UserInfo = React.memo<UserInfoProps>(
  ({
    user,
    layout = "horizontal",
    showAvatar = true,
    showRole = true,
    showStatus = true,
    showEmail = true,
    showDates = false,
    showLastLogin = false,
    avatarSize = "md",
    className,
    clickable = false,
    onUserClick,
    onAvatarClick,
    priority = false,
  }) => {
    const displayName = getUserDisplayName(user);

    // Layout classes
    const getLayoutClasses = () => {
      switch (layout) {
        case "horizontal":
          return "flex items-center gap-3";
        case "vertical":
          return "flex flex-col items-center gap-2 text-center";
        case "compact":
          return "flex items-center gap-2";
        default:
          return "flex items-center gap-3";
      }
    };

    // Content classes based on layout
    const getContentClasses = () => {
      switch (layout) {
        case "horizontal":
          return "flex-1 min-w-0";
        case "vertical":
          return "w-full";
        case "compact":
          return "flex-1 min-w-0";
        default:
          return "flex-1 min-w-0";
      }
    };

    // Base classes
    const baseClasses = cn(
      getLayoutClasses(),
      clickable &&
        "cursor-pointer hover:bg-gray-50 rounded-lg p-2 -m-2 transition-colors",
      className
    );

    const handleUserClick = () => {
      if (clickable && onUserClick) {
        onUserClick(user);
      }
    };

    const handleAvatarClick = () => {
      if (onAvatarClick) {
        onAvatarClick(user);
      }
    };

    return (
      <div
        className={baseClasses}
        onClick={handleUserClick}
        role={clickable ? "button" : undefined}
        tabIndex={clickable ? 0 : undefined}
        onKeyDown={
          clickable
            ? (e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleUserClick();
                }
              }
            : undefined
        }
      >
        {/* Avatar */}
        {showAvatar && (
          <UserAvatar
            user={user}
            size={avatarSize}
            onClick={onAvatarClick ? () => handleAvatarClick() : undefined}
            priority={priority}
          />
        )}

        {/* User Details */}
        <div className={getContentClasses()}>
          {/* Name and Email */}
          <div
            className={cn(
              layout === "compact" ? "flex items-center gap-2" : "space-y-1"
            )}
          >
            <h3
              className={cn(
                "font-medium text-gray-900 truncate",
                layout === "compact" ? "text-sm" : "text-base"
              )}
            >
              {displayName}
            </h3>

            {showEmail && user.email !== displayName && (
              <p
                className={cn(
                  "text-gray-500 truncate",
                  layout === "compact" ? "text-xs" : "text-sm"
                )}
              >
                {user.email}
              </p>
            )}
          </div>

          {/* Badges */}
          {(showRole || showStatus) && (
            <div
              className={cn(
                "flex gap-2",
                layout === "vertical" ? "justify-center" : "justify-start",
                layout === "compact" ? "mt-1" : "mt-2"
              )}
            >
              {showRole && (
                <UserRoleBadge
                  role={user.role}
                  size={layout === "compact" ? "sm" : "md"}
                  variant="subtle"
                />
              )}

              {showStatus && (
                <UserStatusBadge
                  user={user}
                  size={layout === "compact" ? "sm" : "md"}
                  variant="subtle"
                  showLastLogin={showLastLogin}
                />
              )}
            </div>
          )}

          {/* Additional Information */}
          {(showDates || showLastLogin) && (
            <div
              className={cn(
                "text-xs text-gray-500 space-y-1",
                layout === "compact" ? "mt-1" : "mt-2"
              )}
            >
              {showDates && (
                <div className="flex flex-col sm:flex-row sm:gap-4">
                  <span>
                    <strong>Creado:</strong> {formatUserDate(user.createdAt)}
                  </span>

                  {user.updatedAt !== user.createdAt && (
                    <span>
                      <strong>Actualizado:</strong>{" "}
                      {formatUserDate(user.updatedAt)}
                    </span>
                  )}
                </div>
              )}

              {showLastLogin && user.lastLogin && (
                <div>
                  <strong>Última conexión:</strong>{" "}
                  {formatUserDate(user.lastLogin)}
                </div>
              )}
            </div>
          )}

          {/* Email Verification Status */}
          {!user.emailVerified && (
            <div className="mt-2">
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">
                <span role="img" aria-label="Email no verificado">
                  ⚠️
                </span>
                Email no verificado
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }
);

UserInfo.displayName = "UserInfo";
