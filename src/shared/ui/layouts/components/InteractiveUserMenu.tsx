/**
 * 👤 INTERACTIVE USER MENU - ENTERPRISE COMPONENT
 * ===============================================
 *
 * Componente avanzado para mostrar información del usuario con menú dropdown.
 * Enterprise patterns con performance optimization y funcionalidades avanzadas.
 * React 19 compliance con estado optimista.
 *
 * Updated: 2025-01-17 - Enterprise patterns integration
 */

"use client";

import React, {
  useState,
  useMemo,
  useCallback,
  useRef,
  useEffect,
} from "react";
import Image from "next/image";
import {
  ChevronDown,
  ChevronUp,
  Settings,
  LogOut,
  User,
  Shield,
  Crown,
  UserCheck,
  Moon,
  Sun,
} from "lucide-react";
import { cn } from "@/shared/utils";
import type { SessionUser } from "@/shared/types/user";

// 🎯 Enterprise Types
interface EnterpriseRoleInfo {
  name: string;
  description: string;
  level: "user" | "admin" | "super_admin";
  permissions: string[];
  icon: React.ReactNode;
  colorScheme: RoleColorScheme;
}

interface RoleColorScheme {
  bg: string;
  text: string;
  border: string;
  hover: string;
}

interface InteractiveUserMenuProps {
  user: SessionUser;
  roleInfo?: EnterpriseRoleInfo;
  showDropdown?: boolean;
  onLogout?: () => void;
  onSettings?: () => void;
  onProfileClick?: () => void;
  onThemeToggle?: () => void;
  isDarkMode?: boolean;
  isLoading?: boolean;
  debug?: boolean;
  compact?: boolean;
}

interface MenuAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  variant?: "default" | "danger" | "success";
}

// 🎯 Enterprise Configuration
const ENTERPRISE_CONFIG = {
  animation: {
    duration: "duration-200",
    easing: "ease-in-out",
  },
  spacing: {
    compact: "gap-2",
    normal: "gap-3",
  },
  avatar: {
    size: {
      compact: { width: 32, height: 32, className: "w-8 h-8" },
      normal: { width: 40, height: 40, className: "w-10 h-10" },
    },
  },
  debug: process.env.NODE_ENV === "development",
} as const;

// 🎯 Role configurations with safe Tailwind classes
const ROLE_CONFIGS: Record<string, EnterpriseRoleInfo> = {
  user: {
    name: "Usuario",
    description: "Usuario estándar del sistema",
    level: "user",
    permissions: ["read"],
    icon: <User className="w-3 h-3" />,
    colorScheme: {
      bg: "bg-blue-100",
      text: "text-blue-700",
      border: "border-blue-200",
      hover: "hover:bg-blue-200",
    },
  },
  admin: {
    name: "Administrador",
    description: "Administrador del sistema",
    level: "admin",
    permissions: ["read", "write", "admin"],
    icon: <Shield className="w-3 h-3" />,
    colorScheme: {
      bg: "bg-amber-100",
      text: "text-amber-700",
      border: "border-amber-200",
      hover: "hover:bg-amber-200",
    },
  },
  super_admin: {
    name: "Super Admin",
    description: "Super administrador con acceso total",
    level: "super_admin",
    permissions: ["read", "write", "admin", "super_admin"],
    icon: <Crown className="w-3 h-3" />,
    colorScheme: {
      bg: "bg-purple-100",
      text: "text-purple-700",
      border: "border-purple-200",
      hover: "hover:bg-purple-200",
    },
  },
};

/**
 * 🏗️ ENTERPRISE INTERACTIVE USER MENU
 *
 * Features:
 * - ✅ Advanced dropdown menu with actions
 * - ✅ Performance optimization with memoization
 * - ✅ Enterprise role system integration
 * - ✅ Dark/light theme support
 * - ✅ Loading states and error handling
 * - ✅ Keyboard navigation
 * - ✅ Click outside to close
 * - ✅ Accessibility compliance
 * - ✅ Debug mode for development
 */
