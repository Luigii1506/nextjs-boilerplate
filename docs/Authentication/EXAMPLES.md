# 📊 AUTHENTICATION EXAMPLES

**Ejemplos prácticos de uso del sistema de autenticación**

---

## 🎯 **EJEMPLOS POR CASO DE USO**

### **🏠 [Landing Page](#landing-page)**
### **🛡️ [Página Protegida](#página-protegida)**
### **👑 [Panel de Admin](#panel-de-admin)**
### **🧭 [Navegación Condicional](#navegación-condicional)**
### **👤 [Perfil de Usuario](#perfil-de-usuario)**
### **🔄 [Layout Híbrido](#layout-híbrido)**

---

## 🏠 **Landing Page**

**Página pública que muestra contenido diferente según autenticación:**

```typescript
// app/page.tsx
"use client";

import { usePublicPage } from "@/shared/hooks/useAuth";
import Link from "next/link";

export default function HomePage() {
  const { isLoading, isAuthenticated, user, isAdmin } = usePublicPage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Mi App</h1>
            
            {/* Navigation condicional */}
            <nav className="flex items-center space-x-4">
              {isLoading ? (
                <div className="animate-pulse h-8 bg-gray-200 rounded w-24"></div>
              ) : isAuthenticated ? (
                <>
                  <span className="text-gray-700">Hola, {user?.name}</span>
                  <Link 
                    href="/dashboard"
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    Dashboard
                  </Link>
                  {isAdmin && (
                    <Link 
                      href="/admin"
                      className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                    >
                      Admin
                    </Link>
                  )}
                </>
              ) : (
                <>
                  <Link 
                    href="/login"
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Iniciar Sesión
                  </Link>
                  <Link 
                    href="/register"
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    Registrarse
                  </Link>
                </>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Bienvenido a Mi App
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            La mejor aplicación para gestionar tus tareas
          </p>
          
          {/* Contenido condicional */}
          {isAuthenticated ? (
            <div className="bg-green-100 border border-green-400 rounded-lg p-6 mb-8">
              <h3 className="text-lg font-semibold text-green-800 mb-2">
                ✅ Ya tienes una cuenta activa
              </h3>
              <p className="text-green-700 mb-4">
                Bienvenido de vuelta, {user?.name}. Continúa donde lo dejaste.
              </p>
              <Link 
                href="/dashboard"
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700"
              >
                Ir al Dashboard
              </Link>
            </div>
          ) : (
            <div className="bg-blue-100 border border-blue-400 rounded-lg p-6 mb-8">
              <h3 className="text-lg font-semibold text-blue-800 mb-2">
                🚀 Comienza gratis hoy
              </h3>
              <p className="text-blue-700 mb-4">
                Crea tu cuenta y accede a todas las funciones.
              </p>
              <div className="space-x-4">
                <Link 
                  href="/register"
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
                >
                  Crear Cuenta Gratis
                </Link>
                <Link 
                  href="/login"
                  className="border border-blue-600 text-blue-600 px-6 py-3 rounded-lg hover:bg-blue-50"
                >
                  Ya tengo cuenta
                </Link>
              </div>
            </div>
          )}
          
          {/* Features */}
          <div className="grid md:grid-cols-3 gap-8 mt-12">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📝</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Gestión de Tareas</h3>
              <p className="text-gray-600">Organiza y prioriza tus tareas fácilmente</p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">👥</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Colaboración</h3>
              <p className="text-gray-600">Trabaja en equipo de forma eficiente</p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Analytics</h3>
              <p className="text-gray-600">Analiza tu productividad</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
```

---

## 🛡️ **Página Protegida**

**Dashboard que requiere autenticación:**

