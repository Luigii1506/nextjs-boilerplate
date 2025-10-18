/**
 * 📋 AUDIT EVENT DETAILS MODAL
 * ============================
 *
 * Modal para mostrar detalles completos de un evento de auditoría
 * incluyendo cambios, metadata y contexto
 *
 * Created: 2025-01-18 - Audit Event Details Modal
 */

"use client";

import React from "react";
import {
  BaseModal,
  BaseModalActions,
  BaseModalButton,
} from "@/shared/ui/components/BaseModal";
import {
  Activity,
  User,
  Calendar,
  Globe,
  Smartphone,
  AlertCircle,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Code,
  FileText,
} from "lucide-react";
import { cn } from "@/shared/utils";
import type { AuditEvent } from "../../../types";

interface AuditEventDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: AuditEvent | null;
}

/**
 * 🎨 Severity Icon Component
 */
const SeverityIcon: React.FC<{ severity: string }> = ({ severity }) => {
  const icons = {
    critical: <XCircle className="w-5 h-5 text-red-500" />,
    high: <AlertCircle className="w-5 h-5 text-orange-500" />,
    medium: <AlertTriangle className="w-5 h-5 text-yellow-500" />,
    low: <CheckCircle className="w-5 h-5 text-blue-500" />,
  };

  return icons[severity as keyof typeof icons] || icons.low;
};

/**
 * 📝 Change Item Component
 */
const ChangeItem: React.FC<{ change: any }> = ({ change }) => {
  return (
    <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-2">
        <span className="font-medium text-gray-900 dark:text-gray-100">
          {change.fieldLabel || change.field}
        </span>
        <span
          className={cn(
            "px-2 py-0.5 rounded text-xs font-medium",
            change.type === "added" &&
              "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400",
            change.type === "modified" &&
              "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400",
            change.type === "removed" &&
              "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
          )}
        >
          {change.type === "added" && "Agregado"}
          {change.type === "modified" && "Modificado"}
          {change.type === "removed" && "Eliminado"}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
            Valor Anterior
          </p>
          <code className="text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 px-2 py-1 rounded border border-gray-200 dark:border-gray-700 block truncate">
            {change.oldValue !== undefined && change.oldValue !== null
              ? String(change.oldValue)
              : "-"}
          </code>
        </div>
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
            Valor Nuevo
          </p>
          <code className="text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 px-2 py-1 rounded border border-gray-200 dark:border-gray-700 block truncate">
            {change.newValue !== undefined && change.newValue !== null
              ? String(change.newValue)
              : "-"}
          </code>
        </div>
      </div>
    </div>
  );
};

/**
 * 🎯 Main Modal Component
 */
export function AuditEventDetailsModal({
  isOpen,
  onClose,
  event,
}: AuditEventDetailsModalProps) {
  if (!event) return null;

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Detalles del Evento de Auditoría"
      description={`ID: ${event.id}`}
      icon={<Activity className="w-6 h-6 text-white" />}
      maxWidth="3xl"
      actions={
        <BaseModalActions align="right">
          <BaseModalButton onClick={onClose} variant="secondary">
            Cerrar
          </BaseModalButton>
        </BaseModalActions>
      }
    >
      <div className="space-y-6">
        {/* Event Summary */}
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-white dark:bg-gray-800 rounded-lg">
              <SeverityIcon severity={event.severity} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-3 py-1 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-full">
                  {event.action}
                </span>
                <span className="px-3 py-1 bg-white dark:bg-gray-800 text-blue-700 dark:text-blue-400 text-sm font-medium rounded-full">
                  {event.resource}
                </span>
              </div>
              <p className="text-gray-900 dark:text-gray-100 font-medium">
                {event.description || `${event.action} on ${event.resource}`}
              </p>
              {event.resourceName && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Recurso: {event.resourceName} ({event.resourceId})
                </p>
              )}
            </div>
          </div>
        </div>

        {/* User Information */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
            <User className="w-5 h-5 text-blue-500" />
            Información del Usuario
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                Email
              </p>
              <p className="font-medium text-gray-900 dark:text-gray-100">
                {event.userEmail}
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                Rol
              </p>
              <p className="font-medium text-gray-900 dark:text-gray-100">
                {event.userRole}
              </p>
            </div>
            {event.userName && (
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                  Nombre
                </p>
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  {event.userName}
                </p>
              </div>
            )}
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                ID Usuario
              </p>
              <code className="text-sm font-mono text-gray-700 dark:text-gray-300">
                {event.userId}
              </code>
            </div>
          </div>
        </div>

        {/* Timestamp & Context */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-green-500" />
            Contexto Temporal y Técnico
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                Fecha y Hora
              </p>
              <p className="font-medium text-gray-900 dark:text-gray-100">
                {new Date(event.createdAt).toLocaleString()}
              </p>
            </div>
            {event.ipAddress && (
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
                  <Globe className="w-3 h-3" />
                  Dirección IP
                </p>
                <code className="text-sm font-mono text-gray-700 dark:text-gray-300">
                  {event.ipAddress}
                </code>
              </div>
            )}
            {event.userAgent && (
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 md:col-span-2">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
                  <Smartphone className="w-3 h-3" />
                  User Agent
                </p>
                <code className="text-xs font-mono text-gray-700 dark:text-gray-300 break-all">
                  {event.userAgent}
                </code>
              </div>
            )}
          </div>
        </div>

        {/* Changes */}
        {event.changes && event.changes.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
              <Code className="w-5 h-5 text-purple-500" />
              Cambios Realizados ({event.changes.length})
            </h3>
            <div className="space-y-3">
              {event.changes.map((change, index) => (
                <ChangeItem key={index} change={change} />
              ))}
            </div>
          </div>
        )}

        {/* Metadata */}
        {event.metadata && Object.keys(event.metadata).length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
              <FileText className="w-5 h-5 text-orange-500" />
              Metadata Adicional
            </h3>
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <pre className="text-sm text-gray-700 dark:text-gray-300 overflow-x-auto">
                {JSON.stringify(event.metadata, null, 2)}
              </pre>
            </div>
          </div>
        )}

        {/* Event IDs */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            <span className="font-medium">Event ID:</span>{" "}
            <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
              {event.id}
            </code>
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            <span className="font-medium">Resource ID:</span>{" "}
            <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
              {event.resourceId}
            </code>
          </p>
        </div>
      </div>
    </BaseModal>
  );
}

export default AuditEventDetailsModal;