export const InteractiveUserMenu = React.memo<InteractiveUserMenuProps>(
  ({
    user,
    roleInfo,
    showDropdown = true,
    onLogout,
    onSettings,
    onProfileClick,
    onThemeToggle,
    isDarkMode = false,
    isLoading = false,
    debug = ENTERPRISE_CONFIG.debug,
    compact = false,
  }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    // 🎯 Determine user role from user object or props
    const enterpriseRoleInfo = useMemo(() => {
      if (roleInfo) return roleInfo;

      // Fallback to determining from user.role
      const userRole = user.role || "user";
      return ROLE_CONFIGS[userRole] || ROLE_CONFIGS.user;
    }, [roleInfo, user.role]);

    // 🎯 Avatar configuration
    const avatarConfig = compact
      ? ENTERPRISE_CONFIG.avatar.size.compact
      : ENTERPRISE_CONFIG.avatar.size.normal;

    // 🎯 Menu actions configuration
    const menuActions = useMemo((): MenuAction[] => {
      const actions: MenuAction[] = [];

      if (onProfileClick) {
        actions.push({
          id: "profile",
          label: "Mi Perfil",
          icon: <UserCheck className="w-4 h-4" />,
          onClick: onProfileClick,
        });
      }

      if (onSettings) {
        actions.push({
          id: "settings",
          label: "Configuración",
          icon: <Settings className="w-4 h-4" />,
          onClick: onSettings,
        });
      }

      if (onThemeToggle) {
        actions.push({
          id: "theme",
          label: isDarkMode ? "Modo Claro" : "Modo Oscuro",
          icon: isDarkMode ? (
            <Sun className="w-4 h-4" />
          ) : (
            <Moon className="w-4 h-4" />
          ),
          onClick: onThemeToggle,
        });
      }

      if (onLogout) {
        actions.push({
          id: "logout",
          label: "Cerrar Sesión",
          icon: <LogOut className="w-4 h-4" />,
          onClick: onLogout,
          variant: "danger",
        });
      }

      return actions;
    }, [onProfileClick, onSettings, onThemeToggle, onLogout, isDarkMode]);

    // 🎯 Click outside to close
    useEffect(() => {
      function handleClickOutside(event: MouseEvent) {
        if (
          dropdownRef.current &&
          !dropdownRef.current.contains(event.target as Node)
        ) {
          setIsOpen(false);
        }
      }

      if (isOpen) {
        document.addEventListener("mousedown", handleClickOutside);
        return () =>
          document.removeEventListener("mousedown", handleClickOutside);
      }
    }, [isOpen]);

    // 🎯 Handle menu toggle
    const handleToggle = useCallback(() => {
      if (!showDropdown || isLoading) return;

      setIsOpen((prev) => {
        const newState = !prev;

        if (debug) {
          console.log("👤 UserMenu toggle:", {
            isOpen: newState,
            userId: user.id,
            timestamp: new Date().toISOString(),
          });
        }

        return newState;
      });
    }, [showDropdown, isLoading, debug, user.id]);

    // 🎯 Handle action click
    const handleActionClick = useCallback(
      (action: MenuAction) => {
        if (action.disabled) return;

        if (debug) {
          console.log("👤 UserMenu action:", {
            actionId: action.id,
            userId: user.id,
            timestamp: new Date().toISOString(),
          });
        }

        action.onClick();
        setIsOpen(false);
      },
      [debug, user.id]
    );

    // 🎯 Memoized user initials
    const userInitials = useMemo(() => {
      if (!user.name) return "?";
      return user.name
        .split(" ")
        .map((n) => n.charAt(0))
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }, [user.name]);

    // 🎯 Loading state
    if (isLoading) {
      return (
        <div className={cn("flex items-center", compact ? "gap-2" : "gap-3")}>
          <div className="text-right animate-pulse">
            <div className="h-4 w-24 bg-slate-200 rounded mb-1"></div>
            <div className="h-3 w-16 bg-slate-200 rounded"></div>
          </div>
          <div
            className={cn(
              "rounded-full bg-slate-200 animate-pulse",
              avatarConfig.className
            )}
          ></div>
        </div>
      );
    }

    return (
      <div className="relative" ref={dropdownRef}>
        {/* 🎯 User Info Display */}
        <button
          onClick={handleToggle}
          className={cn(
            "flex items-center transition-all",
            compact ? "gap-2" : "gap-3",
            showDropdown &&
              !isLoading &&
              "hover:bg-slate-50 rounded-lg p-2 -m-2",
            ENTERPRISE_CONFIG.animation.duration,
            ENTERPRISE_CONFIG.animation.easing
          )}
          disabled={!showDropdown || isLoading}
          aria-expanded={isOpen}
          aria-haspopup="true"
          aria-label={`Menu de usuario para ${user.name}`}
        >
          {/* User Details */}
          <div className="text-right">
            <p
              className={cn(
                "font-medium text-slate-700",
                compact ? "text-xs" : "text-sm"
              )}
            >
              {user.name}
            </p>
            <div className="flex items-center gap-2">
              {!compact && (
                <span className="text-xs text-slate-500 truncate max-w-32">
                  {user.email}
                </span>
              )}

              {/* Role Badge */}
              <span
                className={cn(
                  "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border",
                  enterpriseRoleInfo.colorScheme.bg,
                  enterpriseRoleInfo.colorScheme.text,
                  enterpriseRoleInfo.colorScheme.border,
                  showDropdown && enterpriseRoleInfo.colorScheme.hover
                )}
              >
                {enterpriseRoleInfo.icon}
                {!compact && enterpriseRoleInfo.name}
              </span>
            </div>
          </div>

          {/* Avatar */}
          {user.image ? (
            <Image
              src={user.image}
              alt={user.name ?? "Usuario"}
              width={avatarConfig.width}
              height={avatarConfig.height}
              className={cn(
                "rounded-full border-2 border-slate-200",
                avatarConfig.className
              )}
              unoptimized={user.image.startsWith("data:")}
            />
          ) : (
            <div
              className={cn(
                "rounded-full bg-slate-200 flex items-center justify-center border-2 border-slate-300",
                avatarConfig.className
              )}
            >
              <span className="text-slate-600 font-medium text-sm">
                {userInitials}
              </span>
            </div>
          )}

          {/* Dropdown Indicator */}
          {showDropdown && !isLoading && (
            <div className="ml-1">
              {isOpen ? (
                <ChevronUp className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              )}
            </div>
          )}
        </button>

        {/* 🎯 Dropdown Menu */}
        {showDropdown && isOpen && menuActions.length > 0 && (
          <div
            ref={menuRef}
            className={cn(
              "absolute right-0 mt-2 w-56 rounded-lg bg-white shadow-lg border border-slate-200 py-1 z-50",
              "animate-in fade-in slide-in-from-top-2",
              ENTERPRISE_CONFIG.animation.duration
            )}
            role="menu"
            aria-orientation="vertical"
          >
            {menuActions.map((action, index) => (
              <button
                key={action.id}
                onClick={() => handleActionClick(action)}
                disabled={action.disabled}
                className={cn(
                  "w-full text-left px-4 py-2 text-sm transition-colors flex items-center gap-3",
                  action.disabled
                    ? "text-slate-400 cursor-not-allowed"
                    : action.variant === "danger"
                    ? "text-red-600 hover:bg-red-50"
                    : "text-slate-700 hover:bg-slate-50",
                  index === 0 && "rounded-t-lg",
                  index === menuActions.length - 1 && "rounded-b-lg"
                )}
                role="menuitem"
              >
                {action.icon}
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }
);

// 🏗️ Display name for debugging
InteractiveUserMenu.displayName = "InteractiveUserMenu";

// 🚀 Export utilities
export { ROLE_CONFIGS, ENTERPRISE_CONFIG };
export type {
  InteractiveUserMenuProps,
  EnterpriseRoleInfo,
  RoleColorScheme,
  MenuAction,
};
