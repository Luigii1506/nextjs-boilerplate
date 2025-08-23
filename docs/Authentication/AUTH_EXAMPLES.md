# 🎯 EJEMPLOS PRÁCTICOS - TANSTACK AUTH SYSTEM

**Casos de uso reales con código completo**  
**Permisos reactivos, performance empresarial, UX superior**

---

## 🎭 **EJEMPLO 1: NAVBAR REACTIVA**

### **Navbar que se actualiza automáticamente según permisos**

```typescript
"use client";

import { useAuth, useLogout } from "@/shared/hooks/useAuth";
import Link from "next/link";

export default function ReactiveNavbar() {
  const { user, isAuthenticated, isAdmin, isSuperAdmin, isLoading } = useAuth();
  const { logout, isLoggingOut } = useLogout();

  if (isLoading) {
    return <NavbarSkeleton />;
  }

  return (
    <nav className="bg-white shadow-md px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="text-xl font-bold text-blue-600">
          Mi App
        </Link>

        {/* Navigation Links - Se actualizan automáticamente */}
        <div className="flex items-center space-x-4">
          <Link href="/" className="text-gray-700 hover:text-blue-600">
            Inicio
          </Link>

          {isAuthenticated && (
            <>
              <Link
                href="/profile"
                className="text-gray-700 hover:text-blue-600"
              >
                Mi Perfil
              </Link>

              {/* ✅ REACTIVO: Aparece/desaparece automáticamente */}
              {isAdmin && (
                <Link
                  href="/dashboard"
                  className="text-gray-700 hover:text-blue-600"
                >
                  📊 Admin Panel
                </Link>
              )}

              {/* ✅ REACTIVO: Solo para super admins */}
              {isSuperAdmin && (
                <Link
                  href="/super-admin"
                  className="text-red-600 hover:text-red-800 font-semibold"
                >
                  🔧 Super Admin
                </Link>
              )}
            </>
          )}

          {/* Auth Actions */}
          <div className="flex items-center space-x-2">
            {isAuthenticated ? (
              <>
                <span className="text-sm text-gray-600">
                  Hola, {user?.name} ({user?.role})
                </span>
                <button
                  onClick={logout}
                  disabled={isLoggingOut}
                  className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 disabled:opacity-50"
                >
                  {isLoggingOut ? "Cerrando..." : "Logout"}
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

// Skeleton loading component
function NavbarSkeleton() {
  return (
    <nav className="bg-white shadow-md px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="w-20 h-6 bg-gray-200 animate-pulse rounded"></div>
        <div className="flex space-x-4">
          <div className="w-16 h-4 bg-gray-200 animate-pulse rounded"></div>
          <div className="w-16 h-4 bg-gray-200 animate-pulse rounded"></div>
          <div className="w-20 h-4 bg-gray-200 animate-pulse rounded"></div>
        </div>
      </div>
    </nav>
  );
}
```

---

## 🛡️ **EJEMPLO 2: PROTECCIÓN DE RUTAS REACTIVA**

### **Página que se protege automáticamente**

