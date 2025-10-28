/**
 * 📊 FULFILLMENT METRICS CARDS
 * ==============================
 *
 * Main metrics cards for fulfillment dashboard
 *
 * Created: 2025-01-27
 */

"use client";

import React from "react";
import {
  Package,
  Truck,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";

export interface FulfillmentMetrics {
  pendingShipment: number;
  inTransit: number;
  delayed: number;
  delivered: number;
}

export interface FulfillmentMetricsCardsProps {
  metrics: FulfillmentMetrics;
}

/**
 * FulfillmentMetricsCards - Displays main fulfillment metrics
 */
export const FulfillmentMetricsCards: React.FC<
  FulfillmentMetricsCardsProps
> = React.memo(({ metrics }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Pending Shipment */}
      <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/30 dark:to-yellow-800/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
        <div className="flex items-center justify-between mb-2">
          <Package className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
          <span className="text-3xl font-bold text-yellow-700 dark:text-yellow-200">
            {metrics.pendingShipment}
          </span>
        </div>
        <h3 className="text-sm font-semibold text-yellow-900 dark:text-yellow-100">
          Pendientes de Envío
        </h3>
        <p className="text-xs text-yellow-600 dark:text-yellow-300 mt-1">
          Requieren tracking
        </p>
      </div>

      {/* In Transit */}
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
        <div className="flex items-center justify-between mb-2">
          <Truck className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          <span className="text-3xl font-bold text-blue-700 dark:text-blue-200">
            {metrics.inTransit}
          </span>
        </div>
        <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100">
          En Tránsito
        </h3>
        <p className="text-xs text-blue-600 dark:text-blue-300 mt-1">
          Activos con tracking
        </p>
      </div>

      {/* Delayed */}
      <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
        <div className="flex items-center justify-between mb-2">
          <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
          <span className="text-3xl font-bold text-red-700 dark:text-red-200">
            {metrics.delayed}
          </span>
        </div>
        <h3 className="text-sm font-semibold text-red-900 dark:text-red-100">
          Retrasadas
        </h3>
        <p className="text-xs text-red-600 dark:text-red-300 mt-1">
          &gt;48hrs sin enviar
        </p>
      </div>

      {/* Delivered */}
      <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
        <div className="flex items-center justify-between mb-2">
          <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
          <span className="text-3xl font-bold text-green-700 dark:text-green-200">
            {metrics.delivered}
          </span>
        </div>
        <h3 className="text-sm font-semibold text-green-900 dark:text-green-100">
          Entregadas
        </h3>
        <p className="text-xs text-green-600 dark:text-green-300 mt-1">
          Completadas
        </p>
      </div>
    </div>
  );
});

FulfillmentMetricsCards.displayName = "FulfillmentMetricsCards";
