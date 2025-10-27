/**
 * 📊 REPORTS TAB COMPONENT
 * ========================
 *
 * Clean tab for reports and analytics with extracted chart components
 * Orchestrates display of charts and summaries
 *
 * ARCHITECTURE:
 * - Uses TabHeader component for consistent header
 * - Uses extracted chart components (StockMovementsChart, etc.)
 * - Uses extracted StockAlertsSummary component
 * - Shared chart configuration for consistency
 *
 * REFACTORED: 2025-01-27
 * - Reduced from 558 lines to ~170 lines (70% reduction)
 * - Extracted 5 chart components
 * - Extracted StockAlertsSummary component
 * - Shared chart configuration
 * - Cleaner orchestration pattern
 *
 * Created: 2025-01-18 - Inventory Reports & Analytics
 * Updated: 2025-01-27 - Architecture refactor for maintainability
 */

"use client";

import React, { useState } from "react";
import {
  BarChart3,
  TrendingUp,
  Package,
  DollarSign,
  Download,
} from "lucide-react";
import { cn } from "@/shared/utils";
import { TabWrapper, TabHeader } from "@/shared/ui/components/tabs";
import {
  StockMovementsChart,
  InventoryValueChart,
  TopProductsChart,
  ProductsByCategoryChart,
  StockAlertsSummary,
  TIME_RANGES,
} from "../reports";

/**
 * 📊 Main Reports Tab Component
 *
 * Displays analytics dashboard with charts and summaries
 */
const ReportsTab: React.FC = React.memo(function ReportsTab() {
  const [selectedRange, setSelectedRange] = useState(30);

  return (
    <TabWrapper spacing="space-y-6">
      {/* 🔥 Using TabHeader component */}
      <TabHeader
        icon={
          <BarChart3 className="w-8 h-8 text-blue-600 dark:text-blue-400" />
        }
        title="Reportes y Analytics"
        description="Análisis detallado de tu inventario"
        customActions={
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
        }
      />

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
