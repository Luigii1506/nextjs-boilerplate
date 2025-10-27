/**
 * 💰 INVENTORY VALUE CHART COMPONENT
 * ====================================
 *
 * Line chart showing inventory value over time (cost vs retail)
 * Extracted from ReportsTab for maintainability
 *
 * Created: 2025-01-27 - Extracted from ReportsTab
 */

"use client";

import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useQuery } from "@tanstack/react-query";
import { getInventoryValueOverTimeAction } from "../../../actions";
import { COLORS, TOOLTIP_STYLES } from "./chartConfig";
import { ChartLoadingSpinner } from "./ChartLoadingSpinner";

export interface InventoryValueChartProps {
  days: number;
}

export const InventoryValueChart: React.FC<InventoryValueChartProps> = React.memo(
  ({ days }) => {
    const { data, isLoading } = useQuery({
      queryKey: ["inventory", "reports", "value", days],
      queryFn: async () => {
        const result = await getInventoryValueOverTimeAction(days);
        return result.success ? result.data || [] : [];
      },
      staleTime: 60000,
    });

    if (isLoading) {
      return <ChartLoadingSpinner />;
    }

    return (
      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={data}>
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
            tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
          />
          <Tooltip
            {...TOOLTIP_STYLES}
            formatter={(value: number) => `$${value.toLocaleString()}`}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="totalValue"
            stroke={COLORS.primary}
            strokeWidth={2}
            name="Valor Costo"
            dot={{ fill: COLORS.primary, r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="totalRetailValue"
            stroke={COLORS.success}
            strokeWidth={2}
            name="Valor Venta"
            dot={{ fill: COLORS.success, r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    );
  }
);

InventoryValueChart.displayName = "InventoryValueChart";
