/**
 * 📊 METRICS CARD COMPONENT
 * =========================
 *
 * Reusable metric card for analytics dashboard
 * Displays a single metric with icon, value, and subtitle
 *
 * Created: 2025-01-27
 */

"use client";

import React from "react";

export interface MetricsCardProps {
  /** Title of the metric */
  title: string;
  /** Main value to display */
  value: string | number;
  /** Subtitle/additional info */
  subtitle: string;
  /** Emoji icon */
  icon: string;
  /** Optional custom color for value */
  valueColor?: string;
}

/**
 * MetricsCard - Displays a single metric with icon
 */
export const MetricsCard: React.FC<MetricsCardProps> = React.memo(
  ({ title, value, subtitle, icon, valueColor = "text-gray-900 dark:text-white" }) => {
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
            {title}
          </div>
          <div className="text-2xl">{icon}</div>
        </div>
        <div className={`text-3xl font-bold ${valueColor}`}>{value}</div>
        <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {subtitle}
        </div>
      </div>
    );
  }
);

MetricsCard.displayName = "MetricsCard";
