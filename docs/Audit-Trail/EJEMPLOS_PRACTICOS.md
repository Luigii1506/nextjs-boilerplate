# 💡 AUDIT TRAIL - EJEMPLOS PRÁCTICOS

## 📋 Índice

1. [🎯 Casos de Uso Comunes](#-casos-de-uso-comunes)
2. [🔄 Integración con Módulos Existentes](#-integración-con-módulos-existentes)
3. [📊 Dashboards Personalizados](#-dashboards-personalizados)
4. [🔍 Búsquedas Avanzadas](#-búsquedas-avanzadas)
5. [📤 Exportación y Reportes](#-exportación-y-reportes)
6. [🛡️ Seguridad y Compliance](#️-seguridad-y-compliance)
7. [⚡ Optimización de Performance](#-optimización-de-performance)

---

## 🎯 Casos de Uso Comunes

### 📝 **1. Auditoría de Gestión de Usuarios**

```typescript
// hooks/useUserAudit.ts
import { useAuditCapture } from "@/features/audit";

export function useUserAudit() {
  const { logCreate, logUpdate, logDelete } = useAuditCapture();

  const auditUserCreation = async (user: User, createdBy: string) => {
    await logCreate("user", user.id, user.name, {
      description: `Usuario ${user.name} creado por ${createdBy}`,
      severity: "medium",
      metadata: {
        email: user.email,
        role: user.role,
        createdBy,
        source: "admin_panel",
      },
    });
  };

  const auditRoleChange = async (
    userId: string,
    userName: string,
    oldRole: string,
    newRole: string,
    changedBy: string
  ) => {
    await logUpdate("user", userId, userName, {
      description: `Rol cambiado de ${oldRole} a ${newRole}`,
      severity: "critical", // Cambios de rol son críticos
      changes: [
        {
          field: "role",
          fieldLabel: "Rol del Usuario",
          oldValue: oldRole,
          newValue: newRole,
        },
      ],
      metadata: {
        changedBy,
        previousRole: oldRole,
        newRole,
        timestamp: new Date().toISOString(),
      },
    });
  };

  const auditUserDeletion = async (
    userId: string,
    userName: string,
    userEmail: string,
    deletedBy: string,
    reason: string
  ) => {
    await logDelete("user", userId, userName, {
      description: `Usuario ${userName} eliminado permanentemente`,
      severity: "critical",
      metadata: {
        deletedBy,
        reason,
        userEmail,
        deletionTimestamp: new Date().toISOString(),
        recoverable: false,
      },
    });
  };

  return {
    auditUserCreation,
    auditRoleChange,
    auditUserDeletion,
  };
}
```

### 🎛️ **2. Auditoría de Feature Flags**

```typescript
// features/feature-flags/hooks/useFeatureFlagAudit.ts
import { useAuditCapture } from "@/features/audit";

export function useFeatureFlagAudit() {
  const { logUpdate } = useAuditCapture();

  const auditFeatureFlagToggle = async (
    flagKey: string,
    flagName: string,
    oldState: boolean,
    newState: boolean,
    toggledBy: string
  ) => {
    await logUpdate("feature_flag", flagKey, flagName, {
      description: `Feature flag '${flagName}' ${
        newState ? "habilitado" : "deshabilitado"
      }`,
      severity: "high", // Feature flags afectan funcionalidad
      changes: [
        {
          field: "enabled",
          fieldLabel: "Estado",
          oldValue: oldState ? "Habilitado" : "Deshabilitado",
          newValue: newState ? "Habilitado" : "Deshabilitado",
        },
      ],
      metadata: {
        toggledBy,
        flagKey,
        previousState: oldState,
        newState,
        affectedUsers: "all", // Este flag afecta a todos los usuarios
        rollbackPossible: true,
      },
    });
  };

  const auditBulkFeatureFlagUpdate = async (
    updates: Array<{
      key: string;
      name: string;
      oldState: boolean;
      newState: boolean;
    }>,
    updatedBy: string
  ) => {
    // Crear un evento por cada flag actualizado
    for (const update of updates) {
      await auditFeatureFlagToggle(
        update.key,
        update.name,
        update.oldState,
        update.newState,
        updatedBy
      );
    }

    // Crear evento de resumen para la operación bulk
    await logUpdate("feature_flag", "bulk_update", "Actualización Masiva", {
      description: `Actualización masiva de ${updates.length} feature flags`,
      severity: "critical",
      metadata: {
        updatedBy,
        flagCount: updates.length,
        flags: updates.map((u) => ({
          key: u.key,
          name: u.name,
          changed: u.oldState !== u.newState,
        })),
        operationType: "bulk_update",
      },
    });
  };

  return {
    auditFeatureFlagToggle,
    auditBulkFeatureFlagUpdate,
  };
}
```

### 📁 **3. Auditoría de Subida de Archivos**

```typescript
// features/file-upload/hooks/useFileUploadAudit.ts
import { useAuditCapture } from "@/features/audit";

export function useFileUploadAudit() {
  const { logCreate, logDelete } = useAuditCapture();

  const auditFileUpload = async (
    file: UploadedFile,
    uploadedBy: string,
    uploadContext: string
  ) => {
    await logCreate("upload", file.id, file.originalName, {
      description: `Archivo '${file.originalName}' subido`,
      severity: "medium",
      metadata: {
        uploadedBy,
        fileName: file.originalName,
        fileSize: file.size,
        fileType: file.mimeType,
        uploadContext, // "profile_picture", "document", etc.
        storageLocation: file.path,
        isPublic: file.isPublic,
        uploadTimestamp: new Date().toISOString(),
      },
    });
  };

  const auditFileDownload = async (
    fileId: string,
    fileName: string,
    downloadedBy: string,
    downloadContext: string
  ) => {
    await logUpdate("upload", fileId, fileName, {
      description: `Archivo '${fileName}' descargado`,
      severity: "low",
      metadata: {
        downloadedBy,
        fileName,
        downloadContext,
        downloadTimestamp: new Date().toISOString(),
        action: "download",
      },
    });
  };

  const auditFileDeletion = async (
    fileId: string,
    fileName: string,
    deletedBy: string,
    reason: string
  ) => {
    await logDelete("upload", fileId, fileName, {
      description: `Archivo '${fileName}' eliminado`,
      severity: "high",
      metadata: {
        deletedBy,
        fileName,
        reason,
        deletionTimestamp: new Date().toISOString(),
        recoverable: false,
      },
    });
  };

  return {
    auditFileUpload,
    auditFileDownload,
    auditFileDeletion,
  };
}
```

---

## 🔄 Integración con Módulos Existentes

### 👥 **Integración con Users Module**

```typescript
// features/admin/users/hooks/useUsersWithAudit.ts
import { useUsers } from "./useUsers";
import { useUserAudit } from "@/hooks/useUserAudit";

export function useUsersWithAudit() {
  const users = useUsers();
  const audit = useUserAudit();

  const createUserWithAudit = async (userData: CreateUserData) => {
    try {
      // Crear usuario usando el hook existente
      const result = await users.createUser(userData);

      if (result.success) {
        // Auditar la creación
        await audit.auditUserCreation(
          result.data,
          "admin_panel" // O obtener del contexto actual
        );
      }

      return result;
    } catch (error) {
      console.error("Error creating user with audit:", error);
      throw error;
    }
  };

  const updateUserRoleWithAudit = async (userId: string, newRole: string) => {
    try {
      // Obtener datos actuales para comparación
      const currentUser = users.users.find((u) => u.id === userId);
      if (!currentUser) throw new Error("Usuario no encontrado");

      // Actualizar rol
      const result = await users.updateUserRole(userId, newRole);

      if (result.success) {
        // Auditar el cambio de rol
        await audit.auditRoleChange(
          userId,
          currentUser.name,
          currentUser.role,
          newRole,
          "admin_panel"
        );
      }

      return result;
    } catch (error) {
      console.error("Error updating user role with audit:", error);
      throw error;
    }
  };

  const deleteUserWithAudit = async (
    userId: string,
    reason: string = "Eliminación administrativa"
  ) => {
    try {
      // Obtener datos del usuario antes de eliminar
      const userToDelete = users.users.find((u) => u.id === userId);
      if (!userToDelete) throw new Error("Usuario no encontrado");

      // Eliminar usuario
      const result = await users.deleteUser(userId);

      if (result.success) {
        // Auditar la eliminación
        await audit.auditUserDeletion(
          userId,
          userToDelete.name,
          userToDelete.email,
          "admin_panel",
          reason
        );
      }

      return result;
    } catch (error) {
      console.error("Error deleting user with audit:", error);
      throw error;
    }
  };

  return {
    ...users,
    createUserWithAudit,
    updateUserRoleWithAudit,
    deleteUserWithAudit,
  };
}
```

### 🎛️ **Integración con Feature Flags**

```typescript
// features/feature-flags/hooks/useFeatureFlagsWithAudit.ts
import { useFeatureFlags } from "./useFeatureFlags";
import { useFeatureFlagAudit } from "./useFeatureFlagAudit";

export function useFeatureFlagsWithAudit() {
  const featureFlags = useFeatureFlags();
  const audit = useFeatureFlagAudit();

  const toggleFlagWithAudit = async (flagKey: string) => {
    try {
      // Obtener estado actual
      const currentFlag = featureFlags.flags.find((f) => f.key === flagKey);
      if (!currentFlag) throw new Error("Feature flag no encontrado");

      const oldState = currentFlag.enabled;

      // Toggle del flag
      const result = await featureFlags.toggleFlag(flagKey);

      if (result.success) {
        // Auditar el cambio
        await audit.auditFeatureFlagToggle(
          flagKey,
          currentFlag.name,
          oldState,
          !oldState,
          "admin_panel"
        );
      }

      return result;
    } catch (error) {
      console.error("Error toggling flag with audit:", error);
      throw error;
    }
  };

  const batchUpdateFlagsWithAudit = async (
    updates: Array<{ key: string; enabled: boolean }>
  ) => {
    try {
      // Obtener estados actuales
      const currentStates = updates.map((update) => {
        const flag = featureFlags.flags.find((f) => f.key === update.key);
        return {
          key: update.key,
          name: flag?.name || update.key,
          oldState: flag?.enabled || false,
          newState: update.enabled,
        };
      });

      // Ejecutar updates
      const result = await featureFlags.batchUpdateFlags(updates);

      if (result.success) {
        // Auditar los cambios
        await audit.auditBulkFeatureFlagUpdate(currentStates, "admin_panel");
      }

      return result;
    } catch (error) {
      console.error("Error batch updating flags with audit:", error);
      throw error;
    }
  };

  return {
    ...featureFlags,
    toggleFlagWithAudit,
    batchUpdateFlagsWithAudit,
  };
}
```

---

## 📊 Dashboards Personalizados

### 🎯 **Dashboard de Seguridad**

```typescript
// components/SecurityAuditDashboard.tsx
"use client";

import {
  useAuditTrail,
  useAuditStats,
  useAuditFilters,
} from "@/features/audit";
import { useEffect, useState } from "react";

export default function SecurityAuditDashboard() {
  const { stats, refresh: refreshStats } = useAuditStats();
  const { events, loadEvents } = useAuditTrail();
  const { updateFilter, resetFilters } = useAuditFilters();

  const [securityMetrics, setSecurityMetrics] = useState({
    criticalEvents: 0,
    failedLogins: 0,
    roleChanges: 0,
    suspiciousActivity: 0,
  });

  // Cargar eventos de seguridad críticos
  useEffect(() => {
    resetFilters();
    updateFilter("severity", "critical");
    updateFilter("dateFrom", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)); // Últimos 7 días
    loadEvents();
  }, []);

  // Calcular métricas de seguridad
  useEffect(() => {
    if (stats) {
      const criticalEvents = stats.bySeverity.critical || 0;
      const roleChanges = stats.byAction.role_change || 0;

      setSecurityMetrics({
        criticalEvents,
        failedLogins: 0, // Implementar conteo de logins fallidos
        roleChanges,
        suspiciousActivity: criticalEvents + roleChanges,
      });
    }
  }, [stats]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-red-600">
        🛡️ Dashboard de Seguridad
      </h1>

      {/* Métricas de Seguridad */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-red-600">
                Eventos Críticos
              </p>
              <p className="text-2xl font-bold text-red-900">
                {securityMetrics.criticalEvents}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Shield className="w-5 h-5 text-orange-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-orange-600">
                Cambios de Rol
              </p>
              <p className="text-2xl font-bold text-orange-900">
                {securityMetrics.roleChanges}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-yellow-600">
                Actividad Sospechosa
              </p>
              <p className="text-2xl font-bold text-yellow-900">
                {securityMetrics.suspiciousActivity}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Eye className="w-5 h-5 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-blue-600">
                Total Monitoreado
              </p>
              <p className="text-2xl font-bold text-blue-900">
                {stats?.totalEvents || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Eventos Críticos Recientes */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold mb-4">
          🚨 Eventos Críticos Recientes
        </h2>

        <div className="space-y-3">
          {events
            .filter((event) => event.severity === "critical")
            .slice(0, 10)
            .map((event) => (
              <div
                key={event.id}
                className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded"
              >
                <div className="flex-1">
                  <div className="font-medium text-red-900">
                    {event.action.toUpperCase()} - {event.resource}
                  </div>
                  <div className="text-sm text-red-700">
                    {event.description}
                  </div>
                  <div className="text-xs text-red-600">
                    {event.userName} • {event.createdAt.toLocaleString()}
                  </div>
                </div>

                <div className="ml-4">
                  <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                    CRÍTICO
                  </span>
                </div>
              </div>
            ))}
        </div>

        {events.filter((e) => e.severity === "critical").length === 0 && (
          <div className="text-center py-8 text-gray-500">
            ✅ No hay eventos críticos recientes
          </div>
        )}
      </div>

      {/* Acciones Rápidas */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold mb-4">
          ⚡ Acciones Rápidas de Seguridad
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => {
              updateFilter("action", "login");
              updateFilter("severity", "high");
              loadEvents();
            }}
            className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left"
          >
            <div className="font-medium">Revisar Logins Sospechosos</div>
            <div className="text-sm text-gray-600">
              Logins con alta severidad
            </div>
          </button>

          <button
            onClick={() => {
              updateFilter("action", "role_change");
              loadEvents();
            }}
            className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left"
          >
            <div className="font-medium">Cambios de Permisos</div>
            <div className="text-sm text-gray-600">
              Todos los cambios de rol
            </div>
          </button>

          <button
            onClick={() => {
              updateFilter("action", "delete");
              updateFilter("severity", "critical");
              loadEvents();
            }}
            className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left"
          >
            <div className="font-medium">Eliminaciones Críticas</div>
            <div className="text-sm text-gray-600">
              Eliminaciones de alta importancia
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
```

### 📈 **Dashboard de Actividad de Usuario**

```typescript
// components/UserActivityDashboard.tsx
"use client";

import { useAuditTrail, useAuditFilters } from "@/features/audit";
import { useState, useEffect } from "react";

interface UserActivityDashboardProps {
  userId?: string;
  userName?: string;
}

export default function UserActivityDashboard({
  userId,
  userName,
}: UserActivityDashboardProps) {
  const { events, loadEvents, isLoading } = useAuditTrail();
  const { updateFilter, resetFilters } = useAuditFilters();

  const [activitySummary, setActivitySummary] = useState({
    totalActions: 0,
    lastActivity: null as Date | null,
    mostCommonAction: "",
    activityByDay: {} as Record<string, number>,
  });

  // Cargar actividad del usuario
  useEffect(() => {
    if (userId) {
      resetFilters();
      updateFilter("userId", userId);
      updateFilter("dateFrom", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)); // Últimos 30 días
      loadEvents();
    }
  }, [userId]);

  // Calcular resumen de actividad
  useEffect(() => {
    if (events.length > 0) {
      const actionCounts = events.reduce((acc, event) => {
        acc[event.action] = (acc[event.action] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const mostCommonAction =
        Object.entries(actionCounts).sort(([, a], [, b]) => b - a)[0]?.[0] ||
        "";

      const activityByDay = events.reduce((acc, event) => {
        const day = event.createdAt.toISOString().split("T")[0];
        acc[day] = (acc[day] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      setActivitySummary({
        totalActions: events.length,
        lastActivity: events[0]?.createdAt || null,
        mostCommonAction,
        activityByDay,
      });
    }
  }, [events]);

  if (isLoading) {
    return <div className="p-6">Cargando actividad del usuario...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          👤 Actividad de {userName || "Usuario"}
        </h1>
        <div className="text-sm text-gray-600">Últimos 30 días</div>
      </div>

      {/* Resumen de Actividad */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="text-sm font-medium text-blue-600">
            Total Acciones
          </div>
          <div className="text-2xl font-bold text-blue-900">
            {activitySummary.totalActions}
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="text-sm font-medium text-green-600">
            Última Actividad
          </div>
          <div className="text-sm font-bold text-green-900">
            {activitySummary.lastActivity
              ? activitySummary.lastActivity.toLocaleDateString()
              : "N/A"}
          </div>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="text-sm font-medium text-purple-600">
            Acción Más Común
          </div>
          <div className="text-sm font-bold text-purple-900 capitalize">
            {activitySummary.mostCommonAction || "N/A"}
          </div>
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="text-sm font-medium text-orange-600">
            Días Activos
          </div>
          <div className="text-2xl font-bold text-orange-900">
            {Object.keys(activitySummary.activityByDay).length}
          </div>
        </div>
      </div>

      {/* Timeline de Actividad */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold mb-4">📅 Timeline de Actividad</h2>

        <div className="space-y-3 max-h-96 overflow-y-auto">
          {events.map((event) => (
            <div
              key={event.id}
              className="flex items-start space-x-3 p-3 border border-gray-100 rounded"
            >
              <div
                className={`p-2 rounded-full ${
                  event.severity === "critical"
                    ? "bg-red-100"
                    : event.severity === "high"
                    ? "bg-orange-100"
                    : event.severity === "medium"
                    ? "bg-yellow-100"
                    : "bg-blue-100"
                }`}
              >
                <Activity
                  className={`w-4 h-4 ${
                    event.severity === "critical"
                      ? "text-red-600"
                      : event.severity === "high"
                      ? "text-orange-600"
                      : event.severity === "medium"
                      ? "text-yellow-600"
                      : "text-blue-600"
                  }`}
                />
              </div>

              <div className="flex-1">
                <div className="font-medium">
                  {event.action.toUpperCase()} - {event.resource}
                </div>
                <div className="text-sm text-gray-600">{event.description}</div>
                <div className="text-xs text-gray-500">
                  {event.createdAt.toLocaleString()}
                </div>

                {event.changes.length > 0 && (
                  <div className="mt-2 text-xs">
                    <div className="font-medium text-gray-700">Cambios:</div>
                    {event.changes.map((change) => (
                      <div key={change.id} className="ml-2 text-gray-600">
                        {change.fieldLabel}: {change.oldValue} →{" "}
                        {change.newValue}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <span
                  className={`px-2 py-1 text-xs rounded-full ${
                    event.severity === "critical"
                      ? "bg-red-100 text-red-800"
                      : event.severity === "high"
                      ? "bg-orange-100 text-orange-800"
                      : event.severity === "medium"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {event.severity.toUpperCase()}
                </span>
              </div>
            </div>
          ))}
        </div>

        {events.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No hay actividad registrada para este usuario
          </div>
        )}
      </div>
    </div>
  );
}
```

---

## 🔍 Búsquedas Avanzadas

### 🎯 **Búsqueda por Patrones Complejos**

```typescript
// hooks/useAdvancedAuditSearch.ts
import { useAuditTrail, useAuditFilters } from "@/features/audit";
import { useState, useCallback } from "react";

export function useAdvancedAuditSearch() {
  const { events, loadEvents, searchEvents } = useAuditTrail();
  const { updateFilter, resetFilters } = useAuditFilters();

  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  // Búsqueda por patrones de seguridad
  const searchSecurityPatterns = useCallback(async () => {
    const patterns = [
      // Múltiples intentos de login fallidos
      {
        action: "login",
        severity: "high",
        description: "failed",
        timeWindow: 1, // hora
      },
      // Cambios de rol fuera de horario
      {
        action: "role_change",
        severity: "critical",
        timeRange: {
          start: 22, // 10 PM
          end: 6, // 6 AM
        },
      },
      // Eliminaciones masivas
      {
        action: "delete",
        count: ">5", // Más de 5 eliminaciones
        timeWindow: 0.5, // 30 minutos
      },
    ];

    // Implementar lógica de búsqueda por patrones
    // Esta es una implementación simplificada
    resetFilters();
    updateFilter("severity", "high");
    updateFilter("dateFrom", new Date(Date.now() - 24 * 60 * 60 * 1000));
    await loadEvents();

    return events.filter((event) =>
      patterns.some(
        (pattern) =>
          event.action === pattern.action && event.severity === pattern.severity
      )
    );
  }, [events, loadEvents, resetFilters, updateFilter]);

  // Búsqueda por correlación de eventos
  const searchCorrelatedEvents = useCallback(
    async (
      primaryEventId: string,
      correlationWindow: number = 30 // minutos
    ) => {
      const primaryEvent = events.find((e) => e.id === primaryEventId);
      if (!primaryEvent) return [];

      const windowStart = new Date(
        primaryEvent.createdAt.getTime() - correlationWindow * 60 * 1000
      );
      const windowEnd = new Date(
        primaryEvent.createdAt.getTime() + correlationWindow * 60 * 1000
      );

      return events.filter(
        (event) =>
          event.id !== primaryEventId &&
          event.userId === primaryEvent.userId &&
          event.createdAt >= windowStart &&
          event.createdAt <= windowEnd
      );
    },
    [events]
  );

  // Búsqueda por anomalías
  const searchAnomalies = useCallback(async () => {
    // Detectar patrones anómalos
    const userActivityCounts = events.reduce((acc, event) => {
      const hour = event.createdAt.getHours();
      const key = `${event.userId}-${hour}`;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Encontrar actividad fuera de horarios normales (11 PM - 5 AM)
    const anomalousEvents = events.filter((event) => {
      const hour = event.createdAt.getHours();
      return hour >= 23 || hour <= 5;
    });

    return anomalousEvents;
  }, [events]);

  // Búsqueda con texto natural
  const searchNaturalLanguage = useCallback(
    async (query: string) => {
      const queryLower = query.toLowerCase();

      // Mapear términos naturales a filtros
      const mappings = {
        crítico: { severity: "critical" },
        críticos: { severity: "critical" },
        peligroso: { severity: "high" },
        eliminó: { action: "delete" },
        eliminado: { action: "delete" },
        creó: { action: "create" },
        creado: { action: "create" },
        actualizó: { action: "update" },
        actualizado: { action: "update" },
        usuario: { resource: "user" },
        usuarios: { resource: "user" },
        archivo: { resource: "upload" },
        archivos: { resource: "upload" },
        hoy: { dateFrom: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        ayer: {
          dateFrom: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          dateTo: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
        semana: { dateFrom: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      };

      // Aplicar filtros basados en el texto
      resetFilters();

      Object.entries(mappings).forEach(([term, filters]) => {
        if (queryLower.includes(term)) {
          Object.entries(filters).forEach(([key, value]) => {
            updateFilter(key as any, value);
          });
        }
      });

      // Agregar a historial
      setSearchHistory((prev) => [query, ...prev.slice(0, 9)]);

      await loadEvents();
      return events;
    },
    [events, loadEvents, resetFilters, updateFilter]
  );

  return {
    searchSecurityPatterns,
    searchCorrelatedEvents,
    searchAnomalies,
    searchNaturalLanguage,
    searchHistory,
  };
}
```

### 🔍 **Componente de Búsqueda Avanzada**

```typescript
// components/AdvancedAuditSearch.tsx
"use client";

import { useState } from "react";
import { useAdvancedAuditSearch } from "@/hooks/useAdvancedAuditSearch";
import { Search, Filter, Clock, AlertTriangle } from "lucide-react";

export default function AdvancedAuditSearch() {
  const {
    searchSecurityPatterns,
    searchCorrelatedEvents,
    searchAnomalies,
    searchNaturalLanguage,
    searchHistory,
  } = useAdvancedAuditSearch();

  const [query, setQuery] = useState("");
  const [searchType, setSearchType] = useState<
    "natural" | "patterns" | "anomalies"
  >("natural");
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    setIsSearching(true);

    try {
      switch (searchType) {
        case "natural":
          await searchNaturalLanguage(query);
          break;
        case "patterns":
          await searchSecurityPatterns();
          break;
        case "anomalies":
          await searchAnomalies();
          break;
      }
    } catch (error) {
      console.error("Error en búsqueda:", error);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-lg font-semibold mb-4 flex items-center">
        <Search className="w-5 h-5 mr-2" />
        Búsqueda Avanzada de Auditoría
      </h2>

      {/* Tipo de Búsqueda */}
      <div className="mb-4">
        <div className="flex space-x-4">
          <label className="flex items-center">
            <input
              type="radio"
              value="natural"
              checked={searchType === "natural"}
              onChange={(e) => setSearchType(e.target.value as any)}
              className="mr-2"
            />
            <span>Lenguaje Natural</span>
          </label>

          <label className="flex items-center">
            <input
              type="radio"
              value="patterns"
              checked={searchType === "patterns"}
              onChange={(e) => setSearchType(e.target.value as any)}
              className="mr-2"
            />
            <span>Patrones de Seguridad</span>
          </label>

          <label className="flex items-center">
            <input
              type="radio"
              value="anomalies"
              checked={searchType === "anomalies"}
              onChange={(e) => setSearchType(e.target.value as any)}
              className="mr-2"
            />
            <span>Detección de Anomalías</span>
          </label>
        </div>
      </div>

      {/* Campo de Búsqueda */}
      {searchType === "natural" && (
        <div className="mb-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ej: 'eventos críticos de usuarios hoy', 'eliminaciones peligrosas esta semana'"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            />
          </div>

          {/* Ejemplos de Búsqueda */}
          <div className="mt-2 text-sm text-gray-600">
            <div className="font-medium">Ejemplos:</div>
            <div className="space-y-1">
              <div>"eventos críticos hoy"</div>
              <div>"usuarios eliminados esta semana"</div>
              <div>"cambios de rol peligrosos"</div>
            </div>
          </div>
        </div>
      )}

      {/* Botón de Búsqueda */}
      <div className="flex items-center space-x-4">
        <button
          onClick={handleSearch}
          disabled={isSearching || (searchType === "natural" && !query.trim())}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          {isSearching ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Buscando...
            </>
          ) : (
            <>
              <Search className="w-4 h-4 mr-2" />
              Buscar
            </>
          )}
        </button>

        {/* Búsquedas Rápidas */}
        <div className="flex space-x-2">
          <button
            onClick={() => searchSecurityPatterns()}
            className="px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200 flex items-center"
          >
            <AlertTriangle className="w-3 h-3 mr-1" />
            Seguridad
          </button>

          <button
            onClick={() => searchAnomalies()}
            className="px-3 py-1 bg-orange-100 text-orange-700 rounded text-sm hover:bg-orange-200 flex items-center"
          >
            <Filter className="w-3 h-3 mr-1" />
            Anomalías
          </button>
        </div>
      </div>

      {/* Historial de Búsquedas */}
      {searchHistory.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center mb-2">
            <Clock className="w-4 h-4 mr-2 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">
              Búsquedas Recientes
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {searchHistory.slice(0, 5).map((search, index) => (
              <button
                key={index}
                onClick={() => {
                  setQuery(search);
                  setSearchType("natural");
                }}
                className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200"
              >
                {search}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
```

---

## 📤 Exportación y Reportes

### 📊 **Generador de Reportes Personalizados**

```typescript
// hooks/useAuditReports.ts
import { useAuditTrail } from "@/features/audit";
import { useState } from "react";

export interface ReportConfig {
  title: string;
  description: string;
  filters: any;
  format: "csv" | "json" | "pdf";
  includeCharts: boolean;
  includeChanges: boolean;
  groupBy?: "user" | "action" | "resource" | "date";
  dateRange: {
    from: Date;
    to: Date;
  };
}

export function useAuditReports() {
  const { exportEvents } = useAuditTrail();
  const [isGenerating, setIsGenerating] = useState(false);

  const generateSecurityReport = async (): Promise<ReportConfig> => {
    return {
      title: "Reporte de Seguridad",
      description: "Eventos críticos y de alta severidad",
      filters: {
        severity: ["high", "critical"],
        action: ["role_change", "delete", "permission_change"],
      },
      format: "pdf",
      includeCharts: true,
      includeChanges: true,
      groupBy: "user",
      dateRange: {
        from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        to: new Date(),
      },
    };
  };

  const generateUserActivityReport = async (
    userId: string
  ): Promise<ReportConfig> => {
    return {
      title: `Reporte de Actividad - Usuario ${userId}`,
      description: "Actividad completa del usuario en el período seleccionado",
      filters: {
        userId,
      },
      format: "csv",
      includeCharts: false,
      includeChanges: true,
      groupBy: "date",
      dateRange: {
        from: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
        to: new Date(),
      },
    };
  };

  const generateComplianceReport = async (): Promise<ReportConfig> => {
    return {
      title: "Reporte de Cumplimiento",
      description: "Eventos requeridos para auditorías de cumplimiento",
      filters: {
        action: ["create", "update", "delete", "role_change"],
        severity: ["medium", "high", "critical"],
      },
      format: "json",
      includeCharts: true,
      includeChanges: true,
      groupBy: "resource",
      dateRange: {
        from: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
        to: new Date(),
      },
    };
  };

  const generateCustomReport = async (config: ReportConfig) => {
    setIsGenerating(true);

    try {
      // Aplicar filtros del reporte
      const result = await exportEvents({
        filters: {
          ...config.filters,
          dateFrom: config.dateRange.from,
          dateTo: config.dateRange.to,
        },
        format: config.format,
      });

      if (result.success) {
        // Procesar datos según configuración
        let processedData = result.data;

        if (config.groupBy) {
          processedData = groupEventsByField(result.data, config.groupBy);
        }

        if (config.includeCharts) {
          processedData = addChartData(processedData);
        }

        // Crear archivo de reporte
        const reportBlob = createReportFile(processedData, config);
        downloadReport(reportBlob, config);

        return {
          success: true,
          message: "Reporte generado exitosamente",
        };
      }

      return result;
    } catch (error) {
      console.error("Error generating report:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      };
    } finally {
      setIsGenerating(false);
    }
  };

  // Funciones auxiliares
  const groupEventsByField = (events: any[], field: string) => {
    return events.reduce((acc, event) => {
      const key = event[field] || "unknown";
      if (!acc[key]) acc[key] = [];
      acc[key].push(event);
      return acc;
    }, {});
  };

  const addChartData = (data: any) => {
    // Agregar datos para gráficos
    return {
      ...data,
      charts: {
        eventsByAction: calculateEventsByAction(data),
        eventsBySeverity: calculateEventsBySeverity(data),
        eventsOverTime: calculateEventsOverTime(data),
      },
    };
  };

  const createReportFile = (data: any, config: ReportConfig): Blob => {
    const reportContent = {
      metadata: {
        title: config.title,
        description: config.description,
        generatedAt: new Date().toISOString(),
        dateRange: config.dateRange,
        totalEvents: Array.isArray(data)
          ? data.length
          : Object.values(data).flat().length,
      },
      data,
      summary: generateReportSummary(data),
    };

    const content =
      config.format === "json"
        ? JSON.stringify(reportContent, null, 2)
        : convertToCSV(reportContent);

    return new Blob([content], {
      type: config.format === "json" ? "application/json" : "text/csv",
    });
  };

  const downloadReport = (blob: Blob, config: ReportConfig) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${config.title.toLowerCase().replace(/\s+/g, "-")}-${
      new Date().toISOString().split("T")[0]
    }.${config.format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const generateReportSummary = (data: any) => {
    // Generar resumen ejecutivo del reporte
    return {
      totalEvents: Array.isArray(data)
        ? data.length
        : Object.values(data).flat().length,
      criticalEvents: 0, // Calcular eventos críticos
      topUsers: [], // Top usuarios más activos
      topActions: [], // Acciones más comunes
      recommendations: [], // Recomendaciones basadas en los datos
    };
  };

  const convertToCSV = (data: any): string => {
    // Convertir datos a formato CSV
    const events = Array.isArray(data.data)
      ? data.data
      : Object.values(data.data).flat();

    const headers = [
      "Fecha",
      "Acción",
      "Recurso",
      "Usuario",
      "Severidad",
      "Descripción",
      "IP",
      "Cambios",
    ];

    const rows = events.map((event: any) => [
      event.createdAt,
      event.action,
      event.resource,
      event.userName || event.userEmail,
      event.severity,
      event.description,
      event.ipAddress,
      event.changes
        ?.map((c: any) => `${c.field}: ${c.oldValue} → ${c.newValue}`)
        .join("; "),
    ]);

    return [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell || ""}"`).join(","))
      .join("\n");
  };

  return {
    generateSecurityReport,
    generateUserActivityReport,
    generateComplianceReport,
    generateCustomReport,
    isGenerating,
  };
}
```

### 📋 **Componente Generador de Reportes**

```typescript
// components/AuditReportGenerator.tsx
"use client";

import { useState } from "react";
import { useAuditReports, ReportConfig } from "@/hooks/useAuditReports";
import { FileText, Download, Calendar, Filter, Settings } from "lucide-react";

export default function AuditReportGenerator() {
  const {
    generateSecurityReport,
    generateUserActivityReport,
    generateComplianceReport,
    generateCustomReport,
    isGenerating,
  } = useAuditReports();

  const [selectedReport, setSelectedReport] = useState<string>("");
  const [customConfig, setCustomConfig] = useState<Partial<ReportConfig>>({
    title: "",
    description: "",
    format: "csv",
    includeCharts: false,
    includeChanges: true,
    dateRange: {
      from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      to: new Date(),
    },
  });

  const predefinedReports = [
    {
      id: "security",
      name: "Reporte de Seguridad",
      description: "Eventos críticos y de alta severidad",
      icon: "🛡️",
      generator: generateSecurityReport,
    },
    {
      id: "compliance",
      name: "Reporte de Cumplimiento",
      description: "Eventos requeridos para auditorías",
      icon: "📋",
      generator: generateComplianceReport,
    },
    {
      id: "custom",
      name: "Reporte Personalizado",
      description: "Configuración personalizada",
      icon: "⚙️",
      generator: null,
    },
  ];

  const handleGenerateReport = async (reportId: string) => {
    const report = predefinedReports.find((r) => r.id === reportId);
    if (!report) return;

    if (report.generator) {
      const config = await report.generator();
      await generateCustomReport(config);
    } else if (reportId === "custom") {
      if (!customConfig.title) {
        alert("Por favor, ingresa un título para el reporte");
        return;
      }
      await generateCustomReport(customConfig as ReportConfig);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center">
          <FileText className="w-6 h-6 mr-2" />
          Generador de Reportes
        </h1>
      </div>

      {/* Reportes Predefinidos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {predefinedReports.map((report) => (
          <div
            key={report.id}
            className={`p-6 border rounded-lg cursor-pointer transition-colors ${
              selectedReport === report.id
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
            onClick={() => setSelectedReport(report.id)}
          >
            <div className="text-2xl mb-2">{report.icon}</div>
            <h3 className="font-semibold mb-2">{report.name}</h3>
            <p className="text-sm text-gray-600 mb-4">{report.description}</p>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleGenerateReport(report.id);
              }}
              disabled={isGenerating}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Generando...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Generar
                </>
              )}
            </button>
          </div>
        ))}
      </div>

      {/* Configuración de Reporte Personalizado */}
      {selectedReport === "custom" && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <Settings className="w-5 h-5 mr-2" />
            Configuración Personalizada
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Información Básica */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Título del Reporte
                </label>
                <input
                  type="text"
                  value={customConfig.title || ""}
                  onChange={(e) =>
                    setCustomConfig((prev) => ({
                      ...prev,
                      title: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej: Reporte Mensual de Actividad"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción
                </label>
                <textarea
                  value={customConfig.description || ""}
                  onChange={(e) =>
                    setCustomConfig((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Descripción del reporte..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Formato
                </label>
                <select
                  value={customConfig.format || "csv"}
                  onChange={(e) =>
                    setCustomConfig((prev) => ({
                      ...prev,
                      format: e.target.value as "csv" | "json",
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="csv">CSV</option>
                  <option value="json">JSON</option>
                </select>
              </div>
            </div>

            {/* Opciones Avanzadas */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rango de Fechas
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    value={
                      customConfig.dateRange?.from.toISOString().split("T")[0]
                    }
                    onChange={(e) =>
                      setCustomConfig((prev) => ({
                        ...prev,
                        dateRange: {
                          ...prev.dateRange!,
                          from: new Date(e.target.value),
                        },
                      }))
                    }
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="date"
                    value={
                      customConfig.dateRange?.to.toISOString().split("T")[0]
                    }
                    onChange={(e) =>
                      setCustomConfig((prev) => ({
                        ...prev,
                        dateRange: {
                          ...prev.dateRange!,
                          to: new Date(e.target.value),
                        },
                      }))
                    }
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={customConfig.includeCharts || false}
                    onChange={(e) =>
                      setCustomConfig((prev) => ({
                        ...prev,
                        includeCharts: e.target.checked,
                      }))
                    }
                    className="mr-2"
                  />
                  <span className="text-sm">
                    Incluir gráficos y estadísticas
                  </span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={customConfig.includeChanges || false}
                    onChange={(e) =>
                      setCustomConfig((prev) => ({
                        ...prev,
                        includeChanges: e.target.checked,
                      }))
                    }
                    className="mr-2"
                  />
                  <span className="text-sm">Incluir detalles de cambios</span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Agrupar por
                </label>
                <select
                  value={customConfig.groupBy || ""}
                  onChange={(e) =>
                    setCustomConfig((prev) => ({
                      ...prev,
                      groupBy: e.target.value as any,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Sin agrupar</option>
                  <option value="user">Usuario</option>
                  <option value="action">Acción</option>
                  <option value="resource">Recurso</option>
                  <option value="date">Fecha</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Historial de Reportes */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center">
          <Calendar className="w-5 h-5 mr-2" />
          Reportes Recientes
        </h2>

        <div className="text-center py-8 text-gray-500">
          <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>No hay reportes generados recientemente</p>
          <p className="text-sm">Los reportes generados aparecerán aquí</p>
        </div>
      </div>
    </div>
  );
}
```

---

Esta documentación completa del módulo de Audit Trail incluye:

✅ **Introducción y características**  
✅ **Arquitectura detallada**  
✅ **Instalación paso a paso**  
✅ **Estructura de datos completa**  
✅ **API de Server Actions**  
✅ **Hooks de React con ejemplos**  
✅ **Componentes UI reutilizables**  
✅ **Ejemplos prácticos reales**  
✅ **Integración con módulos existentes**  
✅ **Dashboards personalizados**  
✅ **Búsquedas avanzadas**  
✅ **Sistema de reportes**  
✅ **Configuración avanzada**  
✅ **Troubleshooting**

¿Te gustaría que agregue alguna sección específica o profundice en algún aspecto particular del módulo?
