"use client";

import React, { useState } from "react";
import {
  Plus,
  Search,
  Users,
  UserCheck,
  UserX,
  Shield,
  RefreshCw,
} from "lucide-react";
import { useUsers } from "../../hooks/useUsers";
import { CreateUserForm, User } from "../../types";
import UserCard from "@/features/admin/users/ui/components/UserCard";
import UserModal from "@/features/admin/users/ui/components/UserModal";
import { useNotifications } from "@/shared/hooks/useNotifications";

/**
 * 🎯 USERS VIEW - VERSIÓN LIMPIA
 * =============================
 *
 * ✅ Una sola fuente de verdad: useUsers hook
 * ✅ Sin duplicación de lógica
 * ✅ Configuración centralizada
 * ✅ Todas las features enterprise automáticas
 */

const UsersCleanView: React.FC = () => {
  // 🧠 SIMPLE: Hook para notificaciones
  const { notify } = useNotifications();

  // 🎛️ UI State (solo UI, no lógica de negocio)
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // 🎯 UNA SOLA LÍNEA: TODO el poder del módulo de usuarios
  const {
    // 📊 Data (automática)
    users,
    stats,

    // 🔄 States (automáticos)
    isLoading,
    isPending,
    error,

    // 🎯 Operations (automáticas + optimistic UI)
    createUser,
    updateUser,
    deleteUser,
    banUser,
    unbanUser,
    updateUserRole,

    // 🔍 Filters (automáticos + optimizados)
    searchUsers,
    filterUsersByRole,
    filterUsersByStatus,

    // 🔄 Management (automático)
    refresh,
    clearErrors,
  } = useUsers();

  // 🔍 SMART FILTERING: Combina búsqueda y filtros automáticamente
  const getFilteredUsers = () => {
    let filtered = users;

    // 🔍 Search (usa el selector optimizado del hook)
    if (searchTerm) {
      filtered = searchUsers(searchTerm);
    }

    // 🎭 Role filter (usa el selector optimizado del hook)
    if (filterRole !== "all") {
      filtered = filterUsersByRole(filterRole as User["role"]);
    }

    // 🚥 Status filter (usa el selector optimizado del hook)
    if (filterStatus !== "all") {
      filtered = filterUsersByStatus(filterStatus as "active" | "banned");
    }

    return filtered;
  };

  const filteredUsers = getFilteredUsers();

  // 🧠 SÚPER SIMPLE: Operaciones con una línea cada una
  const handleCreateUser = async (userData: CreateUserForm) => {
    await notify(
      async () => {
        const result = await createUser(userData);
        if (!result.success) {
          throw new Error(result.error || "Error creating user");
        }
        setIsModalOpen(false);
      },
      "Creando usuario...",
      "Usuario creado exitosamente"
    );
  };

  const handleEditUser = async (userData: CreateUserForm) => {
    if (!editingUser) return;

    await notify(async () => {
      const result = await updateUser({
        id: editingUser.id,
        ...userData,
      });
      if (!result.success) {
        throw new Error(result.error || "Error updating user");
      }
      setEditingUser(null);
      setIsModalOpen(false);
    }, "Actualizando usuario...");
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este usuario?")) return;

    await notify(async () => {
      const result = await deleteUser(userId);
      if (!result.success) {
        throw new Error(result.error || "Error deleting user");
      }
    }, "Eliminando usuario...");
  };

  const handleToggleBan = async (userId: string) => {
    const user = users.find((u) => u.id === userId);
    if (!user) return;

    const isBanned = user.banned; // useUsers maneja el estado correcto

    if (isBanned) {
      await notify(async () => {
        const result = await unbanUser(userId);
        if (!result.success) {
          throw new Error(result.error || "Error unbanning user");
        }
      }, "Desbaneando usuario...");
    } else {
      const banReason = prompt("Razón del baneo:") || "";
      if (!banReason) return;

      await notify(async () => {
        const result = await banUser({
          id: userId,
          reason: banReason,
        });
        if (!result.success) {
          throw new Error(result.error || "Error banning user");
        }
      }, "Baneando usuario...");
    }
  };

  const handleChangeRole = async (userId: string, role: User["role"]) => {
    await notify(async () => {
      const result = await updateUserRole(userId, role);
      if (!result.success) {
        throw new Error(result.error || "Error changing role");
      }
    }, `Cambiando rol a ${role}...`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            👥 Gestión de Usuarios
          </h1>
          <p className="text-slate-600 mt-1">
            Administra todos los usuarios del sistema
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* 🔄 REFRESH: Con estado automático del hook */}
          <button
            onClick={refresh}
            disabled={isPending}
            className={`flex items-center gap-2 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              isPending ? "animate-pulse" : ""
            }`}
          >
            <RefreshCw size={16} className={isPending ? "animate-spin" : ""} />
            {isPending ? "Actualizando..." : "Actualizar"}
          </button>

          <button
            onClick={() => {
              setEditingUser(null);
              setIsModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nuevo Usuario
          </button>
        </div>
      </div>

      {/* 📊 STATS: Automáticas del hook */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600">Total</p>
              <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-50 rounded-lg">
              <UserCheck className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600">Activos</p>
              <p className="text-2xl font-bold text-slate-900">
                {stats.active}
              </p>
              <p className="text-xs text-slate-500">
                {stats.activePercentage.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-50 rounded-lg">
              <UserX className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600">Baneados</p>
              <p className="text-2xl font-bold text-slate-900">
                {stats.banned}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-50 rounded-lg">
              <Shield className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600">Admins</p>
              <p className="text-2xl font-bold text-slate-900">
                {stats.admins}
              </p>
              <p className="text-xs text-slate-500">
                {stats.adminPercentage.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ❌ ERROR HANDLING: Automático del hook */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <p className="text-red-700">{error}</p>
            <button
              onClick={clearErrors}
              className="text-red-600 hover:text-red-800 text-sm underline"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg border border-slate-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar usuarios..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="sm:w-48">
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Todos los roles</option>
              <option value="super_admin">Super Admin</option>
              <option value="admin">Administrador</option>
              <option value="user">Usuario</option>
            </select>
          </div>

          <div className="sm:w-48">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Todos los estados</option>
              <option value="active">Activos</option>
              <option value="banned">Baneados</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Grid */}
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">No se encontraron usuarios</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredUsers.map((user) => (
            <UserCard
              key={user.id}
              user={user}
              onEdit={(user) => {
                setEditingUser(user);
                setIsModalOpen(true);
              }}
              onDelete={handleDeleteUser}
              onToggleBan={handleToggleBan}
              onChangeRole={handleChangeRole}
            />
          ))}
        </div>
      )}

      {/* User Modal */}
      <UserModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingUser(null);
        }}
        onSave={editingUser ? handleEditUser : handleCreateUser}
        user={editingUser}
      />
    </div>
  );
};

export default UsersCleanView;
