/**
 * 📊 USERS OVERVIEW TAB COMPONENT
 * ===============================
 *
 * Dashboard principal con métricas, alertas y KPIs de usuarios
 * Componente optimizado para React 19 con dark mode
 * Siguiendo exactamente el patrón de inventory OverviewTab
 *
 * Created: 2025-01-18 - Users Overview Tab
 */

"use client";

import React, { useMemo } from "react";
import { Users, TrendingUp, Shield, UserCheck, UserX, Eye } from "lucide-react";
import { useUsersContext } from "../../../context";
import {
  TabHeader,
  TabWrapper,
  TabStatsCard,
  TabLoadingSkeleton,
} from "@/shared/ui/components/tabs";
import { AlertCard } from "../overview";

/**
 * 📊 OVERVIEW TAB - MAIN COMPONENT
 * =================================
 */
const OverviewTab: React.FC = () => {
  const { users, setActiveTab } = useUsersContext();
  const { stats, isLoading, users: usersList } = users;

  // 📊 Enhanced Metrics Calculation
  const metrics = useMemo(() => {
    if (!usersList || usersList.length === 0) {
      return {
        totalUsers: 0,
        activeUsers: 0,
        bannedUsers: 0,
        adminUsers: 0,
        recentRegistrations: 0,
        userGrowth: "0%",
        bannedPercentage: "0%",
        adminPercentage: "0%",
      };
    }

    // Recent registrations (last 7 days)
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const recentRegistrations = usersList.filter(
      (user) => new Date(user.createdAt) >= weekAgo
    ).length;

    // Growth calculation (mock for now)
    const userGrowth = recentRegistrations > 0 ? "+12%" : "0%";

    return {
      totalUsers: stats.total,
      activeUsers: stats.active,
      bannedUsers: stats.banned,
      adminUsers: stats.admins,
      recentRegistrations,
      userGrowth,
      bannedPercentage: `${
        stats.total > 0 ? ((stats.banned / stats.total) * 100).toFixed(1) : 0
      }%`,
      adminPercentage: `${stats.adminPercentage.toFixed(1)}%`,
    };
  }, [usersList, stats]);

  // 🚨 Mock Alerts (in real implementation, these would come from a monitoring system)
  const alerts = useMemo(
    () => [
      ...(metrics.bannedUsers > 5
        ? [
            {
              title: "Usuarios Baneados",
              message: `${metrics.bannedUsers} usuarios están actualmente baneados. Revisa las políticas de moderación.`,
              type: "warning" as const,
              timestamp: "Hace 2 horas",
            },
          ]
        : []),
      ...(metrics.recentRegistrations > 10
        ? [
            {
              title: "Alto Registro",
              message: `${metrics.recentRegistrations} nuevos registros en los últimos 7 días. Monitorea actividad sospechosa.`,
              type: "info" as const,
              timestamp: "Hace 1 hora",
            },
          ]
        : []),
    ],
    [metrics.bannedUsers, metrics.recentRegistrations]
  );

  if (isLoading) {
    return (
      <TabWrapper spacing="space-y-6" responsive={false}>
        <TabLoadingSkeleton type="stats" count={4} showHeader />
        <TabLoadingSkeleton type="list" count={3} showHeader={false} />
      </TabWrapper>
    );
  }

  return (
    <TabWrapper>
      {/* Header */}
      <TabHeader
        icon={<Users className="w-8 h-8 text-blue-600 dark:text-blue-400" />}
        title="Vista General"
        description="Dashboard principal con métricas y KPIs del sistema de usuarios"
      />

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <TabStatsCard
          title="Total de Usuarios"
          value={metrics.totalUsers}
          change={metrics.userGrowth}
          changeType="positive"
          icon={Users}
          description="Usuarios registrados en el sistema"
          color="blue"
          onClick={() => setActiveTab("all-users")}
        />

        <TabStatsCard
          title="Usuarios Activos"
          value={metrics.activeUsers}
          change={`${(
            (metrics.activeUsers / metrics.totalUsers) * 100 || 0
          ).toFixed(1)}%`}
          changeType="positive"
          icon={UserCheck}
          description="Usuarios no baneados"
          color="green"
          onClick={() => setActiveTab("all-users")}
        />

        <TabStatsCard
          title="Usuarios Baneados"
          value={metrics.bannedUsers}
          change={metrics.bannedPercentage}
          changeType={metrics.bannedUsers > 0 ? "negative" : "neutral"}
          icon={UserX}
          description="Usuarios suspendidos"
          color="red"
          onClick={() => setActiveTab("all-users")}
        />

        <TabStatsCard
          title="Administradores"
          value={metrics.adminUsers}
          change={metrics.adminPercentage}
          changeType="neutral"
          icon={Shield}
          description="Usuarios con rol administrativo"
          color="purple"
          onClick={() => setActiveTab("admins")}
        />
      </div>

      {/* Alerts Section */}
      {alerts.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Alertas del Sistema
          </h3>
          <div className="space-y-3">
            {alerts.map((alert, index) => (
              <AlertCard
                key={index}
                title={alert.title}
                message={alert.message}
                type={alert.type}
                timestamp={alert.timestamp}
                onView={() => setActiveTab("audit")}
              />
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Acciones Rápidas
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => setActiveTab("all-users")}
            className="p-4 text-left rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <Users className="w-6 h-6 text-blue-600 dark:text-blue-400 mb-2" />
            <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
              Gestionar Usuarios
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Ver, editar y administrar todos los usuarios
            </p>
          </button>

          <button
            onClick={() => setActiveTab("analytics")}
            className="p-4 text-left rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400 mb-2" />
            <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
              Ver Analytics
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Análisis y métricas detalladas
            </p>
          </button>

          <button
            onClick={() => setActiveTab("audit")}
            className="p-4 text-left rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <Eye className="w-6 h-6 text-indigo-600 dark:text-indigo-400 mb-2" />
            <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
              Auditoría
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Historial de actividades del sistema
            </p>
          </button>
        </div>
      </div>

      {/* System Health */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Estado del Sistema
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-700 rounded-lg">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Base de Datos
            </span>
            <span className="flex items-center text-sm text-green-600 dark:text-green-400">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              Operacional
            </span>
          </div>
          <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-700 rounded-lg">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Cache
            </span>
            <span className="flex items-center text-sm text-green-600 dark:text-green-400">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              Óptimo
            </span>
          </div>
        </div>
      </div>
    </TabWrapper>
  );
};

export default OverviewTab;
