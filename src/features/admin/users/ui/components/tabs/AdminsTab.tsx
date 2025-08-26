/**
 * 🛡️ ADMINS TAB COMPONENT
 * =======================
 *
 * Gestión específica de usuarios administrativos
 * Componente optimizado para React 19 con dark mode
 * Siguiendo exactamente el patrón de inventory
 *
 * Created: 2025-01-18 - Users Admins Tab
 */

"use client";

import React, { useState, useMemo } from "react";
import {
  Shield,
  Crown,
  UserCheck,
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  AlertTriangle,
  Lock,
  Unlock,
  Settings,
  Users,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/shared/utils";
import { useUsersContext } from "../../../context";
import { TabTransition } from "../shared";
import type { User } from "../../../types";

// 🛡️ Admin Stats Card Component
interface AdminStatsCardProps {
  title: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  color: "red" | "purple" | "blue" | "green";
  description?: string;
}

const AdminStatsCard: React.FC<AdminStatsCardProps> = ({
  title,
  value,
  icon: Icon,
  color,
  description,
}) => {
  const colorClasses = {
    red: "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700 text-red-600 dark:text-red-400",
    purple:
      "bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-700 text-purple-600 dark:text-purple-400",
    blue: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700 text-blue-600 dark:text-blue-400",
    green:
      "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700 text-green-600 dark:text-green-400",
  };

  return (
    <div
      className={cn(
        "p-6 rounded-xl border transition-all duration-300 hover:shadow-lg transform hover:scale-105",
        colorClasses[color]
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <Icon className="w-8 h-8" />
        <TrendingUp className="w-5 h-5 opacity-60" />
      </div>
      <div className="space-y-1">
        <h3 className="text-3xl font-bold text-gray-900 dark:text-white">
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
    </div>
  );
};

// 👑 Admin Card Component
interface AdminCardProps {
  admin: User;
  onView: (user: User) => void;
  onEdit: (user: User) => void;
  onRemoveAdmin: (user: User) => void;
}

const AdminCard: React.FC<AdminCardProps> = ({
  admin,
  onView,
  onEdit,
  onRemoveAdmin,
}) => {
  const getRoleIcon = (role: string) => {
    switch (role) {
      case "super_admin":
        return <Crown className="w-5 h-5 text-red-500" />;
      case "admin":
        return <Shield className="w-5 h-5 text-purple-500" />;
      case "moderator":
        return <UserCheck className="w-5 h-5 text-blue-500" />;
      default:
        return <Users className="w-5 h-5 text-gray-500" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "super_admin":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 border-red-200 dark:border-red-700";
      case "admin":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400 border-purple-200 dark:border-purple-700";
      case "moderator":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 border-blue-200 dark:border-blue-700";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600";
    }
  };

  const getRoleName = (role: string) => {
    switch (role) {
      case "super_admin":
        return "Super Administrador";
      case "admin":
        return "Administrador";
      case "moderator":
        return "Moderador";
      default:
        return role;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all duration-300 group">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-14 h-14 bg-gradient-to-r from-purple-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
            {admin.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center space-x-2">
              <span>{admin.name}</span>
              {getRoleIcon(admin.role)}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              {admin.email}
            </p>
            <div
              className={cn(
                "inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border mt-2",
                getRoleColor(admin.role)
              )}
            >
              {getRoleName(admin.role)}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onView(admin)}
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title="Ver detalles"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => onEdit(admin)}
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title="Editar permisos"
          >
            <Edit className="w-4 h-4" />
          </button>
          {admin.role !== "super_admin" && (
            <button
              onClick={() => onRemoveAdmin(admin)}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="Remover privilegios admin"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="space-y-3 text-sm">
        <div className="flex items-center justify-between py-2 border-t border-gray-100 dark:border-gray-700">
          <span className="text-gray-600 dark:text-gray-400">Registrado:</span>
          <span className="text-gray-900 dark:text-white">
            {new Date(admin.createdAt).toLocaleDateString()}
          </span>
        </div>

        <div className="flex items-center justify-between py-2">
          <span className="text-gray-600 dark:text-gray-400">
            Última actividad:
          </span>
          <span className="text-gray-900 dark:text-white">
            {new Date(admin.updatedAt).toLocaleDateString()}
          </span>
        </div>

        <div className="flex items-center justify-between py-2">
          <span className="text-gray-600 dark:text-gray-400">Estado:</span>
          <span
            className={cn(
              "px-2 py-1 rounded-full text-xs font-medium",
              admin.banned
                ? "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                : "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
            )}
          >
            {admin.banned ? (
              <div className="flex items-center space-x-1">
                <Lock className="w-3 h-3" />
                <span>Suspendido</span>
              </div>
            ) : (
              <div className="flex items-center space-x-1">
                <Unlock className="w-3 h-3" />
                <span>Activo</span>
              </div>
            )}
          </span>
        </div>
      </div>
    </div>
  );
};

// 📊 Main Admins Tab Component
const AdminsTab: React.FC = () => {
  const { users, openViewModal, openEditModal, openDeleteConfirm } =
    useUsersContext();

  const { users: usersList, isLoading } = users;
  const [searchTerm, setSearchTerm] = useState("");

  // 🛡️ Filter only administrative users
  const adminUsers = useMemo(() => {
    const admins = (usersList || []).filter(
      (user) => user.role === "super_admin" || user.role === "admin"
    );

    if (searchTerm) {
      return admins.filter(
        (admin) =>
          admin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          admin.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          admin.role.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return admins;
  }, [usersList, searchTerm]);

  // 📊 Admin Statistics
  const adminStats = useMemo(() => {
    const superAdmins = adminUsers.filter(
      (user) => user.role === "super_admin"
    ).length;
    const regularAdmins = adminUsers.filter(
      (user) => user.role === "admin"
    ).length;
    const moderators = 0; // No moderator role available
    const totalAdmins = adminUsers.length;

    return {
      superAdmins,
      regularAdmins,
      moderators,
      totalAdmins,
    };
  }, [adminUsers]);

  const handleRemoveAdmin = (admin: User) => {
    // In a real implementation, this would demote the user to regular user role
    openDeleteConfirm(admin);
  };

  const handlePromoteUser = () => {
    // Logic to promote a regular user to admin
    console.log("Promote user to admin");
  };

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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="h-48 bg-gray-200 dark:bg-gray-700 rounded-xl"
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
              <Shield className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              <span>Administradores del Sistema</span>
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Gestión de usuarios con privilegios administrativos (
              {adminStats.totalAdmins} administradores)
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handlePromoteUser}
              className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Promover Usuario</span>
            </button>
          </div>
        </div>

        {/* Admin Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <AdminStatsCard
            title="Super Admins"
            value={adminStats.superAdmins}
            icon={Crown}
            color="red"
            description="Acceso completo al sistema"
          />
          <AdminStatsCard
            title="Administradores"
            value={adminStats.regularAdmins}
            icon={Shield}
            color="purple"
            description="Gestión de usuarios y sistema"
          />
          <AdminStatsCard
            title="Moderadores"
            value={adminStats.moderators}
            icon={UserCheck}
            color="blue"
            description="Moderación de contenido"
          />
          <AdminStatsCard
            title="Total"
            value={adminStats.totalAdmins}
            icon={Users}
            color="green"
            description="Usuarios administrativos"
          />
        </div>

        {/* Search */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar administradores..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Security Notice */}
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-amber-800 dark:text-amber-200">
                Aviso de Seguridad
              </h4>
              <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                Los cambios en permisos administrativos requieren confirmación
                adicional y se registran en el log de auditoría.
              </p>
            </div>
          </div>
        </div>

        {/* Admins Grid */}
        {adminUsers.length === 0 ? (
          <div className="text-center py-12">
            <Shield className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No se encontraron administradores
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {searchTerm
                ? "Intenta ajustar los criterios de búsqueda"
                : "No hay usuarios con privilegios administrativos"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {adminUsers.map((admin) => (
              <AdminCard
                key={admin.id}
                admin={admin}
                onView={openViewModal}
                onEdit={openEditModal}
                onRemoveAdmin={handleRemoveAdmin}
              />
            ))}
          </div>
        )}

        {/* Admin Management Actions */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Mostrando {adminUsers.length} administradores
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <button className="flex items-center space-x-2 px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors">
                <Settings className="w-4 h-4" />
                <span>Configurar Roles</span>
              </button>

              <button className="flex items-center space-x-2 px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors">
                <Eye className="w-4 h-4" />
                <span>Log de Actividades</span>
              </button>
            </div>
          </div>
        </div>

        {/* Role Descriptions */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Descripción de Roles
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Crown className="w-5 h-5 text-red-500" />
                <h4 className="font-medium text-gray-900 dark:text-white">
                  Super Administrador
                </h4>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Acceso completo al sistema, incluyendo configuración de
                seguridad y gestión de otros administradores.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-purple-500" />
                <h4 className="font-medium text-gray-900 dark:text-white">
                  Administrador
                </h4>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Gestión de usuarios, contenido y configuraciones básicas del
                sistema. Sin acceso a configuración crítica.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <UserCheck className="w-5 h-5 text-blue-500" />
                <h4 className="font-medium text-gray-900 dark:text-white">
                  Moderador
                </h4>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Moderación de contenido y usuarios. Acceso limitado a funciones
                administrativas específicas.
              </p>
            </div>
          </div>
        </div>
      </div>
    </TabTransition>
  );
};

export default AdminsTab;
