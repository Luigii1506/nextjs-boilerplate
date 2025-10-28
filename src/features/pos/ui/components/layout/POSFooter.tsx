"use client";
/**
 * 🦶 POS Footer
 * =============
 *
 * Footer del POS con información de estado.
 *
 * @module pos/ui/components/layout/POSFooter
 * @version 1.0.0
 */

import React from "react";
import { useDailyStats } from "../../../hooks";
import { formatCurrency } from "../../../utils";

export const POSFooter: React.FC = () => {
  const { data: dailyStats, isLoading } = useDailyStats();

  return (
    <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col sm:flex-row items-center justify-between space-y-2 sm:space-y-0">
          {/* Left: Daily Stats */}
          <div className="flex items-center space-x-4 text-sm">
            {isLoading ? (
              <span className="text-gray-500 dark:text-gray-400">
                Cargando estadísticas...
              </span>
            ) : dailyStats ? (
              <>
                <div className="flex items-center space-x-2">
                  <span className="text-gray-600 dark:text-gray-400">
                    Ventas hoy:
                  </span>
                  <span className="font-semibold text-green-600 dark:text-green-400">
                    {formatCurrency(dailyStats.netSales)}
                  </span>
                </div>
                <div className="hidden md:flex items-center space-x-2">
                  <span className="text-gray-600 dark:text-gray-400">
                    Transacciones:
                  </span>
                  <span className="font-semibold text-blue-600 dark:text-blue-400">
                    {dailyStats.totalTransactions}
                  </span>
                </div>
              </>
            ) : null}
          </div>

          {/* Right: System Info */}
          <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
            <span>v1.0.0</span>
            <span>•</span>
            <span>{new Date().toLocaleDateString("es-MX")}</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
