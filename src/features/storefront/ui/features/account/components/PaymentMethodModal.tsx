/**
 * 💳 PAYMENT METHOD MODAL COMPONENT
 * ==================================
 *
 * Modal for adding/editing payment methods with Stripe Elements
 * Uses Setup Intent for PCI-compliant card storage without charging
 *
 * @version 1.0.0 - Payment Methods Feature
 */

"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, CreditCard, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useCreatePaymentMethod,
  useUpdatePaymentMethod,
  type PaymentMethod,
} from "@/features/storefront/payment-methods";
import { StripeSetupForm } from "@/core/payments/stripe/components/StripeSetupForm";

interface PaymentMethodModalProps {
  isOpen: boolean;
  onClose: () => void;
  paymentMethod: PaymentMethod | null; // null = add new, object = edit existing
}

export const PaymentMethodModal: React.FC<PaymentMethodModalProps> = ({
  isOpen,
  onClose,
  paymentMethod,
}) => {
  const [label, setLabel] = useState("");
  const [isDefault, setIsDefault] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const createMutation = useCreatePaymentMethod();
  const updateMutation = useUpdatePaymentMethod();

  const isEditing = !!paymentMethod;

  // Initialize form when modal opens
  useEffect(() => {
    if (isOpen && paymentMethod) {
      setLabel(paymentMethod.label || "");
      setIsDefault(paymentMethod.isDefault);
    } else if (isOpen) {
      setLabel("");
      setIsDefault(false);
    }
  }, [isOpen, paymentMethod]);

  const handleUpdateLabel = async () => {
    if (!paymentMethod) return;

    setIsSaving(true);
    try {
      const result = await updateMutation.mutateAsync({
        id: paymentMethod.id,
        label: label || undefined,
        isDefault,
      });

      if (result.success) {
        onClose();
      } else {
        alert(result.error || "Error al actualizar");
      }
    } catch (error) {
      alert("Error al actualizar el método de pago");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSetupSuccess = async (paymentMethodId: string, customerId?: string) => {
    setIsSaving(true);
    try {
      const result = await createMutation.mutateAsync({
        stripePaymentMethodId: paymentMethodId,
        stripeCustomerId: customerId,
        label: label || undefined,
        isDefault,
      });

      if (result.success) {
        onClose();
      } else {
        alert(result.error || "Error al guardar la tarjeta");
      }
    } catch (error) {
      alert("Error al guardar la tarjeta");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-end sm:items-center justify-center p-4">
        <div
          className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  {isEditing ? "Editar Tarjeta" : "Agregar Tarjeta"}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {isEditing
                    ? "Actualiza la etiqueta o configuración"
                    : "Conexión segura con Stripe"}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-6 py-6">
            {/* Label Input (always visible) */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Etiqueta (opcional)
              </label>
              <input
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="ej. Tarjeta Personal, Tarjeta de Empresa"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                maxLength={50}
              />
            </div>

            {/* Default Checkbox */}
            <div className="mb-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isDefault}
                  onChange={(e) => setIsDefault(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Establecer como tarjeta predeterminada
                </span>
              </label>
            </div>

            {/* Stripe Setup Form (only for new cards) */}
            {!isEditing && (
              <div className="mb-6">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Tu información de pago está protegida por Stripe. No
                  almacenamos tu número de tarjeta.
                </p>
                <StripeSetupForm
                  onSuccess={handleSetupSuccess}
                  onError={(error) => alert(error)}
                  submitButtonText="Guardar Tarjeta"
                />
              </div>
            )}

            {/* Editing existing card - show info */}
            {isEditing && paymentMethod && (
              <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-2">
                  <CreditCard className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                    {paymentMethod.brand} •••• {paymentMethod.last4}
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Vence {String(paymentMethod.expiryMonth).padStart(2, "0")}/
                  {paymentMethod.expiryYear}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  No puedes cambiar los datos de la tarjeta. Si necesitas
                  actualizar, elimina esta y agrega una nueva.
                </p>
              </div>
            )}
          </div>

          {/* Footer - Only for editing (adding handled by StripeSetupForm) */}
          {isEditing && (
            <div className="flex gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
              <button
                onClick={onClose}
                disabled={isSaving}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleUpdateLabel}
                disabled={isSaving}
                className={cn(
                  "flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                )}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  "Guardar Cambios"
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};
