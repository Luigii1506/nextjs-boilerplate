/**
 * 📈 REVENUE CHART COMPONENT
 * ==========================
 *
 * Horizontal bar chart showing daily revenue
 *
 * Created: 2025-01-27
 */

"use client";

import React from "react";
import { formatChartDate, formatCurrency, calculateBarPercentage } from "../../../utils/analytics.helpers";

export interface DailyRevenueData {
  date: string;
  revenue: number;
  orders: number;
}

export interface RevenueChartProps {
  /** Daily revenue data */
  data: DailyRevenueData[];
}

/**
 * RevenueChart - Displays daily revenue as horizontal bars
 */
export const RevenueChart: React.FC<RevenueChartProps> = React.memo(({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Ingresos por Día
        </h3>
        <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
          <div className="text-center text-gray-500 dark:text-gray-400">
            <div className="text-4xl mb-2">📈</div>
            <p>Sin datos para el período seleccionado</p>
          </div>
        </div>
      </div>
    );
  }

  const maxRevenue = Math.max(...data.map((d) => d.revenue));

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Ingresos por Día
      </h3>
      <div className="space-y-2">
        {data.map((day) => (
          <div key={day.date} className="flex items-center gap-4">
            <div className="text-sm text-gray-600 dark:text-gray-300 w-24">
              {formatChartDate(day.date)}
            </div>
            <div className="flex-1">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-6 relative">
                <div
                  className="bg-blue-600 dark:bg-blue-500 h-6 rounded-full flex items-center justify-end pr-2"
                  style={{
                    width: `${calculateBarPercentage(day.revenue, maxRevenue)}%`,
                  }}
                >
                  <span className="text-xs text-white font-medium">
                    {formatCurrency(day.revenue)}
                  </span>
                </div>
              </div>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 w-16 text-right">
              {day.orders} órdenes
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

RevenueChart.displayName = "RevenueChart";
