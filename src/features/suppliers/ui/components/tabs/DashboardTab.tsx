/**
 * 📊 SUPPLIERS DASHBOARD TAB
 * ==========================
 *
 * Dashboard principal con métricas, KPIs y resumen de proveedores
 * Vista de alto nivel para gestión de proveedores
 *
 * REFACTORED: 2025-01-27
 * - Using shared Tab components (TabHeader, TabWrapper)
 * - Extracted MetricCard to shared components
 * - Clean orchestration pattern (~150 lines)
 *
 * Created: 2025-01-18 - Suppliers Dashboard
 */

"use client";

import React from "react";
import {
  Truck,
  Star,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { useSupplierContext } from "../../../context";
import { TabHeader, TabWrapper } from "@/shared/ui/components/tabs";
import { MetricCard } from "../dashboard/MetricCard";
import { RecentSuppliers } from "../dashboard/RecentSuppliers";
import { TopRatedSuppliers } from "../dashboard/TopRatedSuppliers";
import { QuickStatsCards } from "../dashboard/QuickStatsCards";

/**
 * 📊 Main Dashboard Tab
 */
export default function DashboardTab() {
  const { suppliers, stats } = useSupplierContext();

  // Calculate additional metrics
  const recentSuppliers = suppliers.data
    .sort((a, b) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return dateB - dateA;
    })
    .slice(0, 5);

  const topRatedSuppliers = suppliers.data
    .filter((s) => s.rating !== null)
    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
    .slice(0, 5);

  return (
    <TabWrapper>
      <TabHeader
        icon={<Truck className="w-8 h-8 text-blue-600 dark:text-blue-400" />}
        title="Dashboard de Proveedores"
        description="Resumen general y métricas clave de tus proveedores"
      />

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Proveedores"
          value={stats.total}
          change={12}
          icon={<Truck className="w-6 h-6" />}
          color="blue"
        />

        <MetricCard
          title="Proveedores Activos"
          value={stats.active}
          icon={<CheckCircle className="w-6 h-6" />}
          color="green"
        />

        <MetricCard
          title="Rating Promedio"
          value={stats.avgRating.toFixed(1)}
          icon={<Star className="w-6 h-6" />}
          color="orange"
        />

        <MetricCard
          title="Proveedores Bloqueados"
          value={stats.blocked}
          icon={<AlertCircle className="w-6 h-6" />}
          color="red"
        />
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentSuppliers
          suppliers={recentSuppliers}
          isLoading={suppliers.isLoading}
        />

        <TopRatedSuppliers
          suppliers={topRatedSuppliers}
          isLoading={suppliers.isLoading}
        />
      </div>

      {/* Quick Stats Cards */}
      <QuickStatsCards />
    </TabWrapper>
  );
}
