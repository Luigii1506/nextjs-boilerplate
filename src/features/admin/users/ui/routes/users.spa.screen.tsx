/**
 * 👥 USERS SCREEN - ELEGANT UX
 * =============================
 *
 * Layout estandarizado siguiendo docs/layout_updated.md:
 * - Header que desaparece suavemente con scroll
 * - Tabs con bordes redondeados
 * - Sin min-h-screen (sin scroll innecesario)
 * - Solo renderiza el tab activo
 * - Transiciones smooth
 *
 * Updated: 2025-01-18 - Standardized Layout
 */

"use client";

// Import custom animations
import "../styles/animations.css";

import React, { useState, useEffect, useMemo } from "react";
import {
  BarChart3,
  Users,
  Shield,
  Eye,
  FileText,
  Key,
  UserCheck,
  RefreshCw,
  Settings,
} from "lucide-react";
import { cn } from "@/shared/utils";
import {
  UsersProvider,
  useUsersContext,
  USERS_TABS,
  type TabId,
} from "../../context";
import { ReusableTabs, type TabItem } from "@/shared/ui/components";
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

// 🎯 Tab Content - Only Active Tab Mounted
const TabContent: React.FC = () => {
  const { activeTab } = useUsersContext();

  return (
    <div className="transition-opacity duration-200">
      {activeTab === "overview" && (
        <div className="animate-fadeIn">
          <OverviewTab />
        </div>
      )}

      {activeTab === "all-users" && (
        <div className="animate-fadeIn">
          <AllUsersTab />
        </div>
      )}

      {activeTab === "admins" && (
        <div className="animate-fadeIn">
          <AdminsTab />
        </div>
      )}

      {activeTab === "analytics" && (
        <div className="animate-fadeIn">
          <AnalyticsTab />
        </div>
      )}

      {activeTab === "audit" && (
        <div className="animate-fadeIn">
          <AuditTab />
        </div>
      )}

      {activeTab === "permissions" && (
        <div className="animate-fadeIn">
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
      )}
    </div>
  );
};

// 🎯 Main Component Content (without Provider)
const UsersSPAContent: React.FC = () => {
  const { activeTab, setActiveTab, users } = useUsersContext();
  const { stats } = users;

  // Estado para visibilidad del header
  const [showHeader, setShowHeader] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

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

  // 🎯 Smooth scroll detection
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Mostrar header cuando: scroll up o está en top
      // Ocultar header cuando: scroll down > 50px
      if (currentScrollY < lastScrollY || currentScrollY < 50) {
        setShowHeader(true);
      } else if (currentScrollY > 50) {
        setShowHeader(false);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  return (
    <div className="bg-gray-50 dark:bg-gray-900">
      {/*
        🎯 HEADER - Smooth fade out on scroll down
        - NO sticky (se oculta completamente)
        - Aparece cuando: scroll up o en top
        - Desaparece cuando: scroll down > 50px
      */}
      {showHeader && (
        <div className="transition-all duration-300 ease-in-out animate-fadeIn">
          <div className="border-b border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="max-w-[1600px] mx-auto px-6 py-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
                    <UserCheck className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                    Gestión de Usuarios
                  </h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Administra usuarios, roles, permisos y monitorea la actividad del sistema
                  </p>
                </div>

                {/* Quick Stats & Actions */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  <div className="flex gap-2">
                    <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <span className="text-xs font-medium text-blue-900 dark:text-blue-100">
                        {stats.total} Total
                      </span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <UserCheck className="w-4 h-4 text-green-600 dark:text-green-400" />
                      <span className="text-xs font-medium text-green-900 dark:text-green-100">
                        {stats.active} Activos
                      </span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <Shield className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      <span className="text-xs font-medium text-purple-900 dark:text-purple-100">
                        {stats.admins} Admins
                      </span>
                    </div>
                  </div>

                  <button className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200">
                    <Settings className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/*
        🎯 TABS - Sticky & Rounded
        - Sticky top-0 siempre
        - Bordes redondeados elegantes
        - Shadow para profundidad
      */}
      <div className="sticky top-0 z-50 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-[1600px] mx-auto px-6 pt-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-2">
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
                  disabled: tab.id === "permissions",
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

      {/*
        📦 CONTENT AREA - Professional Spacing
      */}
      <div className="max-w-[1600px] mx-auto px-6 py-6">
        <TabContent />
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