```typescript
"use client";

import { useAdminPage } from "@/shared/hooks/useAuth";
import { Suspense } from "react";

export default function AdminDashboard() {
  // ✅ useAdminPage maneja todo automáticamente:
  // - Redirect a /login si no está autenticado
  // - Redirect a /unauthorized si no es admin
  // - Re-evalúa permisos automáticamente (background refresh)
  const { user, isLoading, isSuperAdmin } = useAdminPage();

  if (isLoading) {
    return <AdminDashboardSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header Dinámico */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800">
            Panel de Administración
          </h1>
          <p className="text-gray-600 mt-2">
            Bienvenido, <span className="font-semibold">{user?.name}</span>
            <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
              {user?.role}
            </span>
          </p>
        </div>

        {/* Grid de Funciones */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Funciones básicas de admin */}
          <AdminCard
            title="Gestión de Usuarios"
            description="Crear, editar y gestionar usuarios"
            href="/dashboard/users"
            icon="👥"
          />

          <AdminCard
            title="Feature Flags"
            description="Configurar flags del sistema"
            href="/dashboard/feature-flags"
            icon="🚩"
          />

          <AdminCard
            title="Auditoría"
            description="Ver logs de actividad del sistema"
            href="/dashboard/audit"
            icon="📊"
          />

          {/* ✅ REACTIVO: Solo aparece si es super admin */}
          {isSuperAdmin && (
            <>
              <AdminCard
                title="Configuración Avanzada"
                description="Configuración crítica del sistema"
                href="/dashboard/super-admin/config"
                icon="⚙️"
                danger={true}
              />

              <AdminCard
                title="Gestión de Base de Datos"
                description="Operaciones críticas de BD"
                href="/dashboard/super-admin/database"
                icon="💾"
                danger={true}
              />

              <AdminCard
                title="Sistema"
                description="Logs del servidor y métricas"
                href="/dashboard/super-admin/system"
                icon="🔧"
                danger={true}
              />
            </>
          )}
        </div>

        {/* Información de Debug */}
        <Suspense fallback={<div>Cargando debug info...</div>}>
          <DebugInfo user={user} />
        </Suspense>
      </div>
    </div>
  );
}

// Componente reutilizable para tarjetas de admin
interface AdminCardProps {
  title: string;
  description: string;
  href: string;
  icon: string;
  danger?: boolean;
}

function AdminCard({
  title,
  description,
  href,
  icon,
  danger = false,
}: AdminCardProps) {
  return (
    <Link
      href={href}
      className={`block bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow ${
        danger ? "border-l-4 border-red-500" : "border-l-4 border-blue-500"
      }`}
    >
      <div className="flex items-center mb-4">
        <span className="text-3xl mr-3">{icon}</span>
        <h3
          className={`text-xl font-semibold ${
            danger ? "text-red-800" : "text-gray-800"
          }`}
        >
          {title}
        </h3>
      </div>
      <p className="text-gray-600">{description}</p>
      {danger && (
        <div className="mt-3 text-red-600 text-sm font-semibold">
          ⚠️ Requiere Super Admin
        </div>
      )}
    </Link>
  );
}

// Debug component
function DebugInfo({ user }: { user: any }) {
  return (
    <div className="mt-8 bg-gray-800 text-white p-4 rounded-lg">
      <h3 className="text-lg font-semibold mb-2">🔍 Debug Info</h3>
      <pre className="text-sm overflow-x-auto">
        {JSON.stringify(user, null, 2)}
      </pre>
    </div>
  );
}

// Loading skeleton
function AdminDashboardSkeleton() {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="w-64 h-8 bg-gray-200 animate-pulse rounded mb-2"></div>
          <div className="w-48 h-4 bg-gray-200 animate-pulse rounded"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow-md p-6">
              <div className="w-full h-20 bg-gray-200 animate-pulse rounded"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

---

## 🎭 **EJEMPLO 3: LISTA DE USUARIOS CON PERMISOS DINÁMICOS**

### **Componente que actualiza acciones según rol**

```typescript
"use client";

import { useAuth, useAuthInvalidation } from "@/shared/hooks/useAuth";
import { useUsersQuery } from "@/features/admin/users/hooks";
import { useState } from "react";

