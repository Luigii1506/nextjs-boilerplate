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
 */

"use client";

// Import custom animations
import "../styles/animations.css";

import React, { useMemo, useState } from "react";
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

      {/* SPA Performance Indicator (dev mode) */}
      {process.env.NODE_ENV === "development" && (
        <div className="absolute top-2 right-2 z-50 space-y-1">
          <div className="bg-green-500 text-white text-xs px-2 py-1 rounded-full opacity-75 hover:opacity-100 transition-opacity">
            SPA ⚡ {!isTabChanging ? "Instant" : "Transitioning"}
          </div>
          <div className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full opacity-75">
            Users: {stats.total}
          </div>
        </div>
      )}
    </div>
  );
};

// 🎯 Optimized Tab Content Renderer - True SPA Experience
const TabContent: React.FC = () => {
  const { activeTab } = useUsersContext();

  switch (activeTab) {
    case "overview":
      return <OverviewTab />;

    case "all-users":
      return <AllUsersTab />;

    case "admins":
      return <AdminsTab />;

    case "analytics":
      return <AnalyticsTab />;

    case "audit":
      return <AuditTab />;

    case "permissions":
      return (
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
      );

    default:
      return <OverviewTab />;
  }
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

  // 🎯 Simple scroll to top function
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

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

      {/* 🚨 MASSIVE CONTENT TO FORCE SCROLL - Same as inventory */}
      <div
        style={{ minHeight: "200vh" }}
        className="bg-gradient-to-b from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-8 m-6 rounded-lg"
      >
        <h2 className="text-3xl font-bold mb-6">
          🚨 USERS MODULE - SCROLL TEST (200% viewport height)
        </h2>

        <div className="mb-8 p-6 bg-blue-100 dark:bg-blue-900/30 rounded-lg border-2 border-blue-300">
          <h3 className="text-xl font-bold text-blue-800 dark:text-blue-200 mb-2">
            USERS SCROLL STATUS
          </h3>
          <p className="text-blue-700 dark:text-blue-300">
            Testing scroll functionality in Users module. Header should
            hide/show smoothly while tabs remain visible!
          </p>
        </div>

        <div className="space-y-6">
          {Array.from({ length: 40 }, (_, i) => (
            <div
              key={i}
              className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg border"
              style={{ minHeight: "120px" }}
            >
              <h3 className="text-lg font-semibold mb-2">
                👥 Users Test Card #{i + 1}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Line {i + 1}: Testing Users SPA scroll behavior. Header content
                should disappear while tabs remain visible!
              </p>
            </div>
          ))}
        </div>

        <div className="mt-12 p-6 bg-green-100 dark:bg-green-900/30 rounded-lg border-2 border-green-300">
          <h3 className="text-xl font-bold text-green-800 dark:text-green-200 mb-2">
            🎯 Expected Behavior
          </h3>
          <ul className="list-disc list-inside text-green-700 dark:text-green-300 space-y-2">
            <li>
              Header title and description should disappear on scroll down
            </li>
            <li>Tabs should REMAIN VISIBLE at all times</li>
            <li>Header should reappear on scroll up</li>
            <li>Smooth animations throughout</li>
          </ul>
        </div>
      </div>
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
