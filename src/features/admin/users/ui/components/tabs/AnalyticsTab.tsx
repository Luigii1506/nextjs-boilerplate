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
  UserPlus,
  Activity,
  Clock,
  Shield,
  AlertTriangle,
  Download,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { cn } from "@/shared/utils";
import { useUsersContext } from "../../../context";
import { TabTransition } from "../shared";

// 📊 Metric Card Component
interface MetricCardProps {
  title: string;
  value: string | number;
  change: string;
  changeType: "positive" | "negative" | "neutral";
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  description?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  changeType,
  icon: Icon,
  color,
  description,
}) => {
  const changeIcon =
    changeType === "positive" ? (
      <ArrowUpRight className="w-4 h-4" />
    ) : changeType === "negative" ? (
      <ArrowDownRight className="w-4 h-4" />
    ) : (
      <Activity className="w-4 h-4" />
    );

  const changeColor =
    changeType === "positive"
      ? "text-green-600 dark:text-green-400"
      : changeType === "negative"
      ? "text-red-600 dark:text-red-400"
      : "text-gray-600 dark:text-gray-400";

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <Icon className={cn("w-8 h-8", color)} />
        <div
          className={cn("flex items-center text-sm font-medium", changeColor)}
        >
          {changeIcon}
          <span className="ml-1">{change}</span>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
          {value}
        </h3>
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
          {title}
        </p>
        {description && (
          <p className="text-xs text-gray-500 dark:text-gray-500">
            {description}
          </p>
        )}
      </div>
    </div>
  );
};

// 📈 Simple Chart Component (Mock visualization)
interface SimpleBarChartProps {
  title: string;
  data: Array<{ label: string; value: number; color: string }>;
}

const SimpleBarChart: React.FC<SimpleBarChartProps> = ({ title, data }) => {
  const maxValue = Math.max(...data.map((item) => item.value));

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
        {title}
      </h3>

      <div className="space-y-4">
        {data.map((item, index) => (
          <div key={index} className="flex items-center space-x-4">
            <div className="w-20 text-sm text-gray-600 dark:text-gray-400">
              {item.label}
            </div>
            <div className="flex-1">
              <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-6 relative overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-500",
                    item.color
                  )}
                  style={{ width: `${(item.value / maxValue) * 100}%` }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {item.value}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// 📊 Activity Timeline Component
interface ActivityTimelineProps {
  activities: Array<{
    time: string;
    action: string;
    user: string;
    type: "registration" | "login" | "admin_action" | "ban";
  }>;
}

const ActivityTimeline: React.FC<ActivityTimelineProps> = ({ activities }) => {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case "registration":
        return <UserPlus className="w-4 h-4 text-green-500" />;
      case "login":
        return <Activity className="w-4 h-4 text-blue-500" />;
      case "admin_action":
        return <Shield className="w-4 h-4 text-purple-500" />;
      case "ban":
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case "registration":
        return "border-green-200 dark:border-green-700 bg-green-50 dark:bg-green-900/20";
      case "login":
        return "border-blue-200 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20";
      case "admin_action":
        return "border-purple-200 dark:border-purple-700 bg-purple-50 dark:bg-purple-900/20";
      case "ban":
        return "border-red-200 dark:border-red-700 bg-red-50 dark:bg-red-900/20";
      default:
        return "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800";
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
        Actividad Reciente
      </h3>

      <div className="space-y-4 max-h-80 overflow-y-auto">
        {activities.map((activity, index) => (
          <div
            key={index}
            className={cn(
              "flex items-start space-x-3 p-3 rounded-lg border",
              getActivityColor(activity.type)
            )}
          >
            <div className="flex-shrink-0 mt-1">
              {getActivityIcon(activity.type)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-900 dark:text-white">
                <span className="font-medium">{activity.user}</span>{" "}
                {activity.action}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {activity.time}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// 📊 Main Analytics Tab Component
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
      <TabTransition>
        <div className="p-6 space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl"
                ></div>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="h-64 bg-gray-200 dark:bg-gray-700 rounded-xl"
                ></div>
              ))}
            </div>
          </div>
        </div>
      </TabTransition>
    );
  }

  return (
    <TabTransition>
      <div className="p-6 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center space-x-3">
              <BarChart3 className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
              <span>Analytics de Usuarios</span>
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Métricas detalladas y análisis de comportamiento de usuarios
            </p>
          </div>

          <div className="flex items-center space-x-3">
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

            <button className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
              <RefreshCw className="w-4 h-4" />
              <span>Actualizar</span>
            </button>

            <button className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
              <Download className="w-4 h-4" />
              <span>Exportar</span>
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Total Registros"
            value={analytics.totalRegistrations}
            change={analytics.registrationGrowth}
            changeType="positive"
            icon={Users}
            color="text-blue-600 dark:text-blue-400"
            description="Usuarios registrados en total"
          />

          <MetricCard
            title="Nuevos esta Semana"
            value={analytics.newRegistrationsThisWeek}
            change="+15%"
            changeType="positive"
            icon={UserPlus}
            color="text-green-600 dark:text-green-400"
            description="Registros en los últimos 7 días"
          />

          <MetricCard
            title="Promedio Diario"
            value={analytics.averageDailyRegistrations}
            change={analytics.activityGrowth}
            changeType="positive"
            icon={TrendingUp}
            color="text-indigo-600 dark:text-indigo-400"
            description="Registros por día (promedio)"
          />

          <MetricCard
            title="Tasa de Retención"
            value={`${analytics.retentionRate}%`}
            change="+2%"
            changeType="positive"
            icon={Activity}
            color="text-purple-600 dark:text-purple-400"
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
      </div>
    </TabTransition>
  );
};

export default AnalyticsTab;
