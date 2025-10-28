/**
 * 📊 ORDER STATS COMPONENT
 * =========================
 *
 * Displays order statistics in the header
 *
 * Created: 2025-01-27
 */

"use client";

import React from "react";
import { formatCurrency } from "../../../utils/orders.helpers";

export interface OrderStatsData {
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
}

export interface OrderStatsProps {
  stats: OrderStatsData | undefined;
  isLoading?: boolean;
}

/**
 * OrderStats - Displays key order metrics
 */
export const OrderStats: React.FC<OrderStatsProps> = React.memo(
  ({ stats, isLoading = false }) => {
    if (isLoading || !stats) return null;

    return (
      <div className="flex gap-4">
        <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg px-4 py-2">
          <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
            Total Órdenes
          </p>
          <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
            {stats.totalOrders}
          </p>
        </div>
        <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg px-4 py-2">
          <p className="text-xs text-green-600 dark:text-green-400 font-medium">
            Ingresos
          </p>
          <p className="text-2xl font-bold text-green-900 dark:text-green-100">
            {formatCurrency(stats.totalRevenue)}
          </p>
        </div>
        <div className="bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-800 rounded-lg px-4 py-2">
          <p className="text-xs text-purple-600 dark:text-purple-400 font-medium">
            Ticket Promedio
          </p>
          <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
            {formatCurrency(stats.averageOrderValue)}
          </p>
        </div>
      </div>
    );
  }
);

OrderStats.displayName = "OrderStats";