```typescript
// app/dashboard/page.tsx
"use client";

import { useProtectedPage } from "@/shared/hooks/useAuth";
import { useState, useEffect } from "react";

interface Task {
  id: string;
  title: string;
  completed: boolean;
}

export default function DashboardPage() {
  const { isLoading, user } = useProtectedPage();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(true);

  // Cargar tareas del usuario
  useEffect(() => {
    if (user) {
      loadUserTasks();
    }
  }, [user]);

  const loadUserTasks = async () => {
    try {
      setIsLoadingTasks(true);
      // Simular carga de tareas
      await new Promise(resolve => setTimeout(resolve, 1000));
      setTasks([
        { id: "1", title: "Revisar emails", completed: false },
        { id: "2", title: "Llamar al cliente", completed: true },
        { id: "3", title: "Preparar presentación", completed: false },
      ]);
    } catch (error) {
      console.error("Error loading tasks:", error);
    } finally {
      setIsLoadingTasks(false);
    }
  };

  // Loading state durante verificación de auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600">Bienvenido de vuelta, {user?.name}</p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                {user?.role === "admin" ? "👑 Admin" : "👤 Usuario"}
              </span>
              <img 
                src={user?.image || "/default-avatar.png"} 
                alt="Avatar"
                className="w-10 h-10 rounded-full"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* Stats Cards */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-full">
                <span className="text-blue-600 text-xl">📝</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total Tareas</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {isLoadingTasks ? "..." : tasks.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-full">
                <span className="text-green-600 text-xl">✅</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Completadas</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {isLoadingTasks ? "..." : tasks.filter(t => t.completed).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="bg-orange-100 p-3 rounded-full">
                <span className="text-orange-600 text-xl">⏳</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Pendientes</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {isLoadingTasks ? "..." : tasks.filter(t => !t.completed).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tasks List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Mis Tareas</h2>
          </div>
          <div className="p-6">
            {isLoadingTasks ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="animate-pulse flex items-center space-x-3">
                    <div className="w-4 h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded flex-1"></div>
                  </div>
                ))}
              </div>
            ) : tasks.length > 0 ? (
              <div className="space-y-3">
                {tasks.map(task => (
                  <div key={task.id} className="flex items-center space-x-3">
                    <input 
                      type="checkbox" 
                      checked={task.completed}
                      className="w-4 h-4 text-blue-600 rounded"
                      readOnly
                    />
                    <span className={`flex-1 ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                      {task.title}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <span className="text-4xl mb-4 block">📝</span>
                <p className="text-gray-600">No tienes tareas aún</p>
                <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                  Crear Primera Tarea
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
```

---

## 👑 **Panel de Admin**

**Página de administración con permisos elevados:**

```typescript
// app/admin/users/page.tsx
"use client";

import { useAdminPage } from "@/shared/hooks/useAuth";
import { useState, useEffect } from "react";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin" | "super_admin";
  createdAt: string;
  lastLogin?: string;
}

