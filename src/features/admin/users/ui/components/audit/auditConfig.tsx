/**
 * ⚙️ AUDIT CONFIGURATION
 * ======================
 *
 * Configuration for audit entry types and severity levels
 * Extracted from AuditTab for maintainability
 *
 * FEATURES:
 * - Action type info (icons, colors)
 * - Severity color mapping
 * - Type-safe configuration
 *
 * Created: 2025-01-27 - Audit Components Extraction
 */

import React from "react";
import {
  UserPlus,
  Edit,
  Trash2,
  Unlock,
  Lock,
  XCircle,
  CheckCircle,
  Shield,
  AlertTriangle,
  Activity,
} from "lucide-react";

/**
 * Action Type for Audit Entries
 */
export type AuditActionType =
  | "create"
  | "update"
  | "delete"
  | "login"
  | "logout"
  | "ban"
  | "unban"
  | "role_change"
  | "security";

/**
 * Severity Level for Audit Entries
 */
export type AuditSeverity = "low" | "medium" | "high" | "critical";

/**
 * Action Type Info Interface
 */
export interface ActionTypeInfo {
  icon: React.ReactElement;
  color: string;
  bgColor: string;
  borderColor: string;
}

/**
 * Get action type info (icon, colors)
 *
 * @param actionType - Audit action type
 * @returns ActionTypeInfo object
 */
export const getActionTypeInfo = (
  actionType: AuditActionType
): ActionTypeInfo => {
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

/**
 * Get severity color classes
 *
 * @param severity - Audit severity level
 * @returns Tailwind classes string
 */
export const getSeverityColor = (severity: AuditSeverity): string => {
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
