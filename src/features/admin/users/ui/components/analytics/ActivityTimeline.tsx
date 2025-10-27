/**
 * 📊 ACTIVITY TIMELINE COMPONENT
 * ===============================
 *
 * Timeline display for recent user activities
 * Extracted from AnalyticsTab for reusability
 *
 * FEATURES:
 * - Activity feed with icons
 * - Color-coded activity types
 * - Scrollable timeline
 * - Dark mode support
 *
 * Created: 2025-01-27 - Extracted from AnalyticsTab
 */

"use client";

import React from "react";
import { cn } from "@/shared/utils";
import { getActivityIcon, getActivityColor, ActivityType } from "./activityConfig";

/**
 * Activity Item Interface
 */
export interface ActivityItem {
  time: string;
  action: string;
  user: string;
  type: ActivityType;
}

/**
 * ActivityTimeline Props Interface
 */
export interface ActivityTimelineProps {
  activities: ActivityItem[];
}

/**
 * ActivityTimeline Component
 *
 * Displays a timeline of recent activities
 *
 * @example
 * <ActivityTimeline
 *   activities={[
 *     { time: "2 min ago", action: "registered", user: "John", type: "registration" }
 *   ]}
 * />
 */
export const ActivityTimeline: React.FC<ActivityTimelineProps> = React.memo(
  ({ activities }) => {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          Actividad Reciente
        </h3>

        <div className="space-y-4 max-h-80 overflow-y-auto">
          {activities.map((activity, index) => (
            <div
              key={index}
              className={cn(
                "flex items-start space-x-3 p-3 rounded-lg border",
                getActivityColor(activity.type)
              )}
            >
              <div className="flex-shrink-0 mt-1">
                {getActivityIcon(activity.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900 dark:text-white">
                  <span className="font-medium">{activity.user}</span>{" "}
                  {activity.action}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {activity.time}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
);

ActivityTimeline.displayName = "ActivityTimeline";
