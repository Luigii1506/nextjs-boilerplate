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
} from "../context";
import { TabBadge } from "../components";
import { OverviewTab, ProductsTab } from "../tabs";
import { useTabScrollHeader } from "../hooks";

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
const TabNavigation: React.FC = () => {
  const { activeTab, setActiveTab, inventory, isTabChanging } = useInventoryContext();
  const { alerts, stats } = inventory;

  // 🚀 Smart scroll header hook
  const { isHeaderVisible, isPastThreshold, scrollY } = useTabScrollHeader();

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
      <div className="px-6 py-4">
        {/* Smart Header with Scroll Animations */}
        <div
          id="header-tabs-container"
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6"
        >
          <div
            id="header-tabs"
            className={cn(
              "transform-gpu transition-all duration-500 ease-out",
              isHeaderVisible
                ? "header-visible opacity-100 translate-y-0"
                : "header-hidden opacity-0 -translate-y-full"
            )}
          >
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center space-x-2">
              <Package
                className={cn(
                  "w-7 h-7 text-blue-600 dark:text-blue-400 transition-transform duration-300",
                  !isHeaderVisible && "scale-90"
                )}
              />
              <span className="transition-all duration-300">
                Inventory Management
              </span>
            </h1>
            <p
              className={cn(
                "text-gray-600 dark:text-gray-300 mt-1 transition-all duration-300",
                !isHeaderVisible && "opacity-0"
              )}
            >
              Sistema completo de gestión de inventario y productos
            </p>
          </div>

          {/* Actions (always visible) */}
          <div
            className={cn(
              "flex items-center space-x-3 transition-all duration-300",
              // Compact mode when header is hidden
              !isHeaderVisible && "transform scale-90"
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

        {/* Enhanced Tab Navigation - Always Visible */}
        <div
          className={cn(
            "flex space-x-1 overflow-x-auto scrollbar-hide pb-2",
            "transition-all duration-300",
            // Add subtle padding when header is hidden
            !isHeaderVisible && "pt-2"
          )}
        >
          {INVENTORY_TABS.map((tab, index) => {
            const IconComponent =
              ICON_MAP[tab.icon as keyof typeof ICON_MAP] || Package;
            const notificationCount =
              notificationCounts[tab.id as keyof typeof notificationCounts];

            return (
              <div
                key={tab.id}
                className="animate-fadeInUp"
                style={{
                  animationDelay: `${index * 50}ms`,
                }}
              >
                <TabBadge
                  isActive={activeTab === tab.id}
                  label={tab.label}
                  icon={<IconComponent className="w-4 h-4" />}
                  color={tab.color}
                  onClick={() => setActiveTab(tab.id)}
                  hasNotification={notificationCount > 0}
                  notificationCount={notificationCount}
                />
              </div>
            );
          })}
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
        <div className="absolute top-2 right-2 z-50">
          <div className="bg-green-500 text-white text-xs px-2 py-1 rounded-full opacity-75 hover:opacity-100 transition-opacity">
            SPA ⚡ {!isTabChanging ? "Instant" : "Transitioning"}
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
      // TODO: Implement CategoriesTab
      return (
        <div className="p-6 text-center animate-fadeInUp">
          <Tags className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4 animate-scaleIn" />
          <h3 className="text-xl font-medium text-gray-900 dark:text-gray-100 mb-2 animate-slideInUp stagger-1">
            🏷️ Gestión de Categorías
          </h3>
          <p className="text-gray-500 dark:text-gray-400 animate-fadeInScale stagger-2">
            Próximamente: Organización y clasificación de productos
          </p>
        </div>
      );

    case "suppliers":
      // TODO: Implement SuppliersTab
      return (
        <div className="p-6 text-center animate-fadeInUp">
          <Truck className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4 animate-scaleIn" />
          <h3 className="text-xl font-medium text-gray-900 dark:text-gray-100 mb-2 animate-slideInUp stagger-1">
            🚛 Gestión de Proveedores
          </h3>
          <p className="text-gray-500 dark:text-gray-400 animate-fadeInScale stagger-2">
            Próximamente: Administración de proveedores y contactos
          </p>
        </div>
      );

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
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Fixed Navigation */}
      <TabNavigation />

      {/* Main Content Area */}
      <main className="flex-1 relative">
        <div className="max-w-full">
          <TabContent />
        </div>
      </main>
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
