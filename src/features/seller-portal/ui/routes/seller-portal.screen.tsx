/**
 * 👨‍💼 SELLER PORTAL - ELEGANT UX
 * ================================
 *
 * Layout estandarizado con componentes reutilizables:
 * - PageHeader: Header responsive con stats y scroll behavior
 * - StickyTabsContainer: Tabs sticky con bordes redondeados
 * - ContentContainer: Contenedor con padding consistente
 * - useScrollHeader: Hook reutilizable para scroll detection
 *
 * Updated: 2025-01-27 - Fully migrated to reusable components
 */

"use client";

// Import custom animations
import "../../../inventory/ui/styles/animations.css";

import React, { useMemo } from "react";
import {
  Package,
  Truck,
  Tag,
  Gift,
  Ticket,
  BarChart3,
  Store,
  ShoppingCart,
  TrendingUp,
  Settings,
} from "lucide-react";
import {
  ReusableTabs,
  type TabItem,
  PageHeader,
  type StatItem,
  StickyTabsContainer,
  ContentContainer,
} from "@/shared/ui/components";
import { SellerPortalTab } from "../../types";
import { OrdersTab } from "../tabs/OrdersTab";
import { TrackingTab } from "../tabs/TrackingTab";
import { ProductsTab } from "../tabs/ProductsTab";
import { PromotionsTab } from "../tabs/PromotionsTab";
import { CouponsTab } from "../tabs/CouponsTab";
import { AnalyticsTab } from "../tabs/AnalyticsTab";
import { usePendingOrdersCount } from "../../hooks/useOrders";

// 🎯 Tab Content - Only Active Tab Mounted
interface TabContentProps {
  activeTab: SellerPortalTab;
}

const TabContent: React.FC<TabContentProps> = ({ activeTab }) => {
  return (
    <div className="transition-opacity duration-200">
      {activeTab === "orders" && (
        <div className="animate-fadeIn">
          <OrdersTab />
        </div>
      )}

      {activeTab === "tracking" && (
        <div className="animate-fadeIn">
          <TrackingTab />
        </div>
      )}

      {activeTab === "products" && (
        <div className="animate-fadeIn">
          <ProductsTab />
        </div>
      )}

      {activeTab === "promotions" && (
        <div className="animate-fadeIn">
          <PromotionsTab />
        </div>
      )}

      {activeTab === "coupons" && (
        <div className="animate-fadeIn">
          <CouponsTab />
        </div>
      )}

      {activeTab === "analytics" && (
        <div className="animate-fadeIn">
          <AnalyticsTab />
        </div>
      )}
    </div>
  );
};

// 🎯 Main Component
export function SellerPortalScreen() {
  const [activeTab, setActiveTab] = React.useState<SellerPortalTab>("orders");

  // Get pending orders count for badge
  const { data: pendingCount } = usePendingOrdersCount();

  // 🎨 Prepare stats for PageHeader
  const headerStats: StatItem[] = useMemo(
    () => [
      {
        icon: <ShoppingCart className="w-4 h-4" />,
        label: `${pendingCount || 0} Pendientes`,
        color: "blue" as const,
        value: pendingCount || 0,
      },
      {
        icon: <Package className="w-4 h-4" />,
        label: "Productos",
        color: "purple" as const,
        value: 0,
      },
      {
        icon: <TrendingUp className="w-4 h-4" />,
        label: "Ventas",
        color: "green" as const,
        value: 0,
      },
    ],
    [pendingCount]
  );

  // Tab configuration for ReusableTabs
  const tabs: TabItem[] = useMemo(
    () => [
      {
        id: "orders",
        label: "Órdenes",
        icon: <Package className="w-4 h-4" />,
        color: "blue",
        hasNotification: pendingCount ? pendingCount > 0 : false,
        notificationCount: pendingCount || 0,
      },
      {
        id: "tracking",
        label: "Envíos",
        icon: <Truck className="w-4 h-4" />,
        color: "green",
      },
      {
        id: "products",
        label: "Productos",
        icon: <Tag className="w-4 h-4" />,
        color: "purple",
      },
      {
        id: "promotions",
        label: "Promociones",
        icon: <Gift className="w-4 h-4" />,
        color: "pink",
      },
      {
        id: "coupons",
        label: "Cupones",
        icon: <Ticket className="w-4 h-4" />,
        color: "orange",
      },
      {
        id: "analytics",
        label: "Analytics",
        icon: <BarChart3 className="w-4 h-4" />,
        color: "indigo",
      },
    ],
    [pendingCount]
  );

  return (
    <div className="min-h-full bg-gray-50 dark:bg-gray-900">
      <PageHeader
        icon={<Store className="w-6 h-6 sm:w-8 sm:h-8" />}
        title="Portal de Ventas"
        description="Gestiona tus órdenes, productos y promociones"
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
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={(tabId) => setActiveTab(tabId as SellerPortalTab)}
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
        <TabContent activeTab={activeTab} />
      </ContentContainer>
    </div>
  );
}
