/**
 * 👥 PANEL DE GESTIÓN DE USUARIOS Y PERMISOS
 *
 * Este componente te permite:
 * - Ver todos los usuarios
 * - Cambiar roles de usuarios
 * - Crear nuevos usuarios con roles específicos
 * - Gestionar permisos por usuario
 * - Banear/desbanear usuarios
 * - Ver estadísticas de usuarios por rol
 */

"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  UserPlus,
  Settings,
  Crown,
  Shield,
  Edit3,
  Trash2,
  Ban,
  UserCheck,
  Search,
  Filter,
  Eye,
  MoreVertical,
  Key,
  Calendar,
  Mail,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { usePermissions, useUserManagement } from "@/hooks/usePermissions";
import {
  ROLE_INFO,
  ROLE_HIERARCHY,
  type RoleName,
} from "@/lib/auth/permissions";

interface User {
  id: string;
  name: string;
  email: string;
  role?: string | null;
  banned?: boolean | null;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
  banReason?: string | null;
  banExpires?: string | null;
}

interface UserStats {
  total: number;
  byRole: Record<string, number>;
  banned: number;
  verified: number;
  recent: number; // usuarios creados en los últimos 7 días
}

export const UserPermissionsPanel: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<UserStats>({
    total: 0,
    byRole: {},
    banned: 0,
    verified: 0,
    recent: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("all");
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserDetails, setShowUserDetails] = useState(false);

  const {
    canCreateUsers,
    canEditUsers,
    canDeleteUsers,
    canSetUserRoles,
    canBanUsers,
    canViewSessions,
  } = useUserManagement();

  const {
    getManageableRoles,
    canManageUserRole,
    currentRole,
    isSuperAdmin,
    isAdmin,
  } = usePermissions();

  // Cargar usuarios y calcular estadísticas
  const loadUsers = async () => {
    try {
      setLoading(true);
      const result = await authClient.admin.listUsers({
        query: {
          limit: 100,
          ...(searchTerm && {
            searchValue: searchTerm,
            searchField: "email",
            searchOperator: "contains",
          }),
        },
      });

      if (result.data?.users) {
        const userList = result.data.users.map((user) => ({
          ...user,
          createdAt:
            user.createdAt instanceof Date
              ? user.createdAt.toISOString()
              : user.createdAt,
          updatedAt:
            user.updatedAt instanceof Date
              ? user.updatedAt.toISOString()
              : user.updatedAt,
          banExpires:
            user.banExpires instanceof Date
              ? user.banExpires.toISOString()
              : user.banExpires,
        }));
        setUsers(userList);

        // Calcular estadísticas
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const newStats: UserStats = {
          total: userList.length,
          byRole: {},
          banned: userList.filter((u) => u.banned).length,
          verified: userList.filter((u) => u.emailVerified).length,
          recent: userList.filter((u) => new Date(u.createdAt) > sevenDaysAgo)
            .length,
        };

        // Contar por roles
        userList.forEach((user) => {
          const role = user.role || "user";
          newStats.byRole[role] = (newStats.byRole[role] || 0) + 1;
        });

        setStats(newStats);
      }
    } catch (error) {
      console.error("Error loading users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [searchTerm]);

  // Cambiar rol de usuario
  const changeUserRole = async (userId: string, newRole: string) => {
    try {
      await authClient.admin.setRole({
        userId,
        role: newRole as RoleName,
      });

      await loadUsers();

      console.log(`✅ Rol cambiado a ${newRole}`);
    } catch (error) {
      console.error("Error changing role:", error);
      alert("Error al cambiar el rol. Verifica los permisos.");
    }
  };

  // Banear/desbanear usuario
  const toggleUserBan = async (
    userId: string,
    isBanned: boolean,
    banReason?: string
  ) => {
    try {
      if (isBanned) {
        await authClient.admin.unbanUser({ userId });
      } else {
        await authClient.admin.banUser({
          userId,
          banReason: banReason || "Suspendido por administrador",
          banExpiresIn: 7 * 24 * 60 * 60, // 7 días
        });
      }

      await loadUsers();
      console.log(`✅ Usuario ${isBanned ? "desbaneado" : "baneado"}`);
    } catch (error) {
      console.error("Error toggling ban:", error);
      alert("Error al cambiar el estado de ban.");
    }
  };

  // Crear nuevo usuario
  const createUser = async (userData: {
    email: string;
    password: string;
    name: string;
    role: string;
  }) => {
    try {
      await authClient.admin.createUser({
        email: userData.email,
        password: userData.password,
        name: userData.name,
        role: userData.role as RoleName,
      });

      await loadUsers();
      setShowCreateUser(false);
      console.log("✅ Usuario creado exitosamente");
    } catch (error: unknown) {
      console.error("Error creating user:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Error desconocido";
      alert(`Error al crear usuario: ${errorMessage}`);
    }
  };

  // Eliminar usuario
  const deleteUser = async (userId: string) => {
    if (
      !confirm(
        "¿Estás seguro de que quieres eliminar este usuario? Esta acción no se puede deshacer."
      )
    ) {
      return;
    }

    try {
      await authClient.admin.removeUser({ userId });
      await loadUsers();
      console.log("✅ Usuario eliminado");
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Error al eliminar usuario.");
    }
  };

  // Filtrar usuarios
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = selectedRole === "all" || user.role === selectedRole;

    return matchesSearch && matchesRole;
  });

  // Obtener roles que puedo asignar
  const assignableRoles = getManageableRoles();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-slate-600">Cargando usuarios...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-slate-200">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-slate-600">
                Total Usuarios
              </p>
              <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-slate-600">Verificados</p>
              <p className="text-2xl font-bold text-slate-900">
                {stats.verified}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200">
          <div className="flex items-center">
            <Ban className="h-8 w-8 text-red-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-slate-600">Suspendidos</p>
              <p className="text-2xl font-bold text-slate-900">
                {stats.banned}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200">
          <div className="flex items-center">
            <Calendar className="h-8 w-8 text-purple-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-slate-600">Nuevos (7d)</p>
              <p className="text-2xl font-bold text-slate-900">
                {stats.recent}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Panel principal */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200">
        {/* Header */}
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
                <Users className="w-5 h-5" />
                Gestión de Usuarios y Permisos
              </h2>
              <p className="text-slate-600 mt-1">
                Tu rol:{" "}
                <span className="font-medium">
                  {ROLE_INFO[currentRole || "user"]?.name}
                </span>
                {" • "}
                Puedes gestionar {assignableRoles.length} tipos de roles
              </p>
            </div>

            {canCreateUsers() && (
              <button
                onClick={() => setShowCreateUser(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <UserPlus className="w-4 h-4" />
                Crear Usuario
              </button>
            )}
          </div>

          {/* Filtros */}
          <div className="flex gap-4 mt-4">
            {/* Búsqueda */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar por email o nombre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Filtro por rol */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="pl-10 pr-8 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Todos los roles ({stats.total})</option>
                {Object.entries(ROLE_INFO).map(([role, info]) => (
                  <option key={role} value={role}>
                    {info.icon} {info.name} ({stats.byRole[role] || 0})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Lista de usuarios */}
        <div className="p-6">
          <div className="space-y-4">
            {filteredUsers.map((user) => {
              const userRole = (user.role as RoleName) || "user";
              const roleInfo = ROLE_INFO[userRole];
              const canManageThisUser = canManageUserRole(userRole);

              return (
                <div
                  key={user.id}
                  className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    {/* Info del usuario */}
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center">
                        <span className="text-slate-600 font-medium text-lg">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>

                      <div>
                        <h3 className="font-medium text-slate-800">
                          {user.name}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Mail className="w-3 h-3" />
                          {user.email}
                        </div>

                        <div className="flex items-center gap-2 mt-1">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-${roleInfo.color}-100 text-${roleInfo.color}-700`}
                          >
                            <span>{roleInfo.icon}</span>
                            {roleInfo.name}
                          </span>

                          {user.banned && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-700">
                              <Ban className="w-3 h-3" />
                              Suspendido
                            </span>
                          )}

                          {user.emailVerified ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-700">
                              <CheckCircle className="w-3 h-3" />
                              Verificado
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-700">
                              <AlertTriangle className="w-3 h-3" />
                              Sin verificar
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Acciones */}
                    <div className="flex items-center gap-2">
                      {/* Ver detalles */}
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setShowUserDetails(true);
                        }}
                        className="p-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Ver detalles"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {/* Cambiar rol */}
                      {canSetUserRoles() && canManageThisUser && (
                        <select
                          value={userRole}
                          onChange={(e) =>
                            changeUserRole(user.id, e.target.value)
                          }
                          className="px-3 py-1 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value={userRole}>{roleInfo.name}</option>
                          {assignableRoles.map((role) => (
                            <option key={role} value={role}>
                              {ROLE_INFO[role].icon} {ROLE_INFO[role].name}
                            </option>
                          ))}
                        </select>
                      )}

                      {/* Banear/Desbanear */}
                      {canBanUsers() && canManageThisUser && (
                        <button
                          onClick={() => toggleUserBan(user.id, !!user.banned)}
                          className={`p-2 rounded-lg transition-colors ${
                            user.banned
                              ? "bg-green-100 text-green-700 hover:bg-green-200"
                              : "bg-red-100 text-red-700 hover:bg-red-200"
                          }`}
                          title={
                            user.banned ? "Desbanear usuario" : "Banear usuario"
                          }
                        >
                          {user.banned ? (
                            <UserCheck className="w-4 h-4" />
                          ) : (
                            <Ban className="w-4 h-4" />
                          )}
                        </button>
                      )}

                      {/* Eliminar */}
                      {canDeleteUsers() && canManageThisUser && (
                        <button
                          onClick={() => deleteUser(user.id)}
                          className="p-2 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-lg transition-colors"
                          title="Eliminar usuario"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-slate-400" />
              <h3 className="mt-2 text-sm font-medium text-slate-900">
                No hay usuarios
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                {searchTerm
                  ? "No se encontraron usuarios con ese criterio"
                  : "Comienza creando un usuario"}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal crear usuario */}
      {showCreateUser && (
        <CreateUserModal
          onClose={() => setShowCreateUser(false)}
          onCreate={createUser}
          availableRoles={assignableRoles}
        />
      )}

      {/* Modal detalles de usuario */}
      {showUserDetails && selectedUser && (
        <UserDetailsModal
          user={selectedUser}
          onClose={() => {
            setShowUserDetails(false);
            setSelectedUser(null);
          }}
          onUserUpdated={loadUsers}
        />
      )}
    </div>
  );
};

// Modal para crear usuario
const CreateUserModal: React.FC<{
  onClose: () => void;
  onCreate: (userData: {
    email: string;
    password: string;
    name: string;
    role: string;
  }) => void;
  availableRoles: RoleName[];
}> = ({ onClose, onCreate, availableRoles }) => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    role: "user",
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.password || !formData.name) {
      alert("Por favor completa todos los campos");
      return;
    }

    setLoading(true);
    try {
      await onCreate(formData);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">
          Crear Nuevo Usuario
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Nombre
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Nombre completo"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Email
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, email: e.target.value }))
              }
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="usuario@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Contraseña
            </label>
            <input
              type="password"
              required
              minLength={8}
              value={formData.password}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, password: e.target.value }))
              }
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Mínimo 8 caracteres"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Rol
            </label>
            <select
              value={formData.role}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, role: e.target.value }))
              }
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {availableRoles.map((role) => (
                <option key={role} value={role}>
                  {ROLE_INFO[role].icon} {ROLE_INFO[role].name} -{" "}
                  {ROLE_INFO[role].description}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? "Creando..." : "Crear Usuario"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Modal de detalles de usuario
const UserDetailsModal: React.FC<{
  user: User;
  onClose: () => void;
  onUserUpdated: () => void;
}> = ({ user, onClose, onUserUpdated }) => {
  const userRole = (user.role as RoleName) || "user";
  const roleInfo = ROLE_INFO[userRole];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-800">
            Detalles del Usuario
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center">
              <span className="text-slate-600 font-medium text-xl">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h4 className="font-medium text-slate-800">{user.name}</h4>
              <p className="text-slate-600">{user.email}</p>
              <span
                className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-${roleInfo.color}-100 text-${roleInfo.color}-700`}
              >
                {roleInfo.icon} {roleInfo.name}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-slate-700">ID:</span>
              <p className="text-slate-600 break-all">{user.id}</p>
            </div>
            <div>
              <span className="font-medium text-slate-700">Estado:</span>
              <p className={user.banned ? "text-red-600" : "text-green-600"}>
                {user.banned ? "Suspendido" : "Activo"}
              </p>
            </div>
            <div>
              <span className="font-medium text-slate-700">
                Email verificado:
              </span>
              <p
                className={
                  user.emailVerified ? "text-green-600" : "text-yellow-600"
                }
              >
                {user.emailVerified ? "Sí" : "No"}
              </p>
            </div>
            <div>
              <span className="font-medium text-slate-700">Creado:</span>
              <p className="text-slate-600">
                {new Date(user.createdAt).toLocaleDateString("es-ES")}
              </p>
            </div>
          </div>

          {user.banned && user.banReason && (
            <div className="p-3 bg-red-50 border border-red-200 rounded">
              <span className="font-medium text-red-700">
                Razón de suspensión:
              </span>
              <p className="text-red-600 text-sm">{user.banReason}</p>
            </div>
          )}
        </div>

        <div className="flex justify-end pt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserPermissionsPanel;
