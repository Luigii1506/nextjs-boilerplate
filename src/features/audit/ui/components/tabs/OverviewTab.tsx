/**
 * 📊 AUDIT OVERVIEW TAB
 * ====================
 *
 * Dashboard principal con métricas clave, resumen de actividad
 * y estadísticas del sistema de auditoría
 *
 * Created: 2025-01-18 - Audit Overview Tab
 */

"use client";

import React, { useMemo } from "react";
import {
  Activity,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Shield,
  Users,
  FileText,
  Clock,
  Eye,
  AlertCircle,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { cn } from "@/shared/utils";
import type { AuditStats } from "../../../types";

interface OverviewTabProps {
  stats: AuditStats | undefined;
  isLoading?: boolean;
  onNavigate?: (tab: string) => void;
}

/**
 * 📊 Metric Card Component
 */
interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  color: "blue" | "green" | "orange" | "red" | "purple";
  description?: string;
  onClick?: () => void;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  icon,
  color,
  description,
  onClick,
}) => {
  const colorClasses = {
    blue: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800",
    green:
      "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800",
    orange:
      "bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800",
    red: "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800",
    purple:
      "bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800",
  };

  return (
    <div
      className={cn(
        "bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6",
        "transition-all duration-200 hover:shadow-lg",
        onClick && "cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
      )}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {title}
          </p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
            {typeof value === "number" ? value.toLocaleString() : value}
          </p>
          {change !== undefined && (
            <div className="flex items-center gap-1 mt-2">
              {change >= 0 ? (
                <TrendingUp className="w-4 h-4 text-green-500" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-500" />
              )}
              <span
                className={cn(
                  "text-sm font-medium",
                  change >= 0 ? "text-green-600" : "text-red-600"
                )}
              >
                {Math.abs(change)}%
              </span>
            </div>
          )}
          {description && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {description}
            </p>
          )}
        </div>
        <div className={cn("p-3 rounded-lg border", colorClasses[color])}>
          {icon}
        </div>
      </div>
    </div>
  );
};

/**
 * 🎯 Main Overview Tab Component
 */
export default function OverviewTab({
  stats,
  isLoading,
  onNavigate,
}: OverviewTabProps) {
  // Calculate additional metrics
  const metrics = useMemo(() => {
    if (!stats) {
      return {
        totalEvents: 0,
        criticalCount: 0,
        highSeverityCount: 0,
        activeUsers: 0,
        topAction: "N/A",
        topResource: "N/A",
      };
    }

    const criticalCount = stats.bySeverity.critical || 0;
    const highSeverityCount = stats.bySeverity.high || 0;
    const activeUsers = stats.byUser.length;

    // Find top action
    const topActionEntry = Object.entries(stats.byAction).sort(
      ([, a], [, b]) => b - a
    )[0];
    const topAction = topActionEntry ? topActionEntry[0] : "N/A";

    // Find top resource
    const topResourceEntry = stats.topResources[0];
    const topResource = topResourceEntry ? topResourceEntry.resource : "N/A";

    return {
      totalEvents: stats.total,
      criticalCount,
      highSeverityCount,
      activeUsers,
      topAction,
      topResource,
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
          <Shield className="w-7 h-7 text-blue-600 dark:text-blue-400" />
          Resumen de Auditoría
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Métricas clave y actividad del sistema de auditoría
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total de Eventos"
          value={metrics.totalEvents}
          icon={<Activity className="w-6 h-6" />}
          color="blue"
          description="Eventos registrados"
          onClick={() => onNavigate?.("activities")}
        />

        <MetricCard
          title="Usuarios Activos"
          value={metrics.activeUsers}
          icon={<Users className="w-6 h-6" />}
          color="green"
          description="Usuarios con actividad"
          onClick={() => onNavigate?.("users")}
        />

        <MetricCard
          title="Eventos Críticos"
          value={metrics.criticalCount}
          icon={<AlertTriangle className="w-6 h-6" />}
          color="red"
          description="Requieren atención inmediata"
        />

        <MetricCard
          title="Alta Severidad"
          value={metrics.highSeverityCount}
          icon={<AlertCircle className="w-6 h-6" />}
          color="orange"
          description="Eventos de alta prioridad"
        />
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-500" />
              Actividad Reciente
            </h3>
            <button
              onClick={() => onNavigate?.("activities")}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              <Eye className="w-3 h-3" />
              Ver todas
            </button>
          </div>

          <div className="space-y-3">
            {stats?.recentActivity && stats.recentActivity.length > 0 ? (
              stats.recentActivity.slice(0, 5).map((event) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {event.severity === "critical" && (
                        <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                      )}
                      {event.severity === "high" && (
                        <AlertCircle className="w-4 h-4 text-orange-500 flex-shrink-0" />
                      )}
                      {event.severity === "medium" && (
                        <AlertTriangle className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                      )}
                      {event.severity === "low" && (
                        <CheckCircle className="w-4 h-4 text-blue-500 flex-shrink-0" />
                      )}
                      <p className="font-medium text-gray-900 dark:text-gray-100 truncate">
                        {event.action} - {event.resource}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {event.userEmail}
                      </span>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(event.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400">
                  No hay actividad reciente
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Top Users */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-500" />
              Usuarios Más Activos
            </h3>
            <button
              onClick={() => onNavigate?.("users")}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              <Eye className="w-3 h-3" />
              Ver todos
            </button>
          </div>

          <div className="space-y-3">
            {stats?.byUser && stats.byUser.length > 0 ? (
              stats.byUser.slice(0, 5).map((user) => (
                <div
                  key={user.userId}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-gray-100 truncate">
                      {user.userName || "Usuario sin nombre"}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                      {user.userEmail}
                    </p>
                  </div>
                  <div className="ml-4">
                    <span className="px-3 py-1 text-sm font-semibold bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full">
                      {user.eventCount}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400">
                  No hay usuarios activos
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Stats Footer */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {metrics.topAction}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">
              Acción Más Común
            </div>
          </div>

          <div>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {metrics.topResource}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">
              Recurso Más Auditado
            </div>
          </div>

          <div>
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {stats?.bySeverity.medium || 0}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">
              Severidad Media
            </div>
          </div>

          <div>
            <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">
              {stats?.bySeverity.low || 0}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">
              Severidad Baja
            </div>
          </div>
        </div>
      </div>

      {/* System Health Alert (if critical events) */}
      {metrics.criticalCount > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-2">
                Eventos Críticos Detectados
              </h3>
              <p className="text-sm text-red-800 dark:text-red-200 mb-4">
                Se han detectado {metrics.criticalCount} eventos críticos que
                requieren atención inmediata. Revisa la sección de actividades
                para más detalles.
              </p>
              <button
                onClick={() => onNavigate?.("activities")}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Revisar Eventos Críticos
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
