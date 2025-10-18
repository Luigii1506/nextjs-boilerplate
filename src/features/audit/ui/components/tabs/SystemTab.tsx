/**
 * 🔧 AUDIT SYSTEM TAB
 * ===================
 *
 * Vista de salud del sistema, métricas de rendimiento
 * y configuración del sistema de auditoría
 *
 * Created: 2025-01-18 - Audit System Tab
 */

"use client";

import React, { useMemo } from "react";
import {
  Server,
  Activity,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Database,
  Clock,
  Zap,
  Settings,
  BarChart3,
  Shield,
} from "lucide-react";
import { cn } from "@/shared/utils";
import type { AuditStats } from "../../../types";

interface SystemTabProps {
  stats: AuditStats | undefined;
  isLoading?: boolean;
}

/**
 * 📊 System Metric Card
 */
interface SystemMetricProps {
  label: string;
  value: string | number;
  status: "good" | "warning" | "critical" | "info";
  icon: React.ReactNode;
  description?: string;
}

const SystemMetric: React.FC<SystemMetricProps> = ({
  label,
  value,
  status,
  icon,
  description,
}) => {
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

/**
 * 🎯 Main System Tab Component
 */
export default function SystemTab({ stats, isLoading }: SystemTabProps) {
  // Calculate system health metrics
  const systemHealth = useMemo(() => {
    if (!stats) {
      return {
        totalEvents: 0,
        criticalEvents: 0,
        highSeverityEvents: 0,
        mediumSeverityEvents: 0,
        lowSeverityEvents: 0,
        healthScore: 100,
        status: "good" as const,
        topActions: [],
        topResources: [],
      };
    }

    const criticalEvents = stats.bySeverity.critical || 0;
    const highSeverityEvents = stats.bySeverity.high || 0;
    const mediumSeverityEvents = stats.bySeverity.medium || 0;
    const lowSeverityEvents = stats.bySeverity.low || 0;

    // Calculate health score (0-100)
    const totalEvents = stats.total;
    const criticalWeight = criticalEvents * 10;
    const highWeight = highSeverityEvents * 5;
    const mediumWeight = mediumSeverityEvents * 2;

    const healthScore = Math.max(
      0,
      100 -
        ((criticalWeight + highWeight + mediumWeight) /
          Math.max(totalEvents, 1)) *
          10
    );

    // Determine status
    let status: "good" | "warning" | "critical" = "good";
    if (healthScore < 50) status = "critical";
    else if (healthScore < 75) status = "warning";

    // Top actions
    const topActions = Object.entries(stats.byAction)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([action, count]) => ({ action, count }));

    return {
      totalEvents: stats.total,
      criticalEvents,
      highSeverityEvents,
      mediumSeverityEvents,
      lowSeverityEvents,
      healthScore: Math.round(healthScore),
      status,
      topActions,
      topResources: stats.topResources.slice(0, 5),
    };
  }, [stats]);

  if (isLoading) {
    return (
      <div className="space-y-6 p-6 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="bg-gray-200 dark:bg-gray-700 rounded-lg h-32"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <Server className="w-7 h-7 text-green-600 dark:text-green-400" />
          Salud del Sistema
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Monitoreo y métricas del sistema de auditoría
        </p>
      </div>

      {/* System Health Score */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-xl p-8">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <Shield className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Estado del Sistema
              </h3>
            </div>

            <div className="flex items-baseline gap-3">
              <span className="text-6xl font-bold text-blue-600 dark:text-blue-400">
                {systemHealth.healthScore}
              </span>
              <span className="text-2xl text-gray-600 dark:text-gray-400">
                / 100
              </span>
            </div>

            <p className="text-lg text-gray-600 dark:text-gray-400 mt-2">
              {systemHealth.status === "good" &&
                "✅ Sistema funcionando correctamente"}
              {systemHealth.status === "warning" &&
                "⚠️ Sistema requiere atención"}
              {systemHealth.status === "critical" &&
                "🚨 Sistema en estado crítico"}
            </p>
          </div>

          {/* Visual indicator */}
          <div className="relative w-32 h-32">
            <svg className="transform -rotate-90 w-32 h-32">
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="currentColor"
                strokeWidth="12"
                fill="none"
                className="text-gray-200 dark:text-gray-700"
              />
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="currentColor"
                strokeWidth="12"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 56}`}
                strokeDashoffset={`${2 * Math.PI * 56 * (1 - systemHealth.healthScore / 100)}`}
                className={cn(
                  "transition-all duration-1000",
                  systemHealth.status === "good" && "text-green-500",
                  systemHealth.status === "warning" && "text-yellow-500",
                  systemHealth.status === "critical" && "text-red-500"
                )}
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* System Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <SystemMetric
          label="Total Eventos"
          value={systemHealth.totalEvents.toLocaleString()}
          status="info"
          icon={<Activity className="w-6 h-6 text-blue-600 dark:text-blue-400" />}
          description="Eventos registrados"
        />

        <SystemMetric
          label="Eventos Críticos"
          value={systemHealth.criticalEvents}
          status={systemHealth.criticalEvents > 0 ? "critical" : "good"}
          icon={
            <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
          }
          description="Requieren acción inmediata"
        />

        <SystemMetric
          label="Alta Prioridad"
          value={systemHealth.highSeverityEvents}
          status={systemHealth.highSeverityEvents > 5 ? "warning" : "good"}
          icon={
            <AlertTriangle className="w-6 h-6 text-orange-600 dark:text-orange-400" />
          }
          description="Eventos de alta severidad"
        />

        <SystemMetric
          label="Operaciones Normales"
          value={systemHealth.lowSeverityEvents}
          status="good"
          icon={
            <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
          }
          description="Eventos de baja severidad"
        />
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-5 h-5 text-yellow-500" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Acciones Más Comunes
            </h3>
          </div>

          <div className="space-y-3">
            {systemHealth.topActions.length > 0 ? (
              systemHealth.topActions.map((item, index) => {
                const maxCount = systemHealth.topActions[0].count;
                const percentage = (item.count / maxCount) * 100;

                return (
                  <div key={item.action}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100 capitalize">
                        {item.action.replace(/_/g, " ")}
                      </span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {item.count}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className={cn(
                          "h-2 rounded-full transition-all duration-300",
                          index === 0 && "bg-blue-500",
                          index === 1 && "bg-green-500",
                          index === 2 && "bg-yellow-500",
                          index >= 3 && "bg-gray-500"
                        )}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                No hay datos disponibles
              </p>
            )}
          </div>
        </div>

        {/* Top Resources */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Database className="w-5 h-5 text-purple-500" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Recursos Más Auditados
            </h3>
          </div>

          <div className="space-y-3">
            {systemHealth.topResources.length > 0 ? (
              systemHealth.topResources.map((item, index) => {
                const maxCount = systemHealth.topResources[0].count;
                const percentage = (item.count / maxCount) * 100;

                return (
                  <div key={item.resource}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100 capitalize">
                        {item.resource.replace(/_/g, " ")}
                      </span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {item.count}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className={cn(
                          "h-2 rounded-full transition-all duration-300",
                          index === 0 && "bg-purple-500",
                          index === 1 && "bg-pink-500",
                          index === 2 && "bg-indigo-500",
                          index >= 3 && "bg-gray-500"
                        )}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                No hay datos disponibles
              </p>
            )}
          </div>
        </div>
      </div>

      {/* System Configuration */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-gray-500" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Configuración del Sistema
            </h3>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
            <Clock className="w-5 h-5 text-blue-500 mt-0.5" />
            <div>
              <p className="font-medium text-gray-900 dark:text-gray-100">
                Retención de Logs
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                90 días de historial
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
            <BarChart3 className="w-5 h-5 text-green-500 mt-0.5" />
            <div>
              <p className="font-medium text-gray-900 dark:text-gray-100">
                Métricas Activas
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Recolección en tiempo real
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
            <Shield className="w-5 h-5 text-purple-500 mt-0.5" />
            <div>
              <p className="font-medium text-gray-900 dark:text-gray-100">
                Nivel de Seguridad
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Alto - Todas las acciones
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
