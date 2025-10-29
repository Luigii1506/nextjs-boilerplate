"use client";
/**
 * 🛒 Sale Tab
 * ===========
 *
 * Tab del carrito de venta actual.
 *
 * @module pos/ui/features/sale/SaleTab
 * @version 1.0.0
 */

import React from "react";
import { useSaleStore, useSaleItems, useSaleSummary, useItemCount, useHasItems, useCanCheckout, useSaleActions } from "../../../stores/saleStore";
import { usePOSUI } from "../../../context";
import { formatCurrency } from "../../../utils";

export const SaleTab: React.FC = () => {
  // Zustand store
  const items = useSaleItems();
  const summary = useSaleSummary();
  const isLoading = useSaleStore((state) => state.isLoading);
  const itemCount = useItemCount();
  const total = useSaleStore((state) => state.total());
  const hasItems = useHasItems();
  const canCheckout = useCanCheckout();
  const { updateQuantity, removeItem, clearSale } = useSaleActions();

  const { setActiveTab } = usePOSUI();

  const handleCheckout = () => {
    if (canCheckout) {
      setActiveTab("payment");
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6" />
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-24 bg-gray-200 dark:bg-gray-700 rounded"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!hasItems) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="text-center">
          <div className="text-6xl mb-4">🛒</div>
          <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Carrito vacío
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Agrega productos desde la pestaña de productos
          </p>
          <button
            onClick={() => setActiveTab("browse")}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            Ver productos
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Venta Actual
        </h2>
        <button
          onClick={clearSale}
          className="px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors font-medium"
        >
          Limpiar todo
        </button>
      </div>

      {/* Items List */}
      <div className="space-y-4 mb-6">
        {items.map((item) => (
          <div
            key={item.id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4"
          >
            <div className="flex items-start gap-4">
              {/* Image */}
              <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
                {item.product.imageUrl ? (
                  <img
                    src={item.product.imageUrl}
                    alt={item.product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <span className="text-2xl">📦</span>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                  {item.productName}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                  SKU: {item.productSku}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {formatCurrency(item.unitPrice)} × {item.quantity} ={" "}
                  {formatCurrency(item.total)}
                </p>
              </div>

              {/* Quantity Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  disabled={item.quantity <= 1}
                  className="w-8 h-8 flex items-center justify-center bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  −
                </button>
                <span className="w-12 text-center font-semibold text-gray-900 dark:text-gray-100">
                  {item.quantity}
                </span>
                <button
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  disabled={item.quantity >= item.product.stock}
                  className="w-8 h-8 flex items-center justify-center bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  +
                </button>
                <button
                  onClick={() => removeItem(item.id)}
                  className="ml-2 w-8 h-8 flex items-center justify-center text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                >
                  🗑️
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Resumen
        </h3>

        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-gray-600 dark:text-gray-400">
            <span>Items ({itemCount}):</span>
            <span>{formatCurrency(summary.subtotal)}</span>
          </div>

          {summary.discount > 0 && (
            <div className="flex justify-between text-red-600 dark:text-red-400">
              <span>Descuento:</span>
              <span>-{formatCurrency(summary.discount)}</span>
            </div>
          )}

          <div className="flex justify-between text-gray-600 dark:text-gray-400">
            <span>IVA ({(summary.taxRate * 100).toFixed(0)}%):</span>
            <span>{formatCurrency(summary.tax)}</span>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
            <div className="flex justify-between text-xl font-bold text-gray-900 dark:text-gray-100">
              <span>Total:</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>
        </div>

        {/* Checkout Button */}
        <button
          onClick={handleCheckout}
          disabled={!canCheckout}
          className="w-full py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors text-lg"
        >
          {canCheckout ? "Proceder al pago" : "No se puede procesar"}
        </button>
      </div>
    </div>
  );
};
