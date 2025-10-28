/**
 * 🎁 DISCOUNT ANALYTICS COMPONENT
 * ================================
 *
 * Shows discount and promotion usage statistics
 *
 * Created: 2025-01-27
 */

"use client";

import React from "react";
import { formatCurrency } from "../../../utils/analytics.helpers";

export interface DiscountData {
  totalDiscounts: number;
  discountedOrders: number;
  averageDiscount: number;
  topPromotion?: {
    name: string;
    usageCount: number;
    totalDiscount: number;
  };
  topCoupon?: {
    code: string;
    usageCount: number;
    totalDiscount: number;
  };
}

export interface DiscountAnalyticsProps {
  /** Discount analytics data */
  data: DiscountData | null;
}

/**
 * DiscountAnalytics - Displays discount usage and top performers
 */
export const DiscountAnalytics: React.FC<DiscountAnalyticsProps> = React.memo(
  ({ data }) => {
    if (!data) {
      return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Análisis de Descuentos
          </h3>
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            Sin datos de descuentos
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Análisis de Descuentos
        </h3>
        <div className="space-y-4">
          {/* Total Discounts */}
          <div className="flex items-center justify-between p-4 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
            <div>
              <div className="text-sm text-purple-600 dark:text-purple-400 font-medium">
                Total Descuentos
              </div>
              <div className="text-2xl font-bold text-purple-900 dark:text-purple-200">
                {formatCurrency(data.totalDiscounts)}
              </div>
            </div>
            <div className="text-4xl">🎁</div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-xs text-gray-600 dark:text-gray-300">
                Órdenes con Descuento
              </div>
              <div className="text-xl font-bold text-gray-900 dark:text-white">
                {data.discountedOrders}
              </div>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-xs text-gray-600 dark:text-gray-300">
                Descuento Promedio
              </div>
              <div className="text-xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(data.averageDiscount)}
              </div>
            </div>
          </div>

          {/* Top Promotion */}
          {data.topPromotion && (
            <div className="p-3 border border-green-200 dark:border-green-700 bg-green-50 dark:bg-green-900/30 rounded-lg">
              <div className="text-xs text-green-600 dark:text-green-400 font-medium mb-1">
                Top Promoción
              </div>
              <div className="text-sm font-bold text-gray-900 dark:text-white">
                {data.topPromotion.name}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-300">
                {data.topPromotion.usageCount} usos -{" "}
                {formatCurrency(data.topPromotion.totalDiscount)}
              </div>
            </div>
          )}

          {/* Top Coupon */}
          {data.topCoupon && (
            <div className="p-3 border border-blue-200 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
              <div className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-1">
                Top Cupón
              </div>
              <div className="font-mono text-sm font-bold text-gray-900 dark:text-white">
                {data.topCoupon.code}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-300">
                {data.topCoupon.usageCount} usos -{" "}
                {formatCurrency(data.topCoupon.totalDiscount)}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
);

DiscountAnalytics.displayName = "DiscountAnalytics";
