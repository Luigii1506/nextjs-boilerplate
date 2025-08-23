/**
 * 📊 AUDIT STATS COMPONENT
 * ========================
 *
 * Componente para mostrar estadísticas de auditoría
 */

"use client";

import { Card } from "@/shared/ui/components/Card";
import { Badge } from "@/shared/ui/components/Badge";
import { cn } from "@/shared/utils";
import { formatActionLabel, formatResourceLabel } from "../../utils";
import { AUDIT_ACTION_COLORS, AUDIT_SEVERITY_COLORS } from "../../constants";
import type { AuditStats as AuditStatsType } from "../../types";
import {
  Activity,
  Users,
  AlertTriangle,
  TrendingUp,
  Clock,
  BarChart3,
} from "lucide-react";

interface AuditStatsProps {
  stats: AuditStatsType;
  className?: string;
}

export function AuditStats({ stats, className }: AuditStatsProps) {
  return (
    <div className={cn("space-y-6", className)}>
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Eventos
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.total.toLocaleString()}
              </p>
            </div>
            <Activity className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
        </Card>

        <Card className="p-4 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Usuarios Activos
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.byUser.length}
              </p>
            </div>
            <Users className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
        </Card>

        <Card className="p-4 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Eventos Críticos
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.bySeverity.critical || 0}
              </p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
        </Card>

        <Card className="p-4 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Actividad Reciente
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.recentActivity.length}
              </p>
            </div>
            <Clock className="h-8 w-8 text-purple-600 dark:text-purple-400" />
          </div>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Actions Distribution */}
        <Card className="p-6 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Distribución por Acciones
            </h3>
          </div>
          <div className="space-y-3">
            {Object.entries(stats.byAction)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 8)
              .map(([action, count]) => {
                const percentage = (count / stats.total) * 100;
                const color =
                  AUDIT_ACTION_COLORS[
                    action as keyof typeof AUDIT_ACTION_COLORS
                  ] || "gray";

                return (
                  <div
                    key={action}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2 flex-1">
                      <Badge
                        variant="outline"
                        className={`border-${color}-200 dark:border-${color}-700 text-${color}-700 dark:text-${color}-300 text-xs bg-${color}-50 dark:bg-${color}-900/20`}
                      >
                        {formatActionLabel(action as any)}
                      </Badge>
                      <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className={`bg-${color}-500 dark:bg-${color}-400 h-2 rounded-full transition-all duration-300`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white ml-2 min-w-[3rem] text-right">
                      {count}
                    </div>
                  </div>
                );
              })}
          </div>
        </Card>

        {/* Resources Distribution */}
        <Card className="p-6 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Top Recursos
            </h3>
          </div>
          <div className="space-y-3">
            {stats.topResources.slice(0, 8).map((item, index) => {
              const percentage = (item.count / stats.total) * 100;

              return (
                <div
                  key={item.resource}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2 flex-1">
                    <div className="flex items-center justify-center w-6 h-6 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300 rounded-full text-xs font-medium">
                      {index + 1}
                    </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {formatResourceLabel(item.resource)}
                    </span>
                    <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2 ml-2">
                      <div
                        className="bg-blue-500 dark:bg-blue-400 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white ml-2 min-w-[3rem] text-right">
                    {item.count}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Severity & Users Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Severity Distribution */}
        <Card className="p-6 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
            Distribución por Severidad
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(stats.bySeverity).map(([severity, count]) => {
              const color =
                AUDIT_SEVERITY_COLORS[
                  severity as keyof typeof AUDIT_SEVERITY_COLORS
                ] || "gray";
              const percentage = (count / stats.total) * 100;

              return (
                <div key={severity} className="text-center">
                  <div
                    className={`w-16 h-16 mx-auto mb-2 rounded-full bg-${color}-100 dark:bg-${color}-900/30 flex items-center justify-center`}
                  >
                    <span
                      className={`text-2xl font-bold text-${color}-600 dark:text-${color}-400`}
                    >
                      {count}
                    </span>
                  </div>
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                    {severity}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {percentage.toFixed(1)}%
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Top Users */}
        <Card className="p-6 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
            Usuarios Más Activos
          </h3>
          <div className="space-y-3">
            {stats.byUser.slice(0, 6).map((user, index) => (
              <div
                key={user.userId}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 dark:from-blue-400 dark:to-purple-500 text-white rounded-full text-sm font-medium">
                    {user.userName?.charAt(0).toUpperCase() ||
                      user.userEmail.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {user.userName || user.userEmail}
                    </div>
                    {user.userName && (
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {user.userEmail}
                      </div>
                    )}
                  </div>
                </div>
                <Badge
                  variant="secondary"
                  className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-600"
                >
                  {user.eventCount} eventos
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      {stats.recentActivity.length > 0 && (
        <Card className="p-6 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
            Actividad Reciente
          </h3>
          <div className="space-y-3">
            {stats.recentActivity.slice(0, 5).map((event) => (
              <div
                key={event.id}
                className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <Badge
                    variant="outline"
                    className={`border-${
                      AUDIT_ACTION_COLORS[event.action] || "gray"
                    }-200 dark:border-${
                      AUDIT_ACTION_COLORS[event.action] || "gray"
                    }-700 text-${
                      AUDIT_ACTION_COLORS[event.action] || "gray"
                    }-700 dark:text-${
                      AUDIT_ACTION_COLORS[event.action] || "gray"
                    }-300 bg-${
                      AUDIT_ACTION_COLORS[event.action] || "gray"
                    }-50 dark:bg-${
                      AUDIT_ACTION_COLORS[event.action] || "gray"
                    }-900/20`}
                  >
                    {formatActionLabel(event.action)}
                  </Badge>
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {formatResourceLabel(event.resource)}
                  </span>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {new Date(event.createdAt).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
