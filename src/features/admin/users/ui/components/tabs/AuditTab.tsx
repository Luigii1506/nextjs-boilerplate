/**
 * 📋 AUDIT TAB COMPONENT
 * ======================
 *
 * Auditoría y log de actividades de usuarios
 * Componente optimizado para React 19 con dark mode
 * Siguiendo exactamente el patrón de inventory
 *
 * Created: 2025-01-18 - Users Audit Tab
 */

"use client";

import React, { useState, useMemo } from "react";
import { FileText, Download, RefreshCw } from "lucide-react";
import { useUsersContext } from "../../../context";
import {
  TabHeader,
  TabWrapper,
  TabSearchBar,
  TabLoadingSkeleton,
} from "@/shared/ui/components/tabs";
import {
  AuditEntryCard,
  AuditFilters,
  type AuditEntry,
  type AuditFiltersState,
} from "../audit";

/**
 * 📊 AUDIT TAB - MAIN COMPONENT
 * ==============================
 */
const AuditTab: React.FC = () => {
  const { users } = useUsersContext();
  const { isLoading } = users;
  const [searchTerm, setSearchTerm] = useState("");
  const [currentFilters, setCurrentFilters] = useState<AuditFiltersState>({
    actionType: "all",
    severity: "all",
    dateRange: "7d",
    user: "",
  });
  const [, setSelectedEntry] = useState<AuditEntry | null>(null);

  // 📋 Mock audit entries (in real app, this would come from audit API)
  const auditEntries = useMemo(() => {
    const mockEntries: AuditEntry[] = [
      {
        id: "1",
        timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
        action: "Usuario creado",
        actionType: "create",
        user: {
          id: "admin1",
          name: "Admin Principal",
          email: "admin@example.com",
          role: "super_admin",
        },
        target: {
          id: "user1",
          name: "Juan Pérez",
          email: "juan@example.com",
        },
        details: "Nuevo usuario registrado en el sistema",
        severity: "low",
        ipAddress: "192.168.1.100",
        userAgent: "Mozilla/5.0...",
      },
      {
        id: "2",
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        action: "Usuario baneado",
        actionType: "ban",
        user: {
          id: "admin2",
          name: "Moderador García",
          email: "mod@example.com",
          role: "admin",
        },
        target: {
          id: "user2",
          name: "Usuario Problemático",
          email: "problema@example.com",
        },
        details: "Usuario baneado por violación de términos de servicio",
        severity: "high",
        ipAddress: "192.168.1.150",
        metadata: {
          reason: "Spam",
          duration: "7 days",
        },
      },
      {
        id: "3",
        timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        action: "Cambio de rol",
        actionType: "role_change",
        user: {
          id: "superadmin",
          name: "Super Admin",
          email: "super@example.com",
          role: "super_admin",
        },
        target: {
          id: "user3",
          name: "María López",
          email: "maria@example.com",
        },
        details: "Usuario promovido a administrador",
        severity: "medium",
        ipAddress: "10.0.0.1",
        metadata: {
          previousRole: "user",
          newRole: "admin",
        },
      },
      {
        id: "4",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        action: "Intento de acceso no autorizado",
        actionType: "security",
        user: {
          id: "system",
          name: "Sistema",
          email: "system@example.com",
          role: "system",
        },
        details: "Múltiples intentos fallidos de inicio de sesión detectados",
        severity: "critical",
        ipAddress: "Unknown",
        metadata: {
          attempts: 15,
          timeWindow: "5 minutes",
          blocked: true,
        },
      },
    ];

    // Apply search filter
    let filtered = mockEntries;
    if (searchTerm) {
      filtered = filtered.filter(
        (entry) =>
          entry.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
          entry.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          entry.details.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply advanced filters
    if (currentFilters.actionType && currentFilters.actionType !== "all") {
      filtered = filtered.filter(
        (entry) => entry.actionType === currentFilters.actionType
      );
    }

    if (currentFilters.severity && currentFilters.severity !== "all") {
      filtered = filtered.filter(
        (entry) => entry.severity === currentFilters.severity
      );
    }

    if (currentFilters.user) {
      filtered = filtered.filter((entry) =>
        entry.user.name
          .toLowerCase()
          .includes(currentFilters.user.toLowerCase())
      );
    }

    return filtered;
  }, [searchTerm, currentFilters]);

  const handleViewDetails = (entry: AuditEntry) => {
    setSelectedEntry(entry);
  };

  if (isLoading) {
    return (
      <TabWrapper spacing="space-y-6" responsive={false}>
        <TabLoadingSkeleton type="list" count={5} showHeader />
      </TabWrapper>
    );
  }

  return (
    <TabWrapper spacing="space-y-6">
      {/* Header */}
      <TabHeader
        icon={
          <FileText className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
        }
        title="Auditoría del Sistema"
        description={`Registro completo de actividades y cambios del sistema (${auditEntries.length} entradas)`}
        customActions={<AuditFilters onFilterChange={setCurrentFilters} />}
        actions={[
          {
            label: "Actualizar",
            icon: <RefreshCw className="w-4 h-4" />,
            onClick: () => {},
            variant: "secondary",
          },
          {
            label: "Exportar Log",
            icon: <Download className="w-4 h-4" />,
            onClick: () => {},
            variant: "primary",
            color: "indigo",
          },
        ]}
      />

      {/* Search */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <TabSearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Buscar en auditoría..."
        />

        <div className="text-sm text-gray-600 dark:text-gray-400">
          Últimas 24 horas:{" "}
          {
            auditEntries.filter(
              (entry) =>
                new Date(entry.timestamp) >
                new Date(Date.now() - 24 * 60 * 60 * 1000)
            ).length
          }{" "}
          entradas
        </div>
      </div>

      {/* Audit Entries */}
      {auditEntries.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No se encontraron entradas
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {searchTerm || Object.keys(currentFilters).length > 0
              ? "Intenta ajustar los filtros de búsqueda"
              : "No hay actividades registradas en el período seleccionado"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {auditEntries.map((entry) => (
            <AuditEntryCard
              key={entry.id}
              entry={entry}
              onViewDetails={handleViewDetails}
            />
          ))}
        </div>
      )}

      {/* Summary */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {auditEntries.filter((e) => e.severity === "low").length}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Severidad Baja
            </p>
          </div>
          <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {auditEntries.filter((e) => e.severity === "medium").length}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Severidad Media
            </p>
          </div>
          <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {auditEntries.filter((e) => e.severity === "high").length}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Severidad Alta
            </p>
          </div>
          <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {auditEntries.filter((e) => e.severity === "critical").length}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Severidad Crítica
            </p>
          </div>
        </div>
      </div>
    </TabWrapper>
  );
};

export default AuditTab;
