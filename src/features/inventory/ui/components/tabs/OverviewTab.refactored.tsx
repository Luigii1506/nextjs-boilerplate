/**
 * 📊 OVERVIEW TAB COMPONENT (REFACTORED)
 * =======================================
 *
 * Dashboard principal con métricas, alertas y KPIs
 * REFACTORED: Uses new hooks, utils, and extracted components
 *
 * IMPROVEMENTS:
 * - Reduced from 487 → ~200 lines (59% reduction)
 * - Uses useProductMetrics hook for calculations
 * - Uses extracted AlertsCard and RecentProductsSection components
 * - Uses formatCurrency from utils
 * - Cleaner separation of concerns
 *
 * Created: 2025-01-17 - Inventory Overview Tab
 * Refactored: 2025-01-27 - Architecture improvements
 */

"use client";

import React, { useRef, useEffect } from "react";
import {
  Package,
  AlertTriangle,
  ShoppingBag,
  DollarSign,
} from "lucide-react";
import { TabWrapper, TabHeader, TabStatsCard } from "@/shared/ui/components/tabs";
import { useInventoryContext } from "../../../context";
import { useProductMetrics } from "../../../hooks/useProductMetrics";
import { formatCurrency } from "../../../utils";
import { AlertsCard, RecentProductsSection } from "../overview";
import type { Alert } from "../overview/AlertsCard";

/**
 * Overview Tab - Inventory Control Dashboard
 *
 * Main dashboard showing:
 * - Key metrics (products, stock value, alerts)
 * - Stock alerts for products needing attention
 * - Recently updated products
 *
 * @example
 * <OverviewTab />
 */
const OverviewTab: React.FC = React.memo(function OverviewTab() {
  const { inventory, setActiveTab } = useInventoryContext();
  const { stats, products } = inventory;

  // 🔥 NEW: Use custom hook for metrics calculations
  const { inventoryMetrics, operationalMetrics, isLoading } =
    useProductMetrics();

  // SPA-compatible animation system
  const hasInitialized = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      timeoutRef.current = setTimeout(() => {
        // Animation setup if needed
      }, 100);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // 🔥 NEW: Format values using utils
  const totalInventoryValue = formatCurrency(
    stats?.totalValue || 0,
    "MXN"
  );
  const totalRetailValue = formatCurrency(
    stats?.totalRetailValue || 0,
    "MXN"
  );

  // 🔥 NEW: Transform inventory alerts to AlertsCard format
  const stockAlerts: Alert[] = inventory.alerts.map((alert) => ({
    id: alert.id,
    productId: alert.productId,
    productName: alert.productName,
    productSku: alert.productSku,
    category: alert.category,
    currentStock: alert.currentStock,
    minStock: alert.minStock,
    status: alert.status,
  }));

  return (
    <TabWrapper spacing="space-y-6">
      {/* Header */}
      <TabHeader
        icon={<Package className="w-8 h-8 text-blue-600 dark:text-blue-400" />}
        title="Vista General"
        description="Control operacional de tu inventario"
        actions={[
          {
            label: "Gestionar Productos",
            icon: <Package className="w-4 h-4" />,
            onClick: () => setActiveTab("products"),
            variant: "primary",
          },
        ]}
      />

      {/* Operational Metrics - Real Stock Control */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <TabStatsCard
          title="Productos Activos"
          value={stats?.activeProducts || 0}
          description="Total en inventario"
          icon={Package}
          color="blue"
          onClick={() => setActiveTab("products")}
        />

        <TabStatsCard
          title="Valor en Stock"
          value={totalInventoryValue}
          description="Inversión al costo"
          icon={DollarSign}
          color="green"
          onClick={() => setActiveTab("products")}
        />

        <TabStatsCard
          title="Requieren Atención"
          value={operationalMetrics.needsAttentionCount}
          change={
            operationalMetrics.needsAttentionCount > 0
              ? "Acción requerida"
              : "Todo bien"
          }
          changeType={
            operationalMetrics.needsAttentionCount > 0
              ? "negative"
              : "positive"
          }
          description="Stock bajo o agotado"
          icon={AlertTriangle}
          color="orange"
          onClick={() => setActiveTab("products")}
        />

        <TabStatsCard
          title="Valor Retail"
          value={totalRetailValue}
          description="Precio de venta total"
          icon={ShoppingBag}
          color="purple"
          onClick={() => setActiveTab("products")}
        />
      </div>

      {/* Alerts Section */}
      {/* 🔥 NEW: Uses extracted AlertsCard component */}
      <AlertsCard
        alerts={stockAlerts}
        onViewAll={() => setActiveTab("products")}
        maxDisplay={5}
      />

      {/* Recent Products Section */}
      {/* 🔥 NEW: Uses extracted RecentProductsSection component */}
      <RecentProductsSection
        products={operationalMetrics.recentProducts}
        isLoading={isLoading}
        maxDisplay={6}
        onManageClick={() => setActiveTab("products")}
      />
    </TabWrapper>
  );
});

export default OverviewTab;
