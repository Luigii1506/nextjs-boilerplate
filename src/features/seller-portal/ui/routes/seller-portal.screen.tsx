/**
 * 👨‍💼 SELLER PORTAL - MAIN SCREEN
 * ================================
 *
 * Main screen for the Seller Portal with tabs navigation
 * - Orders Management
 * - Tracking
 * - Products
 * - Promotions
 * - Coupons
 * - Analytics
 *
 * Created: 2025-01-17 - Seller Portal Implementation
 */

"use client";

import { useState } from "react";
import { SellerPortalTab, TabConfig } from "../../types";
import { OrdersTab } from "../tabs/OrdersTab";
import { TrackingTab } from "../tabs/TrackingTab";
import { ProductsTab } from "../tabs/ProductsTab";
import { PromotionsTab } from "../tabs/PromotionsTab";
import { CouponsTab } from "../tabs/CouponsTab";
import { AnalyticsTab } from "../tabs/AnalyticsTab";
import { usePendingOrdersCount } from "../../hooks/useOrders";

// Tab configurations
const TABS: TabConfig[] = [
  {
    id: "orders",
    label: "Órdenes",
    icon: "📦",
    description: "Gestionar todas las órdenes",
  },
  {
    id: "tracking",
    label: "Envíos",
    icon: "🚚",
    description: "Tracking de órdenes",
  },
  {
    id: "products",
    label: "Productos",
    icon: "🏷️",
    description: "Gestión rápida de productos",
  },
  {
    id: "promotions",
    label: "Promociones",
    icon: "🎁",
    description: "CRUD de promociones",
  },
  {
    id: "coupons",
    label: "Cupones",
    icon: "🎟️",
    description: "CRUD de cupones",
  },
  {
    id: "analytics",
    label: "Analytics",
    icon: "📊",
    description: "Reportes y métricas",
  },
];

export function SellerPortalScreen() {
  const [activeTab, setActiveTab] = useState<SellerPortalTab>("orders");

  // Get pending orders count for badge
  const { data: pendingCount } = usePendingOrdersCount();

  // Render active tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case "orders":
        return <OrdersTab />;
      case "tracking":
        return <TrackingTab />;
      case "products":
        return <ProductsTab />;
      case "promotions":
        return <PromotionsTab />;
      case "coupons":
        return <CouponsTab />;
      case "analytics":
        return <AnalyticsTab />;
      default:
        return <OrdersTab />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Portal de Ventas
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Gestiona tus órdenes, productos y promociones
            </p>
          </div>

          {/* Tabs Navigation */}
          <div className="flex space-x-1 border-b border-gray-200 dark:border-gray-700 -mb-px">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              const showBadge = tab.id === "orders" && pendingCount && pendingCount > 0;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    relative px-6 py-3 text-sm font-medium transition-colors
                    ${
                      isActive
                        ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
                        : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 border-b-2 border-transparent"
                    }
                  `}
                >
                  <div className="flex items-center gap-2">
                    <span>{tab.icon}</span>
                    <span>{tab.label}</span>
                    {showBadge && (
                      <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 dark:bg-red-600 rounded-full">
                        {pendingCount}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderTabContent()}
      </div>
    </div>
  );
}

