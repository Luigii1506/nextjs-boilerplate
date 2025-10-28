/**
 * 📊 ANALYTICS TAB - Seller Portal
 * =================================
 *
 * Dashboard de métricas y reportes
 *
 * REFACTORED: 2025-01-27
 * - Using shared Tab components (TabHeader, TabWrapper, TabLoadingSkeleton)
 * - Standardized with inventory/users pattern
 * - Clean orchestration pattern
 */

"use client";

import { useState } from "react";
import { BarChart3 } from "lucide-react";
import {
  useAnalyticsMetrics,
  useRevenueByChannel,
  useTopProducts,
  useDiscountAnalytics,
  useDailyRevenue,
  useOrderStatusDistribution,
} from "../../hooks/useAnalytics";
import {
  MetricsCard,
  RevenueChart,
  ChannelPerformance,
  TopProductsList,
  DiscountAnalytics,
  OrderStatusChart,
  SummaryStats,
} from "../components/analytics";
import { formatCurrency } from "../../utils/analytics.helpers";
import {
  TabHeader,
  TabWrapper,
  TabLoadingSkeleton,
} from "@/shared/ui/components/tabs";

export function AnalyticsTab() {
  const [dateRange, setDateRange] = useState("7d");

  // Queries
  const { data: metrics, isLoading: metricsLoading } =
    useAnalyticsMetrics(dateRange);
  const { data: channelData } = useRevenueByChannel(dateRange);
  const { data: topProducts } = useTopProducts(dateRange, 5);
  const { data: discounts } = useDiscountAnalytics(dateRange);
  const { data: dailyRevenue } = useDailyRevenue(dateRange);
  const { data: statusDistribution } = useOrderStatusDistribution(dateRange);

  return (
    <TabWrapper>
      <TabHeader
        icon={
          <BarChart3 className="w-8 h-8 text-blue-600 dark:text-blue-400" />
        }
        title="Analytics"
        description="Métricas y reportes de ventas"
        customActions={
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="24h">Últimas 24 horas</option>
            <option value="7d">Últimos 7 días</option>
            <option value="30d">Últimos 30 días</option>
            <option value="90d">Últimos 90 días</option>
            <option value="12m">Último año</option>
          </select>
        }
      />

      {/* Loading State */}
      {metricsLoading && <TabLoadingSkeleton type="stats" count={4} />}

      {/* Main Metrics */}
      {!metricsLoading && metrics && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <MetricsCard
              title="Ingresos Totales"
              value={formatCurrency(metrics.totalRevenue)}
              subtitle={`${metrics.completedOrders} órdenes completadas`}
              icon="💰"
            />
            <MetricsCard
              title="Órdenes"
              value={metrics.totalOrders}
              subtitle={`${metrics.pendingOrders} pendientes`}
              icon="📦"
            />
            <MetricsCard
              title="Ticket Promedio"
              value={formatCurrency(metrics.averageOrderValue)}
              subtitle="Por orden completada"
              icon="📊"
            />
            <MetricsCard
              title="Clientes"
              value={metrics.totalCustomers}
              subtitle="Clientes únicos"
              icon="👥"
            />
          </div>

          {/* Revenue Chart */}
          <RevenueChart data={dailyRevenue || []} />

          {/* Channel Performance & Top Products */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ChannelPerformance data={channelData || []} />
            <TopProductsList products={topProducts || []} />
          </div>

          {/* Discounts & Order Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <DiscountAnalytics data={discounts || null} />
            <OrderStatusChart data={statusDistribution || []} />
          </div>

          {/* Summary Stats */}
          <SummaryStats
            completedOrders={metrics.completedOrders}
            pendingOrders={metrics.pendingOrders}
            cancelledOrders={metrics.cancelledOrders}
            totalOrders={metrics.totalOrders}
          />
        </>
      )}
    </TabWrapper>
  );
}
