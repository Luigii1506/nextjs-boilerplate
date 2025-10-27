/**
 * 🎯 ADMIN HEADER COMPONENT
 * ========================
 *
 * Header component extraído del AdminLayout para mejor organización.
 * Contiene acciones del header, menú móvil y user menu.
 *
 * Features:
 * - ✅ Header actions memoizadas
 * - ✅ Mobile menu toggle
 * - ✅ Dark mode y i18n toggles
 * - ✅ User menu integrado
 * - ✅ Responsive design
 * - ✅ Accessibility compliant
 *
 * Created: 2025-01-18 - Extracted from AdminLayout
 */

"use client";

import React, { Suspense } from "react";
import { Menu } from "lucide-react";
import { cn } from "@/shared/utils";
import { UserMenu } from "./UserMenu";
import { DarkModeToggle, I18nToggle } from "@/shared/ui/components";
import type { SessionUser } from "@/shared/types/user";

// 🎯 Types
interface HeaderAction {
  id: string;
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  badge?: number;
  disabled?: boolean;
}

interface RoleColorScheme {
  bg: string;
  text: string;
  border: string;
  hover: string;
}

interface EnterpriseRoleInfo {
  name: string;
  description: string;
  level: "user" | "admin" | "super_admin";
  permissions: string[];
  icon: React.ReactNode;
  colorScheme: RoleColorScheme;
}

interface AdminHeaderProps {
  currentUser: SessionUser;
  roleInfo: EnterpriseRoleInfo;
  compact: boolean;
  sidebarOpen: boolean;
  onSidebarToggle: () => void;
  headerActions: HeaderAction[];
  handleProfileClick: () => void;
  handleSettings: () => void;
}

// 🎯 Responsive config
const RESPONSIVE_CONFIG = {
  header: {
    mobileMenuButton: "lg:hidden",
    desktopOnly: "hidden lg:flex",
  },
} as const;

/**
 * 🎯 AdminHeader Component
 */
export const AdminHeader: React.FC<AdminHeaderProps> = ({
  currentUser,
  roleInfo,
  sidebarOpen,
  onSidebarToggle,
  headerActions,
  handleProfileClick,
  handleSettings,
}) => {
  return (
    <header className="bg-white dark:bg-slate-800 shadow-sm border-b border-slate-200 dark:border-slate-700 z-10 transition-colors duration-300">
      <div className="px-3 py-2.5 sm:px-4 sm:py-3 lg:px-6 lg:py-4">
        <div className="flex items-center justify-between gap-2">
          {/* Left Side: Mobile Menu Button + Title */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            {/* Mobile Menu Button - Solo visible en mobile/tablet */}
            <button
              onClick={onSidebarToggle}
              className={cn(
                "flex-shrink-0 p-1.5 sm:p-2 text-slate-600 dark:text-slate-400",
                "hover:text-slate-900 dark:hover:text-slate-100",
                "hover:bg-slate-100 dark:hover:bg-slate-700",
                "rounded-lg transition-colors duration-200",
                RESPONSIVE_CONFIG.header.mobileMenuButton
              )}
              aria-label="Abrir menú de navegación"
              aria-expanded={sidebarOpen}
              aria-controls="mobile-sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Title - Oculto en mobile muy pequeño (<400px), visible en tablet */}
            <div className="hidden min-[400px]:block lg:hidden min-w-0">
              <h1 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-slate-100 truncate">
                Admin Dashboard
              </h1>
              <p className="hidden sm:block text-xs text-slate-600 dark:text-slate-400 truncate">
                Enterprise • React 19
              </p>
            </div>
          </div>

          {/* Right Side: Actions + User Menu */}
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            {/* Desktop Actions - Solo visible en desktop (≥1024px) */}
            <div
              className={cn(
                "items-center gap-2",
                RESPONSIVE_CONFIG.header.desktopOnly
              )}
            >
              {headerActions.map((action) => (
                <button
                  key={action.id}
                  onClick={action.onClick}
                  disabled={action.disabled}
                  className="relative p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors duration-200 disabled:opacity-50"
                  aria-label={action.label}
                >
                  {action.icon}
                  {action.badge && action.badge > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {action.badge > 9 ? "9+" : action.badge}
                    </span>
                  )}
                </button>
              ))}

              {/* 🌙 Dark Mode Toggle - Desktop only */}
              <DarkModeToggle size="md" variant="button" showTooltip={true} />

              {/* 🌍 Language Toggle - Desktop only */}
              <I18nToggle size="md" variant="button" showTooltip={true} />
            </div>

            {/* User Menu - Siempre visible pero compacto en mobile */}
            <Suspense
              fallback={
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse" />
              }
            >
              <UserMenu
                user={currentUser}
                roleInfo={roleInfo}
                showDropdown={true}
                onProfileClick={handleProfileClick}
                onSettings={handleSettings}
                compact={true} // Siempre compacto para ahorrar espacio
              />
            </Suspense>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
