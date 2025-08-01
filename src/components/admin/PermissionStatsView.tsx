/**
 * 📊 VISTA DE ESTADÍSTICAS DE PERMISOS
 *
 * Este componente muestra:
 * - Estadísticas de usuarios por rol
 * - Análisis de permisos del sistema
 * - Resumen de actividad administrativa
 * - Estado del sistema de autenticación
 */

"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  Shield,
  Key,
  Activity,
  CheckCircle,
  AlertTriangle,
  Crown,
  BarChart3,
  Clock,
  Settings,
  Eye,
  Ban,
  UserCheck,
  Zap,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { usePermissions } from "@/hooks/usePermissions";
import {
  ROLE_INFO,
  ROLE_HIERARCHY,
  PERMISSION_GROUPS,
} from "@/lib/auth/permissions";

type RoleName = keyof typeof ROLE_INFO;

interface SystemStats {
  totalUsers: number;
  usersByRole: Record<string, number>;
  bannedUsers: number;
  verifiedUsers: number;
  recentUsers: number;
  adminUsers: number;
  guestUsers: number;
}

interface PermissionSummary {
  totalPermissions: number;
  userPermissions: number;
  contentPermissions: number;
  systemPermissions: number;
  availableRoles: number;
}

export const PermissionStatsView: React.FC = () => {
  const [stats, setStats] = useState<SystemStats>({
    totalUsers: 0,
    usersByRole: {},
    bannedUsers: 0,
    verifiedUsers: 0,
    recentUsers: 0,
    adminUsers: 0,
    guestUsers: 0,
  });

  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const {
    currentRole,
    currentLevel,
    isAdmin,
    isSuperAdmin,
    getManageableRoles,
  } = usePermissions();

  // Calcular estadísticas de permisos
  const permissionSummary: PermissionSummary = {
    totalPermissions: Object.keys(PERMISSION_GROUPS).length,
    userPermissions: 3, // create, update, delete users
    contentPermissions: 6, // create, read, update, delete, publish, moderate
    systemPermissions: isAdmin() ? (isSuperAdmin() ? 15 : 8) : 0,
    availableRoles: Object.keys(ROLE_INFO).length,
  };

  // Cargar estadísticas
  const loadStats = async () => {
    try {
      setLoading(true);

      // Obtener lista de usuarios
      const result = await authClient.admin.listUsers({
        query: {
          limit: 1000, // Obtener todos los usuarios para estadísticas precisas
        },
      });

      if (result.data?.users) {
        const users = result.data.users;
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        // Calcular estadísticas
        const usersByRole: Record<string, number> = {};
        let bannedCount = 0;
        let verifiedCount = 0;
        let recentCount = 0;
        let adminCount = 0;
        let guestCount = 0;

        users.forEach((user) => {
          const role = user.role || "user";
          usersByRole[role] = (usersByRole[role] || 0) + 1;

          if (user.banned) bannedCount++;
          if (user.emailVerified) verifiedCount++;
          if (new Date(user.createdAt) > sevenDaysAgo) recentCount++;

          if (role === "admin" || role === "super_admin") adminCount++;
          if (role === "guest") guestCount++;
        });

        setStats({
          totalUsers: users.length,
          usersByRole,
          bannedUsers: bannedCount,
          verifiedUsers: verifiedCount,
          recentUsers: recentCount,
          adminUsers: adminCount,
          guestUsers: guestCount,
        });

        setLastUpdate(new Date());
      }
    } catch (error) {
      console.error("Error loading stats:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();

    // Actualizar estadísticas cada 5 minutos
    const interval = setInterval(loadStats, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-slate-600">Cargando estadísticas...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Estadísticas del Sistema
            </h2>
            <p className="text-slate-600 mt-1">
              Vista general de usuarios, roles y permisos
            </p>
          </div>

          <div className="text-right">
            <p className="text-sm text-slate-600">Última actualización</p>
            <p className="text-xs text-slate-500 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {lastUpdate.toLocaleTimeString("es-ES")}
            </p>
          </div>
        </div>
      </div>

      {/* Estadísticas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total usuarios */}
        <div className="bg-white p-6 rounded-lg border border-slate-200">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-slate-600">
                Total Usuarios
              </p>
              <p className="text-2xl font-bold text-slate-900">
                {stats.totalUsers}
              </p>
            </div>
          </div>
        </div>

        {/* Administradores */}
        <div className="bg-white p-6 rounded-lg border border-slate-200">
          <div className="flex items-center">
            <Crown className="h-8 w-8 text-purple-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-slate-600">
                Administradores
              </p>
              <p className="text-2xl font-bold text-slate-900">
                {stats.adminUsers}
              </p>
              <p className="text-xs text-slate-500">
                {((stats.adminUsers / stats.totalUsers) * 100 || 0).toFixed(1)}%
                del total
              </p>
            </div>
          </div>
        </div>

        {/* Usuarios verificados */}
        <div className="bg-white p-6 rounded-lg border border-slate-200">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-slate-600">Verificados</p>
              <p className="text-2xl font-bold text-slate-900">
                {stats.verifiedUsers}
              </p>
              <p className="text-xs text-slate-500">
                {((stats.verifiedUsers / stats.totalUsers) * 100 || 0).toFixed(
                  1
                )}
                % del total
              </p>
            </div>
          </div>
        </div>

        {/* Usuarios recientes */}
        <div className="bg-white p-6 rounded-lg border border-slate-200">
          <div className="flex items-center">
            <Activity className="h-8 w-8 text-orange-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-slate-600">Nuevos (7d)</p>
              <p className="text-2xl font-bold text-slate-900">
                {stats.recentUsers}
              </p>
              <p className="text-xs text-slate-500">Últimos 7 días</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribución por roles */}
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Distribución por Roles
          </h3>

          <div className="space-y-3">
            {Object.entries(ROLE_INFO).map(([role, info]) => {
              const count = stats.usersByRole[role] || 0;
              const percentage =
                stats.totalUsers > 0 ? (count / stats.totalUsers) * 100 : 0;

              return (
                <div key={role} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-${info.color}-100 text-${info.color}-700`}
                    >
                      {info.icon} {info.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full bg-${info.color}-500`}
                        style={{ width: `${Math.max(percentage, 2)}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-slate-700 w-8 text-right">
                      {count}
                    </span>
                    <span className="text-xs text-slate-500 w-12 text-right">
                      {percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tu información de permisos */}
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Key className="w-5 h-5" />
            Tu Perfil de Permisos
          </h3>

          <div className="space-y-4">
            {/* Tu rol actual */}
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <span className="text-sm font-medium text-slate-700">
                Tu rol actual
              </span>
              <span
                className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-${
                  ROLE_INFO[currentRole || "user"].color
                }-100 text-${ROLE_INFO[currentRole || "user"].color}-700`}
              >
                {ROLE_INFO[currentRole || "user"].icon}{" "}
                {ROLE_INFO[currentRole || "user"].name}
              </span>
            </div>

            {/* Nivel de acceso */}
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <span className="text-sm font-medium text-slate-700">
                Nivel de acceso
              </span>
              <div className="flex items-center gap-2">
                <div className="w-20 bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full bg-blue-500"
                    style={{ width: `${(currentLevel / 100) * 100}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-slate-700">
                  {currentLevel}/100
                </span>
              </div>
            </div>

            {/* Roles que puedes gestionar */}
            <div className="p-3 bg-slate-50 rounded-lg">
              <span className="text-sm font-medium text-slate-700 block mb-2">
                Roles que puedes gestionar
              </span>
              <div className="flex flex-wrap gap-1">
                {getManageableRoles().map((role) => (
                  <span
                    key={role}
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs bg-${ROLE_INFO[role].color}-100 text-${ROLE_INFO[role].color}-700`}
                  >
                    {ROLE_INFO[role].icon} {ROLE_INFO[role].name}
                  </span>
                ))}
                {getManageableRoles().length === 0 && (
                  <span className="text-xs text-slate-500">
                    Sin permisos de gestión
                  </span>
                )}
              </div>
            </div>

            {/* Capacidades especiales */}
            <div className="space-y-2">
              <span className="text-sm font-medium text-slate-700 block">
                Capacidades especiales
              </span>
              <div className="space-y-1">
                {isSuperAdmin() && (
                  <div className="flex items-center gap-2 text-xs text-red-700">
                    <Crown className="w-3 h-3" />
                    Acceso completo al sistema
                  </div>
                )}
                {isAdmin() && !isSuperAdmin() && (
                  <div className="flex items-center gap-2 text-xs text-purple-700">
                    <Shield className="w-3 h-3" />
                    Administración de usuarios
                  </div>
                )}
                {permissionSummary.systemPermissions > 0 && (
                  <div className="flex items-center gap-2 text-xs text-blue-700">
                    <Settings className="w-3 h-3" />
                    {permissionSummary.systemPermissions} permisos de sistema
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Estado del sistema */}
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5" />
          Estado del Sistema
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Seguridad */}
          <div className="text-center p-4">
            <div className="flex justify-center mb-2">
              {stats.bannedUsers === 0 ? (
                <CheckCircle className="h-8 w-8 text-green-500" />
              ) : (
                <AlertTriangle className="h-8 w-8 text-yellow-500" />
              )}
            </div>
            <p className="text-sm font-medium text-slate-700">Seguridad</p>
            <p className="text-xs text-slate-500">
              {stats.bannedUsers} usuarios suspendidos
            </p>
          </div>

          {/* Verificación */}
          <div className="text-center p-4">
            <div className="flex justify-center mb-2">
              {stats.verifiedUsers / stats.totalUsers > 0.8 ? (
                <CheckCircle className="h-8 w-8 text-green-500" />
              ) : (
                <AlertTriangle className="h-8 w-8 text-yellow-500" />
              )}
            </div>
            <p className="text-sm font-medium text-slate-700">Verificación</p>
            <p className="text-xs text-slate-500">
              {((stats.verifiedUsers / stats.totalUsers) * 100 || 0).toFixed(1)}
              % verificados
            </p>
          </div>

          {/* Actividad */}
          <div className="text-center p-4">
            <div className="flex justify-center mb-2">
              {stats.recentUsers > 0 ? (
                <Activity className="h-8 w-8 text-green-500" />
              ) : (
                <Clock className="h-8 w-8 text-gray-500" />
              )}
            </div>
            <p className="text-sm font-medium text-slate-700">Actividad</p>
            <p className="text-xs text-slate-500">
              {stats.recentUsers} nuevos esta semana
            </p>
          </div>
        </div>
      </div>

      {/* Acciones rápidas */}
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">
          Acciones Rápidas
        </h3>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={loadStats}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Activity className="w-4 h-4" />
            Actualizar Estadísticas
          </button>

          {isAdmin() && (
            <>
              <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors">
                <Users className="w-4 h-4" />
                Ver Usuarios
              </button>

              <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors">
                <Eye className="w-4 h-4" />
                Logs de Actividad
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PermissionStatsView;
