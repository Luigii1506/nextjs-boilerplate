/**
 * 🏢 SUPPLIERS SPA SCREEN
 * =======================
 *
 * Pantalla SPA completa para Suppliers Management
 * Navegación por tabs internos con estado compartido y transiciones smooth
 * Estructura idéntica a InventoryScreen
 *
 * Created: 2025-01-18 - Suppliers SPA Implementation
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
  RefreshCw,
  Settings,
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
import { ReusableTabs, type TabItem } from "@/shared/ui/components";
import { useScrollHeader } from "@/shared/hooks";
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
  const { activeTab, setActiveTab, suppliers, isTabChanging } =
    useSupplierContext();

  // Calculate notification counts for each tab
  const notificationCounts = useMemo(
    () => ({
      dashboard: 0,
      list: 0,
      orders: 0,
      analytics: 0,
      reports: 0,
    }),
    []
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
              <Truck
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
                Gestión de Proveedores
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
              Centro de gestión completo de proveedores y órdenes de compra
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
              onClick={() => suppliers.refetch()}
              disabled={suppliers.isRefetching}
              className={cn(
                "px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg",
                "text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700",
                "flex items-center space-x-2 transition-all duration-200",
                "hover:scale-[1.02] active:scale-[0.98] transform-gpu",
                suppliers.isRefetching && "opacity-50 cursor-not-allowed"
              )}
            >
              <RefreshCw
                className={cn(
                  "w-4 h-4",
                  suppliers.isRefetching && "animate-spin"
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
    </div>
  );
};

// 🎯 TRUE SPA Tab Content - Keep All Tabs Mounted
const TabContent: React.FC = () => {
  const { activeTab, isTabChanging } = useSupplierContext();

  // 🚨 SPA FIX: Render ALL tabs but only show the active one
  return (
    <div className="relative min-h-screen">
      {/* Tab transition overlay */}
      <div
        className={cn(
          "absolute inset-0 bg-white/50 dark:bg-gray-900/50 z-10 pointer-events-none transition-opacity duration-150",
          isTabChanging ? "opacity-100" : "opacity-0"
        )}
      />

      {/* Dashboard Tab - Always mounted */}
      <div
        className={cn(
          "transition-all duration-300 ease-out",
          activeTab === "dashboard"
            ? "opacity-100 visible relative z-0"
            : "opacity-0 invisible absolute inset-0 z-0 pointer-events-none"
        )}
        style={{
          transform:
            activeTab === "dashboard" ? "translateY(0)" : "translateY(20px)",
        }}
      >
        <DashboardTab />
      </div>

      {/* List Tab - Always mounted */}
      <div
        className={cn(
          "transition-all duration-300 ease-out",
          activeTab === "list"
            ? "opacity-100 visible relative z-0"
            : "opacity-0 invisible absolute inset-0 z-0 pointer-events-none"
        )}
        style={{
          transform:
            activeTab === "list" ? "translateY(0)" : "translateY(20px)",
        }}
      >
        <ListTab />
      </div>

      {/* Orders Tab - Always mounted */}
      <div
        className={cn(
          "transition-all duration-300 ease-out",
          activeTab === "orders"
            ? "opacity-100 visible relative z-0"
            : "opacity-0 invisible absolute inset-0 z-0 pointer-events-none"
        )}
        style={{
          transform:
            activeTab === "orders" ? "translateY(0)" : "translateY(20px)",
        }}
      >
        <OrdersTab />
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

      {/* Reports Tab - Always mounted */}
      <div
        className={cn(
          "transition-all duration-300 ease-out",
          activeTab === "reports"
            ? "opacity-100 visible relative z-0"
            : "opacity-0 invisible absolute inset-0 z-0 pointer-events-none"
        )}
        style={{
          transform:
            activeTab === "reports" ? "translateY(0)" : "translateY(20px)",
        }}
      >
        <ReportsTab />
      </div>
    </div>
  );
};

// 🎯 Main SPA Component (without Provider)
const SuppliersSPAContent: React.FC = () => {
  // ✨ Clean Scroll Detection Hook
  const { scrollY, isHeaderVisible, isPastThreshold } = useScrollHeader({
    threshold: 17,
    wheelSensitivity: 0.5,
    useWheelFallback: true,
    debug: false,
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

      {/* 📝 Modal Components - Native modals using SupplierContext */}
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
