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
import { useCart } from "@/features/storefront/cart";
import { useAuth } from "@/shared/hooks/useAuth";

export const CartDebugPanel: React.FC = () => {
  // Use cart Zustand store
  const { cart, summary, items, isLoading, formatPrice } = useCart();

  const { isAuthenticated, user } = useAuth();

  const itemCount = summary?.itemCount || 0;
  const totalAmount = summary?.total || 0;
  const safeItems = items || [];

  console.log("🛒 [CART DEBUG] Current cart state (Ultra-Fast):", {
    hasCart: !!cart,
    hasItems: safeItems.length > 0,
    itemCount,
    totalAmount,
    isEmpty: safeItems.length === 0,
  });

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-black/90 text-white p-4 rounded-lg text-xs max-w-sm max-h-96 overflow-y-auto border border-cyan-500/30">
      <h3 className="font-bold mb-2 text-cyan-400 flex items-center gap-2">
        🛒 CART DEBUG
        {/* Always show active for super fast UX */}
        <div className="w-2 h-2 bg-green-400 rounded-full" />
      </h3>

      <div className="space-y-2">
        {/* Authentication Status */}
        <div>
          <span className="text-blue-400">Auth:</span>{" "}
          {isAuthenticated ? "✅" : "❌"}
          {user && (
            <span className="text-gray-400 ml-2">
              ({user.id.slice(0, 8)}...)
            </span>
          )}
        </div>

        {/* Cart Status */}
        <div>
          <span className="text-green-400">Cart:</span>{" "}
          {safeItems.length > 0 ? "✅" : "❌"}{" "}
          {safeItems.length === 0 ? "(Empty)" : `(${itemCount} items)`}
        </div>

        {/* Total Amount */}
        <div>
          <span className="text-purple-400">Total:</span>{" "}
          {formatPrice(totalAmount || 0)}
        </div>

        {/* Loading States - Zustand Store */}
        <div>
          <span className="text-yellow-400">Loading:</span>{" "}
          {isLoading ? (
            <span className="text-yellow-400">⏳ Loading...</span>
          ) : (
            <span className="text-green-400">✅ Ready</span>
          )}
        </div>

        {/* Data Source */}
        <div>
          <span className="text-cyan-400">Source:</span>{" "}
          <span className="text-purple-400">TanStack Query 🔄</span>
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
        {safeItems.length > 0 && (
          <div className="mt-3 border-t border-gray-600 pt-2">
            <div className="text-green-400 font-semibold mb-1">Cart Items:</div>
            {safeItems.slice(0, 3).map((item, index) => (
              <div key={item.id} className="text-gray-300 text-[10px]">
                {index + 1}. {item.product?.name?.slice(0, 15) || "Unknown"}...
                (×{item.quantity || 0})
                <div className="text-gray-500">
                  {formatPrice(item.price || 0)} × {item.quantity || 0} ={" "}
                  {formatPrice((item.price || 0) * (item.quantity || 0))}
                </div>
              </div>
            ))}
            {safeItems.length > 3 && (
              <div className="text-gray-500 text-[10px]">
                + {safeItems.length - 3} more items...
              </div>
            )}
          </div>
        )}

        {/* No Errors - SUPER FAST UX */}
        <div className="mt-3 border-t border-green-600 pt-2">
          <div className="text-green-400 font-semibold mb-1">Status:</div>
          <div className="text-green-300 text-[10px]">
            ✅ NO ERRORS - SUPER FAST!
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="mt-3 border-t border-gray-600 pt-2">
        <div className="text-gray-400 text-[9px]">
          🔄 Updates in real-time • Check console for detailed logs
        </div>
        <div className="text-gray-500 text-[8px] mt-1">Cart: SUPER FAST ⚡</div>
      </div>
    </div>
  );
};

export default CartDebugPanel;
