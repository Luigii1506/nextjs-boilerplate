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

import React, { useState, useEffect, useMemo } from "react";
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

  // Estado para visibilidad del header
  const [showHeader, setShowHeader] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

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
                    <Package className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                    Inventory Management
                  </h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Sistema completo de gestión de inventario y productos
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => inventory.refetch()}
                    disabled={inventory.isRefetching}
                    className={cn(
                      "px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg",
                      "text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700",
                      "flex items-center space-x-2 transition-all duration-200",
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
      </div>

      {/*
        📦 CONTENT AREA - Professional Spacing
      */}
      <div className="max-w-[1600px] mx-auto px-6 py-6">
        <TabContent />
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
