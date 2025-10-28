/**
 * 🎨 SEVERITY BADGE COMPONENT
 * ============================
 *
 * Badge component para mostrar la severidad de eventos de auditoría
 * con iconos y colores apropiados
 *
 * Created: 2025-01-27 - Extracted from ActivitiesTab
 */

"use client";

import React from "react";
import {
  XCircle,
  AlertCircle,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import { cn } from "@/shared/utils";

export interface SeverityBadgeProps {
  severity: string;
}

const severityConfig = {
  critical: {
    icon: XCircle,
    className: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400",
    label: "Crítico",
  },
  high: {
    icon: AlertCircle,
    className:
      "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400",
    label: "Alto",
  },
  medium: {
    icon: AlertTriangle,
    className:
      "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400",
    label: "Medio",
  },
  low: {
    icon: CheckCircle,
    className:
      "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400",
    label: "Bajo",
  },
} as const;

/**
 * SeverityBadge - Badge para mostrar severidad de eventos
 */
export const SeverityBadge: React.FC<SeverityBadgeProps> = ({ severity }) => {
  const config =
    severityConfig[severity as keyof typeof severityConfig] ||
    severityConfig.low;
  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
        config.className
      )}
    >
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  );
};

export default SeverityBadge;
