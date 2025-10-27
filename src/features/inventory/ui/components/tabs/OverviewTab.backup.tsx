/**
 * 📊 OVERVIEW TAB COMPONENT
 * =========================
 *
 * Dashboard principal con métricas, alertas y KPIs
 * Componente optimizado para React 19 con dark mode
 *
 * Created: 2025-01-17 - Inventory Overview Tab
 * Fixed: 2025-01-17 - Eliminated initial animation flicker on first load
 */

"use client";

import React, { useMemo, useRef, useEffect } from "react";
import {
  Package,
  AlertTriangle,
  ShoppingBag,
  DollarSign,
  Eye,
} from "lucide-react";
import { cn } from "@/shared/utils";
import { useInventoryContext } from "../../../context";
import { ProductCard, StockIndicator } from "..";
import {
  TabWrapper,
  TabHeader,
  TabStatsCard,
  TabLoadingSkeleton,
  TabEmptyState,
} from "@/shared/ui/components/tabs";
import type {
  ProductWithRelations,
  ProductWithComputedProps,
  StockStatus,
} from "../../../types";

// 🧮 Utility function to compute product properties
const computeProductProps = (
  product: ProductWithRelations
): ProductWithComputedProps => {
  // Calculate stock status
  const stockStatus: StockStatus =
    product.stock === 0
      ? "OUT_OF_STOCK"
      : product.stock <= 2
      ? "CRITICAL_STOCK"
      : product.stock <= product.minStock
      ? "LOW_STOCK"
      : "IN_STOCK";

  // Calculate stock percentage (vs max stock)
  const stockPercentage = product.maxStock
    ? (product.stock / product.maxStock) * 100
    : 100;

  return {
    ...product,
    stockStatus,
    stockPercentage,
    totalValue: product.cost * product.stock,
    totalRetailValue: product.price * product.stock,
    isLowStock: stockStatus === "LOW_STOCK",
    isCriticalStock: stockStatus === "CRITICAL_STOCK",
    isOutOfStock: stockStatus === "OUT_OF_STOCK",
    lastMovement: product.stockMovements?.[0],
    formattedPrice: new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(product.price),
    formattedCost: new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(product.cost),
  };
};

// Note: StatsCard has been replaced with TabStatsCard from shared components

