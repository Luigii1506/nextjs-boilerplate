/**
 * 📦 ADD TRACKING MODAL
 * =====================
 *
 * Reusable modal for adding tracking information to orders
 * Used from OrdersTab for quick tracking assignment
 *
 * Created: 2025-01-17 - Consolidation of Orders & Tracking
 */

"use client";

import { useState, useEffect } from "react";
import {
  BaseModal,
  BaseModalActions,
  BaseModalButton,
} from "@/shared/ui/components/BaseModal";
import { OrderSummary } from "../../../types";
import { Truck } from "lucide-react";

// Carrier configuration with logos and tracking URLs
const CARRIERS = {
  FedEx: {
    name: "FedEx",
    logo: "📦",
    trackingUrl: (number: string) => `https://www.fedex.com/fedextrack/?trknbr=${number}`,
  },
  DHL: {
    name: "DHL",
    logo: "🔴",
    trackingUrl: (number: string) =>
      `https://www.dhl.com/mx-es/home/tracking.html?tracking-id=${number}`,
  },
  Estafeta: {
    name: "Estafeta",
    logo: "📮",
    trackingUrl: (number: string) => `https://www.estafeta.com/Rastreo/?guia=${number}`,
  },
  UPS: {
    name: "UPS",
    logo: "🟤",
    trackingUrl: (number: string) => `https://www.ups.com/track?tracknum=${number}`,
  },
  "99Minutos": {
    name: "99 Minutos",
    logo: "⚡",
    trackingUrl: (number: string) => `https://99minutos.com/rastreo/${number}`,
  },
  Redpack: {
    name: "Redpack",
    logo: "🔴",
    trackingUrl: (number: string) => `https://www.redpack.com.mx/rastreo/?guias=${number}`,
  },
  Otro: {
    name: "Otro",
    logo: "📦",
    trackingUrl: () => "#",
  },
};

interface AddTrackingModalProps {
  order: OrderSummary | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    trackingNumber: string;
    carrier: string;
    estimatedDelivery?: string;
    notes?: string;
  }) => Promise<void>;
  isLoading?: boolean;
}

export function AddTrackingModal({
  order,
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
}: AddTrackingModalProps) {
  const [trackingNumber, setTrackingNumber] = useState("");
  const [shippingCarrier, setShippingCarrier] = useState<keyof typeof CARRIERS>("FedEx");
  const [estimatedDelivery, setEstimatedDelivery] = useState("");
  const [notes, setNotes] = useState("");

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setTrackingNumber("");
      setShippingCarrier("FedEx");
      setEstimatedDelivery("");
      setNotes("");
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    if (!trackingNumber.trim()) return;

    await onSubmit({
      trackingNumber: trackingNumber.trim(),
      carrier: shippingCarrier,
      estimatedDelivery: estimatedDelivery || undefined,
      notes: notes.trim() || undefined,
    });
  };

  if (!order) return null;

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={`Agregar Tracking: ${order.number}`}
      description="Ingresa la información de envío para esta orden"
      icon={<Truck className="w-6 h-6 text-white" />}
      maxWidth="lg"
      isLoading={isLoading}
      actions={
        <BaseModalActions align="right">
          <BaseModalButton variant="secondary" onClick={onClose} disabled={isLoading}>
            Cancelar
          </BaseModalButton>
          <BaseModalButton
            variant="primary"
            onClick={handleSubmit}
            disabled={!trackingNumber.trim() || isLoading}
            loading={isLoading}
          >
            Guardar y Marcar como Enviado
          </BaseModalButton>
        </BaseModalActions>
      }
    >
      <div className="space-y-4">
        {/* Order Summary */}
        <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
            Resumen de Orden
          </h4>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-blue-700 dark:text-blue-300">Cliente:</span>
              <p className="text-blue-900 dark:text-blue-100 font-medium truncate">
                {order.customerEmail}
              </p>
            </div>
            <div>
              <span className="text-blue-700 dark:text-blue-300">Total:</span>
              <p className="text-blue-900 dark:text-blue-100 font-medium">
                ${order.total.toFixed(2)}
              </p>
            </div>
            <div>
              <span className="text-blue-700 dark:text-blue-300">Items:</span>
              <p className="text-blue-900 dark:text-blue-100 font-medium">
                {order.itemsCount}
              </p>
            </div>
            <div>
              <span className="text-blue-700 dark:text-blue-300">Estado:</span>
              <p className="text-blue-900 dark:text-blue-100 font-medium">
                {order.status}
              </p>
            </div>
          </div>
        </div>

        {/* Tracking Number */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Número de Tracking *
          </label>
          <input
            type="text"
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            placeholder="Ej: 1234567890"
            autoFocus
          />
        </div>

        {/* Shipping Carrier */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Paquetería *
          </label>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(CARRIERS).map(([key, carrier]) => (
              <button
                key={key}
                type="button"
                onClick={() => setShippingCarrier(key as keyof typeof CARRIERS)}
                className={`flex items-center gap-2 px-4 py-3 border-2 rounded-lg transition-all ${
                  shippingCarrier === key
                    ? "border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/30"
                    : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
                }`}
              >
                <span className="text-2xl">{carrier.logo}</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {carrier.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Estimated Delivery */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Fecha Estimada de Entrega
          </label>
          <input
            type="date"
            value={estimatedDelivery}
            onChange={(e) => setEstimatedDelivery(e.target.value)}
            min={new Date().toISOString().split("T")[0]}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Notas (Opcional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 resize-none"
            placeholder="Ej: Paquete especial, manejo con cuidado..."
          />
        </div>
      </div>
    </BaseModal>
  );
}
