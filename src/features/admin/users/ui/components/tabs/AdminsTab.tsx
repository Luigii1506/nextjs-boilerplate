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
  Plus,
  Crown,
  UserCheck,
  Users,
  AlertTriangle,
  Settings,
  Eye,
} from "lucide-react";
import { useUsersContext } from "../../../context";
import {
  TabHeader,
  TabWrapper,
  TabStatsCard,
  TabSearchBar,
  TabFooterStats,
  TabLoadingSkeleton,
} from "@/shared/ui/components/tabs";
import { AdminCard } from "../admins";
import type { User } from "../../../types";

/**
 * 📊 ADMINS TAB - MAIN COMPONENT
 * ===============================
 */
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
    // TODO: Implement promote user to admin functionality
  };

  if (isLoading) {
    return (
      <TabWrapper spacing="space-y-6" responsive={false}>
        <TabLoadingSkeleton type="stats" count={4} showHeader />
        <TabLoadingSkeleton type="grid" count={6} showHeader={false} />
      </TabWrapper>
    );
  }

  return (
    <TabWrapper>
      {/* Header */}
      <TabHeader
        icon={
          <Shield className="w-8 h-8 text-purple-600 dark:text-purple-400" />
        }
        title="Administradores del Sistema"
        description={`Gestión de usuarios con privilegios administrativos (${adminStats.totalAdmins} administradores)`}
        actions={[
          {
            label: "Promover Usuario",
            icon: <Plus className="w-4 h-4" />,
            onClick: handlePromoteUser,
            variant: "primary",
            color: "purple",
          },
        ]}
      />

      {/* Admin Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <TabStatsCard
          title="Super Admins"
          value={adminStats.superAdmins}
          icon={Crown}
          color="red"
          description="Acceso completo al sistema"
        />
        <TabStatsCard
          title="Administradores"
          value={adminStats.regularAdmins}
          icon={Shield}
          color="purple"
          description="Gestión de usuarios y sistema"
        />
        <TabStatsCard
          title="Moderadores"
          value={adminStats.moderators}
          icon={UserCheck}
          color="blue"
          description="Moderación de contenido"
        />
        <TabStatsCard
          title="Total"
          value={adminStats.totalAdmins}
          icon={Users}
          color="green"
          description="Usuarios administrativos"
        />
      </div>

      {/* Search */}
      <TabSearchBar
        value={searchTerm}
        onChange={setSearchTerm}
        placeholder="Buscar administradores..."
      />

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
      <TabFooterStats
        count={`Mostrando ${adminUsers.length} administradores`}
        actions={[
          {
            label: "Configurar Roles",
            icon: <Settings className="w-4 h-4" />,
            onClick: () => {},
          },
          {
            label: "Log de Actividades",
            icon: <Eye className="w-4 h-4" />,
            onClick: () => {},
          },
        ]}
      />

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
              Acceso completo al sistema, incluyendo configuración de seguridad
              y gestión de otros administradores.
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
    </TabWrapper>
  );
};

export default AdminsTab;
