/**
 * 📊 TAB STATS CARD COMPONENT
 * ============================
 *
 * Tarjeta de estadísticas unificada para todos los tabs
 * Soporta diferentes estilos y variantes
 *
 * Created: 2025-01-27 - Tab Stats Card Component
 */

"use client";

import React from "react";
import {
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  Eye,
} from "lucide-react";
import { cn } from "@/shared/utils";

export interface TabStatsCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  /**
   * Color del card
   * @default "blue"
   */
  color?: "blue" | "green" | "red" | "purple" | "orange" | "indigo" | "yellow";
  /**
   * Cambio o porcentaje opcional
   */
  change?: string;
  /**
   * Tipo de cambio (afecta el icono y color)
   */
  changeType?: "positive" | "negative" | "neutral";
  /**
   * Descripción adicional
   */
  description?: string;
  /**
   * Callback cuando se hace click
   */
  onClick?: () => void;
  /**
   * Variante del diseño
   * - "default": Diseño estándar con hover
   * - "compact": Más compacto sin animaciones
   * - "elevated": Con más sombra y efecto 3D
   */
  variant?: "default" | "compact" | "elevated";
  className?: string;
}

/**
 * TabStatsCard - Tarjeta de estadísticas unificada
 *
 * @example
 * ```tsx
 * <TabStatsCard
 *   title="Total Usuarios"
 *   value={150}
 *   icon={Users}
 *   color="blue"
 *   change="+12%"
 *   changeType="positive"
 *   description="Registrados este mes"
 *   onClick={() => navigate('/users')}
 * />
 * ```
 */
export const TabStatsCard: React.FC<TabStatsCardProps> = ({
  title,
  value,
  icon: Icon,
  color = "blue",
  change,
  changeType = "neutral",
  description,
  onClick,
  variant = "default",
  className,
}) => {
  const colorClasses = {
    blue: {
      bg: "bg-blue-50 dark:bg-blue-900/20",
      border: "border-blue-200 dark:border-blue-700",
      icon: "text-blue-600 dark:text-blue-400",
    },
    green: {
      bg: "bg-green-50 dark:bg-green-900/20",
      border: "border-green-200 dark:border-green-700",
      icon: "text-green-600 dark:text-green-400",
    },
    red: {
      bg: "bg-red-50 dark:bg-red-900/20",
      border: "border-red-200 dark:border-red-700",
      icon: "text-red-600 dark:text-red-400",
    },
    purple: {
      bg: "bg-purple-50 dark:bg-purple-900/20",
      border: "border-purple-200 dark:border-purple-700",
      icon: "text-purple-600 dark:text-purple-400",
    },
    orange: {
      bg: "bg-orange-50 dark:bg-orange-900/20",
      border: "border-orange-200 dark:border-orange-700",
      icon: "text-orange-600 dark:text-orange-400",
    },
    indigo: {
      bg: "bg-indigo-50 dark:bg-indigo-900/20",
      border: "border-indigo-200 dark:border-indigo-700",
      icon: "text-indigo-600 dark:text-indigo-400",
    },
    yellow: {
      bg: "bg-yellow-50 dark:bg-yellow-900/20",
      border: "border-yellow-200 dark:border-yellow-700",
      icon: "text-yellow-600 dark:text-yellow-400",
    },
  };

  const changeColors = {
    positive: "text-green-600 dark:text-green-400",
    negative: "text-red-600 dark:text-red-400",
    neutral: "text-gray-600 dark:text-gray-400",
  };

  const changeIcon = {
    positive: <TrendingUp className="w-4 h-4" />,
    negative: <TrendingDown className="w-4 h-4" />,
    neutral: <ArrowUpRight className="w-4 h-4" />,
  };

  const variantClasses = {
    default: "transition-all duration-300 hover:shadow-lg transform hover:scale-105",
    compact: "transition-shadow hover:shadow-md",
    elevated: "shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1",
  };

  const colors = colorClasses[color];

  return (
    <div
      className={cn(
        "p-6 rounded-xl border group",
        colors.bg,
        colors.border,
        variantClasses[variant],
        onClick && "cursor-pointer hover:bg-opacity-70",
        className
      )}
      onClick={onClick}
    >
      {/* Header con icono y cambio */}
      <div className="flex items-center justify-between mb-3">
        <Icon className={cn("w-8 h-8", colors.icon)} />
        {change && (
          <div
            className={cn(
              "flex items-center text-sm font-medium",
              changeColors[changeType]
            )}
          >
            {changeIcon[changeType]}
            <span className="ml-1">{change}</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="space-y-1">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
          {value}
        </h3>
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {title}
        </p>
        {description && (
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {description}
          </p>
        )}
      </div>

      {/* Click indicator */}
      {onClick && (
        <div className="mt-3 flex items-center text-xs text-gray-500 dark:text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
          <Eye className="w-3 h-3 mr-1" />
          Ver detalles
        </div>
      )}
    </div>
  );
};

export default TabStatsCard;
