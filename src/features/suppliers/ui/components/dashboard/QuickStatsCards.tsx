/**
 * 📊 QUICK STATS CARDS COMPONENT
 * ===============================
 *
 * Displays quick overview stats in gradient cards
 *
 * Created: 2025-01-27
 */

"use client";

import React from "react";
import { Package, DollarSign, AlertCircle } from "lucide-react";

export const QuickStatsCards: React.FC = () => {
  return (
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
  );
};
