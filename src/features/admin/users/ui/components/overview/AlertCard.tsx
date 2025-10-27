/**
 * 🚨 ALERT CARD COMPONENT
 * =======================
 *
 * Alert card component for displaying notifications and warnings
 * Extracted from OverviewTab for reusability
 *
 * FEATURES:
 * - Three alert types (warning, error, info)
 * - Color-coded styling
 * - Optional timestamp
 * - Optional action button
 * - Dark mode support
 *
 * Created: 2025-01-27 - Extracted from OverviewTab
 */

"use client";

import React from "react";
import { AlertTriangle, Clock } from "lucide-react";
import { cn } from "@/shared/utils";

/**
 * Alert Type
 */
export type AlertType = "warning" | "error" | "info";

/**
 * AlertCard Props Interface
 */
export interface AlertCardProps {
  title: string;
  message: string;
  type: AlertType;
  timestamp?: string;
  onView?: () => void;
}

/**
 * AlertCard Component
 *
 * Displays an alert card with type-based styling
 *
 * @example
 * <AlertCard
 *   title="Warning"
 *   message="Action required"
 *   type="warning"
 *   timestamp="2 min ago"
 *   onView={handleView}
 * />
 */
export const AlertCard: React.FC<AlertCardProps> = React.memo(
  ({ title, message, type, timestamp, onView }) => {
    const typeClasses = {
      warning: {
        container:
          "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700",
        icon: "text-yellow-600 dark:text-yellow-400",
        title: "text-yellow-900 dark:text-yellow-100",
      },
      error: {
        container:
          "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700",
        icon: "text-red-600 dark:text-red-400",
        title: "text-red-900 dark:text-red-100",
      },
      info: {
        container:
          "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700",
        icon: "text-blue-600 dark:text-blue-400",
        title: "text-blue-900 dark:text-blue-100",
      },
    };

    const classes = typeClasses[type];

    return (
      <div
        className={cn(
          "p-4 rounded-lg border transition-all duration-300 hover:shadow-md",
          classes.container
        )}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <AlertTriangle className={cn("w-5 h-5 mt-0.5", classes.icon)} />
            <div className="flex-1 space-y-1">
              <h4 className={cn("text-sm font-semibold", classes.title)}>
                {title}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {message}
              </p>
              {timestamp && (
                <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                  <Clock className="w-3 h-3 mr-1" />
                  {timestamp}
                </div>
              )}
            </div>
          </div>
          {onView && (
            <button
              onClick={onView}
              className={cn(
                "text-xs font-medium px-3 py-1 rounded-md transition-colors hover:bg-opacity-80",
                classes.title
              )}
            >
              Ver
            </button>
          )}
        </div>
      </div>
    );
  }
);

AlertCard.displayName = "AlertCard";
