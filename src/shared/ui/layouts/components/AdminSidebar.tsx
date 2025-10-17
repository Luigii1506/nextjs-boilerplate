/**
 * 🎯 ADMIN SIDEBAR COMPONENT
 * ==========================
 *
 * Sidebar component extraído del AdminLayout para mejor organización.
 * Contiene navegación principal, logo y logout button.
 *
 * Features:
 * - ✅ Memoized navigation
 * - ✅ Logo section
 * - ✅ Logout button
 * - ✅ Loading skeletons
 * - ✅ Dark mode support
 * - ✅ Accessibility compliant
 *
 * Created: 2025-01-18 - Extracted from AdminLayout
 * Updated: 2025-01-18 - Fixed hydration issue
 * Fixed: 2025-01-17 - Removed dynamic import to fix chunk loading error
 */

"use client";

import React, { Suspense } from "react";
import { cn } from "@/shared/utils";
import { LogoutButton } from "./LogoutButton";
import Navigation from "./Navigation";
import type { UserRole } from "@/core/navigation";

// 🎯 Types
interface AdminSidebarProps {
  userRole: UserRole;
  className?: string;
  ariaLabel?: string;
  ariaControls?: string;
}

// 🎯 Loading skeleton component
const NavigationSkeleton = () => (
  <nav className="mt-8 space-y-6" suppressHydrationWarning>
    <div
      className="animate-pulse space-y-3"
      role="status"
      aria-label="Cargando navegación"
    >
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="h-10 bg-slate-200 dark:bg-slate-600 rounded-lg animate-pulse"
        />
      ))}
    </div>
  </nav>
);

/**
 * 🎯 AdminSidebar Component
 */
export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  userRole,
  className,
  ariaLabel = "Navegación principal del panel administrativo",
  ariaControls = "main-content",
}) => {
  return (
    <aside
      className={cn(
        "bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex-col transition-colors duration-300",
        className
      )}
      aria-label={ariaLabel}
      aria-controls={ariaControls}
      role="complementary"
      suppressHydrationWarning // Suppress hydration warnings for this component
    >
      {/* Screen reader description */}
      <div id="sidebar-description" className="sr-only">
        Navegación principal del panel administrativo. Use Tab para navegar
        entre elementos o presione Cmd+/ para alternar la barra lateral.
      </div>

      <div className="flex-1 px-3 py-4 overflow-y-auto">
        {/* Logo Section */}
        <div className="p-4 mb-6 bg-slate-50 dark:bg-slate-700 rounded-lg transition-colors duration-300">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold"
              role="img"
              aria-label="Logo del admin dashboard"
            >
              A
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Admin Dashboard
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Enterprise
              </p>
            </div>
          </div>
        </div>

        {/* ⚡ Navigation with Suspense boundary */}
        <Suspense fallback={<NavigationSkeleton />}>
          <Navigation userRole={userRole} />
        </Suspense>

        {/* Logout - Always at bottom */}
        <div className="mt-8 pt-4 border-t border-slate-200 dark:border-slate-600">
          <LogoutButton />
        </div>
      </div>
    </aside>
  );
};

export default AdminSidebar;
