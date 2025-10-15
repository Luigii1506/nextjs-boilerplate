/**
 * 📦 INVENTORY SPA SCREEN
 * =======================
 *
 * Pantalla SPA completa para Inventory Management
 * Navegación por tabs internos con estado compartido y transiciones smooth
 *
 * Created: 2025-01-17 - Inventory SPA Implementation
 * Updated: 2025-01-17 - Enhanced smooth transitions
 * Fixed: 2025-01-17 - True SPA behavior - tabs no longer re-mount when switching
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
    </div>
  );
};

// 🎯 TRUE SPA Tab Content - Keep All Tabs Mounted
const TabContent: React.FC = () => {
  const { activeTab, isTabChanging } = useInventoryContext();

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

      {/* Products Tab - Always mounted */}
      <div
        className={cn(
          "transition-all duration-300 ease-out",
          activeTab === "products"
            ? "opacity-100 visible relative z-0"
            : "opacity-0 invisible absolute inset-0 z-0 pointer-events-none"
        )}
        style={{
          transform:
            activeTab === "products" ? "translateY(0)" : "translateY(20px)",
        }}
      >
        <ProductsTab />
      </div>

      {/* Categories Tab - Always mounted */}
      <div
        className={cn(
          "transition-all duration-300 ease-out",
          activeTab === "categories"
            ? "opacity-100 visible relative z-0"
            : "opacity-0 invisible absolute inset-0 z-0 pointer-events-none"
        )}
        style={{
          transform:
            activeTab === "categories" ? "translateY(0)" : "translateY(20px)",
        }}
      >
        <CategoriesTab />
      </div>

      {/* Suppliers Tab - Always mounted */}
      <div
        className={cn(
          "transition-all duration-300 ease-out",
          activeTab === "suppliers"
            ? "opacity-100 visible relative z-0"
            : "opacity-0 invisible absolute inset-0 z-0 pointer-events-none"
        )}
        style={{
          transform:
            activeTab === "suppliers" ? "translateY(0)" : "translateY(20px)",
        }}
      >
        <SuppliersTab />
      </div>

      {/* Movements Tab (Always mounted) */}
      <div
        className={cn(
          "transition-all duration-300 ease-out",
          activeTab === "movements"
            ? "opacity-100 visible relative z-0"
            : "opacity-0 invisible absolute inset-0 z-0 pointer-events-none"
        )}
        style={{
          transform:
            activeTab === "movements" ? "translateY(0)" : "translateY(20px)",
        }}
      >
        <MovementsTab />
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
const InventorySPAContent: React.FC = () => {
  // ✨ Clean Scroll Detection Hook
  const { scrollY, isHeaderVisible, isPastThreshold } = useScrollHeader({
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
