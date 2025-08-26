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

import React, { useMemo, useRef, useEffect, useState } from "react";
import {
  Package,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  ShoppingBag,
  DollarSign,
  ArrowUpRight,
  Eye,
} from "lucide-react";
import { cn } from "@/shared/utils";
import { useInventoryContext } from "../../../context";
import { ProductCard, StockIndicator } from "..";
import { TabTransition } from "../shared/TabTransition";
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

// 📊 Enhanced Stats Card with Animations
interface StatsCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
  color?: string;
  onClick?: () => void;
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  change,
  changeType = "neutral",
  icon: Icon,
  description,
  color = "blue",
  onClick,
}) => {
  const colorClasses = {
    blue: "from-blue-500 to-blue-600",
    green: "from-green-500 to-green-600",
    orange: "from-orange-500 to-orange-600",
    red: "from-red-500 to-red-600",
    purple: "from-purple-500 to-purple-600",
  };

  return (
    <div
      className={cn(
        "group relative bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700",
        "shadow-sm hover:shadow-lg dark:shadow-gray-900/20 transition-all duration-200",
        "overflow-hidden transform-gpu",
        onClick && "cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
      )}
      onClick={onClick}
    >
      {/* Gradient Background */}
      <div
        className={cn(
          "absolute top-0 right-0 w-20 h-20 opacity-10",
          "bg-gradient-to-br rounded-bl-full",
          colorClasses[color as keyof typeof colorClasses]
        )}
      />

      <div className="relative p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
              {title}
            </p>

            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {typeof value === "number" ? value.toLocaleString() : value}
            </div>

            {change && (
              <div
                className={cn(
                  "flex items-center space-x-1 text-sm",
                  changeType === "positive" &&
                    "text-green-600 dark:text-green-400",
                  changeType === "negative" && "text-red-600 dark:text-red-400",
                  changeType === "neutral" && "text-gray-600 dark:text-gray-400"
                )}
              >
                {changeType === "positive" && (
                  <TrendingUp className="w-4 h-4" />
                )}
                {changeType === "negative" && (
                  <TrendingDown className="w-4 h-4" />
                )}
                <span>{change}</span>
              </div>
            )}

            {description && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {description}
              </p>
            )}
          </div>

          <div
            className={cn(
              "p-3 rounded-lg bg-gradient-to-br",
              colorClasses[color as keyof typeof colorClasses]
            )}
          >
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>

        {onClick && (
          <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
            <ArrowUpRight className="w-4 h-4 text-gray-400" />
          </div>
        )}
      </div>
    </div>
  );
};

// 🚨 Enhanced Alert Card
const AlertsCard: React.FC = () => {
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
};

// 📦 Recent Products Section
const RecentProductsSection: React.FC = () => {
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-gray-200 dark:bg-gray-700 rounded-xl h-48 animate-pulse"
              />
            ))}
          </div>
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
};

// 🎯 OPTIMIZED OVERVIEW TAB - Memoized for SPA Performance
const OverviewTab: React.FC = React.memo(function OverviewTab() {
  const { inventory, setActiveTab } = useInventoryContext();
  const { stats, categories, suppliers } = inventory;

  // 🚨 FIX: Prevent initial flicker by detecting first render
  const isFirstRender = useRef(true);
  const [allowAnimations, setAllowAnimations] = useState(false);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      // Small delay to prevent initial animation flicker
      const timer = setTimeout(() => {
        setAllowAnimations(true);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, []);

  // 🧮 Computed values with memoization
  const totalInventoryValue = useMemo(() => {
    if (!stats) return "0";
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
      maximumFractionDigits: 0,
    }).format(stats.totalValue);
  }, [stats]);

  const totalRetailValue = useMemo(() => {
    if (!stats) return "0";
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
      maximumFractionDigits: 0,
    }).format(stats.totalRetailValue);
  }, [stats]);

  return (
    <TabTransition isActive={true} transitionType="slideUp" delay={0}>
      <div className="space-y-6 p-6">
        {/* Quick Actions Bar */}
        <div
          className={cn(
            "flex flex-wrap gap-3",
            allowAnimations && "animate-fadeInUp stagger-1"
          )}
        >
          <button
            onClick={() => setActiveTab("products")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-all duration-200 hover:scale-[1.02]"
          >
            <Package className="w-4 h-4" />
            <span>Gestionar Productos</span>
          </button>

          <button
            onClick={() => setActiveTab("categories")}
            className="border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-lg flex items-center space-x-2 transition-all duration-200 hover:scale-[1.02]"
          >
            <span>Categorías</span>
          </button>

          <button
            onClick={() => setActiveTab("suppliers")}
            className="border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-lg flex items-center space-x-2 transition-all duration-200 hover:scale-[1.02]"
          >
            <span>Proveedores</span>
          </button>
        </div>

        {/* Stats Grid */}
        <div
          className={cn(
            "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6",
            allowAnimations && "animate-slideInUp stagger-2"
          )}
        >
          <StatsCard
            title="Total Productos"
            value={stats?.totalProducts || 0}
            change="+12% vs mes anterior"
            changeType="positive"
            icon={Package}
            description="Productos activos en inventario"
            color="blue"
            onClick={() => setActiveTab("products")}
          />

          <StatsCard
            title="Valor Inventario"
            value={totalInventoryValue}
            change="+8.2% vs mes anterior"
            changeType="positive"
            icon={DollarSign}
            description="Valor total al costo"
            color="green"
            onClick={() => setActiveTab("reports")}
          />

          <StatsCard
            title="Valor Retail"
            value={totalRetailValue}
            change="+15.4% vs mes anterior"
            changeType="positive"
            icon={ShoppingBag}
            description="Valor total al precio de venta"
            color="purple"
            onClick={() => setActiveTab("reports")}
          />

          <StatsCard
            title="Alertas Stock"
            value={inventory.alerts.length}
            change={
              inventory.alerts.length > 0 ? "Requiere atención" : "Todo bien"
            }
            changeType={inventory.alerts.length > 0 ? "negative" : "positive"}
            icon={AlertTriangle}
            description="Productos con stock bajo"
            color="red"
            onClick={() => setActiveTab("products")}
          />
        </div>

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

        {/* Quick Stats Footer */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div
              className="hover:scale-105 transition-transform cursor-pointer"
              onClick={() => setActiveTab("categories")}
            >
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {categories.length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">
                Categorías
              </div>
            </div>

            <div
              className="hover:scale-105 transition-transform cursor-pointer"
              onClick={() => setActiveTab("suppliers")}
            >
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {suppliers.length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">
                Proveedores
              </div>
            </div>

            <div
              className="hover:scale-105 transition-transform cursor-pointer"
              onClick={() => setActiveTab("movements")}
            >
              <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                {stats?.recentMovements || 0}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">
                Movimientos Hoy
              </div>
            </div>

            <div
              className="hover:scale-105 transition-transform cursor-pointer"
              onClick={() => setActiveTab("products")}
            >
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {stats?.activeProducts || 0}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">
                Activos
              </div>
            </div>
          </div>
        </div>
      </div>
    </TabTransition>
  );
});

export default OverviewTab;
