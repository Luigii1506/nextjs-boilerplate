/**
 * ⚙️ ACTIVITY CONFIGURATION
 * =========================
 *
 * Configuration for activity types in analytics
 * Extracted from AnalyticsTab for maintainability
 *
 * FEATURES:
 * - Activity type icons
 * - Activity type colors
 * - Type-safe configuration
 *
 * Created: 2025-01-27 - Analytics Components Extraction
 */

import React from "react";
import {
  UserPlus,
  Activity,
  Shield,
  AlertTriangle,
  Clock,
} from "lucide-react";

/**
 * Activity Type
 */
export type ActivityType = "registration" | "login" | "admin_action" | "ban";

/**
 * Get activity icon based on type
 *
 * @param type - Activity type
 * @returns React icon element
 */
export const getActivityIcon = (type: ActivityType | string): React.ReactElement => {
  switch (type) {
    case "registration":
      return <UserPlus className="w-4 h-4 text-green-500" />;
    case "login":
      return <Activity className="w-4 h-4 text-blue-500" />;
    case "admin_action":
      return <Shield className="w-4 h-4 text-purple-500" />;
    case "ban":
      return <AlertTriangle className="w-4 h-4 text-red-500" />;
    default:
      return <Clock className="w-4 h-4 text-gray-500" />;
  }
};

/**
 * Get activity color classes based on type
 *
 * @param type - Activity type
 * @returns Tailwind classes string
 */
export const getActivityColor = (type: ActivityType | string): string => {
  switch (type) {
    case "registration":
      return "border-green-200 dark:border-green-700 bg-green-50 dark:bg-green-900/20";
    case "login":
      return "border-blue-200 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20";
    case "admin_action":
      return "border-purple-200 dark:border-purple-700 bg-purple-50 dark:bg-purple-900/20";
    case "ban":
      return "border-red-200 dark:border-red-700 bg-red-50 dark:bg-red-900/20";
    default:
      return "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800";
  }
};
