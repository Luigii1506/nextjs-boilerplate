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
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Eventos</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total.toLocaleString()}</p>
            </div>
            <Activity className="h-8 w-8 text-blue-600" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Usuarios Activos</p>
              <p className="text-2xl font-bold text-gray-900">{stats.byUser.length}</p>
            </div>
            <Users className="h-8 w-8 text-green-600" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Eventos Críticos</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.bySeverity.critical || 0}
              </p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Actividad Reciente</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.recentActivity.length}
              </p>
            </div>
            <Clock className="h-8 w-8 text-purple-600" />
          </div>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Actions Distribution */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="h-5 w-5 text-gray-600" />
            <h3 className="font-semibold text-gray-900">Distribución por Acciones</h3>
          </div>
          <div className="space-y-3">
            {Object.entries(stats.byAction)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 8)
              .map(([action, count]) => {
                const percentage = (count / stats.total) * 100;
                const color = AUDIT_ACTION_COLORS[action as keyof typeof AUDIT_ACTION_COLORS] || "gray";
                
                return (
                  <div key={action} className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-1">
                      <Badge
                        variant="outline"
                        className={`border-${color}-200 text-${color}-700 text-xs`}
                      >
                        {formatActionLabel(action as any)}
                      </Badge>
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className={`bg-${color}-500 h-2 rounded-full transition-all duration-300`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                    <div className="text-sm font-medium text-gray-900 ml-2 min-w-[3rem] text-right">
                      {count}
                    </div>
                  </div>
                );
              })}
          </div>
        </Card>

        {/* Resources Distribution */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-gray-600" />
            <h3 className="font-semibold text-gray-900">Top Recursos</h3>
          </div>
          <div className="space-y-3">
            {stats.topResources.slice(0, 8).map((item, index) => {
              const percentage = (item.count / stats.total) * 100;
              
              return (
                <div key={item.resource} className="flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-1">
                    <div className="flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-600 rounded-full text-xs font-medium">
                      {index + 1}
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      {formatResourceLabel(item.resource)}
                    </span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2 ml-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-sm font-medium text-gray-900 ml-2 min-w-[3rem] text-right">
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
        <Card className="p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Distribución por Severidad</h3>
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(stats.bySeverity).map(([severity, count]) => {
              const color = AUDIT_SEVERITY_COLORS[severity as keyof typeof AUDIT_SEVERITY_COLORS] || "gray";
              const percentage = (count / stats.total) * 100;
              
              return (
                <div key={severity} className="text-center">
                  <div className={`w-16 h-16 mx-auto mb-2 rounded-full bg-${color}-100 flex items-center justify-center`}>
                    <span className={`text-2xl font-bold text-${color}-600`}>
                      {count}
                    </span>
                  </div>
                  <div className="text-sm font-medium text-gray-700 capitalize">
                    {severity}
                  </div>
                  <div className="text-xs text-gray-500">
                    {percentage.toFixed(1)}%
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Top Users */}
        <Card className="p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Usuarios Más Activos</h3>
          <div className="space-y-3">
            {stats.byUser.slice(0, 6).map((user, index) => (
              <div key={user.userId} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full text-sm font-medium">
                    {user.userName?.charAt(0).toUpperCase() || user.userEmail.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {user.userName || user.userEmail}
                    </div>
                    {user.userName && (
                      <div className="text-xs text-gray-500">{user.userEmail}</div>
                    )}
                  </div>
                </div>
                <Badge variant="secondary">
                  {user.eventCount} eventos
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      {stats.recentActivity.length > 0 && (
        <Card className="p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Actividad Reciente</h3>
          <div className="space-y-3">
            {stats.recentActivity.slice(0, 5).map((event) => (
              <div key={event.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div className="flex items-center gap-3">
                  <Badge
                    variant="outline"
                    className={`border-${AUDIT_ACTION_COLORS[event.action] || "gray"}-200 text-${AUDIT_ACTION_COLORS[event.action] || "gray"}-700`}
                  >
                    {formatActionLabel(event.action)}
                  </Badge>
                  <span className="text-sm text-gray-700">
                    {formatResourceLabel(event.resource)}
                  </span>
                </div>
                <div className="text-xs text-gray-500">
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
