/**
 * 📊 COUPON STATS COMPONENT
 * ==========================
 *
 * Displays coupon statistics cards
 *
 * Created: 2025-01-27
 */

"use client";

import React from "react";

export interface CouponStatsData {
  active: number;
  totalUsage: number;
  expired: number;
  total: number;
}

export interface CouponStatsProps {
  stats: CouponStatsData | undefined;
}

/**
 * CouponStats - Displays key coupon metrics
 */
export const CouponStats: React.FC<CouponStatsProps> = React.memo(
  ({ stats }) => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <div className="text-sm text-green-600 dark:text-green-400 font-medium">
            Activos
          </div>
          <div className="text-2xl font-bold text-green-700 dark:text-green-200">
            {stats?.active ?? 0}
          </div>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="text-sm text-blue-600 font-medium">Usos Totales</div>
          <div className="text-2xl font-bold text-blue-700">
            {stats?.totalUsage ?? 0}
          </div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4">
          <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
            Expirados
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

CouponStats.displayName = "CouponStats";
