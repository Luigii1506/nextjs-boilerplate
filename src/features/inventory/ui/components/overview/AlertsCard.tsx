/**
 * 🚨 ALERTS CARD COMPONENT
 * ========================
 *
 * Displays stock alerts for products that need attention
 * Extracted from OverviewTab for reusability and maintainability
 *
 * FEATURES:
 * - Shows low/critical/out of stock alerts
 * - Memoized for performance
 * - Click to navigate to products tab
 * - Empty state handling
 *
 * Created: 2025-01-27 - Extracted from OverviewTab
 */

"use client";

import React from "react";
import { AlertTriangle, Eye, Package } from "lucide-react";
import { cn } from "@/shared/utils";
import { StockIndicator } from "../shared";

/**
 * Alert item structure
 */
export interface Alert {
  id: string;
  productId: string;
  productName: string;
  productSku: string;
  category: string;
  currentStock: number;
  minStock: number;
  status: "OUT_OF_STOCK" | "CRITICAL_STOCK" | "LOW_STOCK";
}

/**
 * Component props
 */
export interface AlertsCardProps {
  alerts: Alert[];
  onViewAll?: () => void;
  maxDisplay?: number;
  className?: string;
}

/**
 * Stock Alerts Card Component
 *
 * Displays a list of products that require attention due to low stock levels
 *
 * @param alerts - Array of stock alerts
 * @param onViewAll - Callback when "Ver todos" is clicked
 * @param maxDisplay - Maximum number of alerts to display (default: 5)
 * @param className - Additional CSS classes
 *
 * @example
 * <AlertsCard
 *   alerts={stockAlerts}
 *   onViewAll={() => setActiveTab('products')}
 *   maxDisplay={5}
 * />
 */
export const AlertsCard: React.FC<AlertsCardProps> = React.memo(
  ({ alerts, onViewAll, maxDisplay = 5, className }) => {
    const displayedAlerts = alerts.slice(0, maxDisplay);

    return (
      <div
        className={cn(
          "bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm",
          className
        )}
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Alertas de Stock
              </h3>
            </div>

            <div className="flex items-center space-x-2">
              {/* Alert count badge */}
              <span className="bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400 text-sm font-medium px-2.5 py-0.5 rounded-full">
                {alerts.length}
              </span>

              {/* View all button */}
              {onViewAll && alerts.length > 0 && (
                <button
                  onClick={onViewAll}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center space-x-1 transition-colors"
                  aria-label="Ver todas las alertas"
                >
                  <Eye className="w-3 h-3" />
                  <span>Ver todos</span>
                </button>
              )}
            </div>
          </div>

          {/* Alerts list */}
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {displayedAlerts.length > 0 ? (
              displayedAlerts.map((alert, index) => (
                <div
                  key={alert.id}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                  style={{
                    animationDelay: `${index * 0.1}s`,
                  }}
                >
                  {/* Alert details */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 dark:text-gray-100 truncate">
                      {alert.productName}
                    </h4>

                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        SKU: {alert.productSku}
                      </span>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {alert.category}
                      </span>
                    </div>

                    {/* Stock indicator */}
                    <StockIndicator
                      stock={alert.currentStock}
                      minStock={alert.minStock}
                      size="sm"
                      showLabel={false}
                    />
                  </div>

                  {/* Status badge */}
                  <div className="ml-4">
                    <div
                      className={cn(
                        "px-2 py-1 rounded-full text-xs font-medium",
                        alert.status === "OUT_OF_STOCK" &&
                          "bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400",
                        alert.status === "CRITICAL_STOCK" &&
                          "bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400",
                        alert.status === "LOW_STOCK" &&
                          "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400"
                      )}
                    >
                      {alert.status === "OUT_OF_STOCK" && "Agotado"}
                      {alert.status === "CRITICAL_STOCK" && "Crítico"}
                      {alert.status === "LOW_STOCK" && "Bajo"}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              /* Empty state */
              <div className="text-center py-8">
                <Package className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400">
                  ✅ No hay alertas de stock
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
);

AlertsCard.displayName = "AlertsCard";
