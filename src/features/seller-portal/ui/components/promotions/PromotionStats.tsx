/**
 * 📊 PROMOTION STATS COMPONENT
 * ==============================
 *
 * Displays promotion statistics cards
 *
 * Created: 2025-01-27
 */

"use client";

import React from "react";

export interface PromotionStatsData {
  active: number;
  scheduled: number;
  expired: number;
  total: number;
}

export interface PromotionStatsProps {
  stats: PromotionStatsData | undefined;
}

/**
 * PromotionStats - Displays stats cards for promotions
 */
export const PromotionStats: React.FC<PromotionStatsProps> = React.memo(
  ({ stats }) => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <div className="text-sm text-green-600 dark:text-green-400 font-medium">
            Activas
          </div>
          <div className="text-2xl font-bold text-green-700 dark:text-green-200">
            {stats?.active ?? 0}
          </div>
        </div>
        <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <div className="text-sm text-yellow-600 dark:text-yellow-400 font-medium">
            Programadas
          </div>
          <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-200">
            {stats?.scheduled ?? 0}
          </div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4">
          <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
            Expiradas
          </div>
          <div className="text-2xl font-bold text-gray-700 dark:text-gray-200">
            {stats?.expired ?? 0}
          </div>
        </div>
        <div className="bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
          <div className="text-sm text-purple-600 dark:text-purple-400 font-medium">
            Total
          </div>
          <div className="text-2xl font-bold text-purple-700 dark:text-purple-200">
            {stats?.total ?? 0}
          </div>
        </div>
      </div>
    );
  }
);

PromotionStats.displayName = "PromotionStats";
