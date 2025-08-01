"use client";

import { useState } from "react";
import { useAdminPage } from "@/hooks/useAuth";
import AdminLayout from "@/components/layout/AdminLayout";
import { DashboardView, UsersView } from "@/components/admin";

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

  // Esta página solo se muestra si el usuario está autenticado y es admin
  if (!isAuthenticated || !user || !isAdmin) {
    return null; // Redirect handled by useAdminPage
  }

  const renderView = () => {
    switch (currentView) {
      case "dashboard":
        return <DashboardView />;
      case "users":
        return <UsersView />;
      case "stats":
        return (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold text-slate-900 mb-2">
              Estadísticas
            </h2>
            <p className="text-slate-600">
              Esta sección estará disponible pronto...
            </p>
          </div>
        );
      case "settings":
        return (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold text-slate-900 mb-2">
              Configuración
            </h2>
            <p className="text-slate-600">
              Esta sección estará disponible pronto...
            </p>
          </div>
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
      {renderView()}
    </AdminLayout>
  );
}
