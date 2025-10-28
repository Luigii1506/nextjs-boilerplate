/**
 * 📊 ANALYTICS TAB COMPONENT
 * ==========================
 *
 * Analytics y métricas avanzadas de usuarios
 * Componente optimizado para React 19 con dark mode
 * Siguiendo exactamente el patrón de inventory
 *
 * Created: 2025-01-18 - Users Analytics Tab
 */

"use client";

import React, { useMemo, useState } from "react";
import {
  BarChart3,
  TrendingUp,
  Users,
  Download,
  RefreshCw,
  UserPlus,
  Activity,
} from "lucide-react";
import { useUsersContext } from "../../../context";
import {
  TabHeader,
  TabWrapper,
  TabStatsCard,
  TabLoadingSkeleton,
} from "@/shared/ui/components/tabs";
import { SimpleBarChart, ActivityTimeline } from "../analytics";

/**
 * 📊 ANALYTICS TAB - MAIN COMPONENT
 * ==================================
 */
const AnalyticsTab: React.FC = () => {
  const { users } = useUsersContext();
  const { users: usersList, stats, isLoading } = users;
  const [timeRange, setTimeRange] = useState("7d");

  // 📊 Analytics calculations
  const analytics = useMemo(() => {
    if (!usersList || usersList.length === 0) {
      return {
        totalRegistrations: 0,
        newRegistrationsThisWeek: 0,
        averageDailyRegistrations: 0,
        retentionRate: 0,
        adminToUserRatio: 0,
        bannedUserRate: 0,
        registrationGrowth: "+0%",
        activityGrowth: "+0%",
        userGrowthData: [],
        roleDistributionData: [],
        recentActivities: [],
      };
    }

    // Mock calculations (in real app, these would come from analytics API)
    const totalRegistrations = usersList.length;
    const newRegistrationsThisWeek = usersList.filter((user) => {
      const userDate = new Date(user.createdAt);
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      return userDate >= weekAgo;
    }).length;

    const averageDailyRegistrations = Math.round(newRegistrationsThisWeek / 7);
    const retentionRate = 85; // Mock data
    const adminToUserRatio = Math.round(
      (stats.admins / totalRegistrations) * 100
    );
    const bannedUserRate = Math.round(
      (stats.banned / totalRegistrations) * 100
    );

    // Mock growth calculations
    const registrationGrowth = newRegistrationsThisWeek > 5 ? "+12%" : "+5%";
    const activityGrowth = "+8%";

    // User growth data (mock)
    const userGrowthData = [
      {
        label: "Lun",
        value: Math.floor(Math.random() * 20) + 5,
        color: "bg-blue-500",
      },
      {
        label: "Mar",
        value: Math.floor(Math.random() * 20) + 5,
        color: "bg-blue-500",
      },
      {
        label: "Mié",
        value: Math.floor(Math.random() * 20) + 5,
        color: "bg-blue-500",
      },
      {
        label: "Jue",
        value: Math.floor(Math.random() * 20) + 5,
        color: "bg-blue-500",
      },
      {
        label: "Vie",
        value: Math.floor(Math.random() * 20) + 5,
        color: "bg-blue-500",
      },
      {
        label: "Sáb",
        value: Math.floor(Math.random() * 20) + 5,
        color: "bg-blue-500",
      },
      {
        label: "Dom",
        value: Math.floor(Math.random() * 20) + 5,
        color: "bg-blue-500",
      },
    ];

    // Role distribution data
    const roleDistributionData = [
      {
        label: "Usuarios",
        value: totalRegistrations - stats.admins,
        color: "bg-green-500",
      },
      {
        label: "Moderadores",
        value: Math.floor(stats.admins * 0.6),
        color: "bg-blue-500",
      },
      {
        label: "Admins",
        value: Math.floor(stats.admins * 0.3),
        color: "bg-purple-500",
      },
      {
        label: "Super Admins",
        value: Math.floor(stats.admins * 0.1) || 1,
        color: "bg-red-500",
      },
    ];

    // Recent activities (mock)
    const recentActivities = [
      {
        time: "Hace 5 minutos",
        action: "se registró en el sistema",
        user: "Juan Pérez",
        type: "registration" as const,
      },
      {
        time: "Hace 15 minutos",
        action: "fue promovido a administrador",
        user: "María García",
        type: "admin_action" as const,
      },
      {
        time: "Hace 30 minutos",
        action: "inició sesión",
        user: "Carlos López",
        type: "login" as const,
      },
      {
        time: "Hace 1 hora",
        action: "fue baneado temporalmente",
        user: "Usuario123",
        type: "ban" as const,
      },
      {
        time: "Hace 2 horas",
        action: "se registró en el sistema",
        user: "Ana Rodríguez",
        type: "registration" as const,
      },
    ];

    return {
      totalRegistrations,
      newRegistrationsThisWeek,
      averageDailyRegistrations,
      retentionRate,
      adminToUserRatio,
      bannedUserRate,
      registrationGrowth,
      activityGrowth,
      userGrowthData,
      roleDistributionData,
      recentActivities,
    };
  }, [usersList, stats]);

  if (isLoading) {
    return (
      <TabWrapper spacing="space-y-6" responsive={false}>
        <TabLoadingSkeleton type="stats" count={4} showHeader />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-64 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"
            />
          ))}
        </div>
      </TabWrapper>
    );
  }

  return (
    <TabWrapper>
      {/* Header */}
      <TabHeader
        icon={
          <BarChart3 className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
        }
        title="Analytics de Usuarios"
        description="Métricas detalladas y análisis de comportamiento de usuarios"
        customActions={
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
          >
            <option value="24h">Últimas 24 horas</option>
            <option value="7d">Últimos 7 días</option>
            <option value="30d">Últimos 30 días</option>
            <option value="90d">Últimos 90 días</option>
          </select>
        }
        actions={[
          {
            label: "Actualizar",
            icon: <RefreshCw className="w-4 h-4" />,
            onClick: () => {},
            variant: "secondary",
          },
          {
            label: "Exportar",
            icon: <Download className="w-4 h-4" />,
            onClick: () => {},
            variant: "primary",
            color: "indigo",
          },
        ]}
      />

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <TabStatsCard
          title="Total Registros"
          value={analytics.totalRegistrations}
          change={analytics.registrationGrowth}
          changeType="positive"
          icon={Users}
          color="blue"
          description="Usuarios registrados en total"
        />

        <TabStatsCard
          title="Nuevos esta Semana"
          value={analytics.newRegistrationsThisWeek}
          change="+15%"
          changeType="positive"
          icon={UserPlus}
          color="green"
          description="Registros en los últimos 7 días"
        />

        <TabStatsCard
          title="Promedio Diario"
          value={analytics.averageDailyRegistrations}
          change={analytics.activityGrowth}
          changeType="positive"
          icon={TrendingUp}
          color="indigo"
          description="Registros por día (promedio)"
        />

        <TabStatsCard
          title="Tasa de Retención"
          value={`${analytics.retentionRate}%`}
          change="+2%"
          changeType="positive"
          icon={Activity}
          color="purple"
          description="Usuarios activos mensualmente"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SimpleBarChart
          title="Registros por Día (Esta Semana)"
          data={analytics.userGrowthData}
        />

        <SimpleBarChart
          title="Distribución por Roles"
          data={analytics.roleDistributionData}
        />
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Insights */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Insights de Usuarios
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Ratio Admin/Usuario
              </span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {analytics.adminToUserRatio}%
              </span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Usuarios Baneados
              </span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {analytics.bannedUserRate}%
              </span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Tasa de Crecimiento
              </span>
              <span className="text-sm font-medium text-green-600 dark:text-green-400">
                {analytics.registrationGrowth}
              </span>
            </div>
            <div className="flex items-center justify-between py-3">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Usuarios Activos
              </span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {analytics.retentionRate}%
              </span>
            </div>
          </div>
        </div>

        {/* Activity Timeline */}
        <div className="lg:col-span-2">
          <ActivityTimeline activities={analytics.recentActivities} />
        </div>
      </div>

      {/* Performance Summary */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Resumen de Performance
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mb-1">
              {analytics.registrationGrowth}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Crecimiento en Registros
            </p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">
              {analytics.retentionRate}%
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Tasa de Retención
            </p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-1">
              {analytics.averageDailyRegistrations}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Promedio Diario
            </p>
          </div>
        </div>
      </div>
    </TabWrapper>
  );
};

export default AnalyticsTab;
