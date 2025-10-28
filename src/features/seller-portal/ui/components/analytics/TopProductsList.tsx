/**
 * 🏆 TOP PRODUCTS LIST COMPONENT
 * ===============================
 *
 * Displays top selling products
 *
 * Created: 2025-01-27
 */

"use client";

import React from "react";
import { formatCurrency } from "../../../utils/analytics.helpers";

export interface TopProduct {
  productId: string;
  productName: string;
  sku: string;
  revenue: number;
  quantitySold: number;
}

export interface TopProductsListProps {
  /** Top products data */
  products: TopProduct[];
}

/**
 * TopProductsList - Displays ranked list of top selling products
 */
export const TopProductsList: React.FC<TopProductsListProps> = React.memo(
  ({ products }) => {
    if (!products || products.length === 0) {
      return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Productos Más Vendidos
          </h3>
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            Sin productos vendidos
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Productos Más Vendidos
        </h3>
        <div className="space-y-3">
          {products.map((product, index) => (
            <div
              key={product.productId}
              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full font-bold text-sm">
                  #{index + 1}
                </div>
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {product.productName}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    SKU: {product.sku}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-gray-900 dark:text-white">
                  {formatCurrency(product.revenue)}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {product.quantitySold} vendidos
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
);

TopProductsList.displayName = "TopProductsList";
