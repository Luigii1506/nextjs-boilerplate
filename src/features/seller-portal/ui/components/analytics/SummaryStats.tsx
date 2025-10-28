/**
 * 📈 SUMMARY STATS COMPONENT
 * ==========================
 *
 * Displays period summary with key metrics
 *
 * Created: 2025-01-27
 */

"use client";

import React from "react";
import { calculateSuccessRate } from "../../../utils/analytics.helpers";

export interface SummaryStatsProps {
  /** Number of completed orders */
  completedOrders: number;
  /** Number of pending orders */
  pendingOrders: number;
  /** Number of cancelled orders */
  cancelledOrders: number;
  /** Total orders */
  totalOrders: number;
}

/**
 * SummaryStats - Displays period summary metrics
 */
export const SummaryStats: React.FC<SummaryStatsProps> = React.memo(
  ({ completedOrders, pendingOrders, cancelledOrders, totalOrders }) => {
    const successRate = calculateSuccessRate(completedOrders, totalOrders);

    return (
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          📈 Resumen del Período
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
              Completadas
            </div>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {completedOrders}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
              Pendientes
            </div>
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {pendingOrders}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
              Canceladas
            </div>
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {cancelledOrders}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
              Tasa de Éxito
            </div>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {successRate.toFixed(1)}%
            </div>
          </div>
        </div>
      </div>
    );
  }
);

SummaryStats.displayName = "SummaryStats";
