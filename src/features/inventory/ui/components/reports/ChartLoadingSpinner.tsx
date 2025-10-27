/**
 * 🔄 CHART LOADING SPINNER COMPONENT
 * ====================================
 *
 * Reusable loading spinner for charts
 * Used across all chart components
 *
 * Created: 2025-01-27 - Extracted from chart components
 */

"use client";

import React from "react";

/**
 * ChartLoadingSpinner Component
 *
 * Displays a loading spinner for charts
 */
export const ChartLoadingSpinner: React.FC = () => (
  <div className="h-80 flex items-center justify-center">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
  </div>
);
