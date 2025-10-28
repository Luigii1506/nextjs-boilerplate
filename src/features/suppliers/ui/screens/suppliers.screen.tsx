/**
 * 🏢 SUPPLIERS SCREEN - ELEGANT UX
 * =================================
 *
 * Layout estandarizado siguiendo el patrón de inventory/users:
 * - Header siempre visible con shadow
 * - Tabs con bordes redondeados sticky
 * - Sin min-h-screen (sin scroll innecesario)
 * - Solo renderiza el tab activo
 * - Transiciones smooth
 *
 * Updated: 2025-01-27 - Standardized to match inventory/users pattern
 */

"use client";

// Import custom animations
import "../../../inventory/ui/styles/animations.css";

import React, { useMemo } from "react";
import {
  BarChart3,
  Truck,
  ShoppingCart,
  TrendingUp,
  FileText,
  Settings,
  CheckCircle,
  Star,
} from "lucide-react";
import { cn } from "@/shared/utils";
import {
  SupplierProvider,
  useSupplierContext,
  SUPPLIER_TABS,
  type TabId,
} from "../../context";
import {
  SupplierFormModal,
  SupplierViewModal,
  SupplierDeleteModal,
} from "../components/modals";
import {
  ReusableTabs,
  type TabItem,
  PageHeader,
  type StatItem,
  StickyTabsContainer,
  ContentContainer,
} from "@/shared/ui/components";
import {
  DashboardTab,
  ListTab,
  OrdersTab,
  AnalyticsTab,
  ReportsTab,
} from "../components/tabs";

// 🎨 Icon mapping for tabs
const ICON_MAP = {
  BarChart3,
  Truck,
  ShoppingCart,
  TrendingUp,
  FileText,
} as const;

// 🎯 Tab Content - Only Active Tab Mounted
const TabContent: React.FC = () => {
  const { activeTab } = useSupplierContext();

  return (
    <div className="transition-opacity duration-200">
      {activeTab === "dashboard" && (
        <div className="animate-fadeIn">
          <DashboardTab />
        </div>
      )}

      {activeTab === "list" && (
        <div className="animate-fadeIn">
          <ListTab />
        </div>
      )}

      {activeTab === "orders" && (
        <div className="animate-fadeIn">
          <OrdersTab />
        </div>
      )}

      {activeTab === "analytics" && (
        <div className="animate-fadeIn">
          <AnalyticsTab />
        </div>
      )}

      {activeTab === "reports" && (
        <div className="animate-fadeIn">
          <ReportsTab />
        </div>
      )}
    </div>
  );
};

// 🎯 Main Component Content (without Provider)
const SuppliersSPAContent: React.FC = () => {
  const { activeTab, setActiveTab, suppliers, stats } = useSupplierContext();

  // Calculate notification counts for each tab
  const notificationCounts = useMemo(
    () => ({
      dashboard: 0,
      list: suppliers.data.length,
      orders: 0,
      analytics: 0,
      reports: 0,
    }),
    [suppliers.data.length]
  );

  // 🎨 Prepare stats for PageHeader
  const headerStats: StatItem[] = useMemo(
    () => [
      {
        icon: <Truck className="w-4 h-4" />,
        label: `${stats.total} Total`,
        color: "blue" as const,
        value: stats.total,
      },
      {
        icon: <CheckCircle className="w-4 h-4" />,
        label: `${stats.active} Activos`,
        color: "green" as const,
        value: stats.active,
      },
      {
        icon: <Star className="w-4 h-4" />,
        label: `${stats.avgRating.toFixed(1)} Rating`,
        color: "orange" as const,
        value: stats.avgRating,
      },
    ],
    [stats.total, stats.active, stats.avgRating]
  );

  return (
    <div className="min-h-full bg-gray-50 dark:bg-gray-900">
      <PageHeader
        icon={<Truck className="w-6 h-6 sm:w-8 sm:h-8" />}
        title="Gestión de Proveedores"
        description="Centro de gestión completo de proveedores y órdenes de compra"
        stats={headerStats}
        action={<Settings className="w-5 h-5" />}
        onActionClick={() => console.log("Settings clicked")}
      />

      {/*
        🎯 TABS - Sticky & Rounded (RESPONSIVE)
        Using StickyTabsContainer component for consistent layout
      */}
      <StickyTabsContainer responsive={true} zIndex={20}>
        <ReusableTabs
          tabs={SUPPLIER_TABS.map((tab) => {
            const IconComponent =
              ICON_MAP[tab.icon as keyof typeof ICON_MAP] || Truck;
            const notificationCount =
              notificationCounts[tab.id as keyof typeof notificationCounts];

            return {
              id: tab.id,
              label: tab.label,
              icon: <IconComponent className="w-4 h-4" />,
              color: tab.color,
              hasNotification: notificationCount > 0,
              notificationCount: notificationCount || 0,
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

      {/* 📝 Modal Components */}
      <SupplierFormModal />
      <SupplierViewModal />
      <SupplierDeleteModal />
    </div>
  );
};

// 🎯 Main Exported Component (with Provider)
interface SuppliersScreenProps {
  className?: string;
}

const SuppliersScreen: React.FC<SuppliersScreenProps> = ({ className }) => {
  return (
    <div className={cn("w-full", className)}>
      <SupplierProvider>
        <SuppliersSPAContent />
      </SupplierProvider>
    </div>
  );
};

export default SuppliersScreen;
