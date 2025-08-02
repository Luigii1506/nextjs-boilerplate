"use client";

import { useState } from "react";
import { useAdminPage } from "@/shared/hooks/useAuth";
import AdminLayout from "@/shared/components/layout/AdminLayout";
import {
  DashboardView,
  UsersView,
} from "@/features/user-management/components";
import { PermissionGate } from "@/core/auth/auth/PermissionGate";
import { Shield, AlertTriangle } from "lucide-react";

export default function AdminDashboardPage() {
  const { isLoading, isAuthenticated, user, isAdmin } = useAdminPage();
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
  // The showAdminPanel check was removed as per the edit hint.
  // The usePermissions hook was removed as per the edit hint.
  // The currentRole and currentLevel variables were removed as per the edit hint.

  // Render appropriate view based on current selection
  const renderCurrentView = () => {
    switch (currentView) {
      case "users":
        // Simple admin check - if user is admin or super_admin, allow access
        if (!isAdmin) {
          return (
            <div className="text-center py-12">
              <Shield className="mx-auto h-8 w-8 text-slate-400" />
              <p className="mt-2 text-slate-600">
                No tienes permisos para gestionar usuarios.
              </p>
              <p className="text-sm text-slate-500 mt-1">
                Necesitas ser administrador para acceder a esta sección.
              </p>
            </div>
          );
        }
        return <UsersView />;

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
