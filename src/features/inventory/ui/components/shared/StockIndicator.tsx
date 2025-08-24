/**
 * 📊 STOCK INDICATOR COMPONENT
 * ============================
 *
 * Componente reutilizable para mostrar el estado del stock
 * React 19 optimizado con dark mode completo
 *
 * Created: 2025-01-17 - Inventory Management Module
 */

import React, { memo } from "react";
import { AlertTriangle, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { cn } from "@/shared/utils";
import { STOCK_STATUS, INVENTORY_DEFAULTS } from "../../../constants";
import type { StockIndicatorProps, StockStatus } from "../../../types";

// 🧮 Utility function to determine stock status
function getStockStatus(
  stock: number,
  minStock: number,
  maxStock?: number | null
): StockStatus {
  if (stock === 0) return "OUT_OF_STOCK";
  if (stock <= INVENTORY_DEFAULTS.CRITICAL_STOCK_THRESHOLD)
    return "CRITICAL_STOCK";
  if (stock <= minStock) return "LOW_STOCK";
  return "IN_STOCK";
}

// 🧮 Get stock percentage for progress bar
function getStockPercentage(
  stock: number,
  minStock: number,
  maxStock?: number | null
): number {
  if (!maxStock || maxStock <= minStock) {
    // If no maxStock, use minStock * 4 as reference for percentage
    const referenceMax = minStock * 4;
    return Math.min(100, (stock / referenceMax) * 100);
  }

  return Math.min(100, (stock / maxStock) * 100);
}

// 🎨 Status icon components
const StatusIcons = {
  IN_STOCK: CheckCircle,
  LOW_STOCK: AlertTriangle,
  CRITICAL_STOCK: AlertCircle,
  OUT_OF_STOCK: XCircle,
} as const;

// 🎯 Main component
const StockIndicator: React.FC<StockIndicatorProps> = memo(
  ({
    stock,
    minStock,
    maxStock = null,
    size = "md",
    showLabel = true,
    className,
  }) => {
    const status = getStockStatus(stock, minStock, maxStock);
    const percentage = getStockPercentage(stock, minStock, maxStock);
    const statusConfig = STOCK_STATUS[status];
    const StatusIcon = StatusIcons[status];

    // 📐 Size configurations
    const sizeClasses = {
      sm: {
        container: "text-xs",
        icon: "w-3 h-3",
        progressBar: "h-1",
        badge: "px-1.5 py-0.5 text-[10px]",
      },
      md: {
        container: "text-sm",
        icon: "w-4 h-4",
        progressBar: "h-2",
        badge: "px-2 py-1 text-xs",
      },
      lg: {
        container: "text-base",
        icon: "w-5 h-5",
        progressBar: "h-3",
        badge: "px-3 py-1.5 text-sm",
      },
    } as const;

    const sizes = sizeClasses[size];

    return (
      <div
        className={cn(
          "flex items-center space-x-2",
          sizes.container,
          className
        )}
      >
        {/* 📊 Progress bar */}
        <div className="flex-1 min-w-0">
          <div
            className={cn(
              "relative overflow-hidden rounded-full",
              sizes.progressBar,
              "bg-gray-200 dark:bg-gray-700"
            )}
          >
            <div
              className={cn(
                "h-full transition-all duration-300 ease-out rounded-full",
                status === "OUT_OF_STOCK" && "bg-gray-400 dark:bg-gray-600",
                status === "CRITICAL_STOCK" &&
                  "bg-gradient-to-r from-red-500 to-red-600",
                status === "LOW_STOCK" &&
                  "bg-gradient-to-r from-yellow-500 to-amber-500",
                status === "IN_STOCK" &&
                  "bg-gradient-to-r from-green-500 to-emerald-500"
              )}
              style={{ width: `${Math.max(percentage, 2)}%` }}
            />
          </div>

          {/* Stock text overlay */}
          <div className="flex justify-between items-center mt-1">
            <span className="text-gray-600 dark:text-gray-300 font-medium">
              {stock} {stock === 1 ? "unidad" : "unidades"}
            </span>
            {maxStock && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                / {maxStock}
              </span>
            )}
          </div>
        </div>

        {/* 🏷️ Status badge */}
        {showLabel && (
          <div
            className={cn(
              "flex items-center space-x-1 rounded-full font-medium border",
              sizes.badge,
              statusConfig.textColor,
              statusConfig.bgColor,
              statusConfig.borderColor
            )}
          >
            <StatusIcon className={sizes.icon} />
            <span>{statusConfig.label}</span>
          </div>
        )}
      </div>
    );
  }
);

StockIndicator.displayName = "StockIndicator";

export default StockIndicator;
