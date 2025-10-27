/**
 * 📈 STOCK MOVEMENTS CHART COMPONENT
 * ====================================
 *
 * Area chart showing stock movements (IN/OUT) over time
 * Extracted from ReportsTab for maintainability
 *
 * FEATURES:
 * - Displays stock entries and exits as area charts
 * - Time-based data with configurable date range
 * - Dark mode compatible colors
 * - Gradient fills for visual appeal
 * - Loading state with spinner
 *
 * Created: 2025-01-27 - Extracted from ReportsTab
 */

"use client";

import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useQuery } from "@tanstack/react-query";
import { getStockMovementsByDateAction } from "../../../actions";
import { COLORS, TOOLTIP_STYLES } from "./chartConfig";
import { ChartLoadingSpinner } from "./ChartLoadingSpinner";

/**
 * StockMovementsChart component props
 */
export interface StockMovementsChartProps {
  /** Number of days to display */
  days: number;
}

/**
 * StockMovementsChart Component
 *
 * Displays stock movements (entries and exits) over a time period
 *
 * @param days - Number of days to display in the chart
 *
 * @example
 * <StockMovementsChart days={30} />
 */
export const StockMovementsChart: React.FC<StockMovementsChartProps> = React.memo(
  ({ days }) => {
    const { data, isLoading } = useQuery({
      queryKey: ["inventory", "reports", "movements", days],
      queryFn: async () => {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        const result = await getStockMovementsByDateAction(startDate, endDate);
        return result.success ? result.data || [] : [];
      },
      staleTime: 60000, // 1 minute
    });

    if (isLoading) {
      return <ChartLoadingSpinner />;
    }

    return (
      <ResponsiveContainer width="100%" height={320}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorIN" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={COLORS.success} stopOpacity={0.8} />
              <stop offset="95%" stopColor={COLORS.success} stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorOUT" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={COLORS.danger} stopOpacity={0.8} />
              <stop offset="95%" stopColor={COLORS.danger} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            className="stroke-gray-200 dark:stroke-gray-700"
          />
          <XAxis
            dataKey="date"
            className="text-xs text-gray-600 dark:text-gray-400"
            tick={{ fill: "currentColor" }}
          />
          <YAxis
            className="text-xs text-gray-600 dark:text-gray-400"
            tick={{ fill: "currentColor" }}
          />
          <Tooltip {...TOOLTIP_STYLES} />
          <Legend />
          <Area
            type="monotone"
            dataKey="IN"
            stroke={COLORS.success}
            fillOpacity={1}
            fill="url(#colorIN)"
            name="Entradas"
          />
          <Area
            type="monotone"
            dataKey="OUT"
            stroke={COLORS.danger}
            fillOpacity={1}
            fill="url(#colorOUT)"
            name="Salidas"
          />
        </AreaChart>
      </ResponsiveContainer>
    );
  }
);

StockMovementsChart.displayName = "StockMovementsChart";
