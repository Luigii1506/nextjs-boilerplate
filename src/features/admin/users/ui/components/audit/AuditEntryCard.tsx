/**
 * 📋 AUDIT ENTRY CARD COMPONENT
 * ==============================
 *
 * Displays audit log entry with expandable details
 * Extracted from AuditTab for maintainability
 *
 * FEATURES:
 * - Expandable card with details
 * - Action type icon and color
 * - Severity badge
 * - User and target information
 * - IP address and user agent display
 * - Metadata JSON display
 * - Dark mode support
 *
 * Created: 2025-01-27 - Extracted from AuditTab
 */

"use client";

import React, { useState } from "react";
import { Eye, Clock, User, Activity, ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/shared/utils";
import { getActionTypeInfo, getSeverityColor, AuditActionType, AuditSeverity } from "./auditConfig";

/**
 * Audit Entry Interface
 */
export interface AuditEntry {
  id: string;
  timestamp: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  action: string;
  actionType: AuditActionType;
  target?: {
    id: string;
    name: string;
    email: string;
  };
  details: string;
  severity: AuditSeverity;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
}

/**
 * AuditEntryCard Props Interface
 */
export interface AuditEntryCardProps {
  entry: AuditEntry;
  onViewDetails: (entry: AuditEntry) => void;
}

/**
 * AuditEntryCard Component
 *
 * Displays an audit entry with expandable details
 *
 * @example
 * <AuditEntryCard
 *   entry={auditEntry}
 *   onViewDetails={handleViewDetails}
 * />
 */
export const AuditEntryCard: React.FC<AuditEntryCardProps> = React.memo(
  ({ entry, onViewDetails }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const actionInfo = getActionTypeInfo(entry.actionType);

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
  }
);

AuditEntryCard.displayName = "AuditEntryCard";
