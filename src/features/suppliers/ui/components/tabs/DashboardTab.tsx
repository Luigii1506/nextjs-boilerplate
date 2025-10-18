/**
 * 📊 SUPPLIERS DASHBOARD TAB
 * ==========================
 *
 * Dashboard principal con métricas, KPIs y resumen de proveedores
 * Vista de alto nivel para gestión de proveedores
 *
 * Created: 2025-01-18 - Suppliers Dashboard
 */

"use client";

import React from "react";
import {
  Truck,
  TrendingUp,
  TrendingDown,
  Star,
  Package,
  AlertCircle,
  CheckCircle,
  Clock,
  DollarSign,
} from "lucide-react";
import { useSupplierContext } from "../../../context";
import { cn } from "@/shared/utils";

/**
 * 📊 Metric Card Component
 */
interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  color: "blue" | "green" | "orange" | "purple" | "red";
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  icon,
  color,
}) => {
  const colorClasses = {
    blue: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400",
    green:
      "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400",
    orange:
      "bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400",
    purple:
      "bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400",
    red: "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400",
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {title}
          </p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
            {value}
          </p>
          {change !== undefined && (
            <div className="flex items-center gap-1 mt-2">
              {change >= 0 ? (
                <TrendingUp className="w-4 h-4 text-green-500" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-500" />
              )}
              <span
                className={cn(
                  "text-sm font-medium",
                  change >= 0 ? "text-green-600" : "text-red-600"
                )}
              >
                {Math.abs(change)}%
              </span>
              <span className="text-sm text-gray-500">vs último mes</span>
            </div>
          )}
        </div>
        <div className={cn("p-3 rounded-lg", colorClasses[color])}>
          {icon}
        </div>
      </div>
    </div>
  );
};

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
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <Truck className="w-7 h-7 text-blue-600 dark:text-blue-400" />
          Dashboard de Proveedores
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Resumen general y métricas clave de tus proveedores
        </p>
      </div>

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
        {/* Recent Suppliers */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Proveedores Recientes
            </h3>
            <Clock className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {suppliers.isLoading ? (
              <p className="text-gray-500 text-sm">Cargando...</p>
            ) : recentSuppliers.length === 0 ? (
              <p className="text-gray-500 text-sm">No hay proveedores aún</p>
            ) : (
              recentSuppliers.map((supplier) => (
                <div
                  key={supplier.id}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {supplier.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {supplier.email || "Sin email"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {supplier.active ? (
                      <span className="px-2 py-1 text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded">
                        Activo
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded">
                        Inactivo
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Top Rated Suppliers */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Mejor Calificados
            </h3>
            <Star className="w-5 h-5 text-yellow-500" />
          </div>
          <div className="space-y-3">
            {suppliers.isLoading ? (
              <p className="text-gray-500 text-sm">Cargando...</p>
            ) : topRatedSuppliers.length === 0 ? (
              <p className="text-gray-500 text-sm">
                No hay proveedores calificados
              </p>
            ) : (
              topRatedSuppliers.map((supplier) => (
                <div
                  key={supplier.id}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {supplier.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {supplier.contactName || "Sin contacto"}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                      {supplier.rating?.toFixed(1)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-3">
            <Package className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            <div>
              <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                Próximas Entregas
              </p>
              <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                0
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg p-6 border border-green-200 dark:border-green-800">
          <div className="flex items-center gap-3">
            <DollarSign className="w-8 h-8 text-green-600 dark:text-green-400" />
            <div>
              <p className="text-sm font-medium text-green-600 dark:text-green-400">
                Órdenes Pendientes
              </p>
              <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                0
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg p-6 border border-purple-200 dark:border-purple-800">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            <div>
              <p className="text-sm font-medium text-purple-600 dark:text-purple-400">
                Alertas
              </p>
              <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                0
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
