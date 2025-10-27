/**
 * 🥧 PRODUCTS BY CATEGORY CHART COMPONENT
 * =========================================
 *
 * Pie chart showing product distribution by category
 * Extracted from ReportsTab for maintainability
 *
 * Created: 2025-01-27 - Extracted from ReportsTab
 */

"use client";

import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useQuery } from "@tanstack/react-query";
import { getProductsByCategoryAction } from "../../../actions";
import { CHART_COLORS, TOOLTIP_STYLES } from "./chartConfig";
import { ChartLoadingSpinner } from "./ChartLoadingSpinner";

export const ProductsByCategoryChart: React.FC = React.memo(() => {
  const { data, isLoading } = useQuery({
    queryKey: ["inventory", "reports", "by-category"],
    queryFn: async () => {
      const result = await getProductsByCategoryAction();
      return result.success ? result.data || [] : [];
    },
    staleTime: 60000,
  });

  if (isLoading) {
    return <ChartLoadingSpinner />;
  }

  return (
    <ResponsiveContainer width="100%" height={320}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ categoryName, productCount }) =>
            `${categoryName}: ${productCount}`
          }
          outerRadius={100}
          fill="#8884d8"
          dataKey="productCount"
        >
          {data?.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={CHART_COLORS[index % CHART_COLORS.length]}
            />
          ))}
        </Pie>
        <Tooltip {...TOOLTIP_STYLES} />
      </PieChart>
    </ResponsiveContainer>
  );
});

ProductsByCategoryChart.displayName = "ProductsByCategoryChart";
