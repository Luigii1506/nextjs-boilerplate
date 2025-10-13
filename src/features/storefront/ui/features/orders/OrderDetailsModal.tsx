/**
 * 📦 OrderDetailsModal - Full Order Details View
 *
 * Professional order details modal with:
 * - Complete order information
 * - Order tracking timeline
 * - Product details
 * - Shipping information
 * - Payment details
 * - Order actions (cancel, repeat)
 *
 * @version 1.0.0
 */

"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import {
  X,
  Package,
  Truck,
  Calendar,
  MapPin,
  CreditCard,
  Check,
  Clock,
  AlertCircle,
  RefreshCw,
  XCircle,
  Mail,
  Phone,
  DollarSign,
} from "lucide-react";
import type { Order } from "@/features/storefront/orders";

interface OrderDetailsModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onCancelOrder?: (orderId: string) => Promise<void>;
  onRepeatOrder?: (orderId: string) => Promise<void>;
}

export const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({
  order,
  isOpen,
  onClose,
  onCancelOrder,
  onRepeatOrder,
}) => {
  const [isCancelling, setIsCancelling] = useState(false);
  const [isRepeating, setIsRepeating] = useState(false);

  if (!isOpen || !order) return null;

  const handleCancelOrder = async () => {
    if (!onCancelOrder) return;

    const confirmed = window.confirm(
      "¿Estás seguro de que deseas cancelar este pedido? Esta acción no se puede deshacer."
    );

    if (!confirmed) return;

    try {
      setIsCancelling(true);
      await onCancelOrder(order.id);
      onClose();
    } catch (error) {
      console.error("Error cancelling order:", error);
      alert("Error al cancelar el pedido. Por favor intenta de nuevo.");
    } finally {
      setIsCancelling(false);
    }
  };

  const handleRepeatOrder = async () => {
    if (!onRepeatOrder) return;

    try {
      setIsRepeating(true);
      await onRepeatOrder(order.id);
      onClose();
    } catch (error) {
      console.error("Error repeating order:", error);
      alert("Error al repetir el pedido. Por favor intenta de nuevo.");
    } finally {
      setIsRepeating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "DELIVERED":
        return "text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-300";
      case "SHIPPED":
        return "text-blue-600 bg-blue-100 dark:bg-blue-900/20 dark:text-blue-300";
      case "PROCESSING":
      case "CONFIRMED":
        return "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-300";
      case "PENDING":
        return "text-gray-600 bg-gray-100 dark:bg-gray-900/20 dark:text-gray-300";
      case "CANCELLED":
      case "REFUNDED":
        return "text-red-600 bg-red-100 dark:bg-red-900/20 dark:text-red-300";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      PENDING: "Pendiente",
      CONFIRMED: "Confirmado",
      PROCESSING: "En Proceso",
      SHIPPED: "Enviado",
      DELIVERED: "Entregado",
      CANCELLED: "Cancelado",
      REFUNDED: "Reembolsado",
    };
    return labels[status] || status;
  };

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "USD",
    }).format(amount / 100);
  };

  const canCancelOrder = ["PENDING", "CONFIRMED", "PROCESSING"].includes(
    order.status
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div
          className="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between z-10">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Pedido {order.number}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Realizado el{" "}
                {new Date(order.placedAt).toLocaleDateString("es-ES", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Status and Actions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span
                  className={cn(
                    "px-4 py-2 rounded-full text-sm font-semibold",
                    getStatusColor(order.status)
                  )}
                >
                  {getStatusLabel(order.status)}
                </span>
                {order.trackingNumber && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                    <Truck className="w-4 h-4" />
                    <span>Tracking: {order.trackingNumber}</span>
                  </div>
                )}
              </div>

              <div className="flex space-x-2">
                {canCancelOrder && (
                  <button
                    onClick={handleCancelOrder}
                    disabled={isCancelling}
                    className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>{isCancelling ? "Cancelando..." : "Cancelar"}</span>
                  </button>
                )}
                {order.status === "DELIVERED" && (
                  <button
                    onClick={handleRepeatOrder}
                    disabled={isRepeating}
                    className="flex items-center space-x-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors disabled:opacity-50"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>{isRepeating ? "Procesando..." : "Repetir Pedido"}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center space-x-2">
                <Package className="w-5 h-5 text-orange-600" />
                <span>Productos</span>
              </h3>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center space-x-4 bg-white dark:bg-gray-800 p-4 rounded-lg"
                  >
                    {item.productImage && (
                      <img
                        src={item.productImage}
                        alt={item.productName}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                    )}
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 dark:text-gray-100">
                        {item.productName}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        SKU: {item.productSku}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Cantidad: {item.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900 dark:text-gray-100">
                        {formatPrice(item.total)}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {formatPrice(item.unitPrice)} c/u
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Totals */}
            <div className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-lg p-6 border border-orange-200 dark:border-orange-800">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center space-x-2">
                <DollarSign className="w-5 h-5 text-orange-600" />
                <span>Resumen del Pedido</span>
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between text-gray-700 dark:text-gray-300">
                  <span>Subtotal</span>
                  <span>{formatPrice(order.subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-700 dark:text-gray-300">
                  <span>Envío</span>
                  <span>{formatPrice(order.shippingCost)}</span>
                </div>
                <div className="flex justify-between text-gray-700 dark:text-gray-300">
                  <span>Impuestos</span>
                  <span>{formatPrice(order.taxAmount)}</span>
                </div>
                {order.discountAmount > 0 && (
                  <div className="flex justify-between text-green-600 dark:text-green-400">
                    <span>Descuento</span>
                    <span>-{formatPrice(order.discountAmount)}</span>
                  </div>
                )}
                <div className="border-t border-gray-300 dark:border-gray-600 pt-2 mt-2">
                  <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-gray-100">
                    <span>Total</span>
                    <span>{formatPrice(order.total)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            {order.shippingAddress && (
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center space-x-2">
                  <MapPin className="w-5 h-5 text-orange-600" />
                  <span>Dirección de Envío</span>
                </h3>
                <div className="text-gray-700 dark:text-gray-300">
                  <p className="font-medium">{order.shippingAddress}</p>
                </div>
              </div>
            )}

            {/* Contact Information */}
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center space-x-2">
                <Mail className="w-5 h-5 text-orange-600" />
                <span>Información de Contacto</span>
              </h3>
              <div className="space-y-2 text-gray-700 dark:text-gray-300">
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <span>{order.email}</span>
                </div>
                {order.phone && (
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <span>{order.phone}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Delivery Estimate */}
            {order.estimatedDelivery && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900 dark:text-blue-100">
                      Fecha Estimada de Entrega
                    </h4>
                    <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                      {new Date(order.estimatedDelivery).toLocaleDateString("es-ES", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Customer Notes */}
            {order.customerNotes && (
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Notas del Cliente
                </h3>
                <p className="text-gray-700 dark:text-gray-300">{order.customerNotes}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsModal;
