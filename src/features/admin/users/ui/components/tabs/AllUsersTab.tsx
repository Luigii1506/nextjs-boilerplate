/**
 * 👥 ALL USERS TAB COMPONENT
 * ==========================
 *
 * Gestión completa de usuarios con CRUD, filtros avanzados y búsqueda
 * Componente optimizado para React 19 con dark mode
 * Siguiendo exactamente el patrón de inventory ProductsTab
 *
 * Created: 2025-01-18 - Users All Users Tab
 */

"use client";

import React, { useState } from "react";
import {
  Search,
  Plus,
  Filter,
  Grid,
  List,
  UserCheck,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  Download,
  Upload,
  RefreshCw,
  Users,
  Ban,
} from "lucide-react";
import { cn } from "@/shared/utils";
import { useUsersContext } from "../../../context";
import { useUsersInfinite } from "../../../hooks/useUsersInfinite";
import { TabTransition } from "../shared";
import type { User } from "../../../types";
import UserModal from "../UserModal.main";
import UserViewModal from "../UserViewModal";
import DeleteUserModal from "../DeleteUserModal";
import BanUserModal from "../BanUserModal";
import BanReasonModal from "../BanReasonModal";

// 👤 User Card Component
interface UserCardProps {
  user: User;
  viewMode: "grid" | "list";
  onView: (user: User) => void;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  onToggleBan: (user: User) => void;
}

