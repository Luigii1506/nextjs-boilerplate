/**
 * 🪝 USE AUDIT CAPTURE
 * ====================
 *
 * Hook para capturar eventos de auditoría manualmente.
 * Incluye helpers para acciones comunes y validación.
 */

"use client";

import { useState, useCallback } from "react";
import { createAuditEventAction } from "../server/actions";
import type {
  CreateAuditEventData,
  AuditAction,
  AuditResource,
  AuditChange,
  AuditActionResult,
  AuditEvent,
} from "../types";

// Tipo específico para metadata de auditoría
type AuditMetadata = Record<string, unknown>;

// Resultado de las operaciones de captura
interface CaptureResult {
  event: AuditEvent;
  success: boolean;
}

// Resultado de operaciones batch
interface BatchCaptureResult {
  success: boolean;
  data?: CaptureResult;
  error?: string;
}

// Interfaz completa con todos los métodos
interface ExtendedUseAuditCaptureReturn {
  // Core methods
  captureEvent: (data: CreateAuditEventData) => Promise<AuditEvent>;
  captureUserAction: (
    action: AuditAction,
    resource: AuditResource,
    resourceId: string,
    description: string,
    changes?: Omit<AuditChange, "type">[]
  ) => Promise<AuditEvent>;
  isCapturing: boolean;
  error: string | null;
  // Quick capture methods
  captureCreate: (
    resource: AuditResource,
    resourceId: string,
    resourceName: string,
    metadata?: AuditMetadata
  ) => Promise<AuditEvent>;
  captureUpdate: (
    resource: AuditResource,
    resourceId: string,
    resourceName: string,
    changes: Omit<AuditChange, "type">[],
    metadata?: AuditMetadata
  ) => Promise<AuditEvent>;
  captureDelete: (
    resource: AuditResource,
    resourceId: string,
    resourceName: string,
    metadata?: AuditMetadata
  ) => Promise<AuditEvent>;
  captureView: (
    resource: AuditResource,
    resourceId: string,
    resourceName: string,
    metadata?: AuditMetadata
  ) => Promise<AuditEvent>;
  captureLogin: (
    sessionId?: string,
    metadata?: AuditMetadata
  ) => Promise<AuditEvent>;
  captureLogout: (
    sessionId?: string,
    metadata?: AuditMetadata
  ) => Promise<AuditEvent>;
  captureExport: (
    resource: AuditResource,
    format: string,
    count: number,
    metadata?: AuditMetadata
  ) => Promise<AuditEvent>;
  captureImport: (
    resource: AuditResource,
    format: string,
    count: number,
    metadata?: AuditMetadata
  ) => Promise<AuditEvent>;
  captureBulkAction: (
    action: "bulk_update" | "bulk_delete",
    resource: AuditResource,
    resourceIds: string[],
    description?: string,
    metadata?: AuditMetadata
  ) => Promise<AuditEvent>;
  captureToggle: (
    resource: AuditResource,
    resourceId: string,
    resourceName: string,
    enabled: boolean,
    metadata?: AuditMetadata
  ) => Promise<AuditEvent>;
  // Utilities
  clearError: () => void;
  captureBatch: (
    events: CreateAuditEventData[]
  ) => Promise<BatchCaptureResult[]>;
  captureWithRetry: (
    data: CreateAuditEventData,
    maxRetries?: number,
    delay?: number
  ) => Promise<AuditEvent>;
}

