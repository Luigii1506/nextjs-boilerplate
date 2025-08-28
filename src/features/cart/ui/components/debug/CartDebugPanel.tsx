/**
 * 🔍 CART DEBUG PANEL
 * ===================
 *
 * Panel de debug para rastrear problemas con el carrito
 * Muestra estado en tiempo real para debugging y performance
 *
 * @version 1.0.0 - Cart Feature Debug Tool
 */

"use client";

import React from "react";
import { useCartContext } from "../../../context";
import { useAuth } from "@/shared/hooks/useAuth";

export const CartDebugPanel: React.FC = () => {
  const {
    cart,
    summary,
    loading,
    errors,
    isEmpty,
    itemCount,
    totalAmount,
    isProcessing,
    formatPrice,
  } = useCartContext();

  const { isAuthenticated, user, isLoading: isAuthLoading } = useAuth();

  console.log("🛒 [CART DEBUG] Current cart state:", {
    hasCart: !!cart,
    itemCount,
    totalAmount,
    isProcessing,
    isEmpty,
  });

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-black/90 text-white p-4 rounded-lg text-xs max-w-sm max-h-96 overflow-y-auto border border-cyan-500/30">
      <h3 className="font-bold mb-2 text-cyan-400 flex items-center gap-2">
        🛒 CART DEBUG
        {isProcessing && (
          <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
        )}
      </h3>

      <div className="space-y-2">
        {/* Authentication Status */}
        <div>
          <span className="text-blue-400">Auth:</span>{" "}
          {isAuthLoading ? "⏳" : isAuthenticated ? "✅" : "❌"}
          {user && (
            <span className="text-gray-400 ml-2">
              ({user.id.slice(0, 8)}...)
            </span>
          )}
        </div>

        {/* Cart Status */}
        <div>
          <span className="text-green-400">Cart:</span> {cart ? "✅" : "❌"}{" "}
          {isEmpty ? "(Empty)" : `(${itemCount} items)`}
        </div>

        {/* Total Amount */}
        <div>
          <span className="text-purple-400">Total:</span>{" "}
          {formatPrice(totalAmount || 0)}
        </div>

        {/* Loading States */}
        <div>
          <span className="text-yellow-400">Loading:</span>{" "}
          {loading ? JSON.stringify(loading).slice(0, 30) + "..." : "None"}
        </div>

        {/* Processing Status */}
        <div>
          <span className="text-orange-400">Processing:</span>{" "}
          {isProcessing ? "🔄" : "✅"}
        </div>

        {/* Summary */}
        {summary && (
          <div className="mt-3 border-t border-gray-600 pt-2">
            <div className="text-cyan-400 font-semibold mb-1">Summary:</div>
            <div className="text-gray-300 text-[10px] space-y-1">
              <div>Items: {summary.itemCount || 0}</div>
              <div>Subtotal: {formatPrice(summary.subtotal || 0)}</div>
              <div>Tax: {formatPrice(summary.taxAmount || 0)}</div>
              <div>Shipping: {formatPrice(summary.shippingAmount || 0)}</div>
              <div>Total: {formatPrice(summary.total || 0)}</div>
            </div>
          </div>
        )}

        {/* Cart Items */}
        {cart?.items && cart.items.length > 0 && (
          <div className="mt-3 border-t border-gray-600 pt-2">
            <div className="text-green-400 font-semibold mb-1">Cart Items:</div>
            {cart.items.slice(0, 3).map((item, index) => (
              <div key={item.id} className="text-gray-300 text-[10px]">
                {index + 1}. {item.product?.name?.slice(0, 15) || "Unknown"}...
                (×{item.quantity || 0})
                <div className="text-gray-500">
                  {formatPrice(item.price || 0)} × {item.quantity || 0} ={" "}
                  {formatPrice((item.price || 0) * (item.quantity || 0))}
                </div>
              </div>
            ))}
            {cart.items.length > 3 && (
              <div className="text-gray-500 text-[10px]">
                + {cart.items.length - 3} more items...
              </div>
            )}
          </div>
        )}

        {/* Errors */}
        {errors.generalError && (
          <div className="mt-3 border-t border-red-600 pt-2">
            <div className="text-red-400 font-semibold mb-1">Error:</div>
            <div className="text-red-300 text-[10px]">
              {errors.generalError.slice(0, 50)}...
            </div>
          </div>
        )}

        {/* Action Errors */}
        {errors.actionErrors && Object.keys(errors.actionErrors).length > 0 && (
          <div className="mt-2">
            <div className="text-red-400 font-semibold mb-1">
              Action Errors:
            </div>
            {Object.entries(errors.actionErrors)
              .slice(0, 2)
              .map(([key, error]) => (
                <div key={key} className="text-red-300 text-[10px]">
                  {key}: {error?.slice(0, 20)}...
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Performance Metrics */}
      <div className="mt-3 border-t border-gray-600 pt-2">
        <div className="text-gray-400 text-[9px]">
          🔄 Updates in real-time • Check console for detailed logs
        </div>
        <div className="text-gray-500 text-[8px] mt-1">
          Cart ID: {cart?.id?.slice(0, 12)}...
        </div>
      </div>
    </div>
  );
};

export default CartDebugPanel;
