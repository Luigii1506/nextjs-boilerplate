"use client";

import { useState } from "react";
import { useAdminPage } from "@/hooks/useAuth";
import { useFeatureFlags, usePermissions } from "@/hooks/usePermissions";
import AdminLayout from "@/components/layout/AdminLayout";
import {
  DashboardView,
  UsersView,
  PermissionStatsView,
} from "@/components/admin";
import UserPermissionsPanel from "@/components/admin/UserPermissionsPanel";
import { PermissionGate, AdminGate } from "@/components/auth/PermissionGate";
import { Shield, AlertTriangle } from "lucide-react";

export default function AdminDashboardPage() {
  const { isLoading, isAuthenticated, user, isAdmin } = useAdminPage();
  const { showAdminPanel } = useFeatureFlags();
  const { currentRole, currentLevel } = usePermissions();
  const [currentView, setCurrentView] = useState("dashboard");

  // Loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-slate-600">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  // Authentication check
  if (!isAuthenticated || !user) {
    return (
      <div className="flex justify-center items-center h-screen bg-slate-50">
        <div className="text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-red-500" />
          <h2 className="mt-4 text-lg font-semibold text-slate-700">
            Acceso Requerido
          </h2>
          <p className="mt-2 text-slate-600">
            Necesitas iniciar sesión para acceder al dashboard.
          </p>
        </div>
      </div>
    );
  }

  // Permission check - use our new permission system
  if (!showAdminPanel) {
    return (
      <div className="flex justify-center items-center h-screen bg-slate-50">
        <div className="text-center">
          <Shield className="mx-auto h-12 w-12 text-amber-500" />
          <h2 className="mt-4 text-lg font-semibold text-slate-700">
            Permisos Insuficientes
          </h2>
          <p className="mt-2 text-slate-600">
            No tienes los permisos necesarios para acceder al panel de
            administración.
          </p>
          <div className="mt-4 p-4 bg-slate-100 rounded-lg inline-block">
            <p className="text-sm text-slate-600">
              <strong>Tu rol actual:</strong> {currentRole || "No asignado"}
            </p>
            <p className="text-sm text-slate-600">
              <strong>Nivel de acceso:</strong> {currentLevel}
            </p>
            <p className="text-sm text-slate-500 mt-2">
              Contacta al administrador si crees que esto es un error.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Render appropriate view based on current selection
  const renderCurrentView = () => {
    switch (currentView) {
      case "users":
        return (
          <PermissionGate
            permissions={{ user: ["create", "read"] }}
            fallback={
              <div className="text-center py-12">
                <Shield className="mx-auto h-8 w-8 text-slate-400" />
                <p className="mt-2 text-slate-600">
                  No tienes permisos para gestionar usuarios.
                </p>
              </div>
            }
          >
            <UsersView />
          </PermissionGate>
        );

      case "permissions":
        return (
          <PermissionGate
            permissions={{ user: ["set-role"] }}
            fallback={
              <div className="text-center py-12">
                <Shield className="mx-auto h-8 w-8 text-slate-400" />
                <p className="mt-2 text-slate-600">
                  No tienes permisos para gestionar permisos y roles.
                </p>
              </div>
            }
          >
            <UserPermissionsPanel />
          </PermissionGate>
        );

      case "stats":
        return (
          <PermissionGate
            permissions={{ analytics: ["read"] }}
            fallback={
              <div className="text-center py-12">
                <Shield className="mx-auto h-8 w-8 text-slate-400" />
                <p className="mt-2 text-slate-600">
                  No tienes permisos para ver estadísticas del sistema.
                </p>
              </div>
            }
          >
            <PermissionStatsView />
          </PermissionGate>
        );

      case "content":
        return (
          <PermissionGate
            permissions={{ content: ["create", "read"] }}
            fallback={
              <div className="text-center py-12">
                <Shield className="mx-auto h-8 w-8 text-slate-400" />
                <p className="mt-2 text-slate-600">
                  No tienes permisos para gestionar contenido.
                </p>
              </div>
            }
          >
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-800 mb-4">
                Gestión de Contenido
              </h2>
              <p className="text-slate-600">
                Esta sección estará disponible próximamente.
              </p>
            </div>
          </PermissionGate>
        );

      case "analytics":
        return (
          <PermissionGate
            permissions={{ analytics: ["read"] }}
            fallback={
              <div className="text-center py-12">
                <Shield className="mx-auto h-8 w-8 text-slate-400" />
                <p className="mt-2 text-slate-600">
                  No tienes permisos para ver análisis.
                </p>
              </div>
            }
          >
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-800 mb-4">
                Análisis y Reportes
              </h2>
              <p className="text-slate-600">
                Dashboard de analytics estará disponible próximamente.
              </p>
            </div>
          </PermissionGate>
        );

      case "api":
        return (
          <PermissionGate
            permissions={{ api: ["read"] }}
            fallback={
              <div className="text-center py-12">
                <Shield className="mx-auto h-8 w-8 text-slate-400" />
                <p className="mt-2 text-slate-600">
                  No tienes permisos para gestionar APIs.
                </p>
              </div>
            }
          >
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-800 mb-4">
                Gestión de APIs
              </h2>
              <p className="text-slate-600">
                Panel de APIs estará disponible próximamente.
              </p>
            </div>
          </PermissionGate>
        );

      case "security":
        return (
          <PermissionGate
            permissions={{ security: ["read"] }}
            fallback={
              <div className="text-center py-12">
                <Shield className="mx-auto h-8 w-8 text-slate-400" />
                <p className="mt-2 text-slate-600">
                  No tienes permisos para ver logs de seguridad.
                </p>
              </div>
            }
          >
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-800 mb-4">
                Seguridad y Auditoría
              </h2>
              <p className="text-slate-600">
                Panel de seguridad estará disponible próximamente.
              </p>
            </div>
          </PermissionGate>
        );

      case "settings":
        return (
          <AdminGate
            requireSuperAdmin={true}
            fallback={
              <div className="text-center py-12">
                <Shield className="mx-auto h-8 w-8 text-slate-400" />
                <p className="mt-2 text-slate-600">
                  Solo los Super Administradores pueden acceder a la
                  configuración del sistema.
                </p>
              </div>
            }
          >
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-800 mb-4">
                Configuración del Sistema
              </h2>
              <p className="text-slate-600">
                Panel de configuración estará disponible próximamente.
              </p>
            </div>
          </AdminGate>
        );

      default:
        return <DashboardView />;
    }
  };

  return (
    <AdminLayout
      user={user}
      currentView={currentView}
      onViewChange={setCurrentView}
    >
      {renderCurrentView()}
    </AdminLayout>
  );
}
