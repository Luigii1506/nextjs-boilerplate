/**
 * 📦 CARRIER PERFORMANCE COMPONENT
 * ==================================
 *
 * Display carrier performance statistics
 *
 * Created: 2025-01-27
 */

"use client";

import React from "react";
import { TrendingUp } from "lucide-react";
import {
  getSuccessRateColor,
  getSuccessRateBarColor,
} from "../../../utils/tracking.helpers";

export interface CarrierStats {
  name: string;
  logo: string;
  successRate: number;
  total: number;
  delivered: number;
}

export interface CarrierPerformanceProps {
  carriers: CarrierStats[];
}

/**
 * CarrierPerformance - Displays carrier performance with progress bars
 */
export const CarrierPerformance: React.FC<CarrierPerformanceProps> = React.memo(
  ({ carriers }) => {
    if (carriers.length === 0) {
      return null;
    }

    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Performance por Paquetería
          </h3>
        </div>
        <div className="space-y-4">
          {carriers.map((carrier) => (
            <div key={carrier.name} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{carrier.logo}</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {carrier.name}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    {carrier.delivered}/{carrier.total} entregas
                  </span>
                  <span className={`font-semibold ${getSuccessRateColor(carrier.successRate)}`}>
                    {carrier.successRate.toFixed(0)}%
                  </span>
                </div>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${getSuccessRateBarColor(carrier.successRate)}`}
                  style={{ width: `${carrier.successRate}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
);

CarrierPerformance.displayName = "CarrierPerformance";
