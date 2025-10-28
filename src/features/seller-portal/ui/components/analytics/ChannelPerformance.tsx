/**
 * 💳 CHANNEL PERFORMANCE COMPONENT
 * =================================
 *
 * Shows revenue breakdown by payment method/channel
 *
 * Created: 2025-01-27
 */

"use client";

import React from "react";
import { getChannelIcon, getChannelColor, formatCurrency } from "../../../utils/analytics.helpers";

export interface ChannelData {
  channel: string;
  revenue: number;
  orders: number;
  percentage: number;
}

export interface ChannelPerformanceProps {
  /** Channel revenue data */
  data: ChannelData[];
}

/**
 * ChannelPerformance - Displays revenue by payment method
 */
export const ChannelPerformance: React.FC<ChannelPerformanceProps> = React.memo(
  ({ data }) => {
    if (!data || data.length === 0) {
      return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Ventas por Método de Pago
          </h3>
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            Sin datos de canales
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Ventas por Método de Pago
        </h3>
        <div className="space-y-4">
          {data.map((channel) => (
            <div key={channel.channel}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{getChannelIcon(channel.channel)}</span>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    {channel.channel}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-gray-900 dark:text-white">
                    {formatCurrency(channel.revenue)}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {channel.orders} órdenes
                  </div>
                </div>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className={`${getChannelColor(channel.channel)} h-2 rounded-full`}
                  style={{ width: `${channel.percentage}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
);

ChannelPerformance.displayName = "ChannelPerformance";