// 🚨 Enhanced Alert Card - Memoized for SPA Performance
const AlertsCard: React.FC = React.memo(function AlertsCard() {
  const { inventory, setActiveTab } = useInventoryContext();
  const { alerts } = inventory;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Alertas de Stock
            </h3>
          </div>
          <div className="flex items-center space-x-2">
            <span className="bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400 text-sm font-medium px-2.5 py-0.5 rounded-full">
              {alerts.length}
            </span>
            <button
              onClick={() => setActiveTab("products")}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center space-x-1 transition-colors"
            >
              <Eye className="w-3 h-3" />
              <span>Ver todos</span>
            </button>
          </div>
        </div>

        <div className="space-y-3 max-h-96 overflow-y-auto">
          {alerts.slice(0, 5).map((alert, index) => (
            <div
              key={alert.id}
              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
              style={{
                animationDelay: `${index * 0.1}s`,
              }}
            >
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-900 dark:text-gray-100 truncate">
                  {alert.productName}
                </h4>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    SKU: {alert.productSku}
                  </span>
                  <span className="text-xs text-gray-400">•</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {alert.category}
                  </span>
                </div>
                <StockIndicator
                  stock={alert.currentStock}
                  minStock={alert.minStock}
                  size="sm"
                  showLabel={false}
                />
              </div>

              <div className="ml-4">
                <div
                  className={cn(
                    "px-2 py-1 rounded-full text-xs font-medium",
                    alert.status === "OUT_OF_STOCK" &&
                      "bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400",
                    alert.status === "CRITICAL_STOCK" &&
                      "bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400",
                    alert.status === "LOW_STOCK" &&
                      "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400"
                  )}
                >
                  {alert.status === "OUT_OF_STOCK" && "Agotado"}
                  {alert.status === "CRITICAL_STOCK" && "Crítico"}
                  {alert.status === "LOW_STOCK" && "Bajo"}
                </div>
              </div>
            </div>
          ))}

          {alerts.length === 0 && (
            <div className="text-center py-8">
              <Package className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">
                ✅ No hay alertas de stock
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

// 📦 Recent Products Section - Memoized for SPA Performance
const RecentProductsSection: React.FC = React.memo(
  function RecentProductsSection() {
    const { inventory, setActiveTab } = useInventoryContext();
    const { products, isLoading } = inventory;

    const recentProducts = useMemo(
      () =>
        products
          .slice(0, 6)
          .sort(
            (a, b) =>
              new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          ),
      [products]
    );

    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                📦 Productos Recientes
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Últimos productos actualizados
              </p>
            </div>
            <button
              onClick={() => setActiveTab("products")}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center space-x-1 transition-colors"
            >
              <Package className="w-3 h-3" />
              <span>Gestionar productos</span>
            </button>
          </div>

          {isLoading ? (
            <TabLoadingSkeleton type="grid" count={6} className="h-48" />
          ) : recentProducts.length === 0 ? (
            <TabEmptyState
              icon={<Package className="w-20 h-20" />}
              title="No hay productos recientes"
              description="Los productos actualizados recientemente aparecerán aquí"
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentProducts.map((product, index) => (
                <div
                  key={product.id}
                  style={{
                    animationDelay: `${index * 0.1}s`,
                  }}
                >
                  <ProductCard
                    product={computeProductProps(product)}
                    showActions={false}
                    className="h-full hover:scale-[1.02] transition-transform duration-200"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }
);

// 🎯 OPERATIONAL OVERVIEW TAB - Inventory Control Dashboard
const OverviewTab: React.FC = React.memo(function OverviewTab() {
  const { inventory, setActiveTab } = useInventoryContext();
  const { stats, categories, suppliers, products } = inventory;

  // 🚨 FIX: SPA-compatible animation system - no flicker on wishlist updates
  const hasInitialized = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // ✅ Only run animation setup once during true component mount
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      // Small delay to prevent initial animation flicker
      timeoutRef.current = setTimeout(() => {
        setAllowAnimations(true);
      }, 100);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []); // ✅ IMPORTANT: Empty dependency array - run only once

  // 🧮 Operational metrics - real stock counts and values
  const operationalMetrics = useMemo(() => {
    const totalInventoryValue = stats
      ? new Intl.NumberFormat("es-MX", {
          style: "currency",
          currency: "MXN",
          maximumFractionDigits: 0,
        }).format(stats.totalValue)
      : "$0";

    const totalRetailValue = stats
      ? new Intl.NumberFormat("es-MX", {
          style: "currency",
          currency: "MXN",
          maximumFractionDigits: 0,
        }).format(stats.totalRetailValue)
      : "$0";

    // Products needing attention (low/critical/depleted)
    const needsAttention = products.filter(
      (p) => p.stock <= p.minStock || p.stock === 0
    );

    // Products with NO movement in 30+ days
    const staleProducts = products.filter((p) => {
      if (!p.stockMovements || p.stockMovements.length === 0) return true;
      const lastMovement = p.stockMovements[0]?.createdAt;
      if (!lastMovement) return true;
      const daysSinceMovement =
        (Date.now() - new Date(lastMovement).getTime()) / (1000 * 60 * 60 * 24);
      return daysSinceMovement > 30;
    });

    return {
      totalInventoryValue,
      totalRetailValue,
      needsAttentionCount: needsAttention.length,
      staleProductsCount: staleProducts.length,
      depletedCount: products.filter((p) => p.stock === 0).length,
    };
  }, [stats, products]);

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
          value={operationalMetrics.totalInventoryValue}
          description="Inversión al costo"
          icon={DollarSign}
          color="green"
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
            operationalMetrics.needsAttentionCount > 0 ? "negative" : "positive"
          }
          description="Stock bajo o agotado"
          icon={AlertTriangle}
          color="orange"
          onClick={() => setActiveTab("products")}
        />

        <TabStatsCard
          title="Movimientos Hoy"
          value={stats?.recentMovements || 0}
          description="Transacciones registradas"
          icon={ShoppingBag}
          color="purple"
          onClick={() => setActiveTab("movements")}
        />
      </div>

      {/* Attention Required Section */}
      {operationalMetrics.needsAttentionCount > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-2">
                Productos Requieren Atención
              </h3>
              <div className="space-y-2 text-sm text-red-800 dark:text-red-200">
                <div className="flex items-center justify-between">
                  <span>Productos agotados</span>
                  <span className="font-semibold">
                    {operationalMetrics.depletedCount}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Stock bajo mínimo</span>
                  <span className="font-semibold">
                    {operationalMetrics.needsAttentionCount -
                      operationalMetrics.depletedCount}
                  </span>
                </div>
                {operationalMetrics.staleProductsCount > 0 && (
                  <div className="flex items-center justify-between">
                    <span>Sin movimiento (30+ días)</span>
                    <span className="font-semibold">
                      {operationalMetrics.staleProductsCount}
                    </span>
                  </div>
                )}
              </div>
              <button
                onClick={() => setActiveTab("products")}
                className="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Revisar Productos
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Alerts */}
        <div className="lg:col-span-1">
          <AlertsCard />
        </div>

        {/* Recent Products */}
        <div className="lg:col-span-2">
          <RecentProductsSection />
        </div>
      </div>

      {/* Quick Navigation Footer */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <button
            className="hover:scale-105 transition-transform"
            onClick={() => setActiveTab("products")}
          >
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {stats?.totalProducts || 0}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">
              Total Productos
            </div>
          </button>

          <button
            className="hover:scale-105 transition-transform"
            onClick={() => setActiveTab("categories")}
          >
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {categories.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">
              Categorías
            </div>
          </button>

          <button
            className="hover:scale-105 transition-transform"
            onClick={() => setActiveTab("suppliers")}
          >
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {suppliers.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">
              Proveedores
            </div>
          </button>

          <button
            className="hover:scale-105 transition-transform"
            onClick={() => setActiveTab("reports")}
          >
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              {operationalMetrics.totalRetailValue}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">
              Valor Retail
            </div>
          </button>
        </div>
      </div>
    </TabWrapper>
  );
});

export default OverviewTab;
