/**
 * 👥 USERS SPA SCREEN
 * ==================
 *
 * Single Page Application completa para Users Management
 * Navegación por tabs internos con estado compartido y transiciones smooth
 * Siguiendo EXACTAMENTE el patrón de InventoryContext
 *
 * Created: 2025-01-18 - Users SPA Implementation
 * Pattern: Strictly following InventoryContext architecture
 * Fixed: 2025-01-17 - True SPA behavior - tabs no longer re-mount when switching
 */

"use client";

// Import custom animations
import "../styles/animations.css";

import React, { useMemo } from "react";
import {
  BarChart3,
  Users,
  Shield,
  Eye,
  FileText,
  Key,
  UserCheck,
} from "lucide-react";
import { cn } from "@/shared/utils";
import {
  UsersProvider,
  useUsersContext,
  USERS_TABS,
  type TabId,
} from "../../context";
import { ReusableTabs, type TabItem } from "@/shared/ui/components";
import { useScrollHeader } from "@/shared/hooks";
import {
  OverviewTab,
  AllUsersTab,
  AdminsTab,
  AnalyticsTab,
  AuditTab,
} from "../components/tabs";

// 🎨 Icon mapping for tabs
const ICON_MAP = {
  BarChart3,
  Users,
  Shield,
  Eye,
  FileText,
  Key,
} as const;

// 🎯 Enhanced Tab Navigation with Smart Scroll
interface TabNavigationProps {
  isHeaderVisible: boolean;
}

