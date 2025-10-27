/**
 * ⚠️ STOCK ALERTS SUMMARY COMPONENT
 * ===================================
 *
 * Summary cards showing stock status distribution
 * Extracted from ReportsTab for maintainability
 *
 * FEATURES:
 * - Displays stock alerts in color-coded cards
 * - Shows counts for: OK, Low, Critical, Out of Stock
 * - Hover effects and animations
 * - Dark mode compatible
 * - Loading skeleton state
 *
 * Created: 2025-01-27 - Extracted from ReportsTab
 */

"use client";

import React from "react";
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  XCircle,
} from "lucide-react";
import { cn } from "@/shared/utils";
import { useQuery } from "@tanstack/react-query";
import { getStockAlertsSummaryAction } from "../../../actions";

/**
 * StockAlertsSummary Component
 *
 * Displays a grid of cards showing stock status distribution
 *
 * @example
 * <StockAlertsSummary />
 */
export const StockAlertsSummary: React.FC = React.memo(() => {
  const { data, isLoading } = useQuery({
    queryKey: ["inventory", "reports", "alerts-summary"],
    queryFn: async () => {
      const result = await getStockAlertsSummaryAction();
      return result.success ? result.data : null;
    },
    staleTime: 30000,
  });

  if (isLoading || !data) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 animate-pulse h-24"
          />
        ))}
      </div>
    );
  }

  const alerts = [
    {
      label: "Stock OK",
      value: data.ok,
      icon: CheckCircle2,
      color: "text-green-600 dark:text-green-400",
      bg: "bg-green-50 dark:bg-green-900/20",
      border: "border-green-200 dark:border-green-800",
    },
    {
      label: "Stock Bajo",
      value: data.low,
      icon: AlertCircle,
      color: "text-yellow-600 dark:text-yellow-400",
      bg: "bg-yellow-50 dark:bg-yellow-900/20",
      border: "border-yellow-200 dark:border-yellow-800",
    },
    {
      label: "Crítico",
      value: data.critical,
      icon: AlertTriangle,
      color: "text-orange-600 dark:text-orange-400",
      bg: "bg-orange-50 dark:bg-orange-900/20",
      border: "border-orange-200 dark:border-orange-800",
    },
    {
      label: "Sin Stock",
      value: data.outOfStock,
      icon: XCircle,
      color: "text-red-600 dark:text-red-400",
      bg: "bg-red-50 dark:bg-red-900/20",
      border: "border-red-200 dark:border-red-800",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {alerts.map((alert) => {
        const Icon = alert.icon;
        return (
          <div
            key={alert.label}
            className={cn(
              "rounded-lg border p-4 transition-all hover:scale-105",
              alert.bg,
              alert.border
            )}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  {alert.label}
                </p>
                <p className={cn("text-2xl font-bold mt-1", alert.color)}>
                  {alert.value}
                </p>
              </div>
              <Icon className={cn("w-8 h-8", alert.color)} />
            </div>
          </div>
        );
      })}
    </div>
  );
});

StockAlertsSummary.displayName = "StockAlertsSummary";
