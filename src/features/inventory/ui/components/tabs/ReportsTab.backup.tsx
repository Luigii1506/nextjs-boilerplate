/**
 * 📊 REPORTS TAB COMPONENT
 * ========================
 *
 * Dashboard completo de reportes y analytics con gráficas interactivas
 * Usa Recharts con dark mode completo y diseño hermoso
 *
 * Created: 2025-01-18 - Inventory Reports & Analytics
 */

"use client";

import React, { useState } from "react";
import {
  BarChart3,
  TrendingUp,
  Package,
  DollarSign,
  Download,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import { cn } from "@/shared/utils";
import { TabWrapper, TabHeader } from "@/shared/ui/components/tabs";
import { useQuery } from "@tanstack/react-query";
import {
  getStockMovementsByDateAction,
  getInventoryValueOverTimeAction,
  getTopProductsByValueAction,
  getProductsByCategoryAction,
  getStockAlertsSummaryAction,
} from "../../../actions";

// 🎨 Color palette for charts (dark mode compatible)
const COLORS = {
  primary: "#3B82F6",
  success: "#10B981",
  warning: "#F59E0B",
  danger: "#EF4444",
  purple: "#8B5CF6",
  cyan: "#06B6D4",
  pink: "#EC4899",
};

const CHART_COLORS = [
  COLORS.primary,
  COLORS.success,
  COLORS.warning,
  COLORS.danger,
  COLORS.purple,
  COLORS.cyan,
];

// 🎯 Time range options
const TIME_RANGES = [
  { value: 7, label: "7 días" },
  { value: 30, label: "30 días" },
  { value: 90, label: "90 días" },
];

/**
 * 📈 Stock Movements Chart Component
 */
const StockMovementsChart: React.FC<{ days: number }> = ({ days }) => {
  const { data, isLoading } = useQuery({
    queryKey: ["inventory", "reports", "movements", days],
    queryFn: async () => {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      const result = await getStockMovementsByDateAction(startDate, endDate);
      return result.success ? result.data || [] : [];
    },
    staleTime: 60000, // 1 minute
  });

  if (isLoading) {
    return (
      <div className="h-80 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={320}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="colorIN" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={COLORS.success} stopOpacity={0.8} />
            <stop offset="95%" stopColor={COLORS.success} stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorOUT" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={COLORS.danger} stopOpacity={0.8} />
            <stop offset="95%" stopColor={COLORS.danger} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid
          strokeDasharray="3 3"
          className="stroke-gray-200 dark:stroke-gray-700"
        />
        <XAxis
          dataKey="date"
          className="text-xs text-gray-600 dark:text-gray-400"
          tick={{ fill: "currentColor" }}
        />
        <YAxis
          className="text-xs text-gray-600 dark:text-gray-400"
          tick={{ fill: "currentColor" }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "var(--tooltip-bg, #ffffff)",
            border: "1px solid var(--tooltip-border, #e5e7eb)",
            borderRadius: "8px",
          }}
          labelStyle={{ color: "var(--tooltip-text, #374151)" }}
        />
        <Legend />
        <Area
          type="monotone"
          dataKey="IN"
          stroke={COLORS.success}
          fillOpacity={1}
          fill="url(#colorIN)"
          name="Entradas"
        />
        <Area
          type="monotone"
          dataKey="OUT"
          stroke={COLORS.danger}
          fillOpacity={1}
          fill="url(#colorOUT)"
          name="Salidas"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

/**
 * 💰 Inventory Value Chart Component
 */
const InventoryValueChart: React.FC<{ days: number }> = ({ days }) => {
  const { data, isLoading } = useQuery({
    queryKey: ["inventory", "reports", "value", days],
    queryFn: async () => {
      const result = await getInventoryValueOverTimeAction(days);
      return result.success ? result.data || [] : [];
    },
    staleTime: 60000,
  });

  if (isLoading) {
    return (
      <div className="h-80 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={320}>
      <LineChart data={data}>
        <CartesianGrid
          strokeDasharray="3 3"
          className="stroke-gray-200 dark:stroke-gray-700"
        />
        <XAxis
          dataKey="date"
          className="text-xs text-gray-600 dark:text-gray-400"
          tick={{ fill: "currentColor" }}
        />
        <YAxis
          className="text-xs text-gray-600 dark:text-gray-400"
          tick={{ fill: "currentColor" }}
          tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "var(--tooltip-bg, #ffffff)",
            border: "1px solid var(--tooltip-border, #e5e7eb)",
            borderRadius: "8px",
          }}
          formatter={(value: number) => `$${value.toLocaleString()}`}
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="totalValue"
          stroke={COLORS.primary}
          strokeWidth={2}
          name="Valor Costo"
          dot={{ fill: COLORS.primary, r: 4 }}
          activeDot={{ r: 6 }}
        />
        <Line
          type="monotone"
          dataKey="totalRetailValue"
          stroke={COLORS.success}
          strokeWidth={2}
          name="Valor Venta"
          dot={{ fill: COLORS.success, r: 4 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

/**
 * 🏆 Top Products Chart Component
 */
const TopProductsChart: React.FC = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["inventory", "reports", "top-products"],
    queryFn: async () => {
      const result = await getTopProductsByValueAction(10);
      return result.success ? result.data || [] : [];
    },
    staleTime: 60000,
  });

  if (isLoading) {
    return (
      <div className="h-80 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={data} layout="vertical">
        <CartesianGrid
          strokeDasharray="3 3"
          className="stroke-gray-200 dark:stroke-gray-700"
        />
        <XAxis
          type="number"
          className="text-xs text-gray-600 dark:text-gray-400"
          tick={{ fill: "currentColor" }}
          tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
        />
        <YAxis
          dataKey="name"
          type="category"
          width={150}
          className="text-xs text-gray-600 dark:text-gray-400"
          tick={{ fill: "currentColor" }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "var(--tooltip-bg, #ffffff)",
            border: "1px solid var(--tooltip-border, #e5e7eb)",
            borderRadius: "8px",
          }}
          formatter={(value: number) => `$${value.toLocaleString()}`}
        />
        <Bar
          dataKey="totalValue"
          fill={COLORS.primary}
          radius={[0, 4, 4, 0]}
          name="Valor Total"
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

/**
 * 🥧 Products by Category Chart Component
 */
const ProductsByCategoryChart: React.FC = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["inventory", "reports", "by-category"],
    queryFn: async () => {
      const result = await getProductsByCategoryAction();
      return result.success ? result.data || [] : [];
    },
    staleTime: 60000,
  });

  if (isLoading) {
    return (
      <div className="h-80 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={320}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ categoryName, productCount }) =>
            `${categoryName}: ${productCount}`
          }
          outerRadius={100}
          fill="#8884d8"
          dataKey="productCount"
        >
          {data?.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={CHART_COLORS[index % CHART_COLORS.length]}
            />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: "var(--tooltip-bg, #ffffff)",
            border: "1px solid var(--tooltip-border, #e5e7eb)",
            borderRadius: "8px",
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};

/**
 * ⚠️ Stock Alerts Summary Component
 */
const StockAlertsSummary: React.FC = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["inventory", "reports", "alerts-summary"],
    queryFn: async () => {
      const result = await getStockAlertsSummaryAction();
      return result.success ? result.data : null;
    },
    staleTime: 30000,
  });

  if (isLoading || !data) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 animate-pulse h-24"
          />
        ))}
      </div>
    );
  }

  const alerts = [
    {
      label: "Stock OK",
      value: data.ok,
      icon: CheckCircle2,
      color: "text-green-600 dark:text-green-400",
      bg: "bg-green-50 dark:bg-green-900/20",
      border: "border-green-200 dark:border-green-800",
    },
    {
      label: "Stock Bajo",
      value: data.low,
      icon: AlertCircle,
      color: "text-yellow-600 dark:text-yellow-400",
      bg: "bg-yellow-50 dark:bg-yellow-900/20",
      border: "border-yellow-200 dark:border-yellow-800",
    },
    {
      label: "Crítico",
      value: data.critical,
      icon: AlertTriangle,
      color: "text-orange-600 dark:text-orange-400",
      bg: "bg-orange-50 dark:bg-orange-900/20",
      border: "border-orange-200 dark:border-orange-800",
    },
    {
      label: "Sin Stock",
      value: data.outOfStock,
      icon: XCircle,
      color: "text-red-600 dark:text-red-400",
      bg: "bg-red-50 dark:bg-red-900/20",
      border: "border-red-200 dark:border-red-800",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {alerts.map((alert) => {
        const Icon = alert.icon;
        return (
          <div
            key={alert.label}
            className={cn(
              "rounded-lg border p-4 transition-all hover:scale-105",
              alert.bg,
              alert.border
            )}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  {alert.label}
                </p>
                <p className={cn("text-2xl font-bold mt-1", alert.color)}>
                  {alert.value}
                </p>
              </div>
              <Icon className={cn("w-8 h-8", alert.color)} />
            </div>
          </div>
        );
      })}
    </div>
  );
};

