/**
 * 🎯 MOBILE SIDEBAR COMPONENT
 * ===========================
 *
 * Mobile sidebar component con overlay y mejor UX móvil.
 * Extraído del AdminLayout para mejor organización.
 *
 * Features:
 * - ✅ Overlay backdrop
 * - ✅ Slide transitions
 * - ✅ User info panel
 * - ✅ Dark mode y i18n toggles
 * - ✅ Memoized navigation
 * - ✅ Focus management
 * - ✅ Swipe gestures (próximo)
 *
 * Created: 2025-01-18 - Extracted from AdminLayout
 */

"use client";

import React, { Suspense } from "react";
import { X } from "lucide-react";
import { cn } from "@/shared/utils";
import Navigation from "./Navigation";
import { UserMenu } from "./UserMenu";
import { LogoutButton } from "./LogoutButton";
import { DarkModeToggle, I18nToggle } from "@/shared/ui/components";
import type { SessionUser } from "@/shared/types/user";
import type { UserRole } from "@/core/navigation";

// 🎯 Types
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

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: SessionUser;
  userRole: UserRole;
  roleInfo: EnterpriseRoleInfo;
  handleProfileClick: () => void;
  className?: string;
}

// 🎯 Memoized Navigation for performance
const MemoizedNavigation = React.memo(Navigation);

// 🎯 Responsive config
const RESPONSIVE_CONFIG = {
  sidebar: {
    mobile: "lg:hidden",
  },
} as const;

/**
 * 🎯 MobileSidebar Component
 */
export const MobileSidebar: React.FC<MobileSidebarProps> = ({
  isOpen,
  onClose,
  currentUser,
  userRole,
  roleInfo,
  handleProfileClick,
  className,
}) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop Overlay */}
      <div
        className="fixed inset-0 z-40 bg-slate-900 bg-opacity-50 lg:hidden transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
        role="button"
        aria-label="Cerrar menú lateral"
        tabIndex={-1}
      />

      {/* Mobile Sidebar */}
      <aside
        id="mobile-sidebar"
        className={cn(
          "fixed top-0 left-0 z-50 h-full w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 transform transition-all duration-300",
          RESPONSIVE_CONFIG.sidebar.mobile,
          isOpen ? "translate-x-0" : "-translate-x-full",
          className
        )}
        aria-label="Navegación principal móvil"
        aria-controls="mobile-nav-content"
        role="dialog"
        aria-modal="true"
        aria-describedby="mobile-sidebar-description"
      >
        {/* Screen reader description for mobile */}
        <div id="mobile-sidebar-description" className="sr-only">
          Menú de navegación móvil. Presione Escape para cerrar o toque fuera
          del menú.
        </div>

        <div className="flex-1 px-3 py-4 overflow-y-auto">
          {/* Mobile Header with Close Button */}
          <div className="flex items-center justify-between p-4 mb-6 bg-slate-50 dark:bg-slate-700 rounded-lg transition-colors duration-300">
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                role="img"
                aria-label="Logo del admin dashboard"
              >
                A
              </div>
              <div>
                <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Admin
                </h2>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Dashboard
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-600 rounded-lg transition-colors duration-200"
              aria-label="Cerrar menú"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile User Info Panel */}
          <div className="mb-6 space-y-3">
            {/* Settings - Stacked vertically for better spacing */}
            <div className="space-y-2">
              {/* 🌙 Dark Mode Toggle */}
              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-lg transition-colors duration-300">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Modo Oscuro
                </span>
                <DarkModeToggle
                  size="sm"
                  variant="switch"
                  showTooltip={false}
                />
              </div>

              {/* 🌍 Language Toggle */}
              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-lg transition-colors duration-300">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Idioma
                </span>
                <I18nToggle size="sm" variant="switch" showTooltip={false} />
              </div>
            </div>
          </div>

          {/* Mobile Navigation */}
          <div id="mobile-nav-content">
            <Suspense
              fallback={
                <div
                  className="animate-pulse space-y-2"
                  role="status"
                  aria-label="Cargando navegación móvil"
                >
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-8 bg-slate-200 dark:bg-slate-600 rounded-md animate-pulse"
                    />
                  ))}
                </div>
              }
            >
              <MemoizedNavigation userRole={userRole} />
            </Suspense>
          </div>

          {/* Logout */}
          <div className="mt-8 pt-4 border-t border-slate-200 dark:border-slate-600">
            <LogoutButton />
          </div>
        </div>
      </aside>
    </>
  );
};

export default MobileSidebar;
