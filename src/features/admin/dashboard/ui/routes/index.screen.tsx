"use client";

import React, { useActionState, useOptimistic, useTransition } from "react";
import {
  Users,
  UserCheck,
  UserX,
  Shield,
  TrendingUp,
  Calendar,
  Activity,
  Sliders,
  CheckCircle,
  XCircle,
  RefreshCw,
} from "lucide-react";
import { User, UserStats } from "@/shared/types/user";
import {
  getDashboardStatsServerAction,
  getRecentUsersServerAction,
  refreshDashboardServerAction,
} from "../../server/actions";
import { useIsEnabled } from "@/shared/hooks/useFeatureFlagsServerActions";

interface DashboardViewProps {
  onViewChange?: (view: string) => void;
}

// 🎯 Optimistic State para React 19
interface OptimisticDashboardState {
  stats: UserStats | null;
  recentUsers: User[];
  isRefreshing: boolean;
}

const DashboardView: React.FC<DashboardViewProps> = ({ onViewChange }) => {
  // 🚀 REACT 19: useActionState for dashboard stats
  const [statsState, statsAction, isStatsLoading] = useActionState(async () => {
    const result = await getDashboardStatsServerAction();
    return result;
  }, null);

  // 🚀 REACT 19: useActionState for recent users
  const [usersState, usersAction, isUsersLoading] = useActionState(async () => {
    const result = await getRecentUsersServerAction(5);
    return result;
  }, null);

  // ⚡ REACT 19: useTransition for refresh
  const [isRefreshing, startRefresh] = useTransition();

  // 🎯 REACT 19: useOptimistic for instant UI feedback
  const [optimisticState, setOptimisticState] = useOptimistic(
    {
      stats: statsState?.success ? (statsState.data as UserStats) : null,
      recentUsers: usersState?.success ? (usersState.data as User[]) : [],
      isRefreshing: false,
    } as OptimisticDashboardState,
    (
      state: OptimisticDashboardState,
      optimisticValue: Partial<OptimisticDashboardState>
    ) => ({
      ...state,
      ...optimisticValue,
    })
  );

  // 🎛️ Feature Flags (Pure Server Actions)
  const isEnabled = useIsEnabled();
  const featureFlags = {
    fileUpload: isEnabled("fileUpload"),
    userManagement: isEnabled("userManagement"),
    advancedAnalytics: isEnabled("analytics"),
  };

  // 🔄 Refresh handler with optimistic UI
  const handleRefresh = async () => {
    // Optimistic: show refreshing state immediately
    setOptimisticState({ isRefreshing: true });

    startRefresh(async () => {
      try {
        await refreshDashboardServerAction();
        // Reload data after refresh
        statsAction();
        usersAction();
      } finally {
        setOptimisticState({ isRefreshing: false });
      }
    });
  };

  // 📊 Computed values from optimistic state
  const stats = optimisticState.stats || {
    total: 0,
    active: 0,
    banned: 0,
    admins: 0,
  };

  const isLoading = isStatsLoading || isUsersLoading;
  const loading = isLoading && !optimisticState.stats; // Only show spinner on initial load

  // 🚀 Auto-load data on component mount (React 19 way)
  React.useEffect(() => {
    if (!statsState || !usersState) {
      startRefresh(() => {
        if (!statsState) statsAction();
        if (!usersState) usersAction();
      });
    }
  }, [statsAction, usersAction, statsState, usersState, startRefresh]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">🏠 Dashboard</h1>
          <p className="text-slate-600 mt-1">Resumen general del sistema</p>
        </div>

        {/* 🚀 REACT 19: Refresh button with optimistic UI */}
        <button
          onClick={handleRefresh}
          disabled={isRefreshing || optimisticState.isRefreshing}
          className={`flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
            isRefreshing || optimisticState.isRefreshing ? "animate-pulse" : ""
          }`}
        >
          <RefreshCw
            size={18}
            className={
              isRefreshing || optimisticState.isRefreshing ? "animate-spin" : ""
            }
          />
          {isRefreshing || optimisticState.isRefreshing
            ? "Actualizando..."
            : "Actualizar"}
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">
                Total Usuarios
              </p>
              <p className="text-3xl font-bold text-slate-900 mt-2">
                {stats.total}
              </p>
              <div className="flex items-center mt-2 text-green-600">
                <TrendingUp className="w-4 h-4 mr-1" />
                <span className="text-sm font-medium">+12%</span>
              </div>
            </div>
            <div className="p-3 bg-blue-50 rounded-full">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">
                Usuarios Activos
              </p>
              <p className="text-3xl font-bold text-slate-900 mt-2">
                {stats.active}
              </p>
              <div className="flex items-center mt-2 text-green-600">
                <TrendingUp className="w-4 h-4 mr-1" />
                <span className="text-sm font-medium">+8%</span>
              </div>
            </div>
            <div className="p-3 bg-green-50 rounded-full">
              <UserCheck className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">
                Usuarios Baneados
              </p>
              <p className="text-3xl font-bold text-slate-900 mt-2">
                {stats.banned}
              </p>
              <div className="flex items-center mt-2 text-red-600">
                <TrendingUp className="w-4 h-4 mr-1 transform rotate-180" />
                <span className="text-sm font-medium">-2%</span>
              </div>
            </div>
            <div className="p-3 bg-red-50 rounded-full">
              <UserX className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">
                Administradores
              </p>
              <p className="text-3xl font-bold text-slate-900 mt-2">
                {stats.admins}
              </p>
              <div className="flex items-center mt-2 text-slate-500">
                <Activity className="w-4 h-4 mr-1" />
                <span className="text-sm font-medium">Estable</span>
              </div>
            </div>
            <div className="p-3 bg-amber-50 rounded-full">
              <Shield className="w-6 h-6 text-amber-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activity Chart Placeholder */}
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-900">
              Actividad de Usuarios
            </h3>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Calendar className="w-4 h-4" />
              Últimos 30 días
            </div>
          </div>

          {/* Simple Activity Visualization */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Registros</span>
              <div className="flex items-center gap-2">
                <div className="w-24 h-2 bg-blue-100 rounded-full">
                  <div className="w-16 h-2 bg-blue-500 rounded-full"></div>
                </div>
                <span className="text-sm font-medium text-slate-900">67%</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Logins</span>
              <div className="flex items-center gap-2">
                <div className="w-24 h-2 bg-green-100 rounded-full">
                  <div className="w-20 h-2 bg-green-500 rounded-full"></div>
                </div>
                <span className="text-sm font-medium text-slate-900">83%</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Verificaciones</span>
              <div className="flex items-center gap-2">
                <div className="w-24 h-2 bg-amber-100 rounded-full">
                  <div className="w-12 h-2 bg-amber-500 rounded-full"></div>
                </div>
                <span className="text-sm font-medium text-slate-900">50%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Flags Status */}
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-900">
              🎛️ Feature Flags
            </h3>
            <button
              onClick={() => onViewChange?.("feature-flags")}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Administrar
            </button>
          </div>

          <div className="space-y-3">
            {[
              {
                key: "fileUpload",
                label: "📁 File Upload",
                description: "Sistema de archivos",
              },
              {
                key: "analytics",
                label: "📊 Analytics",
                description: "Estadísticas y métricas",
              },
              {
                key: "darkMode",
                label: "🌙 Dark Mode",
                description: "Modo oscuro",
              },
              {
                key: "betaFeatures",
                label: "🧪 Beta Features",
                description: "Funcionalidades experimentales",
              },
            ].map((flag) => {
              const isEnabled =
                featureFlags[flag.key as keyof typeof featureFlags];
              return (
                <div
                  key={flag.key}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {isEnabled ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500" />
                    )}
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        {flag.label}
                      </p>
                      <p className="text-xs text-slate-500">
                        {flag.description}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      isEnabled
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {isEnabled ? "ON" : "OFF"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">
          Acciones Rápidas
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => onViewChange?.("users")}
            className="p-4 border-2 border-dashed border-slate-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors text-left"
          >
            <Users className="w-6 h-6 text-blue-600 mb-2" />
            <h4 className="font-medium text-slate-900">Gestionar Usuarios</h4>
            <p className="text-sm text-slate-600 mt-1">
              Ver, crear y editar usuarios
            </p>
          </button>

          <button className="p-4 border-2 border-dashed border-slate-300 rounded-lg hover:border-green-400 hover:bg-green-50 transition-colors text-left">
            <Shield className="w-6 h-6 text-green-600 mb-2" />
            <h4 className="font-medium text-slate-900">Configurar Roles</h4>
            <p className="text-sm text-slate-600 mt-1">
              Administrar permisos y roles
            </p>
          </button>

          <button
            onClick={() => onViewChange?.("feature-flags")}
            className="p-4 border-2 border-dashed border-slate-300 rounded-lg hover:border-orange-400 hover:bg-orange-50 transition-colors text-left"
          >
            <Sliders className="w-6 h-6 text-orange-600 mb-2" />
            <h4 className="font-medium text-slate-900">Feature Flags</h4>
            <p className="text-sm text-slate-600 mt-1">
              Controlar funcionalidades
            </p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
