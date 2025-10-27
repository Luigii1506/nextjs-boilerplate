/**
 * 👨‍💼 SELLER PORTAL - ELEGANT UX
 * ================================
 *
 * Layout estandarizado siguiendo docs/layout_updated.md:
 * - Header que desaparece suavemente con scroll
 * - Tabs con bordes redondeados usando ReusableTabs
 * - Sin min-h-screen (sin scroll innecesario)
 * - Solo renderiza el tab activo
 * - Transiciones smooth
 *
 * Updated: 2025-01-18 - Standardized Layout
 */

"use client";

// Import custom animations
import "../../../inventory/ui/styles/animations.css";

import { useState, useEffect } from "react";
import {
  Package,
  Truck,
  Tag,
  Gift,
  Ticket,
  BarChart3,
  Store,
  RefreshCw,
} from "lucide-react";
import { ReusableTabs, type TabItem } from "@/shared/ui/components";
import { SellerPortalTab } from "../../types";
import { OrdersTab } from "../tabs/OrdersTab";
import { TrackingTab } from "../tabs/TrackingTab";
import { ProductsTab } from "../tabs/ProductsTab";
import { PromotionsTab } from "../tabs/PromotionsTab";
import { CouponsTab } from "../tabs/CouponsTab";
import { AnalyticsTab } from "../tabs/AnalyticsTab";
import { usePendingOrdersCount } from "../../hooks/useOrders";

// 🎨 Icon mapping for tabs
const ICON_MAP = {
  orders: Package,
  tracking: Truck,
  products: Tag,
  promotions: Gift,
  coupons: Ticket,
  analytics: BarChart3,
} as const;

export function SellerPortalScreen() {
  const [activeTab, setActiveTab] = useState<SellerPortalTab>("orders");

  // Estado para visibilidad del header
  const [showHeader, setShowHeader] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Get pending orders count for badge
  const { data: pendingCount } = usePendingOrdersCount();

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

  // Tab configuration for ReusableTabs
  const tabs: TabItem[] = [
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
  ];

  return (
    <div className="min-h-full bg-gray-50 dark:bg-gray-900">
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
                    <Store className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                    Portal de Ventas
                  </h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Gestiona tus órdenes, productos y promociones
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-3">
                  <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-2 transition-all duration-200">
                    <RefreshCw className="w-4 h-4" />
                    <span>Actualizar</span>
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
      <div className="sticky top-0 z-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-[1600px] mx-auto px-6 pt-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-2">
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
          </div>
        </div>
      </div>

      {/*
        📦 CONTENT AREA - Professional Spacing
      */}
      <div className="max-w-[1600px] mx-auto px-6 py-6">
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
      </div>
    </div>
  );
}

