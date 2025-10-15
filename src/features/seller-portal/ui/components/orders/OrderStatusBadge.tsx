/**
 * 🏷️ ORDER STATUS BADGE COMPONENT
 * =================================
 *
 * Visual badge for order status with color coding
 *
 * Created: 2025-01-17 - Seller Portal Implementation
 */

"use client";

import { OrderStatus, PaymentStatus, FulfillmentStatus } from "../../../types";

interface OrderStatusBadgeProps {
  status: OrderStatus | PaymentStatus | FulfillmentStatus;
  type?: "order" | "payment" | "fulfillment";
}

const statusConfig = {
  // Order Status
  PENDING: {
    label: "Pendiente",
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
    icon: "⏳",
  },
  CONFIRMED: {
    label: "Confirmada",
    color: "bg-blue-100 text-blue-800 border-blue-200",
    icon: "✓",
  },
  PROCESSING: {
    label: "Procesando",
    color: "bg-indigo-100 text-indigo-800 border-indigo-200",
    icon: "⚙️",
  },
  SHIPPED: {
    label: "Enviada",
    color: "bg-purple-100 text-purple-800 border-purple-200",
    icon: "📦",
  },
  DELIVERED: {
    label: "Entregada",
    color: "bg-green-100 text-green-800 border-green-200",
    icon: "✅",
  },
  CANCELLED: {
    label: "Cancelada",
    color: "bg-red-100 text-red-800 border-red-200",
    icon: "❌",
  },
  REFUNDED: {
    label: "Reembolsada",
    color: "bg-orange-100 text-orange-800 border-orange-200",
    icon: "💸",
  },

  // Payment Status
  PAID: {
    label: "Pagada",
    color: "bg-green-100 text-green-800 border-green-200",
    icon: "💳",
  },
  FAILED: {
    label: "Fallida",
    color: "bg-red-100 text-red-800 border-red-200",
    icon: "⚠️",
  },
  PARTIALLY_REFUNDED: {
    label: "Reembolso Parcial",
    color: "bg-orange-100 text-orange-800 border-orange-200",
    icon: "💸",
  },

  // Fulfillment Status
  UNFULFILLED: {
    label: "Sin Procesar",
    color: "bg-gray-100 text-gray-800 border-gray-200 dark:border-gray-700",
    icon: "📋",
  },
  PARTIALLY_FULFILLED: {
    label: "Procesado Parcial",
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
    icon: "📦",
  },
  FULFILLED: {
    label: "Procesado",
    color: "bg-blue-100 text-blue-800 border-blue-200",
    icon: "✓",
  },
};

export function OrderStatusBadge({ status, type = "order" }: OrderStatusBadgeProps) {
  const config = statusConfig[status] || {
    label: status,
    color: "bg-gray-100 text-gray-800 border-gray-200 dark:border-gray-700",
    icon: "?",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${config.color}`}
    >
      <span>{config.icon}</span>
      <span>{config.label}</span>
    </span>
  );
}
