/**
 * 🏆 TOP PRODUCTS CHART COMPONENT
 * =================================
 *
 * Horizontal bar chart showing top products by total value
 * Extracted from ReportsTab for maintainability
 *
 * Created: 2025-01-27 - Extracted from ReportsTab
 */

"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useQuery } from "@tanstack/react-query";
import { getTopProductsByValueAction } from "../../../actions";
import { COLORS, TOOLTIP_STYLES } from "./chartConfig";
import { ChartLoadingSpinner } from "./ChartLoadingSpinner";

export const TopProductsChart: React.FC = React.memo(() => {
  const { data, isLoading } = useQuery({
    queryKey: ["inventory", "reports", "top-products"],
    queryFn: async () => {
      const result = await getTopProductsByValueAction(10);
      return result.success ? result.data || [] : [];
    },
    staleTime: 60000,
  });

  if (isLoading) {
    return <ChartLoadingSpinner />;
  }

  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={data} layout="vertical">
        <CartesianGrid
          strokeDasharray="3 3"
          className="stroke-gray-200 dark:stroke-gray-700"
        />
        <XAxis
          type="number"
          className="text-xs text-gray-600 dark:text-gray-400"
          tick={{ fill: "currentColor" }}
          tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
        />
        <YAxis
          dataKey="name"
          type="category"
          width={150}
          className="text-xs text-gray-600 dark:text-gray-400"
          tick={{ fill: "currentColor" }}
        />
        <Tooltip
          {...TOOLTIP_STYLES}
          formatter={(value: number) => `$${value.toLocaleString()}`}
        />
        <Bar
          dataKey="totalValue"
          fill={COLORS.primary}
          radius={[0, 4, 4, 0]}
          name="Valor Total"
        />
      </BarChart>
    </ResponsiveContainer>
  );
});

TopProductsChart.displayName = "TopProductsChart";
