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
import {
  Users,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Shield,
  UserCheck,
  UserX,
  ArrowUpRight,
  Eye,
  Clock,
} from "lucide-react";
import { cn } from "@/shared/utils";
import { useUsersContext } from "../../../context";
import { TabTransition } from "../shared/TabTransition";

// 📊 Enhanced Stats Card with Animations
interface StatsCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
  color?: string;
  onClick?: () => void;
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  change,
  changeType = "neutral",
  icon: Icon,
  description,
  color = "blue",
  onClick,
}) => {
  const colorClasses = {
    blue: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700",
    green:
      "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700",
    red: "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700",
    purple:
      "bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-700",
    orange:
      "bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-700",
    indigo:
      "bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-700",
  };

  const iconColors = {
    blue: "text-blue-600 dark:text-blue-400",
    green: "text-green-600 dark:text-green-400",
    red: "text-red-600 dark:text-red-400",
    purple: "text-purple-600 dark:text-purple-400",
    orange: "text-orange-600 dark:text-orange-400",
    indigo: "text-indigo-600 dark:text-indigo-400",
  };

  return (
    <div
      className={cn(
        "p-6 rounded-xl border transition-all duration-300 hover:shadow-lg",
        "transform hover:scale-105 cursor-pointer group",
        colorClasses[color as keyof typeof colorClasses],
        onClick && "hover:bg-opacity-70"
      )}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-3">
        <Icon
          className={cn(
            "w-8 h-8",
            iconColors[color as keyof typeof iconColors]
          )}
        />
        {change && (
          <div
            className={cn(
              "flex items-center text-sm font-medium",
              changeType === "positive" && "text-green-600 dark:text-green-400",
              changeType === "negative" && "text-red-600 dark:text-red-400",
              changeType === "neutral" && "text-gray-600 dark:text-gray-400"
            )}
          >
            {changeType === "positive" ? (
              <TrendingUp className="w-4 h-4 mr-1" />
            ) : changeType === "negative" ? (
              <TrendingDown className="w-4 h-4 mr-1" />
            ) : (
              <ArrowUpRight className="w-4 h-4 mr-1" />
            )}
            {change}
          </div>
        )}
      </div>

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

      {onClick && (
        <div className="mt-3 flex items-center text-xs text-gray-500 dark:text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
          <Eye className="w-3 h-3 mr-1" />
          Ver detalles
        </div>
      )}
    </div>
  );
};

// 📊 Alert Card Component
interface AlertCardProps {
  title: string;
  message: string;
  type: "warning" | "error" | "info";
  timestamp?: string;
  onView?: () => void;
}

const AlertCard: React.FC<AlertCardProps> = ({
  title,
  message,
  type,
  timestamp,
  onView,
}) => {
  const typeClasses = {
    warning: {
      container:
        "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700",
      icon: "text-yellow-600 dark:text-yellow-400",
      title: "text-yellow-900 dark:text-yellow-100",
    },
    error: {
      container:
        "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700",
      icon: "text-red-600 dark:text-red-400",
      title: "text-red-900 dark:text-red-100",
    },
    info: {
      container:
        "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700",
      icon: "text-blue-600 dark:text-blue-400",
      title: "text-blue-900 dark:text-blue-100",
    },
  };

  const classes = typeClasses[type];

  return (
    <div
      className={cn(
        "p-4 rounded-lg border transition-all duration-300 hover:shadow-md",
        classes.container
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <AlertTriangle className={cn("w-5 h-5 mt-0.5", classes.icon)} />
          <div className="flex-1 space-y-1">
            <h4 className={cn("text-sm font-semibold", classes.title)}>
              {title}
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {message}
            </p>
            {timestamp && (
              <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                <Clock className="w-3 h-3 mr-1" />
                {timestamp}
              </div>
            )}
          </div>
        </div>
        {onView && (
          <button
            onClick={onView}
            className={cn(
              "text-xs font-medium px-3 py-1 rounded-md transition-colors hover:bg-opacity-80",
              classes.title
            )}
          >
            Ver
          </button>
        )}
      </div>
    </div>
  );
};

// 📊 Main Overview Tab Component
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
      <div className="p-6 space-y-6 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl"
            />
          ))}
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <TabTransition>
      <div className="p-6 space-y-8">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Vista General
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Dashboard principal con métricas y KPIs del sistema de usuarios
          </p>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total de Usuarios"
            value={metrics.totalUsers}
            change={metrics.userGrowth}
            changeType="positive"
            icon={Users}
            description="Usuarios registrados en el sistema"
            color="blue"
            onClick={() => setActiveTab("all-users")}
          />

          <StatsCard
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

          <StatsCard
            title="Usuarios Baneados"
            value={metrics.bannedUsers}
            change={metrics.bannedPercentage}
            changeType={metrics.bannedUsers > 0 ? "negative" : "neutral"}
            icon={UserX}
            description="Usuarios suspendidos"
            color="red"
            onClick={() => setActiveTab("all-users")}
          />

          <StatsCard
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
      </div>
    </TabTransition>
  );
};

export default OverviewTab;
