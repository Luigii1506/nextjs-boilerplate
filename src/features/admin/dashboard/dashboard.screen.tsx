"use client";

import React from "react";
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
import { useDashboard } from "./dashboard.hooks";
import { useIsEnabled } from "@/features/admin/feature-flags";
import { useHydration } from "@/shared/hooks/useHydration";

interface DashboardPageProps {
  onViewChange?: (view: string) => void;
}

export default function DashboardPage({ onViewChange }: DashboardPageProps) {
  // 🪝 Usar el hook personalizado del dashboard
  const {
    stats,
    isLoading,
    isRefreshing,
    refresh: handleRefresh,
  } = useDashboard();

  // 🎛️ Feature Flags
  const isHydrated = useHydration();
  const isEnabled = useIsEnabled();
  const featureFlags = {
    fileUpload: isEnabled("fileUpload"),
    userManagement: isEnabled("userManagement"),
    advancedAnalytics: isEnabled("analytics"),
  };

  // 📊 Stats con valores por defecto
  const dashboardStats = stats || {
    total: 0,
    active: 0,
    banned: 0,
    admins: 0,
  };

  if (isLoading) {
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
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            🏠 Dashboard
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Resumen general del sistema
          </p>
        </div>

        {/* 🚀 REACT 19: Refresh button with optimistic UI */}
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className={`flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed dark:bg-blue-700 dark:hover:bg-blue-600 ${
            isRefreshing ? "animate-pulse" : ""
          }`}
        >
          <RefreshCw size={18} className={isRefreshing ? "animate-spin" : ""} />
          {isRefreshing ? "Actualizando..." : "Actualizar"}
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Total Usuarios
              </p>
              <p className="text-3xl font-bold text-slate-900 dark:text-slate-100 mt-2">
                {dashboardStats.total}
              </p>
              <div className="flex items-center mt-2 text-green-600">
                <TrendingUp className="w-4 h-4 mr-1" />
                <span className="text-sm font-medium">+12%</span>
              </div>
            </div>
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-full">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Usuarios Activos
              </p>
              <p className="text-3xl font-bold text-slate-900 dark:text-slate-100 mt-2">
                {dashboardStats.active}
              </p>
              <div className="flex items-center mt-2 text-green-600">
                <TrendingUp className="w-4 h-4 mr-1" />
                <span className="text-sm font-medium">+8%</span>
              </div>
            </div>
            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-full">
              <UserCheck className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Usuarios Baneados
              </p>
              <p className="text-3xl font-bold text-slate-900 dark:text-slate-100 mt-2">
                {dashboardStats.banned}
              </p>
              <div className="flex items-center mt-2 text-red-600">
                <TrendingUp className="w-4 h-4 mr-1 transform rotate-180" />
                <span className="text-sm font-medium">-2%</span>
              </div>
            </div>
            <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-full">
              <UserX className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Administradores
              </p>
              <p className="text-3xl font-bold text-slate-900 dark:text-slate-100 mt-2">
                {dashboardStats.admins}
              </p>
              <div className="flex items-center mt-2 text-slate-500">
                <Activity className="w-4 h-4 mr-1" />
                <span className="text-sm font-medium">Estable</span>
              </div>
            </div>
            <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-full">
              <Shield className="w-6 h-6 text-amber-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activity Chart Placeholder */}
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
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
              <span className="text-sm text-slate-600 dark:text-slate-400">
                Registros
              </span>
              <div className="flex items-center gap-2">
                <div className="w-24 h-2 bg-blue-100 dark:bg-blue-900/20 rounded-full">
                  <div className="w-16 h-2 bg-blue-500 rounded-full"></div>
                </div>
                <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  67%
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600 dark:text-slate-400">
                Logins
              </span>
              <div className="flex items-center gap-2">
                <div className="w-24 h-2 bg-green-100 dark:bg-green-900/20 rounded-full">
                  <div className="w-20 h-2 bg-green-500 rounded-full"></div>
                </div>
                <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  83%
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600 dark:text-slate-400">
                Verificaciones
              </span>
              <div className="flex items-center gap-2">
                <div className="w-24 h-2 bg-amber-100 dark:bg-amber-900/20 rounded-full">
                  <div className="w-12 h-2 bg-amber-500 rounded-full"></div>
                </div>
                <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  50%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Flags Status */}
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              🎛️ Feature Flags
            </h3>
            <button
              onClick={() => onViewChange?.("feature-flags")}
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
            >
              Administrar
            </button>
          </div>

          <div className="space-y-3">
            {/* 🔄 Hydration Safe Feature Flags */}
            {!isHydrated
              ? // Show skeleton while hydrating to avoid hydration mismatch
                Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg animate-pulse"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 bg-slate-300 dark:bg-slate-600 rounded-full"></div>
                      <div>
                        <div className="w-24 h-4 bg-slate-300 dark:bg-slate-600 rounded mb-1"></div>
                        <div className="w-32 h-3 bg-slate-200 dark:bg-slate-700 rounded"></div>
                      </div>
                    </div>
                    <div className="w-8 h-5 bg-slate-300 dark:bg-slate-600 rounded-full"></div>
                  </div>
                ))
              : // Render actual feature flags after hydration
                [
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
                      className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        {isEnabled ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-500" />
                        )}
                        <div>
                          <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                            {flag.label}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {flag.description}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          isEnabled
                            ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                            : "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400"
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
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Acciones Rápidas
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => onViewChange?.("users")}
            className="p-4 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors text-left"
          >
            <Users className="w-6 h-6 text-blue-600 mb-2" />
            <h4 className="font-medium text-slate-900 dark:text-slate-100">
              Gestionar Usuarios
            </h4>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Ver, crear y editar usuarios
            </p>
          </button>

          <button className="p-4 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg hover:border-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors text-left">
            <Shield className="w-6 h-6 text-green-600 mb-2" />
            <h4 className="font-medium text-slate-900 dark:text-slate-100">
              Configurar Roles
            </h4>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Administrar permisos y roles
            </p>
          </button>

          <button
            onClick={() => onViewChange?.("feature-flags")}
            className="p-4 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg hover:border-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors text-left"
          >
            <Sliders className="w-6 h-6 text-orange-600 mb-2" />
            <h4 className="font-medium text-slate-900 dark:text-slate-100">
              Feature Flags
            </h4>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Controlar funcionalidades
            </p>
          </button>
        </div>
      </div>
    </div>
  );
}
