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
import { Plus, Grid, List, Download, Upload, Users } from "lucide-react";
import { cn } from "@/shared/utils";
import { useUsersContext } from "../../../context";
import type { User } from "../../../types";
import UserModal from "../UserModal.main";
import UserViewModal from "../UserViewModal";
import DeleteUserModal from "../DeleteUserModal";
import BanUserModal from "../BanUserModal";
import BanReasonModal from "../BanReasonModal";
import {
  TabHeader,
  TabWrapper,
  TabSearchBar,
  TabEmptyState,
  TabFooterStats,
} from "@/shared/ui/components/tabs";
import { UserCard, UserFilters, UserFiltersState } from "../users";

/**
 * 📊 ALL USERS TAB - MAIN COMPONENT
 * ==================================
 */
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
    users: {
      users,
      isLoading,
      deleteUser,
      banUser,
      unbanUser,
      searchUsers,
      filterUsersByRole,
      filterUsersByStatus,
    },
  } = useUsersContext();

  const [currentFilters, setCurrentFilters] = useState<UserFiltersState>({
    role: "all",
    status: "all",
    dateRange: "all",
  });

  // 🔍 Smart filtering with optimized data (same pattern as inventory)
  const getFilteredUsers = () => {
    let filtered = users;

    // 🔍 Search
    if (globalSearchTerm) {
      filtered = searchUsers(globalSearchTerm);
    }

    // 🎭 Role filter
    if (currentFilters.role !== "all") {
      filtered = filterUsersByRole(currentFilters.role as User["role"]);
    }

    // 🚥 Status filter
    if (currentFilters.status !== "all") {
      filtered = filterUsersByStatus(
        currentFilters.status as "active" | "banned"
      );
    }

    return filtered;
  };

  const filteredUsers = getFilteredUsers();

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

  // 🚨 Error state handling can be added here if needed

  return (
    <TabWrapper>
      {/* Header */}
      <TabHeader
        icon={<Users className="w-8 h-8 text-blue-600 dark:text-blue-400" />}
        title="Todos los Usuarios"
        description={`Gestión completa de usuarios del sistema (${filteredUsers.length} usuarios)`}
        customActions={<UserFilters onFilterChange={setCurrentFilters} />}
        actions={[
          {
            label: "Nuevo Usuario",
            icon: <Plus className="w-4 h-4" />,
            onClick: handleCreateUser,
            variant: "primary",
            color: "blue",
          },
        ]}
      />

      {/* Search and View Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <TabSearchBar
          value={globalSearchTerm}
          onChange={setGlobalSearchTerm}
          placeholder="Buscar usuarios..."
        />

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

      {/* 👥 Users Display (same pattern as inventory) */}
      {isLoading ? (
        <div
          className={cn(
            "transition-all duration-300",
            viewMode === "grid"
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              : "space-y-4"
          )}
        >
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className={cn(
                "bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse",
                viewMode === "grid" ? "h-80" : "h-24"
              )}
              style={{
                animationDelay: `${i * 0.1}s`,
              }}
            />
          ))}
        </div>
      ) : filteredUsers.length === 0 ? (
        <TabEmptyState
          icon={<Users className="w-20 h-20" />}
          title="No se encontraron usuarios"
          description={
            globalSearchTerm ||
            currentFilters.role !== "all" ||
            currentFilters.status !== "all"
              ? "Intenta ajustar los filtros de búsqueda para ver más usuarios"
              : "Aún no hay usuarios registrados en el sistema"
          }
          action={{
            label: "Agregar Primer Usuario",
            onClick: handleCreateUser,
            icon: <Plus className="w-5 h-5" />,
          }}
        />
      ) : (
        <div
          className={cn(
            "transition-all duration-300",
            viewMode === "grid"
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              : "space-y-4"
          )}
        >
          {filteredUsers.map((user, index) => (
            <div
              key={user.id}
              className="transition-all duration-200"
              style={{
                animationDelay: `${index * 0.05}s`,
              }}
            >
              <UserCard
                user={user}
                viewMode={viewMode}
                onView={openViewModal}
                onEdit={openEditModal}
                onDelete={openDeleteConfirm}
                onToggleBan={handleToggleBan}
              />
            </div>
          ))}
        </div>
      )}

      {/* 📊 Simple Stats Footer (same pattern as inventory) */}
      {filteredUsers.length > 0 && (
        <TabFooterStats
          count={`Mostrando ${filteredUsers.length} usuarios${
            globalSearchTerm ||
            currentFilters.role !== "all" ||
            currentFilters.status !== "all"
              ? ""
              : ` de ${users.length} total`
          }`}
          isFiltered={
            globalSearchTerm !== "" ||
            currentFilters.role !== "all" ||
            currentFilters.status !== "all"
          }
          actions={[
            {
              label: "Exportar",
              icon: <Download className="w-4 h-4" />,
              onClick: () => {},
            },
            {
              label: "Importar",
              icon: <Upload className="w-4 h-4" />,
              onClick: () => {},
            },
          ]}
        />
      )}

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
    </TabWrapper>
  );
};

export default AllUsersTab;
