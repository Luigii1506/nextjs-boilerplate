/**
 * 🎴 ORDER CARD COMPONENT - ENHANCED
 * ===================================
 *
 * Professional order card with:
 * - Better information hierarchy
 * - Visual urgency indicators
 * - Improved layout
 * - Quick info at a glance
 *
 * Created: 2025-01-17 - Seller Portal Implementation
 * Updated: 2025-01-17 - Professional E-commerce Enhancement
 */

"use client";

import { OrderSummary, OrderStatus, PaymentStatus, FulfillmentStatus } from "../../../types";
import { OrderStatusBadge } from "./OrderStatusBadge";
import { Truck } from "lucide-react";

interface OrderCardProps {
  order: OrderSummary;
  onClick?: () => void;
  selectionMode?: boolean;
  isSelected?: boolean;
  onSelectionToggle?: () => void;
  onAddTracking?: (order: OrderSummary) => void;
}

export function OrderCard({
  order,
  onClick,
  selectionMode = false,
  isSelected = false,
  onSelectionToggle,
  onAddTracking,
}: OrderCardProps) {
  const formattedDate = new Date(order.placedAt).toLocaleDateString("es-MX", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const formattedTotal = new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(order.total);

  // Determine urgency level
  const needsAttention =
    order.paymentStatus === PaymentStatus.PENDING ||
    (order.status === OrderStatus.CONFIRMED && !order.trackingNumber);

  const isUrgent = order.paymentStatus === PaymentStatus.FAILED;

  // Check if needs tracking
  const needsTracking =
    order.fulfillmentStatus === FulfillmentStatus.UNFULFILLED &&
    !order.trackingNumber &&
    order.paymentStatus === PaymentStatus.PAID;

  const handleClick = () => {
    if (selectionMode && onSelectionToggle) {
      onSelectionToggle();
    } else if (onClick) {
      onClick();
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`
        relative bg-white dark:bg-gray-800 border rounded-lg p-4
        hover:shadow-lg dark:hover:shadow-gray-900/50 transition-all cursor-pointer
        hover:border-blue-500 dark:hover:border-blue-400
        ${
          isSelected
            ? "ring-2 ring-blue-500 dark:ring-blue-400 border-blue-500 dark:border-blue-400"
            : isUrgent
              ? "border-red-300 dark:border-red-700"
              : needsAttention
                ? "border-yellow-300 dark:border-yellow-700"
                : "border-gray-200 dark:border-gray-700"
        }
      `}
    >
      {/* Selection Checkbox */}
      {selectionMode && (
        <div className="absolute top-2 left-2 z-10">
          <div
            className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
              isSelected
                ? "bg-blue-600 dark:bg-blue-500 border-blue-600 dark:border-blue-500"
                : "bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
            }`}
          >
            {isSelected && (
              <svg
                className="w-4 h-4 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            )}
          </div>
        </div>
      )}

      {/* Urgency Indicator */}
      {!selectionMode && (needsAttention || isUrgent) && (
        <div className="absolute top-2 right-2">
          <div
            className={`w-3 h-3 rounded-full animate-pulse ${
              isUrgent
                ? "bg-red-500 dark:bg-red-600"
                : "bg-yellow-500 dark:bg-yellow-600"
            }`}
          />
        </div>
      )}

      {/* Header - Order Number & Amount */}
      <div className="flex items-start justify-between mb-3 pr-6">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-lg text-gray-900 dark:text-white">
              {order.number}
            </h3>
            <span className="text-xs text-gray-400 dark:text-gray-500">•</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {order.itemsCount} {order.itemsCount === 1 ? "item" : "items"}
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{formattedDate}</p>
        </div>
        <div className="text-right">
          <p className="font-bold text-xl text-gray-900 dark:text-white">{formattedTotal}</p>
        </div>
      </div>

      {/* Status Badges - More Prominent */}
      <div className="flex flex-wrap gap-2 mb-3">
        <OrderStatusBadge status={order.status} type="order" />
        <OrderStatusBadge status={order.paymentStatus} type="payment" />
        <OrderStatusBadge status={order.fulfillmentStatus} type="fulfillment" />
      </div>

      {/* Customer Info - Redesigned */}
      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-md p-3 mb-3">
        <div className="flex items-start gap-2">
          <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-sm">👤</span>
          </div>
          <div className="flex-1 min-w-0">
            {order.customerName && (
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {order.customerName}
              </p>
            )}
            <p className="text-xs text-gray-600 dark:text-gray-300 truncate">
              {order.customerEmail}
            </p>
          </div>
        </div>
      </div>

      {/* Tracking Info - More Visible */}
      {order.trackingNumber ? (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-sm">📦</span>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                En Tránsito
              </p>
              <p className="text-xs font-mono text-blue-800 dark:text-blue-300 truncate">
                {order.trackingNumber}
              </p>
            </div>
          </div>
        </div>
      ) : needsAttention ? (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md p-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-sm">⚠️</span>
            <p className="text-xs text-yellow-700 dark:text-yellow-300 font-medium">
              Requiere Atención
            </p>
          </div>
        </div>
      ) : null}

      {/* Footer - Quick Actions */}
      <div className="flex items-center justify-between gap-2 pt-2 border-t border-gray-200 dark:border-gray-600">
        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600">
          {order.paymentMethod || "💳 Card"}
        </span>

        <div className="flex items-center gap-2">
          {/* Add Tracking Button - Only if needs tracking */}
          {needsTracking && onAddTracking && !selectionMode && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddTracking(order);
              }}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 dark:bg-blue-500 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors text-xs font-medium"
            >
              <Truck className="w-3 h-3" />
              Agregar Tracking
            </button>
          )}

          {/* View Details Link */}
          {!needsTracking && (
            <span className="text-xs text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1">
              Ver detalles
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
