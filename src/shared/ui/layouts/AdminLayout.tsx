/**
 * 🏛️ ADMIN LAYOUT
 * ================
 *
 * Layout estándar para administración.
 * Optimizado para Next.js 15 y React 19.
 *
 * Standard: 2025-01-17 - Clean admin layout
 */

import React, { Suspense } from "react";
import { Settings, Bell, Search, Menu, X } from "lucide-react";
import { cn } from "@/shared/utils";
import Navigation from "./components/Navigation";
import { UserMenu, ROLE_CONFIGS } from "./components/UserMenu";
import { LogoutButton } from "./components/LogoutButton";
import type { SessionUser } from "@/shared/types/user";

// 🎯 Enterprise Configuration
const ENTERPRISE_SHELL_CONFIG = {
  layout: {
    sidebarWidth: {
      desktop: "w-64",
      tablet: "w-56",
      mobile: "w-full",
    },
    headerHeight: "h-16",
    contentMaxWidth: "max-w-7xl",
    contentPadding: {
      desktop: "p-8",
      tablet: "p-6",
      mobile: "p-4",
    },
  },
  breakpoints: {
    mobile: "lg:hidden",
    tablet: "md:block lg:hidden",
    desktop: "lg:block",
  },
  animation: {
    duration: "duration-300",
    easing: "ease-in-out",
  },
  debug: process.env.NODE_ENV === "development",
} as const;

// 🎯 Responsive breakpoint utilities
const RESPONSIVE_CONFIG = {
  sidebar: {
    desktop: "hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0",
    mobile: "lg:hidden",
  },
  mainContent: {
    desktop: "lg:pl-64",
    mobile: "pl-0",
  },
  header: {
    mobileMenuButton: "lg:hidden",
    desktopOnly: "hidden lg:flex",
  },
} as const;

// 🎯 Layout Types
interface AdminLayoutProps {
  user: SessionUser;
  children: React.ReactNode;
  isAdmin: boolean;
  isSuperAdmin?: boolean;
  sidebarOpen?: boolean;
  onSidebarToggle?: () => void;
  onSearch?: () => void;
  onNotifications?: () => void;
  onSettings?: () => void;
  onProfileClick?: () => void;
  onThemeToggle?: () => void;
  isDarkMode?: boolean;
  isLoading?: boolean;
  debug?: boolean;
  compact?: boolean;
}

interface HeaderAction {
  id: string;
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  badge?: number;
  disabled?: boolean;
}

// 🎯 Loading Components
function HeaderSkeleton() {
  return (
    <header className="bg-white shadow-sm border-b border-slate-200">
      <div className="px-4 lg:px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 bg-slate-200 rounded-lg animate-pulse"></div>
            <div>
              <div className="h-5 w-32 bg-slate-200 rounded animate-pulse mb-1"></div>
              <div className="h-4 w-48 bg-slate-200 rounded animate-pulse"></div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-slate-200 rounded-lg animate-pulse"></div>
            <div className="w-9 h-9 bg-slate-200 rounded-lg animate-pulse"></div>
            <div className="w-9 h-9 bg-slate-200 rounded-lg animate-pulse"></div>
            <div className="w-24 h-10 bg-slate-200 rounded-lg animate-pulse"></div>
          </div>
        </div>
      </div>
    </header>
  );
}

/**
 * 🏗️ ADMIN LAYOUT
 *
 * Features:
 * - ✅ Responsive design (mobile/tablet/desktop)
 * - ✅ Performance optimized with Suspense
 * - ✅ Role-based navigation
 * - ✅ Loading states
 * - ✅ Accessibility compliance (ARIA)
 * - ✅ Theme support ready
 */
