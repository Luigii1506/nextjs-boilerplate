/**
 * 📋 ORDER DETAIL MODAL COMPONENT
 * ================================
 *
 * Comprehensive order detail modal showing:
 * - Customer information
 * - Order items with images and expandable details
 * - Pricing breakdown
 * - Shipping information
 * - Order timeline/history
 * - Quick actions
 *
 * Created: 2025-01-17 - Professional E-commerce Enhancement
 * Updated: 2025-01-17 - Migrated to BaseModal standard
 * Updated: 2025-01-17 - Added real order items with expansion
 */

"use client";

import { useState, useEffect } from "react";
import {
  BaseModal,
  BaseModalActions,
  BaseModalButton,
} from "@/shared/ui/components/BaseModal";
import { OrderSummary, OrderDetails } from "../../../types";
import { OrderStatusBadge } from "./OrderStatusBadge";
import {
  Package,
  Truck,
  User,
  Calendar,
  Info,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
} from "lucide-react";
import { getOrderDetailsAction } from "../../../server/actions/orders.actions";

interface OrderDetailModalProps {
  order: OrderSummary | null;
  isOpen: boolean;
  onClose: () => void;
}

export function OrderDetailModal({
  order,
  isOpen,
  onClose,
}: OrderDetailModalProps) {
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  // Fetch full order details when modal opens
  useEffect(() => {
    if (isOpen && order) {
      setLoading(true);
      getOrderDetailsAction(order.id)
        .then((details) => {
          setOrderDetails(details);
        })
        .catch((error) => {
          console.error("Error fetching order details:", error);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setOrderDetails(null);
      setExpandedItems(new Set());
    }
  }, [isOpen, order]);

  const toggleItemExpansion = (itemId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  const expandAll = () => {
    if (orderDetails) {
      setExpandedItems(new Set(orderDetails.items.map((item) => item.id)));
    }
  };

  const collapseAll = () => {
    setExpandedItems(new Set());
  };

  if (!order) return null;

  const displayOrder = orderDetails || order;
  const formattedDate = new Date(displayOrder.placedAt).toLocaleString(
    "es-MX",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  );

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={`Orden ${displayOrder.number}`}
      description={formattedDate}
      icon={<Package className="w-6 h-6 text-white" />}
      maxWidth="4xl"
      isLoading={loading}
      actions={
        <BaseModalActions align="right">
          <BaseModalButton variant="secondary" onClick={onClose}>
            Cerrar
          </BaseModalButton>
          <BaseModalButton variant="primary">Actualizar Estado</BaseModalButton>
        </BaseModalActions>
      }
    >
      {/* Status Badges */}
      <div className="flex flex-wrap gap-2 mb-6">
        <OrderStatusBadge status={displayOrder.status} type="order" />
        <OrderStatusBadge status={displayOrder.paymentStatus} type="payment" />
        <OrderStatusBadge
          status={displayOrder.fulfillmentStatus}
          type="fulfillment"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Order Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Information */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Cliente
            </h3>
            <div className="space-y-2 text-sm">
              {displayOrder.customerName && (
                <div className="flex items-start">
                  <span className="font-medium text-gray-700 dark:text-gray-300 w-24">
                    Nombre:
                  </span>
                  <span className="text-gray-900 dark:text-white">
                    {displayOrder.customerName}
                  </span>
                </div>
              )}
              <div className="flex items-start">
                <span className="font-medium text-gray-700 dark:text-gray-300 w-24">
                  Email:
                </span>
                <span className="text-gray-900 dark:text-white">
                  {displayOrder.customerEmail}
                </span>
              </div>
              {orderDetails && orderDetails.phone && (
                <div className="flex items-start">
                  <span className="font-medium text-gray-700 dark:text-gray-300 w-24">
                    Teléfono:
                  </span>
                  <span className="text-gray-900 dark:text-white">
                    {orderDetails.phone}
                  </span>
                </div>
              )}
              <div className="flex items-start">
                <span className="font-medium text-gray-700 dark:text-gray-300 w-24">
                  Método:
                </span>
                <span className="text-gray-900 dark:text-white">
                  {displayOrder.paymentMethod || "Tarjeta"}
                </span>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Package className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                Artículos ({displayOrder.itemsCount})
              </h3>
              {orderDetails && orderDetails.items.length > 1 && (
                <div className="flex gap-2">
                  <button
                    onClick={expandAll}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                  >
                    Expandir Todo
                  </button>
                  <span className="text-gray-400">|</span>
                  <button
                    onClick={collapseAll}
                    className="text-xs text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 font-medium"
                  >
                    Contraer Todo
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-3">
              {loading ? (
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                  <div className="flex items-center justify-center py-4">
                    <div className="w-6 h-6 border-2 border-blue-600 dark:border-blue-400 border-t-transparent rounded-full animate-spin" />
                    <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                      Cargando artículos...
                    </span>
                  </div>
                </div>
              ) : orderDetails && orderDetails.items.length > 0 ? (
                orderDetails.items.map((item) => {
                  const isExpanded = expandedItems.has(item.id);
                  return (
                    <div
                      key={item.id}
                      className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 overflow-hidden transition-all"
                    >
                      {/* Item Header - Always Visible */}
                      <div
                        onClick={() => toggleItemExpansion(item.id)}
                        className="flex gap-3 p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                      >
                        {/* Product Image */}
                        <div className="w-16 h-16 bg-gray-200 dark:bg-gray-600 rounded-md flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {item.productImage ? (
                            <img
                              src={item.productImage}
                              alt={item.productName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <ImageIcon className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                          )}
                        </div>

                        {/* Item Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <p className="font-medium text-gray-900 dark:text-white truncate">
                                {item.productName}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                SKU: {item.productSku}
                              </p>
                            </div>
                            <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors">
                              {isExpanded ? (
                                <ChevronUp className="w-4 h-4 text-gray-400" />
                              ) : (
                                <ChevronDown className="w-4 h-4 text-gray-400" />
                              )}
                            </button>
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-sm text-gray-600 dark:text-gray-300">
                              Cantidad: {item.quantity}
                            </span>
                            <span className="text-sm font-semibold text-gray-900 dark:text-white">
                              ${item.total.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Expanded Details */}
                      {isExpanded && (
                        <div className="border-t border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 p-3 space-y-2">
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="text-gray-600 dark:text-gray-400">
                                Precio Unitario:
                              </span>
                              <p className="font-medium text-gray-900 dark:text-white">
                                ${item.unitPrice.toFixed(2)}
                              </p>
                            </div>
                            <div>
                              <span className="text-gray-600 dark:text-gray-400">
                                Total:
                              </span>
                              <p className="font-medium text-gray-900 dark:text-white">
                                ${item.total.toFixed(2)}
                              </p>
                            </div>
                          </div>
                          <div className="pt-2 border-t border-gray-200 dark:border-gray-600">
                            <span className="text-xs text-gray-600 dark:text-gray-400">
                              Product ID:
                            </span>
                            <p className="text-xs font-mono text-gray-500 dark:text-gray-500">
                              {item.productId}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
                  <div className="flex gap-3">
                    <div className="w-16 h-16 bg-gray-200 dark:bg-gray-600 rounded-md flex items-center justify-center">
                      <Package className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {displayOrder.itemsCount}{" "}
                        {displayOrder.itemsCount === 1
                          ? "artículo"
                          : "artículos"}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Cargando detalles...
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Shipping Information */}
          {displayOrder.trackingNumber && (
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <Truck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                Información de Envío
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-start">
                  <span className="font-medium text-gray-700 dark:text-gray-300 w-32">
                    Tracking:
                  </span>
                  <span className="font-mono text-blue-600 dark:text-blue-400">
                    {displayOrder.trackingNumber}
                  </span>
                </div>
                {displayOrder.shippedAt && (
                  <div className="flex items-start">
                    <span className="font-medium text-gray-700 dark:text-gray-300 w-32">
                      Enviado:
                    </span>
                    <span className="text-gray-900 dark:text-white">
                      {new Date(displayOrder.shippedAt).toLocaleDateString(
                        "es-MX",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }
                      )}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Order Timeline */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Historial
            </h3>
            <div className="space-y-3">
              {orderDetails && orderDetails.statusHistory.length > 0 ? (
                orderDetails.statusHistory.map((history, index) => (
                  <div key={history.id} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center font-bold text-xs">
                        {index + 1}
                      </div>
                      {index < orderDetails.statusHistory.length - 1 && (
                        <div className="w-0.5 h-full bg-gray-300 dark:bg-gray-600 mt-2"></div>
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {history.status}
                      </p>
                      {history.notes && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {history.notes}
                        </p>
                      )}
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        {new Date(history.createdAt).toLocaleString("es-MX")}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <>
                  <div className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center font-bold">
                        ✓
                      </div>
                      {displayOrder.shippedAt && (
                        <div className="w-0.5 h-full bg-gray-300 dark:bg-gray-600 mt-2"></div>
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <p className="font-medium text-gray-900 dark:text-white">
                        Orden Creada
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {formattedDate}
                      </p>
                    </div>
                  </div>

                  {displayOrder.shippedAt && (
                    <div className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center">
                          <Truck className="w-4 h-4" />
                        </div>
                        {displayOrder.deliveredAt && (
                          <div className="w-0.5 h-full bg-gray-300 dark:bg-gray-600 mt-2"></div>
                        )}
                      </div>
                      <div className="flex-1 pb-4">
                        <p className="font-medium text-gray-900 dark:text-white">
                          Orden Enviada
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(displayOrder.shippedAt).toLocaleString(
                            "es-MX"
                          )}
                        </p>
                      </div>
                    </div>
                  )}

                  {displayOrder.deliveredAt && (
                    <div className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center font-bold">
                          ✓✓
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white">
                          Orden Entregada
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(displayOrder.deliveredAt).toLocaleString(
                            "es-MX"
                          )}
                        </p>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Summary & Actions */}
        <div className="space-y-6">
          {/* Order Summary */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Resumen
            </h3>
            <div className="space-y-2 text-sm">
              {orderDetails && (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">
                      Subtotal:
                    </span>
                    <span className="text-gray-900 dark:text-white font-medium">
                      ${orderDetails.subtotal.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">
                      Envío:
                    </span>
                    <span className="text-gray-900 dark:text-white font-medium">
                      ${orderDetails.shippingCost.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">
                      Impuestos:
                    </span>
                    <span className="text-gray-900 dark:text-white font-medium">
                      ${orderDetails.taxAmount.toFixed(2)}
                    </span>
                  </div>
                  {orderDetails.discountAmount > 0 && (
                    <div className="flex justify-between text-green-600 dark:text-green-400">
                      <span>Descuentos:</span>
                      <span className="font-medium">
                        -${orderDetails.discountAmount.toFixed(2)}
                      </span>
                    </div>
                  )}
                </>
              )}
              <div className="border-t border-gray-300 dark:border-gray-600 pt-2 mt-2">
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-900 dark:text-white">
                    Total:
                  </span>
                  <span className="font-bold text-lg text-gray-900 dark:text-white">
                    ${displayOrder.total.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Acciones Rápidas
            </h3>
            <div className="space-y-2">
              <button className="w-full px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors text-sm font-medium flex items-center justify-center gap-2">
                <span>🖨️</span>
                Imprimir Factura
              </button>
              <button className="w-full px-4 py-2 bg-green-600 dark:bg-green-500 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-600 transition-colors text-sm font-medium flex items-center justify-center gap-2">
                <span>📧</span>
                Enviar Email
              </button>
              <button className="w-full px-4 py-2 bg-purple-600 dark:bg-purple-500 text-white rounded-lg hover:bg-purple-700 dark:hover:bg-purple-600 transition-colors text-sm font-medium flex items-center justify-center gap-2">
                <span>📋</span>
                Copiar Detalles
              </button>
              <button className="w-full px-4 py-2 bg-red-600 dark:bg-red-500 text-white rounded-lg hover:bg-red-700 dark:hover:bg-red-600 transition-colors text-sm font-medium flex items-center justify-center gap-2">
                <span>↩️</span>
                Reembolsar
              </button>
            </div>
          </div>

          {/* Additional Info */}
          <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-2">
                  Información Adicional
                </h4>
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  ID: {displayOrder.id}
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                  Canal: {displayOrder.paymentMethod || "Online"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </BaseModal>
  );
}