const UserCard: React.FC<UserCardProps> = ({
  user,
  viewMode,
  onView,
  onEdit,
  onDelete,
  onToggleBan,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const getRoleColor = (role: string) => {
    switch (role) {
      case "super_admin":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
      case "admin":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400";
      case "moderator":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
      case "user":
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  const getStatusColor = (banned: boolean) => {
    return banned
      ? "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
      : "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
  };

  if (viewMode === "list") {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {user.name}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">{user.email}</p>
              <div className="flex items-center space-x-2 mt-1">
                <span
                  className={cn(
                    "px-2 py-1 rounded-full text-xs font-medium",
                    getRoleColor(user.role)
                  )}
                >
                  {user.role}
                </span>
                <span
                  className={cn(
                    "px-2 py-1 rounded-full text-xs font-medium",
                    getStatusColor(user.banned)
                  )}
                >
                  {user.banned ? "Baneado" : "Activo"}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onView(user)}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="Ver detalles"
            >
              <Eye className="w-5 h-5" />
            </button>
            <button
              onClick={() => onEdit(user)}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="Editar"
            >
              <Edit className="w-5 h-5" />
            </button>
            <button
              onClick={() => onToggleBan(user)}
              className={cn(
                "p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors",
                user.banned
                  ? "text-green-600 dark:text-green-400 hover:text-green-700"
                  : "text-yellow-600 dark:text-yellow-400 hover:text-yellow-700"
              )}
              title={user.banned ? "Desbanear" : "Banear"}
            >
              {user.banned ? (
                <UserCheck className="w-5 h-5" />
              ) : (
                <Ban className="w-5 h-5" />
              )}
            </button>
            <button
              onClick={() => onDelete(user)}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="Eliminar"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Grid view
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow group">
      <div className="flex items-start justify-between mb-4">
        <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
          {user.name.charAt(0).toUpperCase()}
        </div>
        <div className="relative">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>
          {isMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-700 rounded-md shadow-lg border border-gray-200 dark:border-gray-600 z-10">
              <button
                onClick={() => {
                  onView(user);
                  setIsMenuOpen(false);
                }}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center space-x-2"
              >
                <Eye className="w-4 h-4" />
                <span>Ver detalles</span>
              </button>
              <button
                onClick={() => {
                  onEdit(user);
                  setIsMenuOpen(false);
                }}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center space-x-2"
              >
                <Edit className="w-4 h-4" />
                <span>Editar</span>
              </button>
              <button
                onClick={() => {
                  onToggleBan(user);
                  setIsMenuOpen(false);
                }}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center space-x-2"
              >
                {user.banned ? (
                  <UserCheck className="w-4 h-4" />
                ) : (
                  <Ban className="w-4 h-4" />
                )}
                <span>{user.banned ? "Desbanear" : "Banear"}</span>
              </button>
              <button
                onClick={() => {
                  onDelete(user);
                  setIsMenuOpen(false);
                }}
                className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center space-x-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>Eliminar</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            {user.name}
          </h3>
          <p className="text-gray-600 dark:text-gray-400">{user.email}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <span
            className={cn(
              "px-3 py-1 rounded-full text-sm font-medium",
              getRoleColor(user.role)
            )}
          >
            {user.role}
          </span>
          <span
            className={cn(
              "px-3 py-1 rounded-full text-sm font-medium",
              getStatusColor(user.banned)
            )}
          >
            {user.banned ? "Baneado" : "Activo"}
          </span>
        </div>

        <div className="text-sm text-gray-500 dark:text-gray-400">
          <p>Creado: {new Date(user.createdAt).toLocaleDateString()}</p>
          <p>Actualizado: {new Date(user.updatedAt).toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  );
};

// 🔍 Advanced Filters Component
interface UserFiltersState {
  role: string;
  status: string;
  dateRange: string;
}

const UserFilters: React.FC<{
  onFilterChange: (filters: UserFiltersState) => void;
}> = ({ onFilterChange }) => {
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<UserFiltersState>({
    role: "all",
    status: "all",
    dateRange: "all",
  });

  const applyFilters = (newFilters: UserFiltersState) => {
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowFilters(!showFilters)}
        className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
      >
        <Filter className="w-4 h-4" />
        <span>Filtros</span>
      </button>

      {showFilters && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-20 p-4">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
            Filtros Avanzados
          </h4>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Rol
              </label>
              <select
                value={filters.role}
                onChange={(e) =>
                  applyFilters({ ...filters, role: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">Todos los roles</option>
                <option value="super_admin">Super Admin</option>
                <option value="admin">Admin</option>
                <option value="moderator">Moderador</option>
                <option value="user">Usuario</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Estado
              </label>
              <select
                value={filters.status}
                onChange={(e) =>
                  applyFilters({ ...filters, status: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">Todos los estados</option>
                <option value="active">Activos</option>
                <option value="banned">Baneados</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Período de registro
              </label>
              <select
                value={filters.dateRange}
                onChange={(e) =>
                  applyFilters({ ...filters, dateRange: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">Todos los períodos</option>
                <option value="today">Hoy</option>
                <option value="week">Esta semana</option>
                <option value="month">Este mes</option>
                <option value="year">Este año</option>
              </select>
            </div>

            <div className="flex justify-end space-x-2 pt-4 border-t border-gray-200 dark:border-gray-600">
              <button
                onClick={() => {
                  const resetFilters = {
                    role: "all",
                    status: "all",
                    dateRange: "all",
                  };
                  applyFilters(resetFilters);
                }}
                className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              >
                Limpiar
              </button>
              <button
                onClick={() => setShowFilters(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
              >
                Aplicar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// 📊 Main All Users Tab Component
const AllUsersTab: React.FC = () => {
  const {
    viewMode,
    setViewMode,
    globalSearchTerm,
    setGlobalSearchTerm,
    openEditModal,
    openDeleteConfirm,
    openViewModal,
    closeViewModal,
    isViewModalOpen,
    viewingUser,
    openBanConfirm,
    isUserModalOpen,
    setIsUserModalOpen,
    editingUser,
    closeEditModal,
    deletingUser,
    closeDeleteConfirm,
    isDeleteConfirmOpen,
    banningUser,
    closeBanConfirm,
    isBanConfirmOpen,
    openBanReasonModal,
    closeBanReasonModal,
    isBanReasonModalOpen,
    users: { deleteUser, banUser, unbanUser },
  } = useUsersContext();

  const [currentFilters, setCurrentFilters] = useState<UserFiltersState>({
    role: "all",
    status: "all",
    dateRange: "all",
  });

  // 🚀 Infinite scroll hook with optimized filters
  const infiniteUsersQuery = useUsersInfinite(
    {
      searchValue: globalSearchTerm || undefined,
      searchField: "name", // Default to name search
      role: currentFilters.role !== "all" ? (currentFilters.role as User["role"]) : undefined,
      status: currentFilters.status !== "all" ? (currentFilters.status as "active" | "banned") : undefined,
    },
    {
      pageSize: 20,
      prefetchNextPage: true,
      prefetchOnHover: true,
      enableVirtualScroll: false, // Keep simple for now
      loadMoreThreshold: 300,
    }
  );

  const {
    users: usersList,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    loadMore,
    refresh,
    scrollRef,
    loadMoreTriggerRef,
    handleScroll,
    stats,
    error,
    hasError,
  } = infiniteUsersQuery;

  // 📊 Users are already filtered by the infinite query
  const filteredUsers = usersList || [];

  // 🎯 Real Action Handlers
  const handleToggleBan = (user: User) => {
    if (user.banned) {
      // If user is already banned, use simple confirmation modal to unban
      openBanConfirm(user);
    } else {
      // If user is not banned, use reason modal to capture ban reason
      openBanReasonModal(user);
    }
  };

  const handleCreateUser = () => {
    setIsUserModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (deletingUser) {
      await deleteUser(deletingUser.id);
      closeDeleteConfirm();
    }
  };

  const handleConfirmBan = async () => {
    if (banningUser) {
      // This handler is only for unbanning (since banned users use BanUserModal)
      await unbanUser(banningUser.id);
      closeBanConfirm();
    }
  };

  const handleConfirmBanWithReason = async (reason: string) => {
    if (banningUser && !banningUser.banned) {
      await banUser(banningUser.id, reason);
      closeBanReasonModal();
    }
  };

  // 🚨 Error state
  if (hasError && !usersList.length) {
    return (
      <TabTransition>
        <div className="p-6 space-y-6">
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Error al cargar usuarios
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {error || "Ocurrió un error inesperado"}
            </p>
            <button
              onClick={() => refresh()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Reintentar
            </button>
          </div>
        </div>
      </TabTransition>
    );
  }

  // 🔄 Initial loading state
  if (isLoading && !usersList.length) {
    return (
      <TabTransition>
        <div className="p-6 space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
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
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Todos los Usuarios
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Gestión completa de usuarios del sistema ({stats.loadedUsers} de {stats.totalUsers} usuarios cargados)
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => refresh()}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Actualizar</span>
            </button>

            <UserFilters onFilterChange={setCurrentFilters} />

            <button
              onClick={handleCreateUser}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo Usuario</span>
            </button>
          </div>
        </div>

        {/* Search and View Toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar usuarios..."
              value={globalSearchTerm}
              onChange={(e) => setGlobalSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Vista:
            </span>
            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={cn(
                  "p-2 rounded-md transition-colors",
                  viewMode === "grid"
                    ? "bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                )}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={cn(
                  "p-2 rounded-md transition-colors",
                  viewMode === "list"
                    ? "bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                )}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* 🚀 Infinite Scroll Container */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="max-h-[calc(100vh-300px)] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent"
        >
          {/* Users Grid/List */}
          {filteredUsers.length === 0 && !isLoading ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No se encontraron usuarios
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {globalSearchTerm || currentFilters.role !== "all" || currentFilters.status !== "all"
                  ? "Intenta ajustar los filtros de búsqueda"
                  : "Aún no hay usuarios registrados en el sistema"}
              </p>
            </div>
          ) : (
            <>
              <div
                className={cn(
                  "gap-6 pb-6",
                  viewMode === "grid"
                    ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                    : "space-y-4"
                )}
              >
                {filteredUsers.map((user) => (
                  <UserCard
                    key={user.id}
                    user={user}
                    viewMode={viewMode}
                    onView={openViewModal}
                    onEdit={openEditModal}
                    onDelete={openDeleteConfirm}
                    onToggleBan={handleToggleBan}
                  />
                ))}
              </div>

              {/* 🔄 Load More Trigger & Loading States */}
              {hasNextPage && (
                <div
                  ref={loadMoreTriggerRef}
                  className="flex justify-center py-8"
                >
                  {isFetchingNextPage ? (
                    <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      <span>Cargando más usuarios...</span>
                    </div>
                  ) : (
                    <button
                      onClick={loadMore}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                    >
                      <Download className="w-4 h-4" />
                      <span>Cargar más usuarios</span>
                    </button>
                  )}
                </div>
              )}

              {/* 🎯 End of List Indicator */}
              {!hasNextPage && filteredUsers.length > 0 && (
                <div className="text-center py-6 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    ✅ Todos los usuarios han sido cargados ({stats.totalUsers} total)
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* 📊 Stats Footer */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Mostrando {stats.loadedUsers} de {stats.totalUsers} usuarios
              </p>
              {stats.loadingProgress > 0 && (
                <div className="flex items-center space-x-2">
                  <div className="w-20 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-600 transition-all duration-300"
                      style={{ width: `${Math.min(stats.loadingProgress, 100)}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {Math.round(stats.loadingProgress)}%
                  </span>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <button className="flex items-center space-x-2 px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors">
                <Download className="w-4 h-4" />
                <span>Exportar</span>
              </button>
              <button className="flex items-center space-x-2 px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors">
                <Upload className="w-4 h-4" />
                <span>Importar</span>
              </button>
            </div>
          </div>
        </div>

        {/* 🎭 User Management Modal */}
        <UserModal
          isOpen={isUserModalOpen}
          onClose={closeEditModal}
          user={editingUser}
          mode={editingUser ? "edit" : "create"}
          title={editingUser ? "Editar Usuario" : "Crear Nuevo Usuario"}
        />

        {/* 🗑️ Delete Confirmation Modal */}
        <DeleteUserModal
          isOpen={isDeleteConfirmOpen}
          onClose={closeDeleteConfirm}
          user={deletingUser}
          onConfirm={handleConfirmDelete}
        />

        {/* 🚫 Ban/Unban Confirmation Modal (Only for unbanning) */}
        <BanUserModal
          isOpen={isBanConfirmOpen}
          onClose={closeBanConfirm}
          user={banningUser}
          onConfirm={handleConfirmBan}
        />

        {/* 🚫 Ban Reason Modal (For banning with reason) */}
        <BanReasonModal
          isOpen={isBanReasonModalOpen}
          onClose={closeBanReasonModal}
          user={banningUser}
          onConfirm={handleConfirmBanWithReason}
        />

        {/* 👁️ User View Modal (For detailed user information) */}
        <UserViewModal
          isOpen={isViewModalOpen}
          onClose={closeViewModal}
          user={viewingUser}
          onEdit={openEditModal}
          onDelete={openDeleteConfirm}
          onBan={handleToggleBan}
        />
      </div>
    </TabTransition>
  );
};

export default AllUsersTab;