export default function AdminUsersPage() {
  const { isLoading, user, isAdmin } = useAdminPage();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [filter, setFilter] = useState<"all" | "admin" | "user">("all");

  useEffect(() => {
    if (user && isAdmin) {
      loadUsers();
    }
  }, [user, isAdmin]);

  const loadUsers = async () => {
    try {
      setIsLoadingUsers(true);
      // Simular carga de usuarios
      await new Promise(resolve => setTimeout(resolve, 1000));
      setUsers([
        {
          id: "1",
          name: "Juan Pérez",
          email: "juan@example.com",
          role: "user",
          createdAt: "2024-01-15",
          lastLogin: "2024-01-17"
        },
        {
          id: "2", 
          name: "María García",
          email: "maria@example.com",
          role: "admin",
          createdAt: "2024-01-10",
          lastLogin: "2024-01-17"
        },
        {
          id: "3",
          name: "Carlos López",
          email: "carlos@example.com", 
          role: "super_admin",
          createdAt: "2024-01-01",
          lastLogin: "2024-01-17"
        }
      ]);
    } catch (error) {
      console.error("Error loading users:", error);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  // Loading durante verificación de permisos
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando permisos de administrador...</p>
        </div>
      </div>
    );
  }

  const filteredUsers = users.filter(u => 
    filter === "all" || u.role === filter
  );

  const getRoleBadge = (role: string) => {
    const styles = {
      user: "bg-blue-100 text-blue-800",
      admin: "bg-yellow-100 text-yellow-800", 
      super_admin: "bg-red-100 text-red-800"
    };
    const labels = {
      user: "Usuario",
      admin: "Admin",
      super_admin: "Super Admin"
    };
    
    return (
      <span className={`px-2 py-1 text-xs rounded-full ${styles[role]}`}>
        {labels[role]}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                👑 Panel de Administración
              </h1>
              <p className="text-gray-600">
                Gestión de usuarios - {user?.name}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {user?.role === "super_admin" && (
                <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm">
                  🔑 Super Admin
                </span>
              )}
              <button className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
                Nuevo Usuario
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-full">
                <span className="text-blue-600 text-xl">👥</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total Usuarios</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {isLoadingUsers ? "..." : users.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-full">
                <span className="text-green-600 text-xl">👤</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Usuarios</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {isLoadingUsers ? "..." : users.filter(u => u.role === "user").length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="bg-yellow-100 p-3 rounded-full">
                <span className="text-yellow-600 text-xl">👑</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Admins</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {isLoadingUsers ? "..." : users.filter(u => u.role === "admin").length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="bg-red-100 p-3 rounded-full">
                <span className="text-red-600 text-xl">🔑</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Super Admins</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {isLoadingUsers ? "..." : users.filter(u => u.role === "super_admin").length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">
                Lista de Usuarios
              </h2>
              
              {/* Filters */}
              <div className="flex space-x-2">
                {["all", "user", "admin"].map(filterOption => (
                  <button
                    key={filterOption}
                    onClick={() => setFilter(filterOption as any)}
                    className={`px-3 py-1 rounded text-sm ${
                      filter === filterOption
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {filterOption === "all" ? "Todos" : 
                     filterOption === "user" ? "Usuarios" : "Admins"}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            {isLoadingUsers ? (
              <div className="p-6">
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="animate-pulse flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                      </div>
                      <div className="w-20 h-6 bg-gray-200 rounded"></div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Usuario
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rol
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Registro
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Último Login
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map(adminUser => (
                    <tr key={adminUser.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                            <span className="text-gray-600 font-medium">
                              {adminUser.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {adminUser.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {adminUser.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getRoleBadge(adminUser.role)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(adminUser.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {adminUser.lastLogin 
                          ? new Date(adminUser.lastLogin).toLocaleDateString()
                          : "Nunca"
                        }
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button className="text-blue-600 hover:text-blue-900">
                            Editar
                          </button>
                          {user?.role === "super_admin" && adminUser.role !== "super_admin" && (
                            <button className="text-red-600 hover:text-red-900">
                              Eliminar
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
```

---

## 🧭 **Navegación Condicional**

**Componente de navegación que cambia según autenticación:**

```typescript
// components/Navigation.tsx
"use client";

import { usePublicPage } from "@/shared/hooks/useAuth";
import Link from "next/link";
import { useState } from "react";

export default function Navigation() {
  const { isLoading, isAuthenticated, user, isAdmin } = usePublicPage();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-blue-600">Mi App</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {/* Links públicos */}
            <Link href="/" className="text-gray-700 hover:text-blue-600">
              Inicio
            </Link>
            <Link href="/features" className="text-gray-700 hover:text-blue-600">
              Características
            </Link>
            <Link href="/pricing" className="text-gray-700 hover:text-blue-600">
              Precios
            </Link>

            {/* Links condicionales */}
            {isLoading ? (
              <div className="flex items-center space-x-4">
                <div className="animate-pulse h-8 bg-gray-200 rounded w-20"></div>
                <div className="animate-pulse h-8 bg-gray-200 rounded w-16"></div>
              </div>
            ) : isAuthenticated ? (
              <div className="flex items-center space-x-4">
                {/* Links para usuarios autenticados */}
                <Link 
                  href="/dashboard" 
                  className="text-gray-700 hover:text-blue-600"
                >
                  Dashboard
                </Link>
                
                {/* Links solo para admins */}
                {isAdmin && (
                  <>
                    <Link 
                      href="/admin" 
                      className="text-red-600 hover:text-red-800 font-medium"
                    >
                      👑 Admin
                    </Link>
                    <Link 
                      href="/admin/users" 
                      className="text-gray-700 hover:text-blue-600"
                    >
                      Usuarios
                    </Link>
                  </>
                )}

                {/* User Menu */}
                <div className="relative group">
                  <button className="flex items-center space-x-2 text-gray-700 hover:text-blue-600">
                    <img 
                      src={user?.image || "/default-avatar.png"} 
                      alt="Avatar"
                      className="w-8 h-8 rounded-full"
                    />
                    <span>{user?.name}</span>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                  
                  {/* Dropdown Menu */}
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="py-1">
                      <Link 
                        href="/profile" 
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Mi Perfil
                      </Link>
                      <Link 
                        href="/settings" 
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Configuración
                      </Link>
                      <hr className="my-1" />
                      <button 
                        className="block w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-gray-100"
                        onClick={() => {/* logout logic */}}
                      >
                        Cerrar Sesión
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                {/* Links para usuarios no autenticados */}
                <Link 
                  href="/login" 
                  className="text-gray-700 hover:text-blue-600"
                >
                  Iniciar Sesión
                </Link>
                <Link 
                  href="/register" 
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  Registrarse
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <div className="flex flex-col space-y-3">
              <Link href="/" className="text-gray-700 hover:text-blue-600">
                Inicio
              </Link>
              <Link href="/features" className="text-gray-700 hover:text-blue-600">
                Características
              </Link>
              <Link href="/pricing" className="text-gray-700 hover:text-blue-600">
                Precios
              </Link>
              
              {isAuthenticated ? (
                <>
                  <hr className="my-2" />
                  <Link href="/dashboard" className="text-gray-700 hover:text-blue-600">
                    Dashboard
                  </Link>
                  {isAdmin && (
                    <Link href="/admin" className="text-red-600 hover:text-red-800">
                      👑 Admin
                    </Link>
                  )}
                  <Link href="/profile" className="text-gray-700 hover:text-blue-600">
                    Mi Perfil
                  </Link>
                  <button className="text-left text-red-700 hover:text-red-900">
                    Cerrar Sesión
                  </button>
                </>
              ) : (
                <>
                  <hr className="my-2" />
                  <Link href="/login" className="text-gray-700 hover:text-blue-600">
                    Iniciar Sesión
                  </Link>
                  <Link href="/register" className="text-blue-600 hover:text-blue-800">
                    Registrarse
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
```

---

## 👤 **Perfil de Usuario**

**Página de perfil con actualización de estado:**

```typescript
// app/profile/page.tsx
"use client";

import { useProtectedPage, useRefreshAuth } from "@/shared/hooks/useAuth";
import { useState } from "react";

export default function ProfilePage() {
  const { isLoading, user } = useProtectedPage();
  const { refreshAuth, isRefreshing } = useRefreshAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Simular actualización del perfil
      console.log("Updating profile:", formData);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Refrescar estado de autenticación
      const success = await refreshAuth();
      
      if (success) {
        setIsEditing(false);
        alert("Perfil actualizado correctamente");
      } else {
        alert("Error al actualizar el estado");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Error al actualizar perfil");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Mi Perfil</h1>
            <p className="text-gray-600">Gestiona tu información personal</p>
          </div>
          
          <div className="p-6">
            <div className="flex items-center space-x-6">
              <div className="w-20 h-20 bg-gray-300 rounded-full flex items-center justify-center">
                {user?.image ? (
                  <img 
                    src={user.image} 
                    alt="Avatar"
                    className="w-20 h-20 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-2xl text-gray-600 font-bold">
                    {user?.name?.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {user?.name}
                </h2>
                <p className="text-gray-600">{user?.email}</p>
                <div className="flex items-center mt-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    user?.role === "admin" 
                      ? "bg-yellow-100 text-yellow-800"
                      : user?.role === "super_admin"
                      ? "bg-red-100 text-red-800"
                      : "bg-blue-100 text-blue-800"
                  }`}>
                    {user?.role === "admin" ? "👑 Admin" :
                     user?.role === "super_admin" ? "🔑 Super Admin" : "👤 Usuario"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Form */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">
                Información Personal
              </h2>
              {!isEditing && (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  Editar
                </button>
              )}
            </div>
          </div>

          <div className="p-6">
            {isEditing ? (
              <form onSubmit={handleSave} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre Completo
                  </label>
                  <input 
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input 
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="flex space-x-4">
                  <button 
                    type="submit"
                    disabled={isRefreshing}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isRefreshing ? "Guardando..." : "Guardar Cambios"}
                  </button>
                  <button 
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setFormData({
                        name: user?.name || "",
                        email: user?.email || "",
                      });
                    }}
                    className="border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre Completo
                  </label>
                  <p className="text-gray-900">{user?.name}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <p className="text-gray-900">{user?.email}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rol
                  </label>
                  <p className="text-gray-900">
                    {user?.role === "admin" ? "Administrador" :
                     user?.role === "super_admin" ? "Super Administrador" : "Usuario"}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha de Registro
                  </label>
                  <p className="text-gray-900">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "No disponible"}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Account Actions */}
        <div className="bg-white rounded-lg shadow mt-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Acciones de Cuenta
            </h2>
          </div>
          
          <div className="p-6 space-y-4">
            <button className="w-full text-left px-4 py-3 border border-gray-300 rounded-md hover:bg-gray-50">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium text-gray-900">Cambiar Contraseña</p>
                  <p className="text-sm text-gray-600">Actualiza tu contraseña</p>
                </div>
                <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            </button>

            <button className="w-full text-left px-4 py-3 border border-gray-300 rounded-md hover:bg-gray-50">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium text-gray-900">Configuración de Privacidad</p>
                  <p className="text-sm text-gray-600">Gestiona tu privacidad</p>
                </div>
                <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            </button>

            <button className="w-full text-left px-4 py-3 border border-red-300 rounded-md hover:bg-red-50 text-red-700">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">Eliminar Cuenta</p>
                  <p className="text-sm text-red-600">Esta acción no se puede deshacer</p>
                </div>
                <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

## 🔄 **Layout Híbrido**

**Patrón Server + Client para layouts:**

```typescript
// app/(admin)/layout.tsx - Server Component
import { type ReactNode } from "react";
import { redirect } from "next/navigation";
import { requireAuth } from "@/core/auth/server";
import { ROLE_INFO } from "@/core/auth/config/permissions";
import type { SessionUser } from "@/shared/types/user";
import AdminLayoutWrapper from "./AdminLayoutWrapper";

export const runtime = "nodejs";

/**
 * 🏛️ ADMIN ROOT LAYOUT
 * Server Component que verifica auth y pasa a Client
 */
export default async function AdminRootLayout({
  children,
}: {
  children: ReactNode;
}) {
  // 🔐 Server-side auth verification
  const session = await requireAuth();
  const user = session!.user as SessionUser;

  // 🛡️ Role-based access control
  const role = (user.role ?? "user") as keyof typeof ROLE_INFO;
  const isAdmin = role === "admin" || role === "super_admin";
  const isSuperAdmin = role === "super_admin";
  
  if (!isAdmin) redirect("/unauthorized");

  // ✅ Pass to client wrapper for reactive UI
  return (
    <AdminLayoutWrapper 
      user={user} 
      isAdmin={isAdmin} 
      isSuperAdmin={isSuperAdmin}
    >
      {children}
    </AdminLayoutWrapper>
  );
}
```

```typescript
// app/(admin)/AdminLayoutWrapper.tsx - Client Component
"use client";

import { type ReactNode } from "react";
import { useAdminPage } from "@/shared/hooks/useAuth";
import AdminLayout from "@/shared/ui/layouts/AdminLayout";
import type { SessionUser } from "@/shared/types/user";

interface AdminLayoutWrapperProps {
  user: SessionUser;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  children: ReactNode;
}

/**
 * 🎯 ADMIN LAYOUT WRAPPER
 * Client wrapper que maneja estado reactivo
 */
export default function AdminLayoutWrapper({
  user: initialUser,
  isAdmin: initialIsAdmin,
  isSuperAdmin,
  children,
}: AdminLayoutWrapperProps) {
  // 🔐 Reactive auth state con automatic redirects
  const { isLoading, isAuthenticated, user, isAdmin } = useAdminPage();

  // 🛡️ Loading state durante verificación inicial
  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Verificando permisos...</p>
        </div>
      </div>
    );
  }

  // 🚫 Si no está autenticado, useAdminPage ya redirigió
  if (!isAuthenticated || !user) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <p className="text-slate-600">Redirigiendo...</p>
        </div>
      </div>
    );
  }

  // 🚫 Si no es admin, useAdminPage ya redirigió
  if (!isAdmin) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <p className="text-slate-600">Sin permisos de administrador...</p>
        </div>
      </div>
    );
  }

  // ✅ Render admin layout con estado reactivo
  return (
    <AdminLayout 
      user={user} 
      isAdmin={isAdmin} 
      isSuperAdmin={user.role === "super_admin"}
    >
      {children}
    </AdminLayout>
  );
}
```

---

**¡Ejemplos completos y listos para usar!** 🚀✨
