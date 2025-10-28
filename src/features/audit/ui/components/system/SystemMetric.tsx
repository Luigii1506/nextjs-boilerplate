/**
 * 📊 SYSTEM METRIC COMPONENT
 * ===========================
 *
 * Card component para mostrar métricas del sistema
 * con estados de salud (good, warning, critical, info)
 *
 * Created: 2025-01-27 - Extracted from SystemTab
 */

"use client";

import React from "react";
import {
  CheckCircle,
  AlertTriangle,
  Activity,
} from "lucide-react";
import { cn } from "@/shared/utils";

export interface SystemMetricProps {
  label: string;
  value: string | number;
  status: "good" | "warning" | "critical" | "info";
  icon: React.ReactNode;
  description?: string;
}

const statusConfig = {
  good: {
    bg: "bg-green-50 dark:bg-green-900/20",
    border: "border-green-200 dark:border-green-800",
    text: "text-green-700 dark:text-green-400",
    icon: CheckCircle,
  },
  warning: {
    bg: "bg-yellow-50 dark:bg-yellow-900/20",
    border: "border-yellow-200 dark:border-yellow-800",
    text: "text-yellow-700 dark:text-yellow-400",
    icon: AlertTriangle,
  },
  critical: {
    bg: "bg-red-50 dark:bg-red-900/20",
    border: "border-red-200 dark:border-red-800",
    text: "text-red-700 dark:text-red-400",
    icon: AlertTriangle,
  },
  info: {
    bg: "bg-blue-50 dark:bg-blue-900/20",
    border: "border-blue-200 dark:border-blue-800",
    text: "text-blue-700 dark:text-blue-400",
    icon: Activity,
  },
};

/**
 * SystemMetric - Card para métricas del sistema
 */
export const SystemMetric: React.FC<SystemMetricProps> = ({
  label,
  value,
  status,
  icon,
  description,
}) => {
  const config = statusConfig[status];
  const StatusIcon = config.icon;

  return (
    <div
      className={cn(
        "rounded-lg border-2 p-6 transition-all hover:shadow-md",
        config.bg,
        config.border
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={cn("p-2 rounded-lg", config.bg)}>{icon}</div>
        <StatusIcon className={cn("w-5 h-5", config.text)} />
      </div>

      <div>
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
          {label}
        </p>
        <p className={cn("text-3xl font-bold", config.text)}>{value}</p>
        {description && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            {description}
          </p>
        )}
      </div>
    </div>
  );
};

export default SystemMetric;
