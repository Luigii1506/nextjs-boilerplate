/**
 * 📊 SIMPLE BAR CHART COMPONENT
 * ==============================
 *
 * Simple horizontal bar chart for analytics visualization
 * Extracted from AnalyticsTab for reusability
 *
 * FEATURES:
 * - Horizontal bar chart
 * - Animated bars
 * - Value labels
 * - Dark mode support
 *
 * Created: 2025-01-27 - Extracted from AnalyticsTab
 */

"use client";

import React from "react";
import { cn } from "@/shared/utils";

/**
 * Chart Data Item Interface
 */
export interface ChartDataItem {
  label: string;
  value: number;
  color: string;
}

/**
 * SimpleBarChart Props Interface
 */
export interface SimpleBarChartProps {
  title: string;
  data: ChartDataItem[];
}

/**
 * SimpleBarChart Component
 *
 * Displays a simple horizontal bar chart
 *
 * @example
 * <SimpleBarChart
 *   title="User Growth"
 *   data={[
 *     { label: "Mon", value: 10, color: "bg-blue-500" },
 *     { label: "Tue", value: 15, color: "bg-blue-500" }
 *   ]}
 * />
 */
export const SimpleBarChart: React.FC<SimpleBarChartProps> = React.memo(
  ({ title, data }) => {
    const maxValue = Math.max(...data.map((item) => item.value));

    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          {title}
        </h3>

        <div className="space-y-4">
          {data.map((item, index) => (
            <div key={index} className="flex items-center space-x-4">
              <div className="w-20 text-sm text-gray-600 dark:text-gray-400">
                {item.label}
              </div>
              <div className="flex-1">
                <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-6 relative overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-500",
                      item.color
                    )}
                    style={{ width: `${(item.value / maxValue) * 100}%` }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {item.value}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
);

SimpleBarChart.displayName = "SimpleBarChart";
