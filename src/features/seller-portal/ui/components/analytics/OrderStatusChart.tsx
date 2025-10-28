/**
 * 📊 ORDER STATUS CHART COMPONENT
 * ================================
 *
 * Shows distribution of orders by status
 *
 * Created: 2025-01-27
 */

"use client";

import React from "react";
import { getStatusLabel } from "../../../utils/analytics.helpers";

export interface StatusData {
  status: string;
  count: number;
  percentage: number;
}

export interface OrderStatusChartProps {
  /** Status distribution data */
  data: StatusData[];
}

/**
 * OrderStatusChart - Displays order status distribution
 */
export const OrderStatusChart: React.FC<OrderStatusChartProps> = React.memo(
  ({ data }) => {
    if (!data || data.length === 0) {
      return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Estado de Órdenes
          </h3>
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            Sin datos de estados
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Estado de Órdenes
        </h3>
        <div className="space-y-3">
          {data.map((status) => (
            <div key={status.status}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  {getStatusLabel(status.status)}
                </span>
                <div className="text-right">
                  <span className="text-sm font-bold text-gray-900 dark:text-white">
                    {status.count}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                    ({status.percentage.toFixed(1)}%)
                  </span>
                </div>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                  style={{ width: `${status.percentage}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
);

OrderStatusChart.displayName = "OrderStatusChart";
