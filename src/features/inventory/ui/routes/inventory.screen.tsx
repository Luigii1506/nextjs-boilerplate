/**
 * 📦 INVENTORY SPA SCREEN
 * =======================
 *
 * Pantalla SPA completa para Inventory Management
 * Navegación por tabs internos con estado compartido y transiciones smooth
 *
 * Created: 2025-01-17 - Inventory SPA Implementation
 * Updated: 2025-01-17 - Enhanced smooth transitions
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
  RefreshCw,
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
import { ReusableTabs, type TabItem } from "@/shared/ui/components";
import { useScrollHeader } from "@/shared/hooks";
import {
  OverviewTab,
  ProductsTab,
  CategoriesTab,
  SuppliersTab,
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

// 🎯 Enhanced Tab Navigation with Smart Scroll
interface TabNavigationProps {
  isHeaderVisible: boolean;
  scrollY: number;
  isPastThreshold: boolean;
}

const TabNavigation: React.FC<TabNavigationProps> = ({
  isHeaderVisible,
  scrollY,
  isPastThreshold,
}) => {
  const { activeTab, setActiveTab, inventory, isTabChanging } =
    useInventoryContext();
  const { alerts, stats } = inventory;

  console.log("🔥 TAB NAVIGATION RENDER STATE:", { scrollY, isHeaderVisible });

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

  return (
    <div
      className={cn(
        "border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50",
        "transform-gpu transition-all duration-300",
        // Backdrop blur effect when scrolled
        isPastThreshold
          ? "header-backdrop scrolled"
          : "header-backdrop bg-white dark:bg-gray-800"
      )}
      style={{
        transform: `translateY(${
          scrollY > 0 ? Math.min(scrollY * 0.1, 10) : 0
        }px)`,
      }}
    >
      <div className="px-6 py-4 flex justify-center flex-col">
        {/* Smart Header with Scroll Animations */}
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
            transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        >
          <div
            id="header-tabs"
            className={cn(
              "transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] transform-gpu",
              isHeaderVisible
                ? "opacity-100 translate-x-0"
                : "opacity-0 -translate-x-2"
            )}
          >
            <h1
              className={cn(
                "text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center space-x-2",
                "transition-all duration-150 ease-[cubic-bezier(0.4,0,0.2,1)] transform-gpu",
                isHeaderVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-1"
              )}
            >
              <Package
                className={cn(
                  "w-7 h-7 text-blue-600 dark:text-blue-400",
                  "transition-all duration-150 ease-[cubic-bezier(0.4,0,0.2,1)] transform-gpu",
                  isHeaderVisible
                    ? "opacity-100 scale-100 rotate-0"
                    : "opacity-0 scale-95 rotate-3"
                )}
              />
              <span
                className={cn(
                  "transition-all duration-150 ease-[cubic-bezier(0.4,0,0.2,1)] transform-gpu",
                  isHeaderVisible
                    ? "opacity-100 translate-x-0"
                    : "opacity-0 translate-x-1"
                )}
              >
                Inventory Management
              </span>
            </h1>
            <p
              className={cn(
                "text-gray-600 dark:text-gray-300 mt-1",
                "transition-all duration-150 ease-[cubic-bezier(0.4,0,0.2,1)] transform-gpu",
                isHeaderVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-1"
              )}
            >
              Sistema completo de gestión de inventario y productos
            </p>
          </div>

          {/* Actions */}
          <div
            className={cn(
              "flex items-center space-x-3",
              "transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] transform-gpu",
              isHeaderVisible
                ? "opacity-100 translate-x-0 scale-100"
                : "opacity-0 translate-x-4 scale-98"
            )}
          >
            <button
              onClick={() => inventory.refetch()}
              disabled={inventory.isRefetching}
              className={cn(
                "px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg",
                "text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700",
                "flex items-center space-x-2 transition-all duration-200",
                "hover:scale-[1.02] active:scale-[0.98] transform-gpu",
                inventory.isRefetching && "opacity-50 cursor-not-allowed"
              )}
            >
              <RefreshCw
                className={cn(
                  "w-4 h-4",
                  inventory.isRefetching && "animate-spin"
                )}
              />
              <span>Actualizar</span>
            </button>

            <button className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200 hover:scale-105">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Enhanced Tab Navigation - Always Visible & Clean */}
        <div
          className={cn(
            "transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] transform-gpu",
            // Add smooth movement when header is hidden
            isHeaderVisible ? "translate-y-0 pt-0" : "translate-y-0"
          )}
        >
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
        </div>
      </div>

      {/* Scroll Indicator & SPA Status */}
      {isPastThreshold && (
        <div
          className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
          style={{
            width: `${Math.min((scrollY / window.innerHeight) * 100, 100)}%`,
          }}
        />
      )}

      {/* SPA Performance Indicator (dev mode) */}
      {process.env.NODE_ENV === "development" && (
        <div className="absolute top-2 right-2 z-50 space-y-1">
          <div className="bg-green-500 text-white text-xs px-2 py-1 rounded-full opacity-75 hover:opacity-100 transition-opacity">
            SPA ⚡ {!isTabChanging ? "Instant" : "Transitioning"}
          </div>
          <div
            className={cn(
              "text-white text-xs px-2 py-1 rounded-full opacity-75",
              isHeaderVisible ? "bg-green-500" : "bg-red-500"
            )}
          >
            Header: {isHeaderVisible ? "VISIBLE" : "HIDDEN"}
          </div>
          <div className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full opacity-75">
            Y: {scrollY}px
          </div>
        </div>
      )}
    </div>
  );
};