export default function AdminLayout({
  user,
  children,
  sidebarOpen = false,
  onSidebarToggle,
  onSearch,
  onNotifications,
  onSettings,
  onProfileClick,
  onThemeToggle,
  isDarkMode = false,
  isLoading = false,
  debug = ENTERPRISE_SHELL_CONFIG.debug,
  compact = false,
}: AdminLayoutProps) {
  // 🎯 Enterprise role integration
  const enterpriseRoleInfo = React.useMemo(() => {
    const userRole = user.role || "user";
    const roleConfig = ROLE_CONFIGS[userRole];

    // Ensure we always have a valid role config
    if (!roleConfig) {
      console.warn(
        `Role '${userRole}' not found in ROLE_CONFIGS, falling back to 'user'`
      );
      // Final fallback if even 'user' doesn't exist
      return (
        ROLE_CONFIGS.user || {
          name: "Usuario",
          description: "Usuario estándar",
          level: "user" as const,
          permissions: ["read"],
          icon: React.createElement("span", null, "👤"),
          colorScheme: {
            bg: "bg-blue-100",
            text: "text-blue-700",
            border: "border-blue-200",
            hover: "hover:bg-blue-200",
          },
        }
      );
    }

    return roleConfig;
  }, [user.role]);

  // 🎯 Header actions configuration
  const headerActions = React.useMemo(
    (): HeaderAction[] => [
      {
        id: "search",
        icon: <Search className="w-5 h-5" />,
        label: "Buscar",
        onClick: onSearch,
      },
      {
        id: "notifications",
        icon: <Bell className="w-5 h-5" />,
        label: "Notificaciones",
        onClick: onNotifications,
        badge: 3, // TODO: Get from notifications service
      },
      {
        id: "settings",
        icon: <Settings className="w-5 h-5" />,
        label: "Configuración",
        onClick: onSettings,
      },
    ],
    [onSearch, onNotifications, onSettings]
  );

  // 🎯 Loading state
  if (isLoading) {
    return (
      <div className="h-screen flex bg-slate-50">
        {/* Sidebar skeleton */}
        <aside className="hidden lg:flex lg:w-64 lg:flex-col bg-white border-r border-slate-200">
          <div className="h-full px-3 pb-4 bg-white">
            <div className="p-4 mb-6 bg-slate-50 rounded-lg animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 w-24 bg-slate-200 rounded mb-2"></div>
                  <div className="h-3 w-16 bg-slate-200 rounded"></div>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-10 bg-slate-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </aside>

        {/* Main content skeleton */}
        <div className="flex-1 flex flex-col">
          <HeaderSkeleton />
          <main className="flex-1 p-8">
            <div className="max-w-7xl mx-auto">
              <div className="h-64 bg-slate-200 rounded-lg animate-pulse"></div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-slate-50">
      {/* 📋 Desktop Sidebar - Fixed */}
      <aside
        className={cn(
          "bg-white border-r border-slate-200 flex-col",
          RESPONSIVE_CONFIG.sidebar.desktop
        )}
        aria-label="Navegación principal"
      >
        <div className="flex-1 px-3 py-4 overflow-y-auto">
          {/* Logo Section */}
          <div className="p-4 mb-6 bg-slate-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
                A
              </div>
              <div>
                <h2 className="text-sm font-semibold text-slate-900">
                  Admin Dashboard
                </h2>
                <p className="text-xs text-slate-600">Enterprise</p>
              </div>
            </div>
          </div>

          {/* ⚡ Simple Navigation */}
          <Suspense
            fallback={
              <div className="animate-pulse">Cargando navegación...</div>
            }
          >
            <Navigation
              userRole={
                (user.role as "user" | "admin" | "super_admin") || "user"
              }
            />
          </Suspense>

          {/* Logout - Always at bottom */}
          <div className="mt-8 pt-4 border-t border-slate-200">
            <LogoutButton />
          </div>
        </div>
      </aside>

      {/* 📱 Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 z-20 bg-slate-900 bg-opacity-50 lg:hidden"
            onClick={onSidebarToggle}
            aria-hidden="true"
          />
          <aside
            className={cn(
              "fixed top-0 left-0 z-30 h-full w-64 bg-white border-r border-slate-200 transform transition-transform duration-300",
              RESPONSIVE_CONFIG.sidebar.mobile,
              sidebarOpen ? "translate-x-0" : "-translate-x-full"
            )}
            aria-label="Navegación principal móvil"
          >
            <div className="flex-1 px-3 py-4 overflow-y-auto">
              {/* Mobile Header */}
              <div className="flex items-center justify-between p-4 mb-6 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                    A
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-slate-900">
                      Admin
                    </h2>
                    <p className="text-xs text-slate-600">Dashboard</p>
                  </div>
                </div>
                <button
                  onClick={onSidebarToggle}
                  className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
                  aria-label="Cerrar menú"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Mobile User Info */}
              <div className="p-4 mb-6 bg-slate-50 rounded-lg">
                <UserMenu
                  user={user}
                  roleInfo={enterpriseRoleInfo}
                  showDropdown={false}
                  compact={true}
                />
              </div>

              {/* Navigation */}
              <Suspense
                fallback={
                  <div className="animate-pulse">Cargando navegación...</div>
                }
              >
                <Navigation
                  userRole={
                    (user.role as "user" | "admin" | "super_admin") || "user"
                  }
                />
              </Suspense>

              {/* Logout */}
              <div className="mt-8 pt-4 border-t border-slate-200">
                <LogoutButton />
              </div>
            </div>
          </aside>
        </>
      )}

      {/* 📄 Main Content Area */}
      <div
        className={cn(
          "flex-1 flex flex-col",
          RESPONSIVE_CONFIG.mainContent.desktop,
          RESPONSIVE_CONFIG.mainContent.mobile
        )}
      >
        {/* 📱 Header */}
        <header className="bg-white shadow-sm border-b border-slate-200 z-10">
          <div className="px-4 lg:px-6 py-4">
            <div className="flex items-center justify-between">
              {/* Mobile Menu Button + Title */}
              <div className="flex items-center gap-4">
                <button
                  onClick={onSidebarToggle}
                  className={cn(
                    "p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors",
                    RESPONSIVE_CONFIG.header.mobileMenuButton
                  )}
                  aria-label="Abrir menú de navegación"
                >
                  <Menu className="w-5 h-5" />
                </button>

                <div className="lg:hidden">
                  <h1 className="text-lg font-semibold text-slate-900">
                    Admin Dashboard
                  </h1>
                  <p className="text-xs text-slate-600">
                    Enterprise • React 19
                  </p>
                </div>
              </div>

              {/* Header Actions */}
              <div className="flex items-center gap-2 lg:gap-4">
                {/* Desktop Actions */}
                <div
                  className={cn(
                    "items-center gap-3",
                    RESPONSIVE_CONFIG.header.desktopOnly
                  )}
                >
                  {headerActions.map((action) => (
                    <button
                      key={action.id}
                      onClick={action.onClick}
                      disabled={action.disabled}
                      className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
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
                </div>

                {/* User Menu - Always visible */}
                <Suspense
                  fallback={
                    <div className="w-10 h-10 bg-slate-200 rounded-full animate-pulse"></div>
                  }
                >
                  <UserMenu
                    user={user}
                    roleInfo={enterpriseRoleInfo}
                    showDropdown={true}
                    onProfileClick={onProfileClick}
                    onSettings={onSettings}
                    onThemeToggle={onThemeToggle}
                    isDarkMode={isDarkMode}
                    compact={compact}
                    debug={debug}
                  />
                </Suspense>
              </div>
            </div>
          </div>
        </header>

        {/* 📄 Main Content */}
        <main className="flex-1 overflow-auto">
          <div
            className={cn(
              "h-full",
              compact
                ? "p-4"
                : ENTERPRISE_SHELL_CONFIG.layout.contentPadding.desktop
            )}
          >
            <div
              className={cn(
                ENTERPRISE_SHELL_CONFIG.layout.contentMaxWidth,
                "mx-auto h-full"
              )}
            >
              <Suspense
                fallback={
                  <div className="h-64 bg-slate-200 rounded-lg animate-pulse flex items-center justify-center">
                    <span className="text-slate-500">
                      Cargando contenido...
                    </span>
                  </div>
                }
              >
                {children}
              </Suspense>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

// 🚀 Export configuration for reuse
export { ENTERPRISE_SHELL_CONFIG, RESPONSIVE_CONFIG };
export type { AdminLayoutProps, HeaderAction };
