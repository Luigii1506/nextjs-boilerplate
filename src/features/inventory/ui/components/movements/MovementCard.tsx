/**
 * 📦 MOVEMENT CARD COMPONENT
 * ===========================
 *
 * Card component for displaying a single stock movement
 * Extracted from MovementsTab for maintainability
 *
 * FEATURES:
 * - Product image and details
 * - Movement type badge with color coding
 * - Quantity change visualization
 * - Stock before/after display
 * - User and timestamp information
 * - Dark mode support
 *
 * Created: 2025-01-27 - Extracted from MovementsTab
 */

"use client";

import React from "react";
import { Package, User, Calendar } from "lucide-react";
import { cn } from "@/shared/utils";
import { Movement, MOVEMENT_TYPE_CONFIG } from "./movementConfig";

/**
 * MovementCard component props
 */
export interface MovementCardProps {
  /** Movement data */
  movement: Movement;
}

/**
 * MovementCard Component
 *
 * Displays a stock movement with product info, type, quantity, and metadata
 *
 * @param movement - Movement data to display
 *
 * @example
 * <MovementCard movement={movementData} />
 */
export const MovementCard: React.FC<MovementCardProps> = React.memo(
  ({ movement }) => {
    const config =
      MOVEMENT_TYPE_CONFIG[movement.type as keyof typeof MOVEMENT_TYPE_CONFIG];
    const Icon = config.icon;

    const quantityChange =
      movement.type === "IN"
        ? `+${movement.quantity}`
        : movement.type === "OUT"
        ? `-${movement.quantity}`
        : movement.quantity.toString();

    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between gap-4">
          {/* Left: Product Info */}
          <div className="flex items-start gap-3 flex-1 min-w-0">
            {/* Product Image */}
            <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-700 flex-shrink-0 overflow-hidden">
              {movement.product.images[0] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={movement.product.images[0]}
                  alt={movement.product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="w-6 h-6 text-gray-400" />
                </div>
              )}
            </div>

            {/* Product Details */}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                {movement.product.name}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                SKU: {movement.product.sku}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                {movement.reason}
              </p>
              {movement.reference && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Ref: {movement.reference}
                </p>
              )}
            </div>
          </div>

          {/* Right: Movement Info */}
          <div className="flex flex-col items-end gap-2 flex-shrink-0">
            {/* Type Badge */}
            <span
              className={cn(
                "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border",
                config.bgColor,
                config.textColor,
                config.borderColor
              )}
            >
              <Icon className="w-3 h-3" />
              {config.label}
            </span>

            {/* Quantity Change */}
            <div className="text-right">
              <div
                className={cn(
                  "text-2xl font-bold",
                  movement.type === "IN" &&
                    "text-green-600 dark:text-green-400",
                  movement.type === "OUT" && "text-red-600 dark:text-red-400",
                  movement.type === "ADJUSTMENT" &&
                    "text-purple-600 dark:text-purple-400"
                )}
              >
                {quantityChange}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {movement.previousStock} → {movement.newStock}
              </div>
            </div>

            {/* User & Date */}
            <div className="text-xs text-gray-500 dark:text-gray-400 text-right">
              <div className="flex items-center gap-1">
                <User className="w-3 h-3" />
                <span>{movement.user.name}</span>
              </div>
              <div className="flex items-center gap-1 mt-0.5">
                <Calendar className="w-3 h-3" />
                <span>
                  {new Intl.DateTimeFormat("es-MX", {
                    day: "2-digit",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  }).format(new Date(movement.createdAt))}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

MovementCard.displayName = "MovementCard";
