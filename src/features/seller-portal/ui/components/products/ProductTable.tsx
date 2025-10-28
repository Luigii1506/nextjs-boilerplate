/**
 * 📋 PRODUCT TABLE COMPONENT
 * ===========================
 *
 * Table displaying products with visibility and channel controls
 *
 * Created: 2025-01-27
 */

"use client";

import React from "react";
import { ProductVisibility, SalesChannel } from "../../../types";
import type { ProductQuickView } from "../../../types";
import { getStockColorClass, formatPrice } from "../../../utils/products.helpers";

export interface ProductTableProps {
  products: ProductQuickView[];
  onVisibilityChange: (
    product: ProductQuickView,
    visibility: ProductVisibility
  ) => void;
  onChannelToggle: (product: ProductQuickView, channel: SalesChannel) => void;
  onToggleActive: (product: ProductQuickView) => void;
  isUpdatingVisibility?: boolean;
  isTogglingActive?: boolean;
}

/**
 * ProductTable - Displays products with inline controls
 */
export const ProductTable: React.FC<ProductTableProps> = React.memo(
  ({
    products,
    onVisibilityChange,
    onChannelToggle,
    onToggleActive,
    isUpdatingVisibility = false,
    isTogglingActive = false,
  }) => {
    if (products.length === 0) {
      return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
          <div className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
            No se encontraron productos
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Producto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  SKU
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Precio
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Visibilidad
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Canales
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Estado
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {products.map((product) => (
                <tr
                  key={product.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700 dark:bg-gray-800"
                >
                  {/* Product Info */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {product.image && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={product.image}
                          alt={product.name}
                          className="h-10 w-10 rounded object-cover mr-3"
                        />
                      )}
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {product.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {product.categoryName}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* SKU */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-mono text-gray-900 dark:text-white">
                      {product.sku}
                    </div>
                  </td>

                  {/* Price */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {formatPrice(
                        product.publicPrice ?? product.price
                      )}
                    </div>
                    {product.salePrice && (
                      <div className="text-xs text-red-600 dark:text-red-400">
                        Oferta: {formatPrice(product.salePrice)}
                      </div>
                    )}
                  </td>

                  {/* Stock */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm ${getStockColorClass(product.stock)}`}>
                      {product.stock}
                    </div>
                  </td>

                  {/* Visibility Selector */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={product.visibility}
                      onChange={(e) =>
                        onVisibilityChange(
                          product,
                          e.target.value as ProductVisibility
                        )
                      }
                      className="text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      disabled={isUpdatingVisibility}
                    >
                      <option value={ProductVisibility.PUBLIC}>
                        👁️ Público
                      </option>
                      <option value={ProductVisibility.HIDDEN}>
                        🔒 Oculto
                      </option>
                      <option value={ProductVisibility.INTERNAL}>
                        🔧 Interno
                      </option>
                      <option value={ProductVisibility.COMING_SOON}>
                        ⏰ Próximamente
                      </option>
                      <option value={ProductVisibility.DISCONTINUED}>
                        ⛔ Descontinuado
                      </option>
                    </select>
                  </td>

                  {/* Channel Toggles */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          onChannelToggle(product, "ONLINE" as SalesChannel)
                        }
                        disabled={isUpdatingVisibility}
                        className={`px-2 py-1 text-xs rounded border ${
                          product.availableChannels.includes(
                            "ONLINE" as SalesChannel
                          )
                            ? "bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300"
                            : "bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400"
                        }`}
                      >
                        🌐 Online
                      </button>
                      <button
                        onClick={() =>
                          onChannelToggle(product, "POS" as SalesChannel)
                        }
                        disabled={isUpdatingVisibility}
                        className={`px-2 py-1 text-xs rounded border ${
                          product.availableChannels.includes(
                            "POS" as SalesChannel
                          )
                            ? "bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700 text-green-700 dark:text-green-300"
                            : "bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400"
                        }`}
                      >
                        🏪 POS
                      </button>
                    </div>
                  </td>

                  {/* Active Status Toggle */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => onToggleActive(product)}
                      disabled={isTogglingActive}
                      className={`px-3 py-1 text-xs rounded-full font-medium ${
                        product.isActive
                          ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                          : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                      }`}
                    >
                      {product.isActive ? "✓ Activo" : "✗ Inactivo"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }
);

ProductTable.displayName = "ProductTable";
