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
import {
  FileText,
  Eye,
  Search,
  Filter,
  Download,
  Calendar,
  Clock,
  User,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Activity,
  Lock,
  Unlock,
  Edit,
  Trash2,
  UserPlus,
  Settings,
  RefreshCw,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/shared/utils";
import { useUsersContext } from "../../../context";
import { TabTransition } from "../shared";

// 📋 Audit Entry Interface
interface AuditEntry {
  id: string;
  timestamp: string;
  action: string;
  actionType:
    | "create"
    | "update"
    | "delete"
    | "login"
    | "logout"
    | "ban"
    | "unban"
    | "role_change"
    | "security";
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  target?: {
    id: string;
    name: string;
    email: string;
  };
  details: string;
  severity: "low" | "medium" | "high" | "critical";
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
}

// 🎨 Action Type Colors and Icons
const getActionTypeInfo = (actionType: AuditEntry["actionType"]) => {
  switch (actionType) {
    case "create":
      return {
        icon: <UserPlus className="w-4 h-4" />,
        color: "text-green-600 dark:text-green-400",
        bgColor: "bg-green-100 dark:bg-green-900/20",
        borderColor: "border-green-200 dark:border-green-700",
      };
    case "update":
      return {
        icon: <Edit className="w-4 h-4" />,
        color: "text-blue-600 dark:text-blue-400",
        bgColor: "bg-blue-100 dark:bg-blue-900/20",
        borderColor: "border-blue-200 dark:border-blue-700",
      };
    case "delete":
      return {
        icon: <Trash2 className="w-4 h-4" />,
        color: "text-red-600 dark:text-red-400",
        bgColor: "bg-red-100 dark:bg-red-900/20",
        borderColor: "border-red-200 dark:border-red-700",
      };
    case "login":
      return {
        icon: <Unlock className="w-4 h-4" />,
        color: "text-green-600 dark:text-green-400",
        bgColor: "bg-green-100 dark:bg-green-900/20",
        borderColor: "border-green-200 dark:border-green-700",
      };
    case "logout":
      return {
        icon: <Lock className="w-4 h-4" />,
        color: "text-gray-600 dark:text-gray-400",
        bgColor: "bg-gray-100 dark:bg-gray-700",
        borderColor: "border-gray-200 dark:border-gray-600",
      };
    case "ban":
      return {
        icon: <XCircle className="w-4 h-4" />,
        color: "text-red-600 dark:text-red-400",
        bgColor: "bg-red-100 dark:bg-red-900/20",
        borderColor: "border-red-200 dark:border-red-700",
      };
    case "unban":
      return {
        icon: <CheckCircle className="w-4 h-4" />,
        color: "text-green-600 dark:text-green-400",
        bgColor: "bg-green-100 dark:bg-green-900/20",
        borderColor: "border-green-200 dark:border-green-700",
      };
    case "role_change":
      return {
        icon: <Shield className="w-4 h-4" />,
        color: "text-purple-600 dark:text-purple-400",
        bgColor: "bg-purple-100 dark:bg-purple-900/20",
        borderColor: "border-purple-200 dark:border-purple-700",
      };
    case "security":
      return {
        icon: <AlertTriangle className="w-4 h-4" />,
        color: "text-yellow-600 dark:text-yellow-400",
        bgColor: "bg-yellow-100 dark:bg-yellow-900/20",
        borderColor: "border-yellow-200 dark:border-yellow-700",
      };
    default:
      return {
        icon: <Activity className="w-4 h-4" />,
        color: "text-gray-600 dark:text-gray-400",
        bgColor: "bg-gray-100 dark:bg-gray-700",
        borderColor: "border-gray-200 dark:border-gray-600",
      };
  }
};

// 🔍 Audit Entry Component
interface AuditEntryCardProps {
  entry: AuditEntry;
  onViewDetails: (entry: AuditEntry) => void;
}

const AuditEntryCard: React.FC<AuditEntryCardProps> = ({
  entry,
  onViewDetails,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const actionInfo = getActionTypeInfo(entry.actionType);

  const getSeverityColor = (severity: AuditEntry["severity"]) => {
    switch (severity) {
      case "critical":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
      case "high":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400";
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
      case "low":
      default:
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
    }
  };

  return (
    <div
      className={cn(
        "bg-white dark:bg-gray-800 rounded-lg border p-4 hover:shadow-md transition-shadow",
        actionInfo.borderColor
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          <div className={cn("p-2 rounded-lg", actionInfo.bgColor)}>
            <div className={actionInfo.color}>{actionInfo.icon}</div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {entry.action}
              </h4>
              <span
                className={cn(
                  "px-2 py-1 rounded-full text-xs font-medium",
                  getSeverityColor(entry.severity)
                )}
              >
                {entry.severity}
              </span>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              {entry.details}
            </p>

            <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
              <div className="flex items-center space-x-1">
                <User className="w-3 h-3" />
                <span>{entry.user.name}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="w-3 h-3" />
                <span>{new Date(entry.timestamp).toLocaleString()}</span>
              </div>
              {entry.ipAddress && (
                <div className="flex items-center space-x-1">
                  <Activity className="w-3 h-3" />
                  <span>{entry.ipAddress}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => onViewDetails(entry)}
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded"
            title="Ver detalles"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded"
          >
            {isExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h5 className="font-medium text-gray-900 dark:text-white mb-2">
                Usuario
              </h5>
              <p className="text-gray-600 dark:text-gray-400">
                {entry.user.name}
              </p>
              <p className="text-gray-500 dark:text-gray-500">
                {entry.user.email}
              </p>
              <p className="text-gray-500 dark:text-gray-500">
                Rol: {entry.user.role}
              </p>
            </div>

            {entry.target && (
              <div>
                <h5 className="font-medium text-gray-900 dark:text-white mb-2">
                  Objetivo
                </h5>
                <p className="text-gray-600 dark:text-gray-400">
                  {entry.target.name}
                </p>
                <p className="text-gray-500 dark:text-gray-500">
                  {entry.target.email}
                </p>
              </div>
            )}

            {entry.userAgent && (
              <div className="md:col-span-2">
                <h5 className="font-medium text-gray-900 dark:text-white mb-2">
                  User Agent
                </h5>
                <p className="text-gray-500 dark:text-gray-500 text-xs break-all">
                  {entry.userAgent}
                </p>
              </div>
            )}

            {entry.metadata && Object.keys(entry.metadata).length > 0 && (
              <div className="md:col-span-2">
                <h5 className="font-medium text-gray-900 dark:text-white mb-2">
                  Metadata
                </h5>
                <pre className="text-xs bg-gray-50 dark:bg-gray-700 p-2 rounded overflow-auto">
                  {JSON.stringify(entry.metadata, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// 🔍 Advanced Filters Component
const AuditFilters: React.FC<{
  onFilterChange: (filters: any) => void;
}> = ({ onFilterChange }) => {
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    actionType: "all",
    severity: "all",
    dateRange: "7d",
    user: "",
  });

  const applyFilters = (newFilters: typeof filters) => {
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowFilters(!showFilters)}
        className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
      >
        <Filter className="w-4 h-4" />
        <span>Filtros Avanzados</span>
      </button>

      {showFilters && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-20 p-4">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
            Filtros de Auditoría
          </h4>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tipo de Acción
              </label>
              <select
                value={filters.actionType}
                onChange={(e) =>
                  applyFilters({ ...filters, actionType: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">Todas las acciones</option>
                <option value="create">Creación</option>
                <option value="update">Actualización</option>
                <option value="delete">Eliminación</option>
                <option value="login">Inicio de sesión</option>
                <option value="logout">Cierre de sesión</option>
                <option value="ban">Baneo</option>
                <option value="unban">Desbaneo</option>
                <option value="role_change">Cambio de rol</option>
                <option value="security">Seguridad</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Severidad
              </label>
              <select
                value={filters.severity}
                onChange={(e) =>
                  applyFilters({ ...filters, severity: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">Todas las severidades</option>
                <option value="low">Baja</option>
                <option value="medium">Media</option>
                <option value="high">Alta</option>
                <option value="critical">Crítica</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Período
              </label>
              <select
                value={filters.dateRange}
                onChange={(e) =>
                  applyFilters({ ...filters, dateRange: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="1d">Último día</option>
                <option value="7d">Últimos 7 días</option>
                <option value="30d">Últimos 30 días</option>
                <option value="90d">Últimos 90 días</option>
                <option value="all">Todo el período</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Usuario
              </label>
              <input
                type="text"
                placeholder="Filtrar por usuario..."
                value={filters.user}
                onChange={(e) =>
                  applyFilters({ ...filters, user: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4 border-t border-gray-200 dark:border-gray-600">
              <button
                onClick={() => {
                  const resetFilters = {
                    actionType: "all",
                    severity: "all",
                    dateRange: "7d",
                    user: "",
                  };
                  applyFilters(resetFilters);
                }}
                className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              >
                Limpiar
              </button>
              <button
                onClick={() => setShowFilters(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
              >
                Aplicar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// 📊 Main Audit Tab Component
const AuditTab: React.FC = () => {
  const { users } = useUsersContext();
  const { users: usersList, isLoading } = users;
  const [searchTerm, setSearchTerm] = useState("");
  const [currentFilters, setCurrentFilters] = useState({});
  const [selectedEntry, setSelectedEntry] = useState<AuditEntry | null>(null);

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
      <TabTransition>
        <div className="p-6 space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-6"></div>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg"
                ></div>
              ))}
            </div>
          </div>
        </div>
      </TabTransition>
    );
  }

  return (
    <TabTransition>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center space-x-3">
              <FileText className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
              <span>Auditoría del Sistema</span>
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Registro completo de actividades y cambios del sistema (
              {auditEntries.length} entradas)
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
              <RefreshCw className="w-4 h-4" />
              <span>Actualizar</span>
            </button>

            <AuditFilters onFilterChange={setCurrentFilters} />

            <button className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
              <Download className="w-4 h-4" />
              <span>Exportar Log</span>
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar en auditoría..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

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
      </div>
    </TabTransition>
  );
};

export default AuditTab;