// 🎯 Optimized Tab Content Renderer - True SPA Experience
const TabContent: React.FC = () => {
  const { activeTab } = useInventoryContext();

  // Note: No loading skeleton between tabs - data is already loaded!
  // Only show actual data loading when initially fetching from server

  // Render active tab content instantly
  switch (activeTab) {
    case "overview":
      return <OverviewTab />;

    case "products":
      return <ProductsTab />;

    case "categories":
      return <CategoriesTab />;

    case "suppliers":
      return <SuppliersTab />;

    case "movements":
      // TODO: Implement MovementsTab
      return (
        <div className="p-6 text-center animate-fadeInUp">
          <Archive className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4 animate-scaleIn" />
          <h3 className="text-xl font-medium text-gray-900 dark:text-gray-100 mb-2 animate-slideInUp stagger-1">
            📋 Movimientos de Stock
          </h3>
          <p className="text-gray-500 dark:text-gray-400 animate-fadeInScale stagger-2">
            Próximamente: Historial completo de movimientos de inventario
          </p>
        </div>
      );

    case "reports":
      // TODO: Implement ReportsTab
      return (
        <div className="p-6 text-center animate-fadeInUp">
          <FileText className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4 animate-scaleIn" />
          <h3 className="text-xl font-medium text-gray-900 dark:text-gray-100 mb-2 animate-slideInUp stagger-1">
            📊 Reportes y Analytics
          </h3>
          <p className="text-gray-500 dark:text-gray-400 animate-fadeInScale stagger-2">
            Próximamente: Reportes detallados y análisis de datos
          </p>
        </div>
      );

    default:
      return <OverviewTab />;
  }
};

// 🎯 Main SPA Component (without Provider)
const InventorySPAContent: React.FC = () => {
  // ✨ Clean Scroll Detection Hook
  const {
    scrollY,
    isHeaderVisible,
    isPastThreshold,
    isNativeScrollWorking,
    isWheelSimulationActive,
  } = useScrollHeader({
    threshold: 17,
    wheelSensitivity: 0.5,
    useWheelFallback: true,
    debug: false, // Set to true for debugging
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Fixed Navigation */}
      <TabNavigation
        isHeaderVisible={isHeaderVisible}
        scrollY={scrollY}
        isPastThreshold={isPastThreshold}
      />

      {/* Main Content Area */}
      <main className="flex-1 relative">
        <div
          className={cn(
            "max-w-full",
            "transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] transform-gpu",
            isHeaderVisible ? "translate-y-0" : "-translate-y-6"
          )}
        >
          <TabContent />
        </div>
      </main>

      {/* 🚨 MASSIVE CONTENT TO FORCE SCROLL */}
      <div
        style={{ minHeight: "200vh" }}
        className="bg-gradient-to-b from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-8 m-6 rounded-lg"
      >
        <h2 className="text-3xl font-bold mb-6">
          🚨 SCROLL FORCE TEST - 200% VIEWPORT HEIGHT
        </h2>

        <div className="mb-8 p-6 bg-red-100 dark:bg-red-900/30 rounded-lg border-2 border-red-300">
          <h3 className="text-xl font-bold text-red-800 dark:text-red-200 mb-2">
            SCROLL STATUS
          </h3>
          <p className="text-red-700 dark:text-red-300">
            This div is 200% viewport height. Should be scrollable!
          </p>
        </div>

        <div className="space-y-6">
          {Array.from({ length: 40 }, (_, i) => (
            <div
              key={i}
              className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg border"
              style={{ minHeight: "120px" }}
            >
              <h3 className="text-lg font-semibold mb-2">🔄 Card #{i + 1}</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Line {i + 1}: Forcing scroll with large content. ScrollY should
                change!
              </p>
            </div>
          ))}
        </div>
      </div>

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
