"use client";

import React from "react";
import {
  Users,
  Settings,
  BarChart3,
  Shield,
  LogOut,
  Home,
  FileText,
  Key,
  Eye,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { usePermissions } from "@/hooks/usePermissions";
import {
  PermissionGate,
  UserManagementGate,
} from "@/components/auth/PermissionGate";
import { ROLE_INFO } from "@/lib/auth/permissions";

interface AdminLayoutProps {
  children: React.ReactNode;
  user: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
    role?: string | null;
  };
  currentView?: string;
  onViewChange?: (view: string) => void;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({
  children,
  user,
  currentView = "dashboard",
  onViewChange,
}) => {
  const router = useRouter();
  const { currentRole, isAdmin, isSuperAdmin, canAccess } = usePermissions();

  const handleLogout = async () => {
    try {
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            router.push("/login");
          },
        },
      });
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  const handleViewChange = (view: string) => {
    if (onViewChange) {
      onViewChange(view);
    }
  };

  // Get role info for display
  const roleInfo = currentRole ? ROLE_INFO[currentRole] : ROLE_INFO.user;

  // Only show admin layout if user is admin or super_admin
  if (!isAdmin()) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Shield className="mx-auto h-12 w-12 text-slate-400" />
          <h2 className="mt-4 text-lg font-semibold text-slate-700">
            Acceso Restringido
          </h2>
          <p className="mt-2 text-slate-600">
            No tienes permisos para acceder al panel de administración.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Fixed Header */}
      <header className="bg-white border-b border-slate-200 fixed top-0 right-0 left-64 z-10">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Header Title */}
            <div>
              <h1 className="text-xl font-semibold text-slate-800">
                Panel de Administración
              </h1>
              <p className="text-sm text-slate-600">Vista: {currentView}</p>
            </div>

            {/* User Info & Logout */}
            <div className="flex items-center gap-4">
              {/* User Profile */}
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-slate-700">
                    {user.name}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">{user.email}</span>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-${roleInfo.color}-100 text-${roleInfo.color}-700`}
                    >
                      <span>{roleInfo.icon}</span>
                      {roleInfo.name}
                    </span>
                  </div>
                </div>

                {user.image ? (
                  <img
                    src={user.image}
                    alt={user.name}
                    className="w-10 h-10 rounded-full border-2 border-slate-200"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center">
                    <span className="text-slate-600 font-medium">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Salir
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Fixed Sidebar */}
      <aside className="fixed top-0 left-0 w-64 h-full bg-white border-r border-slate-200 z-20">
        <div className="p-6">
          {/* Logo/Brand */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">Admin</h2>
              <p className="text-xs text-slate-500">Panel de Control</p>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="space-y-2">
            {/* Dashboard */}
            <button
              onClick={() => handleViewChange("dashboard")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 text-left rounded-lg transition-colors ${
                currentView === "dashboard"
                  ? "bg-slate-100 text-slate-800 font-medium"
                  : "text-slate-600 hover:text-slate-800 hover:bg-slate-50"
              }`}
            >
              <Home className="w-5 h-5" />
              <span>Dashboard</span>
            </button>

            {/* User Management */}
            <UserManagementGate action="create">
              <button
                onClick={() => handleViewChange("users")}
                className={`w-full flex items-center gap-3 px-3 py-2.5 text-left rounded-lg transition-colors ${
                  currentView === "users"
                    ? "bg-slate-100 text-slate-800 font-medium"
                    : "text-slate-600 hover:text-slate-800 hover:bg-slate-50"
                }`}
              >
                <Users className="w-5 h-5" />
                <span>Usuarios</span>
              </button>
            </UserManagementGate>

            {/* 🧹 LIMPIEZA COMPLETA - Solo Dashboard y Usuarios */}
          </nav>

          {/* Permission Info */}
          <div className="mt-8 p-4 bg-slate-50 rounded-lg">
            <h4 className="text-sm font-medium text-slate-700 mb-2">
              Tu Acceso
            </h4>
            <div className="space-y-1 text-xs text-slate-600">
              <div>✓ Gestión de usuarios</div>
              {isSuperAdmin() && <div>✓ Acceso completo al sistema</div>}
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 pt-24 p-6">
        <div className="max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
};

export default AdminLayout;
