/**
 * 🚨 ALERTS SECTION COMPONENT
 * ============================
 *
 * Urgent alerts for delayed orders and issues
 *
 * Created: 2025-01-27
 */

"use client";

import React from "react";
import { AlertTriangle, Clock, XCircle } from "lucide-react";

export interface AlertsSectionProps {
  delayedCount: number;
  issuesCount: number;
}

/**
 * AlertsSection - Displays urgent alerts and issues
 */
export const AlertsSection: React.FC<AlertsSectionProps> = React.memo(
  ({ delayedCount, issuesCount }) => {
    if (delayedCount === 0 && issuesCount === 0) {
      return null;
    }

    return (
      <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
          <h3 className="text-lg font-semibold text-red-900 dark:text-red-100">
            Alertas y Acciones Urgentes
          </h3>
        </div>
        <div className="space-y-3">
          {delayedCount > 0 && (
            <div className="flex items-start gap-3 p-4 bg-white dark:bg-gray-800 rounded-lg">
              <Clock className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-white">
                  {delayedCount} órdenes sin enviar por más de 48 horas
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Estas órdenes requieren atención inmediata
                </p>
              </div>
              <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium">
                Ver Órdenes
              </button>
            </div>
          )}
          {issuesCount > 0 && (
            <div className="flex items-start gap-3 p-4 bg-white dark:bg-gray-800 rounded-lg">
              <XCircle className="w-5 h-5 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-white">
                  {issuesCount} problemas de entrega detectados
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Incluye cancelaciones y entregas fallidas
                </p>
              </div>
              <button className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium">
                Resolver
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }
);

AlertsSection.displayName = "AlertsSection";
