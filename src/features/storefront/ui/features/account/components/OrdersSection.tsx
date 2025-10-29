/**
 * 🛍️ ORDERS SECTION
 * =================
 *
 * Component for displaying and managing user orders
 */

"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Calendar, ShoppingBag } from "lucide-react";
import { useAuth } from "@/shared/hooks/useAuth";
import {
  useOrder,
  useCancelOrder,
  type OrderSummary,
} from "@/features/storefront/orders";
import { useCartActions } from "@/features/storefront/cart";
import { OrderDetailsModal } from "../../orders";
import {
  formatPrice,
  getOrderStatusColor,
  getOrderStatusLabel,
} from "../utils/formatters";

interface OrdersSectionProps {
  orders: OrderSummary[];
  allowAnimations: boolean;
}

export const OrdersSection: React.FC<OrdersSectionProps> = ({
  orders,
  allowAnimations,
}) => {
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const { addToCart } = useCartActions();
  const { user } = useAuth();
  const cancelOrderMutation = useCancelOrder();

  // Fetch full order details when an order is selected
  const { data: orderDetails, isLoading: isLoadingDetails } = useOrder(
    selectedOrderId || "",
    user?.id || "",
    !!selectedOrderId && !!user?.id
  );

  const handleCancelOrder = async (orderId: string) => {
    try {
      if (!user?.id) return;
      await cancelOrderMutation.mutateAsync({
        orderId,
        userId: user.id,
      });
      setSelectedOrderId(null);
    } catch (error) {
      console.error("Error cancelling order:", error);
      throw error;
    }
  };

  const handleRepeatOrder = async (orderId: string) => {
    try {
      if (!orderDetails) return;

      // Add all items from the order to the cart
      for (const item of orderDetails.items) {
        await addToCart(item.productId, item.quantity);
      }

      setSelectedOrderId(null);
      alert("Productos agregados al carrito!");
    } catch (error) {
      console.error("Error repeating order:", error);
      throw error;
    }
  };

  return (
    <>
      <div
        className={cn(
          "space-y-6",
          allowAnimations && "animate-customerFadeInUp"
        )}
      >
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  Historial de Pedidos
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Consulta el estado de tus pedidos y tracking
                </p>
              </div>
            </div>
          </div>

          {orders.length === 0 ? (
            <div className="p-12 text-center">
              <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                No tienes pedidos aún
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Cuando realices tu primera compra, aparecerá aquí
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                          Pedido {order.number}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {new Date(order.placedAt).toLocaleDateString(
                            "es-ES",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            }
                          )}
                        </p>
                      </div>
                      <span
                        className={cn(
                          "px-3 py-1 rounded-full text-xs font-semibold",
                          getOrderStatusColor(order.status)
                        )}
                      >
                        {getOrderStatusLabel(order.status)}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                        {formatPrice(order.total)}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {order.itemCount} artículo
                        {order.itemCount > 1 || order.itemCount === 0
                          ? "s"
                          : ""}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                        {order.estimatedDelivery && (
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>
                              Estimado:{" "}
                              {new Date(
                                order.estimatedDelivery
                              ).toLocaleDateString("es-ES")}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <button
                        onClick={() => setSelectedOrderId(order.id)}
                        className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
                      >
                        Ver Detalles
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Order Details Modal */}
      <OrderDetailsModal
        order={orderDetails || null}
        isOpen={!!selectedOrderId}
        onClose={() => setSelectedOrderId(null)}
        onCancelOrder={handleCancelOrder}
        onRepeatOrder={handleRepeatOrder}
      />
    </>
  );
};