export function useAuditCapture(): ExtendedUseAuditCaptureReturn {
  const [isCapturing, setIsCapturing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 📝 Capture Event
  const captureEvent = useCallback(
    async (data: CreateAuditEventData): Promise<AuditEvent> => {
      try {
        setIsCapturing(true);
        setError(null);

        const result: AuditActionResult<AuditEvent> =
          await createAuditEventAction(data);

        if (!result.success || !result.data) {
          setError(result.error || "Error al capturar evento");
          throw new Error(result.error || "Error al capturar evento");
        }

        return result.data;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Error desconocido";
        setError(errorMessage);
        console.error("[useAuditCapture] Capture error:", err);
        throw err;
      } finally {
        setIsCapturing(false);
      }
    },
    []
  );

  // 🎯 Capture User Action (Simplified)
  const captureUserAction = useCallback(
    async (
      action: AuditAction,
      resource: AuditResource,
      resourceId: string,
      description: string,
      changes?: Omit<AuditChange, "type">[]
    ): Promise<AuditEvent> => {
      const data: CreateAuditEventData = {
        action,
        resource,
        resourceId,
        description,
        severity: "medium",
        changes,
      };

      return captureEvent(data);
    },
    [captureEvent]
  );

  // 🎯 Quick Capture Methods
  const captureCreate = useCallback(
    async (
      resource: AuditResource,
      resourceId: string,
      resourceName: string,
      metadata?: AuditMetadata
    ): Promise<AuditEvent> => {
      return captureEvent({
        action: "create",
        resource,
        resourceId,
        resourceName,
        description: `Creó ${resource}: ${resourceName}`,
        severity: "medium",
        metadata,
      });
    },
    [captureEvent]
  );

  const captureUpdate = useCallback(
    async (
      resource: AuditResource,
      resourceId: string,
      resourceName: string,
      changes: Omit<AuditChange, "type">[],
      metadata?: AuditMetadata
    ): Promise<AuditEvent> => {
      return captureEvent({
        action: "update",
        resource,
        resourceId,
        resourceName,
        description: `Actualizó ${resource}: ${resourceName}`,
        severity: "medium",
        changes,
        metadata,
      });
    },
    [captureEvent]
  );

  const captureDelete = useCallback(
    async (
      resource: AuditResource,
      resourceId: string,
      resourceName: string,
      metadata?: AuditMetadata
    ): Promise<AuditEvent> => {
      return captureEvent({
        action: "delete",
        resource,
        resourceId,
        resourceName,
        description: `Eliminó ${resource}: ${resourceName}`,
        severity: "high",
        metadata,
      });
    },
    [captureEvent]
  );

  const captureView = useCallback(
    async (
      resource: AuditResource,
      resourceId: string,
      resourceName: string,
      metadata?: AuditMetadata
    ): Promise<AuditEvent> => {
      return captureEvent({
        action: "view",
        resource,
        resourceId,
        resourceName,
        description: `Vio ${resource}: ${resourceName}`,
        severity: "low",
        metadata,
      });
    },
    [captureEvent]
  );

  const captureLogin = useCallback(
    async (
      sessionId?: string,
      metadata?: AuditMetadata
    ): Promise<AuditEvent> => {
      return captureEvent({
        action: "login",
        resource: "session",
        resourceId: sessionId || `session-${Date.now()}`,
        resourceName: "User Session",
        description: "Usuario inició sesión",
        severity: "low",
        metadata,
      });
    },
    [captureEvent]
  );

  const captureLogout = useCallback(
    async (
      sessionId?: string,
      metadata?: AuditMetadata
    ): Promise<AuditEvent> => {
      return captureEvent({
        action: "logout",
        resource: "session",
        resourceId: sessionId || `session-${Date.now()}`,
        resourceName: "User Session",
        description: "Usuario cerró sesión",
        severity: "low",
        metadata,
      });
    },
    [captureEvent]
  );

  const captureExport = useCallback(
    async (
      resource: AuditResource,
      format: string,
      count: number,
      metadata?: AuditMetadata
    ): Promise<AuditEvent> => {
      return captureEvent({
        action: "export",
        resource,
        resourceId: `export-${Date.now()}`,
        resourceName: `Export ${format.toUpperCase()}`,
        description: `Exportó ${count} ${resource}s en formato ${format.toUpperCase()}`,
        severity: "medium",
        metadata: {
          format,
          count,
          ...metadata,
        },
      });
    },
    [captureEvent]
  );

  const captureImport = useCallback(
    async (
      resource: AuditResource,
      format: string,
      count: number,
      metadata?: AuditMetadata
    ): Promise<AuditEvent> => {
      return captureEvent({
        action: "import",
        resource,
        resourceId: `import-${Date.now()}`,
        resourceName: `Import ${format.toUpperCase()}`,
        description: `Importó ${count} ${resource}s desde formato ${format.toUpperCase()}`,
        severity: "medium",
        metadata: {
          format,
          count,
          ...metadata,
        },
      });
    },
    [captureEvent]
  );

  const captureBulkAction = useCallback(
    async (
      action: "bulk_update" | "bulk_delete",
      resource: AuditResource,
      resourceIds: string[],
      description?: string,
      metadata?: AuditMetadata
    ): Promise<AuditEvent> => {
      return captureEvent({
        action,
        resource,
        resourceId: "bulk-operation",
        resourceName: `${resourceIds.length} ${resource}s`,
        description:
          description || `${action} en ${resourceIds.length} ${resource}s`,
        severity: "high",
        metadata: {
          resourceIds,
          count: resourceIds.length,
          ...metadata,
        },
      });
    },
    [captureEvent]
  );

  const captureToggle = useCallback(
    async (
      resource: AuditResource,
      resourceId: string,
      resourceName: string,
      enabled: boolean,
      metadata?: AuditMetadata
    ): Promise<AuditEvent> => {
      return captureEvent({
        action: "toggle",
        resource,
        resourceId,
        resourceName,
        description: `${
          enabled ? "Activó" : "Desactivó"
        } ${resource}: ${resourceName}`,
        severity: "medium",
        metadata: {
          enabled,
          ...metadata,
        },
      });
    },
    [captureEvent]
  );

  // 🔄 Clear Error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // 🎯 Batch Capture (for multiple events)
  const captureBatch = useCallback(
    async (events: CreateAuditEventData[]): Promise<BatchCaptureResult[]> => {
      const results: BatchCaptureResult[] = [];

      for (const eventData of events) {
        try {
          const result = await captureEvent(eventData);
          results.push({
            success: true,
            data: { event: result, success: true },
          });
        } catch (err) {
          results.push({
            success: false,
            error: err instanceof Error ? err.message : "Error desconocido",
          });
        }
      }

      return results;
    },
    [captureEvent]
  );

  // 🎯 Capture with Retry
  const captureWithRetry = useCallback(
    async (
      data: CreateAuditEventData,
      maxRetries: number = 3,
      delay: number = 1000
    ): Promise<AuditEvent> => {
      let lastError: Error | null = null;

      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          return await captureEvent(data);
        } catch (err) {
          lastError =
            err instanceof Error ? err : new Error("Error desconocido");

          if (attempt < maxRetries) {
            // Wait before retry
            await new Promise((resolve) =>
              setTimeout(resolve, delay * attempt)
            );
          }
        }
      }

      throw lastError;
    },
    [captureEvent]
  );

  // 🎯 Extended return type with all methods
  return {
    captureEvent,
    captureUserAction,
    isCapturing,
    error,
    // Quick capture methods
    captureCreate,
    captureUpdate,
    captureDelete,
    captureView,
    captureLogin,
    captureLogout,
    captureExport,
    captureImport,
    captureBulkAction,
    captureToggle,
    // Utilities
    clearError,
    captureBatch,
    captureWithRetry,
  };
}
