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
import { useUsersQuery } from "../../hooks/useUsersQuery";
import { CreateUserForm, User } from "../../types";
import UserCard from "@/features/admin/users/ui/components/UserCard";
import UserModal from "@/features/admin/users/ui/components/UserModal";
import { SkeletonList, SkeletonStatsCard } from "@/shared/ui/components";

/**
 * ⚡ OPTIMIZED USERS VIEW - TANSTACK QUERY
 * ========================================
 *
 * Vista súper optimizada usando TanStack Query.
 * Performance enterprise, cero parpadeos, optimistic updates.
 *
 * Enterprise: 2025-01-17 - Maximum performance
 */

const OptimizedUsersView: React.FC = () => {
  // 🎛️ UI State
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // ⚡ TANSTACK QUERY HOOK - Enterprise optimized
  const {
    users,
    stats,
    isLoading,
    isFetching,
    isValidating,
    error,
    hasError,
    searchUsers,
    filterUsersByRole,
    filterUsersByStatus,
    createUser,
    updateUser,
    deleteUser,
    toggleBanUser,
    refresh,
    isCreating,
    isUpdating,
    isDeleting,
  } = useUsersQuery();

  // 🔍 Smart filtering with optimized data
  const getFilteredUsers = () => {
    let filtered = users;

    // 🔍 Search
    if (searchTerm) {
      filtered = searchUsers(searchTerm);
    }

    // 🎭 Role filter
    if (filterRole !== "all") {
      filtered = filterUsersByRole(filterRole as User["role"]);
    }

    // 🚥 Status filter
    if (filterStatus !== "all") {
      filtered = filterUsersByStatus(filterStatus as "active" | "banned");
    }

    return filtered;
  };

  const filteredUsers = getFilteredUsers();

  // 🧠 User operations - Optimistic by default
  const handleCreateUser = async (userData: CreateUserForm) => {
    await createUser(userData);
    setIsModalOpen(false);
  };

  const handleEditUser = async (userData: CreateUserForm) => {
    if (!editingUser) return;

    await updateUser(editingUser.id, userData);
    setEditingUser(null);
    setIsModalOpen(false);
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este usuario?")) return;
    await deleteUser(userId);
  };

  const handleToggleBan = async (userId: string) => {
    await toggleBanUser(userId);
  };

  const handleChangeRole = async (userId: string, role: User["role"]) => {
    await updateUser(userId, { role });
  };

  return (
    <div className="space-y-6">
      {/* 🏠 Header - SIEMPRE VISIBLE */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              👥 Gestión de Usuarios
            </h1>
            {/* ⚡ Performance indicators */}
            {isValidating && (
              <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs rounded-full">
                <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <span>Actualizando</span>
              </div>
            )}
            {(isCreating || isUpdating || isDeleting) && (
              <div className="flex items-center gap-1 px-2 py-1 bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 text-xs rounded-full">
                <div className="w-3 h-3 border-2 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
                <span>Guardando</span>
              </div>
            )}
          </div>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Sistema súper optimizado con TanStack Query
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* 🔄 Refresh button */}
          <button
            onClick={() => {
              refresh();
            }}
            disabled={isFetching}
            className={`flex items-center gap-2 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              isFetching ? "animate-pulse" : ""
            }`}
          >
            <RefreshCw size={16} className={isFetching ? "animate-spin" : ""} />
            {isFetching ? "Actualizando..." : "Actualizar"}
          </button>

          <button
            onClick={() => {
              setEditingUser(null);
              setIsModalOpen(true);
            }}
            disabled={isCreating}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            {isCreating ? "Creando..." : "Nuevo Usuario"}
          </button>
        </div>
      </div>

      {/* 📊 STATS - OPTIMIZED CON CACHE */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonStatsCard key={i} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Total
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {stats.total}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <UserCheck className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Activos
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {stats.active}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {stats.activePercentage.toFixed(1)}%
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <UserX className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Baneados
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {stats.banned}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                <Shield className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Admins
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {stats.admins}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {stats.adminPercentage.toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ❌ Error handling */}
      {hasError && error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <p className="text-red-700 dark:text-red-300">{error}</p>
            <button
              onClick={() => {
                refresh();
              }}
              className="text-red-600 hover:text-red-800 text-sm underline"
            >
              Reintentar
            </button>
          </div>
        </div>
      )}

      {/* 🔍 Filters */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar usuarios..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          <div className="sm:w-48">
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
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
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
            >
              <option value="all">Todos los estados</option>
              <option value="active">Activos</option>
              <option value="banned">Baneados</option>
            </select>
          </div>
        </div>
      </div>

      {/* 👥 Users Grid - TANSTACK QUERY OPTIMIZED */}
      {isLoading ? (
        <SkeletonList items={6} showAvatar={true} />
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

export default OptimizedUsersView;