export default function UsersList() {
  const { user: currentUser, isAdmin, isSuperAdmin } = useAuth();
  const { users, isLoading, deleteUser, banUser, unbanUser, updateUserRole } =
    useUsersQuery();
  const { invalidateAuthCache } = useAuthInvalidation();
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      // 1. Actualizar rol en servidor
      await updateUserRole({ userId, role: newRole });

      // 2. 🔔 CRÍTICO: Invalidar auth cache para permisos reactivos instantáneos
      await invalidateAuthCache();

      // 3. El usuario cuyo rol cambió verá sus nuevos permisos al instante
      alert(
        `Rol actualizado. El usuario verá sus nuevos permisos inmediatamente.`
      );
    } catch (error) {
      alert("Error actualizando rol");
    }
  };

  if (isLoading) {
    return <UsersListSkeleton />;
  }

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <div className="px-6 py-4 bg-gray-50 border-b">
        <h2 className="text-xl font-semibold text-gray-800">
          Gestión de Usuarios ({users.length})
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Permisos reactivos - los cambios se aplican instantáneamente
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Usuario
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Rol
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                {/* Usuario Info */}
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="ml-4">
                      <div className="font-medium text-gray-900">
                        {user.name}
                      </div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </div>
                </td>

                {/* Rol */}
                <td className="px-6 py-4">
                  <RoleBadge role={user.role} />
                </td>

                {/* Estado */}
                <td className="px-6 py-4">
                  {user.banned ? (
                    <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
                      🚫 Baneado
                    </span>
                  ) : (
                    <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                      ✅ Activo
                    </span>
                  )}
                </td>

                {/* ✅ ACCIONES REACTIVAS - Se actualizan según permisos actuales */}
                <td className="px-6 py-4">
                  <div className="flex space-x-2">
                    {/* ✅ Solo visible si es admin Y no es él mismo */}
                    {isAdmin && user.id !== currentUser?.id && (
                      <>
                        {/* Selector de rol reactivo */}
                        <select
                          value={user.role}
                          onChange={(e) =>
                            handleRoleChange(user.id, e.target.value)
                          }
                          className="text-xs border rounded px-2 py-1"
                          disabled={
                            user.role === "super_admin" && !isSuperAdmin
                          }
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                          {/* ✅ Solo super admin puede crear otros super admin */}
                          {isSuperAdmin && (
                            <option value="super_admin">Super Admin</option>
                          )}
                        </select>

                        {/* Ban/Unban */}
                        {user.banned ? (
                          <button
                            onClick={() => unbanUser(user.id)}
                            className="text-xs bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
                          >
                            Desbanear
                          </button>
                        ) : (
                          <button
                            onClick={() =>
                              banUser({
                                userId: user.id,
                                reason: "Violación de términos",
                              })
                            }
                            className="text-xs bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600"
                          >
                            Banear
                          </button>
                        )}

                        {/* Delete - Solo super admin */}
                        {isSuperAdmin && (
                          <button
                            onClick={() => deleteUser(user.id)}
                            className="text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                          >
                            Eliminar
                          </button>
                        )}
                      </>
                    )}

                    {/* Info si es él mismo */}
                    {user.id === currentUser?.id && (
                      <span className="text-xs text-gray-500 italic">
                        (Tú mismo)
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Badge component para roles
function RoleBadge({ role }: { role: string }) {
  const styles = {
    user: "bg-gray-100 text-gray-800",
    admin: "bg-blue-100 text-blue-800",
    super_admin: "bg-red-100 text-red-800 font-semibold",
  };

  const icons = {
    user: "👤",
    admin: "👨‍💼",
    super_admin: "👑",
  };

  return (
    <span
      className={`px-2 py-1 text-xs rounded-full ${
        styles[role as keyof typeof styles]
      }`}
    >
      {icons[role as keyof typeof icons]} {role.replace("_", " ")}
    </span>
  );
}

function UsersListSkeleton() {
  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <div className="px-6 py-4 bg-gray-50 border-b">
        <div className="w-48 h-6 bg-gray-200 animate-pulse rounded"></div>
      </div>

      <div className="p-6">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center space-x-4 py-4 border-b">
            <div className="w-10 h-10 bg-gray-200 animate-pulse rounded-full"></div>
            <div className="flex-1 space-y-2">
              <div className="w-32 h-4 bg-gray-200 animate-pulse rounded"></div>
              <div className="w-48 h-3 bg-gray-200 animate-pulse rounded"></div>
            </div>
            <div className="w-16 h-6 bg-gray-200 animate-pulse rounded"></div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## 🔄 **EJEMPLO 4: DEMO DE PERMISOS REACTIVOS**

### **Componente de demostración interactivo**

```typescript
"use client";

import {
  useAuth,
  useAuthInvalidation,
  useRefreshAuth,
} from "@/shared/hooks/useAuth";
import { useState, useEffect } from "react";

export default function ReactivePermissionsDemo() {
  const { user, isAdmin, isSuperAdmin, isLoading, isRefreshing } = useAuth();
  const { invalidateAuthCache } = useAuthInvalidation();
  const { refreshAuth, isRefreshing: isManualRefreshing } = useRefreshAuth();

  const [lastUpdate, setLastUpdate] = useState<string>("");
  const [changeCount, setChangeCount] = useState(0);

  // Track permission changes
  useEffect(() => {
    setLastUpdate(new Date().toLocaleTimeString());
    setChangeCount((c) => c + 1);
  }, [user?.role, isAdmin, isSuperAdmin]);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          🎭 Demo: Permisos Reactivos en Tiempo Real
        </h1>
        <p className="text-gray-600">
          Esta demo muestra cómo los permisos se actualizan automáticamente
          cuando cambias de rol desde otro admin panel.
        </p>
      </div>

      {/* Status Panel */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Current User */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            👤 Usuario Actual
          </h3>
          {isLoading ? (
            <div className="space-y-2">
              <div className="w-32 h-4 bg-gray-200 animate-pulse rounded"></div>
              <div className="w-24 h-4 bg-gray-200 animate-pulse rounded"></div>
            </div>
          ) : (
            <div className="space-y-2">
              <p>
                <strong>Nombre:</strong> {user?.name}
              </p>
              <p>
                <strong>Email:</strong> {user?.email}
              </p>
              <p>
                <strong>Rol:</strong>
                <span
                  className={`ml-2 px-2 py-1 rounded text-sm ${
                    user?.role === "super_admin"
                      ? "bg-red-100 text-red-800"
                      : user?.role === "admin"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {user?.role}
                </span>
              </p>
            </div>
          )}
        </div>

        {/* Permissions */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            🛡️ Permisos Actuales
          </h3>
          <div className="space-y-3">
            <PermissionIndicator
              label="Es Usuario"
              hasPermission={!!user}
              icon="👤"
            />
            <PermissionIndicator
              label="Es Admin"
              hasPermission={isAdmin}
              icon="👨‍💼"
            />
            <PermissionIndicator
              label="Es Super Admin"
              hasPermission={isSuperAdmin}
              icon="👑"
            />
          </div>
        </div>

        {/* Update Status */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            🔄 Estado de Actualización
          </h3>
          <div className="space-y-3">
            <div className="flex items-center">
              <div
                className={`w-3 h-3 rounded-full mr-2 ${
                  isLoading
                    ? "bg-yellow-500 animate-pulse"
                    : isRefreshing
                    ? "bg-blue-500 animate-pulse"
                    : "bg-green-500"
                }`}
              ></div>
              <span className="text-sm">
                {isLoading
                  ? "Cargando..."
                  : isRefreshing
                  ? "Actualizando..."
                  : "Listo"}
              </span>
            </div>

            <div className="text-sm text-gray-600">
              <p>
                <strong>Última actualización:</strong> {lastUpdate}
              </p>
              <p>
                <strong>Cambios detectados:</strong> {changeCount}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          🎮 Acciones de Prueba
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => refreshAuth()}
            disabled={isManualRefreshing}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {isManualRefreshing ? "🔄 Refrescando..." : "🔄 Refrescar Manual"}
          </button>

          <button
            onClick={() => invalidateAuthCache()}
            className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
          >
            🗑️ Invalidar Cache
          </button>

          <button
            onClick={() => window.location.reload()}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            ↻ Recargar Página
          </button>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-800 mb-3">
          📋 Instrucciones de Prueba
        </h3>
        <div className="text-blue-700 space-y-2 text-sm">
          <p>
            <strong>1. Background Refresh:</strong> Los permisos se actualizan
            automáticamente cada 30 segundos
          </p>
          <p>
            <strong>2. Window Focus:</strong> Cambia a otra pestaña y vuelve -
            se verificarán automáticamente
          </p>
          <p>
            <strong>3. Cambio de Rol:</strong> Pide a otro admin que cambie tu
            rol - verás los cambios al instante
          </p>
          <p>
            <strong>4. Manual Refresh:</strong> Usa el botón "Refrescar Manual"
            para verificar inmediatamente
          </p>
          <p>
            <strong>5. Cache Invalidation:</strong> Usa "Invalidar Cache" para
            forzar re-fetch completo
          </p>
        </div>
      </div>

      {/* Feature Showcase */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">
          🎯 Showcase de Funciones por Rol
        </h3>

        {/* User Features */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-800 mb-2">
            👤 Funciones de Usuario
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <FeatureButton enabled={!!user} label="Ver Perfil" />
            <FeatureButton enabled={!!user} label="Editar Perfil" />
            <FeatureButton enabled={!!user} label="Configuración" />
            <FeatureButton enabled={!!user} label="Notificaciones" />
          </div>
        </div>

        {/* Admin Features */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-800 mb-2">
            👨‍💼 Funciones de Admin
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <FeatureButton enabled={isAdmin} label="Gestionar Usuarios" />
            <FeatureButton enabled={isAdmin} label="Ver Auditoría" />
            <FeatureButton enabled={isAdmin} label="Feature Flags" />
            <FeatureButton enabled={isAdmin} label="Configuraciones" />
          </div>
        </div>

        {/* Super Admin Features */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h4 className="font-medium text-red-800 mb-2">
            👑 Funciones de Super Admin
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <FeatureButton enabled={isSuperAdmin} label="Sistema" />
            <FeatureButton enabled={isSuperAdmin} label="Base de Datos" />
            <FeatureButton enabled={isSuperAdmin} label="Logs del Servidor" />
            <FeatureButton
              enabled={isSuperAdmin}
              label="Configuración Crítica"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper components
function PermissionIndicator({
  label,
  hasPermission,
  icon,
}: {
  label: string;
  hasPermission: boolean;
  icon: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-600">
        {icon} {label}
      </span>
      <span
        className={`text-sm font-semibold ${
          hasPermission ? "text-green-600" : "text-gray-400"
        }`}
      >
        {hasPermission ? "✅ SÍ" : "❌ NO"}
      </span>
    </div>
  );
}

function FeatureButton({
  enabled,
  label,
}: {
  enabled: boolean;
  label: string;
}) {
  return (
    <button
      disabled={!enabled}
      className={`text-xs px-2 py-1 rounded border ${
        enabled
          ? "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
          : "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"
      }`}
    >
      {enabled ? "✅" : "🔒"} {label}
    </button>
  );
}
```

---

## 🚀 **¡PRUEBA TU SISTEMA!**

### **Para probar los permisos reactivos:**

1. **🔄 Abre esta demo en el navegador**
2. **👥 Pide a otro admin que cambie tu rol**
3. **⏱️ Observa cómo se actualizan automáticamente:**
   - Background refresh (cada 30s)
   - Window focus (cambiar pestaña y volver)
   - Manual refresh (botón)
   - Cache invalidation (instantáneo)

### **📊 Métricas esperadas:**

- **Background update:** 30 segundos
- **Window focus:** <500ms
- **Manual refresh:** <200ms
- **Cache invalidation:** <100ms

**¡Tu sistema de permisos es ahora 100% reactivo! 🎉**
