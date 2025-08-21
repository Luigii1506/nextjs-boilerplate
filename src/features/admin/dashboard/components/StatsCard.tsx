import React from "react";
import { TrendingUp, Activity } from "lucide-react";
import { StatsCardProps } from "../types";

/**
 * 📊 COMPONENTE DE TARJETA DE ESTADÍSTICAS
 *
 * Componente reutilizable para mostrar estadísticas con tendencias.
 */

export function StatsCard({
  title,
  value,
  trend,
  icon: Icon,
  color,
}: StatsCardProps) {
  const colorClasses = {
    blue: {
      bg: "bg-blue-50 dark:bg-blue-900/20",
      icon: "text-blue-600",
    },
    green: {
      bg: "bg-green-50 dark:bg-green-900/20",
      icon: "text-green-600",
    },
    red: {
      bg: "bg-red-50 dark:bg-red-900/20",
      icon: "text-red-600",
    },
    amber: {
      bg: "bg-amber-50 dark:bg-amber-900/20",
      icon: "text-amber-600",
    },
  };

  const getTrendIcon = () => {
    if (!trend) return <Activity className="w-4 h-4 mr-1" />;

    switch (trend.direction) {
      case "up":
        return <TrendingUp className="w-4 h-4 mr-1" />;
      case "down":
        return <TrendingUp className="w-4 h-4 mr-1 transform rotate-180" />;
      default:
        return <Activity className="w-4 h-4 mr-1" />;
    }
  };

  const getTrendColor = () => {
    if (!trend) return "text-slate-500";

    switch (trend.direction) {
      case "up":
        return "text-green-600";
      case "down":
        return "text-red-600";
      default:
        return "text-slate-500";
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
            {title}
          </p>
          <p className="text-3xl font-bold text-slate-900 dark:text-slate-100 mt-2">
            {value.toLocaleString()}
          </p>
          {trend && (
            <div className={`flex items-center mt-2 ${getTrendColor()}`}>
              {getTrendIcon()}
              <span className="text-sm font-medium">{trend.value}</span>
            </div>
          )}
        </div>
        <div className={`p-3 ${colorClasses[color].bg} rounded-full`}>
          <Icon className={`w-6 h-6 ${colorClasses[color].icon}`} />
        </div>
      </div>
    </div>
  );
}