const TabNavigation: React.FC<TabNavigationProps> = ({ isHeaderVisible }) => {
  const { activeTab, setActiveTab, users, isTabChanging } = useUsersContext();
  const { stats } = users;

  // Calculate notification counts for each tab
  const notificationCounts = useMemo(
    () => ({
      overview: stats.banned > 0 ? stats.banned : 0,
      "all-users": stats.total,
      admins: stats.admins,
      analytics: 0,
      permissions: 0,
      audit: 0,
    }),
    [stats.banned, stats.total, stats.admins]
  );

  return (
    <div className="border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg">
      <div className="px-6 py-4 flex justify-center flex-col">
        {/* Smart Header with Scroll Animations - DISAPPEARS ON SCROLL */}
        <div
          id="header-tabs-container"
          className={cn(
            "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4",
            "transform-gpu transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
            isHeaderVisible
              ? "opacity-100 translate-y-0 scale-y-100 mb-6 max-h-96"
              : "opacity-0 -translate-y-3 scale-y-90 mb-0 max-h-0 overflow-hidden pointer-events-none"
          )}
          style={{
            visibility: isHeaderVisible ? "visible" : "hidden",
            transitionProperty: "opacity, transform, margin-bottom, max-height",
          }}
        >
          {/* Title Section */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <UserCheck className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Gestión de Usuarios
              </h1>
            </div>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl">
              Administra usuarios, roles, permisos y monitorea la actividad del
              sistema. Panel centralizado para la gestión completa de usuarios.
            </p>
          </div>

          {/* Quick Stats - Visible only when header is visible */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                {stats.total} Total
              </span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <UserCheck className="w-5 h-5 text-green-600 dark:text-green-400" />
              <span className="text-sm font-medium text-green-900 dark:text-green-100">
                {stats.active} Activos
              </span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <Shield className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <span className="text-sm font-medium text-purple-900 dark:text-purple-100">
                {stats.admins} Admins
              </span>
            </div>
          </div>
        </div>

        {/* Enhanced Tab Navigation - ALWAYS VISIBLE & CLEAN */}
        <div
          className={cn(
            "transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] transform-gpu",
            // Add smooth movement when header is hidden
            isHeaderVisible ? "translate-y-0 pt-0" : "translate-y-0"
          )}
        >
          <ReusableTabs
            tabs={USERS_TABS.map((tab) => {
              const IconComponent =
                ICON_MAP[tab.icon as keyof typeof ICON_MAP] || Eye;
              const notificationCount =
                notificationCounts[tab.id as keyof typeof notificationCounts];

              return {
                id: tab.id,
                label: tab.label,
                icon: <IconComponent className="w-4 h-4" />,
                color: tab.color,
                hasNotification: notificationCount > 0,
                notificationCount: notificationCount || 0,
                disabled: tab.id === "permissions", // Future feature
              } as TabItem;
            })}
            activeTab={activeTab}
            onTabChange={(tabId) => setActiveTab(tabId as TabId)}
            variant="default"
            size="md"
            animated={true}
            scrollable={true}
            className="bg-transparent border-0 shadow-none p-0"
          />
        </div>
      </div>
    </div>
  );
};

// 🎯 TRUE SPA Tab Content - Keep All Tabs Mounted (Users)
const TabContent: React.FC = () => {
  const { activeTab, isTabChanging } = useUsersContext();

  // 🚨 SPA FIX: Render ALL tabs but only show the active one
  // This prevents unmounting/remounting which was causing the "refresh" behavior
  return (
    <div className="relative min-h-screen">
      {/* Tab transition overlay */}
      <div
        className={cn(
          "absolute inset-0 bg-white/50 dark:bg-gray-900/50 z-10 pointer-events-none transition-opacity duration-150",
          isTabChanging ? "opacity-100" : "opacity-0"
        )}
      />

      {/* Overview Tab - Always mounted */}
      <div
        className={cn(
          "transition-all duration-300 ease-out",
          activeTab === "overview"
            ? "opacity-100 visible relative z-0"
            : "opacity-0 invisible absolute inset-0 z-0 pointer-events-none"
        )}
        style={{
          transform:
            activeTab === "overview" ? "translateY(0)" : "translateY(20px)",
        }}
      >
        <OverviewTab />
      </div>

      {/* All Users Tab - Always mounted */}
      <div
        className={cn(
          "transition-all duration-300 ease-out",
          activeTab === "all-users"
            ? "opacity-100 visible relative z-0"
            : "opacity-0 invisible absolute inset-0 z-0 pointer-events-none"
        )}
        style={{
          transform:
            activeTab === "all-users" ? "translateY(0)" : "translateY(20px)",
        }}
      >
        <AllUsersTab />
      </div>

      {/* Admins Tab - Always mounted */}
      <div
        className={cn(
          "transition-all duration-300 ease-out",
          activeTab === "admins"
            ? "opacity-100 visible relative z-0"
            : "opacity-0 invisible absolute inset-0 z-0 pointer-events-none"
        )}
        style={{
          transform:
            activeTab === "admins" ? "translateY(0)" : "translateY(20px)",
        }}
      >
        <AdminsTab />
      </div>

      {/* Analytics Tab - Always mounted */}
      <div
        className={cn(
          "transition-all duration-300 ease-out",
          activeTab === "analytics"
            ? "opacity-100 visible relative z-0"
            : "opacity-0 invisible absolute inset-0 z-0 pointer-events-none"
        )}
        style={{
          transform:
            activeTab === "analytics" ? "translateY(0)" : "translateY(20px)",
        }}
      >
        <AnalyticsTab />
      </div>

      {/* Audit Tab - Always mounted */}
      <div
        className={cn(
          "transition-all duration-300 ease-out",
          activeTab === "audit"
            ? "opacity-100 visible relative z-0"
            : "opacity-0 invisible absolute inset-0 z-0 pointer-events-none"
        )}
        style={{
          transform:
            activeTab === "audit" ? "translateY(0)" : "translateY(20px)",
        }}
      >
        <AuditTab />
      </div>

      {/* Permissions Tab - Placeholder (Always mounted) */}
      <div
        className={cn(
          "transition-all duration-300 ease-out",
          activeTab === "permissions"
            ? "opacity-100 visible relative z-0"
            : "opacity-0 invisible absolute inset-0 z-0 pointer-events-none"
        )}
        style={{
          transform:
            activeTab === "permissions" ? "translateY(0)" : "translateY(20px)",
        }}
      >
        <div className="p-8 text-center">
          <div className="max-w-md mx-auto">
            <Key className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Gestión de Permisos
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Esta funcionalidad estará disponible próximamente. Permitirá
              gestionar permisos granulares para cada usuario.
            </p>
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                🚧 En desarrollo - Próximamente disponible
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// 🎯 Main SPA Component (without Provider)
const UsersSPAContent: React.FC = () => {
  // ✨ Clean Scroll Detection Hook
  const { isHeaderVisible } = useScrollHeader({
    threshold: 17,
    wheelSensitivity: 0.5,
    useWheelFallback: true,
    debug: false, // Set to true for debugging
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Fixed Navigation */}
      <TabNavigation isHeaderVisible={isHeaderVisible} />

      {/* Main Content Area */}
      <main className="flex-1 relative">
        <div
          className={cn(
            "max-w-full",
            "transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] transform-gpu",
            isHeaderVisible ? "translate-y-0" : "-translate-y-6"
          )}
          data-scroll-content
        >
          <TabContent />
        </div>
      </main>
    </div>
  );
};

// 🎯 Main Export with Context Provider
const UsersSPAScreen: React.FC = () => {
  return (
    <UsersProvider>
      <UsersSPAContent />
    </UsersProvider>
  );
};

export default UsersSPAScreen;
