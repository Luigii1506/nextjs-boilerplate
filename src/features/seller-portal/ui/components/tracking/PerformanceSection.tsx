/**
 * 📈 PERFORMANCE SECTION COMPONENT
 * ==================================
 *
 * Performance metrics and quick actions
 *
 * Created: 2025-01-27
 */

"use client";

import React from "react";
import {
  Clock,
  TrendingUp,
  Printer,
  Truck,
  ExternalLink,
  AlertTriangle,
} from "lucide-react";

export interface PerformanceSectionProps {
  avgFulfillmentHours: number;
  shippedIn24hrsPercent: number;
}

/**
 * PerformanceSection - Performance metrics and quick actions
 */
export const PerformanceSection: React.FC<PerformanceSectionProps> = React.memo(
  ({ avgFulfillmentHours, shippedIn24hrsPercent }) => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Average Fulfillment Time */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <Clock className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Tiempo Promedio de Fulfillment
            </h3>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-purple-600 dark:text-purple-400">
              {avgFulfillmentHours.toFixed(1)}
            </span>
            <span className="text-lg text-gray-600 dark:text-gray-300">
              horas
            </span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Desde orden hasta envío
          </p>
          <div className="mt-4 flex items-center gap-2 text-sm">
            <TrendingUp className="w-4 h-4 text-green-600" />
            <span className="text-green-600 dark:text-green-400 font-medium">
              {shippedIn24hrsPercent.toFixed(0)}% enviadas en 24hrs
            </span>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Acciones Rápidas
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <button className="flex flex-col items-center gap-2 p-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors">
              <Printer className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              <span className="text-xs font-medium text-blue-900 dark:text-blue-100">
                Imprimir Etiquetas
              </span>
            </button>
            <button className="flex flex-col items-center gap-2 p-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/50 transition-colors">
              <Truck className="w-6 h-6 text-green-600 dark:text-green-400" />
              <span className="text-xs font-medium text-green-900 dark:text-green-100">
                Solicitar Recolección
              </span>
            </button>
            <button className="flex flex-col items-center gap-2 p-4 bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-700 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors">
              <ExternalLink className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              <span className="text-xs font-medium text-purple-900 dark:text-purple-100">
                Trackear Múltiples
              </span>
            </button>
            <button className="flex flex-col items-center gap-2 p-4 bg-orange-50 dark:bg-orange-900/30 border border-orange-200 dark:border-orange-700 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/50 transition-colors">
              <AlertTriangle className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              <span className="text-xs font-medium text-orange-900 dark:text-orange-100">
                Reportar Problema
              </span>
            </button>
          </div>
        </div>
      </div>
    );
  }
);

PerformanceSection.displayName = "PerformanceSection";
