/**
 * 👥 USERS SCREEN - ELEGANT UX
 * =============================
 *
 * Layout estandarizado con componentes reutilizables:
 * - PageHeader: Header responsive con stats y scroll behavior
 * - StickyTabsContainer: Tabs sticky con bordes redondeados
 * - ContentContainer: Contenedor con padding consistente
 * - useScrollHeader: Hook reutilizable para scroll detection
 *
 * Updated: 2025-01-18 - Fully migrated to reusable components
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
  Settings,
} from "lucide-react";
import {
  UsersProvider,
  useUsersContext,
  USERS_TABS,
  type TabId,
} from "../../context";
import {
  ReusableTabs,
  type TabItem,
  PageHeader,
  type StatItem,
  StickyTabsContainer,
  ContentContainer,
} from "@/shared/ui/components";
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

  // 🎯 Scroll header detection (reusable hook)
  const { showHeader } = useScrollHeader({
    mode: "direction",
    threshold: 50,
  });

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

  // 🎨 Prepare stats for PageHeader
  const headerStats: StatItem[] = useMemo(
    () => [
      {
        icon: <Users className="w-4 h-4" />,
        label: `${stats.total} Total`,
        color: "blue" as const,
        value: stats.total,
      },
      {
        icon: <UserCheck className="w-4 h-4" />,
        label: `${stats.active} Activos`,
        color: "green" as const,
        value: stats.active,
      },
      {
        icon: <Shield className="w-4 h-4" />,
        label: `${stats.admins} Admins`,
        color: "purple" as const,
        value: stats.admins,
      },
    ],
    [stats.total, stats.active, stats.admins]
  );

  return (
    <div className="min-h-full bg-gray-50 dark:bg-gray-900">
      <PageHeader
        icon={<UserCheck className="w-6 h-6 sm:w-8 sm:h-8" />}
        title="Gestión de Usuarios"
        description="Administra usuarios, roles, permisos y monitorea la actividad del sistema"
        stats={headerStats}
        action={<Settings className="w-5 h-5" />}
        onActionClick={() => console.log("Settings clicked")}
        hidden={!showHeader}
      />

      {/*
        🎯 TABS - Sticky & Rounded (RESPONSIVE)
        Using StickyTabsContainer component for consistent layout
      */}
      <StickyTabsContainer responsive={true} zIndex={20}>
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
      </StickyTabsContainer>

      {/*
        📦 CONTENT AREA - Professional Spacing (RESPONSIVE)
        Using ContentContainer component for consistent layout
      */}
      <ContentContainer responsive={true}>
        <TabContent />
      </ContentContainer>
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
