/**
 * 📦 INVENTORY SCREEN - ELEGANT UX
 * =================================
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

import React, { useMemo } from "react";
import {
  BarChart3,
  Package,
  Tags,
  Truck,
  Archive,
  FileText,
  Settings,
} from "lucide-react";
import { cn } from "@/shared/utils";
import {
  InventoryProvider,
  useInventoryContext,
  INVENTORY_TABS,
  type TabId,
} from "../../context";
import {
  ProductModal,
  DeleteProductModal,
  ProductViewModal,
  CategoryModal,
  CategoryViewModal,
  CategoryDeleteModal,
  SupplierModal,
  SupplierViewModal,
  SupplierDeleteModal,
} from "../components";
import {
  ReusableTabs,
  type TabItem,
  PageHeader,
  type StatItem,
  StickyTabsContainer,
  ContentContainer,
} from "@/shared/ui/components";
import {
  OverviewTab,
  ProductsTab,
  CategoriesTab,
  SuppliersTab,
  MovementsTab,
  ReportsTab,
} from "../components/tabs";

// 🎨 Icon mapping for tabs
const ICON_MAP = {
  BarChart3,
  Package,
  Tags,
  Truck,
  Archive,
  FileText,
} as const;

// 🎯 Tab Content - Only Active Tab Mounted
const TabContent: React.FC = () => {
  const { activeTab } = useInventoryContext();

  return (
    <div className="transition-opacity duration-200">
      {activeTab === "overview" && (
        <div className="animate-fadeIn">
          <OverviewTab />
        </div>
      )}

      {activeTab === "products" && (
        <div className="animate-fadeIn">
          <ProductsTab />
        </div>
      )}

      {activeTab === "categories" && (
        <div className="animate-fadeIn">
          <CategoriesTab />
        </div>
      )}

      {activeTab === "suppliers" && (
        <div className="animate-fadeIn">
          <SuppliersTab />
        </div>
      )}

      {activeTab === "movements" && (
        <div className="animate-fadeIn">
          <MovementsTab />
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
const InventorySPAContent: React.FC = () => {
  const { activeTab, setActiveTab, inventory } = useInventoryContext();
  const { alerts, stats } = inventory;

  // Calculate notification counts for each tab
  const notificationCounts = useMemo(
    () => ({
      overview: alerts.length > 0 ? alerts.length : 0,
      products: alerts.length,
      categories: 0,
      suppliers: 0,
      movements: stats?.recentMovements || 0,
      reports: 0,
    }),
    [alerts.length, stats?.recentMovements]
  );

  // 🎨 Prepare stats for PageHeader
  const headerStats: StatItem[] = useMemo(
    () => [
      {
        icon: <Package className="w-4 h-4" />,
        label: `${stats?.totalProducts || 0} Productos`,
        color: "blue" as const,
        value: stats?.totalProducts || 0,
      },
      {
        icon: <Tags className="w-4 h-4" />,
        label: `${stats?.totalCategories || 0} Categorías`,
        color: "purple" as const,
        value: stats?.totalCategories || 0,
      },
      {
        icon: <Truck className="w-4 h-4" />,
        label: `${stats?.totalSuppliers || 0} Proveedores`,
        color: "green" as const,
        value: stats?.totalSuppliers || 0,
      },
    ],
    [stats?.totalProducts, stats?.totalCategories, stats?.totalSuppliers]
  );

  return (
    <div className="min-h-full bg-gray-50 dark:bg-gray-900">
      <PageHeader
        icon={<Package className="w-6 h-6 sm:w-8 sm:h-8" />}
        title="Inventory Management"
        description="Sistema completo de gestión de inventario y productos"
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
          tabs={INVENTORY_TABS.map((tab) => {
            const IconComponent =
              ICON_MAP[tab.icon as keyof typeof ICON_MAP] || Package;
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
      <ProductModal />
      <DeleteProductModal />
      <ProductViewModal />
      <CategoryModal />
      <CategoryViewModal />
      <CategoryDeleteModal />
      <SupplierModal />
      <SupplierViewModal />
      <SupplierDeleteModal />
    </div>
  );
};

// 🎯 Main Exported Component (with Provider)
interface InventoryScreenProps {
  className?: string;
}

const InventoryScreen: React.FC<InventoryScreenProps> = ({ className }) => {
  return (
    <div className={cn("w-full", className)}>
      <InventoryProvider>
        <InventorySPAContent />
      </InventoryProvider>
    </div>
  );
};

export default InventoryScreen;
