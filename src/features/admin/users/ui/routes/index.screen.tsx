"use client";

import React, {
  useActionState,
  useOptimistic,
  useTransition,
  useEffect,
} from "react";
import {
  Plus,
  Search,
  Users,
  UserCheck,
  UserX,
  Shield,
  RefreshCw,
} from "lucide-react";
import {
  User,
  CreateUserForm,
  UserOptimisticState,
  UserStats,
} from "../../types";
import {
  getAllUsersAction,
  createUserAction,
  updateUserAction,
  updateUserRoleAction,
  deleteUserAction,
  banUserAction,
  unbanUserAction,
} from "../../server/actions";
import UserCard from "@/features/admin/users/ui/components/UserCard";
import UserModal from "@/features/admin/users/ui/components/UserModal";

// Use the type from our module
type OptimisticUsersState = UserOptimisticState;

const UsersView: React.FC = () => {
  // 🎛️ Filter & UI State
  const [searchTerm, setSearchTerm] = React.useState("");
  const [filterRole, setFilterRole] = React.useState<string>("all");
  const [filterStatus, setFilterStatus] = React.useState<string>("all");
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingUser, setEditingUser] = React.useState<User | null>(null);
  const [currentPage, setCurrentPage] = React.useState(1);

  const usersPerPage = 12;

  // 🚀 REACT 19: useActionState for loading users
  const [usersState, usersAction, isUsersLoading] = useActionState(async () => {
    const result = await getAllUsersAction(
      usersPerPage,
      (currentPage - 1) * usersPerPage,
      searchTerm || undefined,
      "email"
    );
    return result;
  }, null);

  // ⚡ REACT 19: useTransition for non-blocking operations
  const [isRefreshing, startRefresh] = useTransition();

  // 🎯 REACT 19: useOptimistic for instant UI feedback
  const [optimisticState, setOptimisticState] = useOptimistic(
    {
      users: usersState?.success
        ? (usersState.data as { users: User[]; pagination: { total: number } })
            .users || []
        : [],
      totalUsers: usersState?.success
        ? (usersState.data as { users: User[]; pagination: { total: number } })
            .pagination?.total || 0
        : 0,
      isRefreshing: false,
    } as OptimisticUsersState,
    (
      state: OptimisticUsersState,
      optimisticValue: Partial<OptimisticUsersState>
    ) => ({
      ...state,
      ...optimisticValue,
    })
  );

  // 🚀 Auto-load users on component mount (only once)
  useEffect(() => {
    if (!usersState) {
      startRefresh(() => {
        usersAction();
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array - runs only once on mount to prevent infinite loops

  // 🔄 Sync optimistic state with server state when data arrives
  useEffect(() => {
    if (usersState?.success && usersState.data) {
      const serverData = usersState.data as {
        users: User[];
        pagination: { total: number; hasMore: boolean };
      };

      // 🚀 REACT 19: Wrap optimistic state updates in startTransition
      startRefresh(() => {
        setOptimisticState({
          users: serverData.users || [],
          totalUsers: serverData.pagination?.total || 0,
          isRefreshing: false,
        });
      });
    }
  }, [usersState, setOptimisticState, startRefresh]);

  // 📊 Computed values from optimistic state
  const users = optimisticState.users;
  const totalUsers = optimisticState.totalUsers;
  const loading = isUsersLoading && users.length === 0; // Only show spinner on initial load

  // Filter users based on current filters (local filtering for role and status only)
  const filteredUsers = users.filter((user) => {
    const matchesRole = filterRole === "all" || user.role === filterRole;
    const matchesStatus =
      filterStatus === "all" || user.status === filterStatus;
    return matchesRole && matchesStatus;
  });

  // Calculate stats from optimistic state
  const stats: UserStats = {
    total: totalUsers,
    active: users.filter((u) => u.status === "active").length,
    banned: users.filter((u) => u.status === "banned").length,
    admins: users.filter((u) => u.role === "admin" || u.role === "super_admin")
      .length,
  };

  // 🔄 Refresh handler with optimistic UI
  const handleRefresh = () => {
    startRefresh(() => {
      setOptimisticState({ ...optimisticState, isRefreshing: true });
      usersAction();
    });
  };

  // 🚀 REACT 19: Create user with Server Action + Optimistic UI
  const handleCreateUser = async (userData: CreateUserForm) => {
    try {
      // Prepare FormData for Server Action OUTSIDE of transition
      const formData = new FormData();
      formData.append("email", userData.email);
      formData.append("name", userData.name);
      formData.append("password", userData.password || "");
      formData.append("role", userData.role);

      // Execute Server Action first
      const result = await createUserAction(formData);

      if (result.success) {
        // Close modal on success
        setIsModalOpen(false);

        // Refresh server data to get the real user with proper ID
        startRefresh(() => {
          usersAction();
        });
      } else {
        // Show error message
        console.error("Error creating user:", result.error);
        throw new Error(result.error || "Error creating user");
      }
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  };

  // 🚀 REACT 19: Edit user with Server Action + Optimistic UI
  const handleEditUser = async (userData: CreateUserForm) => {
    if (!editingUser) return;

    try {
      // Prepare FormData for Server Action OUTSIDE of transition
      const formData = new FormData();
      formData.append("id", editingUser.id);
      formData.append("email", userData.email);
      formData.append("name", userData.name);
      formData.append("role", userData.role);

      // Execute Server Action first
      const result = await updateUserAction(formData);

      if (result.success) {
        // Close modal on success
        setEditingUser(null);
        setIsModalOpen(false);

        // Refresh server data to get updated user data
        startRefresh(() => {
          usersAction();
        });
      } else {
        // Show error message
        console.error("Error editing user:", result.error);
        throw new Error(result.error || "Error editing user");
      }
    } catch (error) {
      console.error("Error editing user:", error);
      throw error;
    }
  };

  // 🚀 REACT 19: Delete user with Server Action + Optimistic UI
  const handleDeleteUser = async (userId: string) => {
    if (
      !confirm(
        "¿Estás seguro de que quieres eliminar este usuario? Esta acción no se puede deshacer."
      )
    ) {
      return;
    }

    try {
      // Prepare FormData for Server Action OUTSIDE of transition
      const formData = new FormData();
      formData.append("id", userId);

      // Execute Server Action first
      const result = await deleteUserAction(formData);

      if (result.success) {
        // Refresh server data to reflect deletion
        startRefresh(() => {
          usersAction();
        });
      } else {
        // Show error message
        console.error("Error deleting user:", result.error);
        throw new Error(result.error || "Error deleting user");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  // 🚀 REACT 19: Toggle ban status with Server Action + Optimistic UI
  const handleToggleBan = async (userId: string) => {
    const user = users.find((u) => u.id === userId);
    if (!user) return;

    try {
      const isBanned = user.status === "banned";
      let banReason = "";

      if (!isBanned) {
        banReason = prompt("Razón del baneo:") || "";
        if (!banReason) return;
      }

      // Prepare FormData for Server Action OUTSIDE of transition
      const formData = new FormData();
      formData.append("id", userId);
      if (!isBanned && banReason) {
        formData.append("reason", banReason);
      }

      // Execute appropriate Server Action first
      const result = isBanned
        ? await unbanUserAction(formData)
        : await banUserAction(formData);

      if (result.success) {
        // Refresh server data to reflect ban status change
        startRefresh(() => {
          usersAction();
        });
      } else {
        // Show error message
        console.error("Error toggling ban:", result.error);
        throw new Error(result.error || "Error toggling ban status");
      }
    } catch (error) {
      console.error("Error toggling ban:", error);
    }
  };

  // 🚀 REACT 19: Change user role with Server Action + Optimistic UI
  const handleChangeRole = async (userId: string, role: User["role"]) => {
    try {
      // Prepare FormData for Server Action OUTSIDE of transition
      const formData = new FormData();
      formData.append("userId", userId); // updateUserRoleAction expects "userId" not "id"
      formData.append("role", role);

      // Execute Server Action first - using updateUserRoleAction for proper super_admin support
      const result = await updateUserRoleAction(formData);

      if (result.success) {
        // Refresh server data to reflect role change
        startRefresh(() => {
          usersAction();
        });
      } else {
        // Show error message
        console.error("Error changing role:", result.error);
        throw new Error(result.error || "Error changing user role");
      }
    } catch (error) {
      console.error("Error changing role:", error);
    }
  };

  const totalPages = Math.ceil(totalUsers / usersPerPage);

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
          {/* 🚀 REACT 19: Refresh button with optimistic UI */}
          <button
            onClick={handleRefresh}
            disabled={isRefreshing || optimisticState.isRefreshing}
            className={`flex items-center gap-2 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              isRefreshing || optimisticState.isRefreshing
                ? "animate-pulse"
                : ""
            }`}
          >
            <RefreshCw
              size={16}
              className={
                isRefreshing || optimisticState.isRefreshing
                  ? "animate-spin"
                  : ""
              }
            />
            {isRefreshing || optimisticState.isRefreshing
              ? "Actualizando..."
              : "Actualizar"}
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

      {/* Stats Cards */}
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
            </div>
          </div>
        </div>
      </div>

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

          {/* Role Filter */}
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

          {/* Status Filter */}
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
      {loading ? (
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-slate-700">
            Mostrando {(currentPage - 1) * usersPerPage + 1} a{" "}
            {Math.min(currentPage * usersPerPage, totalUsers)} de {totalUsers}{" "}
            usuarios
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-2 text-sm font-medium text-slate-500 bg-white border border-slate-300 rounded-md hover:bg-slate-50 disabled:opacity-50"
            >
              Anterior
            </button>
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-2 text-sm font-medium text-slate-500 bg-white border border-slate-300 rounded-md hover:bg-slate-50 disabled:opacity-50"
            >
              Siguiente
            </button>
          </div>
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

export default UsersView;