/**
 * 📊 Main Reports Tab Component
 */
const ReportsTab: React.FC = React.memo(function ReportsTab() {
  const [selectedRange, setSelectedRange] = useState(30);

  return (
    <TabWrapper spacing="space-y-6">
      {/* Header */}
      <TabHeader
        icon={
          <BarChart3 className="w-8 h-8 text-blue-600 dark:text-blue-400" />
        }
        title="Reportes y Analytics"
        description="Análisis detallado de tu inventario"
      >
        <div className="flex items-center gap-2">
          {/* Time Range Selector */}
          <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            {TIME_RANGES.map((range) => (
              <button
                key={range.value}
                onClick={() => setSelectedRange(range.value)}
                className={cn(
                  "px-4 py-2 rounded-md text-sm font-medium transition-all",
                  selectedRange === range.value
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                )}
              >
                {range.label}
              </button>
            ))}
          </div>

          <button className="flex items-center gap-2 px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <Download className="w-4 h-4" />
            <span>Exportar</span>
          </button>
        </div>
      </TabHeader>

      {/* Stock Alerts Summary */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Resumen de Alertas
        </h3>
        <StockAlertsSummary />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stock Movements Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Movimientos de Stock
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Entradas vs Salidas
              </p>
            </div>
            <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <StockMovementsChart days={selectedRange} />
        </div>

        {/* Inventory Value Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Valor del Inventario
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Costo vs Venta
              </p>
            </div>
            <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
          <InventoryValueChart days={selectedRange} />
        </div>

        {/* Top Products Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Top 10 Productos
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Por valor total
              </p>
            </div>
            <Package className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
          <TopProductsChart />
        </div>

        {/* Products by Category Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Productos por Categoría
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Distribución
              </p>
            </div>
            <Package className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
          </div>
          <ProductsByCategoryChart />
        </div>
      </div>
    </TabWrapper>
  );
});

export default ReportsTab;
