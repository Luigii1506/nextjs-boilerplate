/**
 * 💳 PAYMENT METHODS SECTION COMPONENT
 * ======================================
 *
 * Displays and manages user saved payment methods in AccountTab
 *
 * @version 1.0.0 - Payment Methods Feature
 */

"use client";

import { useState } from "react";
import { CreditCard, Plus, Trash2, Star, Edit, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useDeletePaymentMethod,
  useSetDefaultPaymentMethod,
} from "@/features/storefront/payment-methods";
import type { PaymentMethod } from "@/features/storefront/payment-methods";
import { PaymentMethodModal } from "./PaymentMethodModal";

interface PaymentMethodsSectionProps {
  paymentMethods: PaymentMethod[];
  allowAnimations: boolean;
}

// Card brand icons/colors
const CARD_BRANDS: Record<
  string,
  { icon: string; color: string; textColor: string }
> = {
  visa: { icon: "💳", color: "bg-blue-600", textColor: "text-blue-600" },
  mastercard: {
    icon: "💳",
    color: "bg-orange-600",
    textColor: "text-orange-600",
  },
  amex: { icon: "💳", color: "bg-cyan-600", textColor: "text-cyan-600" },
  discover: { icon: "💳", color: "bg-amber-600", textColor: "text-amber-600" },
  default: { icon: "💳", color: "bg-gray-600", textColor: "text-gray-600" },
};

export const PaymentMethodsSection: React.FC<PaymentMethodsSectionProps> = ({
  paymentMethods,
  allowAnimations,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPaymentMethod, setEditingPaymentMethod] =
    useState<PaymentMethod | null>(null);

  // Mutations only (data comes from props)
  const deletePaymentMethod = useDeletePaymentMethod();
  const setDefaultPaymentMethod = useSetDefaultPaymentMethod();

  const handleDelete = async (paymentMethodId: string) => {
    if (
      confirm(
        "¿Estás seguro de que deseas eliminar este método de pago? Esta acción no se puede deshacer."
      )
    ) {
      try {
        await deletePaymentMethod.mutateAsync(paymentMethodId);
      } catch (error) {
        alert("Error al eliminar el método de pago");
      }
    }
  };

  const handleSetDefault = async (paymentMethodId: string) => {
    try {
      await setDefaultPaymentMethod.mutateAsync(paymentMethodId);
    } catch (error) {
      alert("Error al establecer el método de pago por defecto");
    }
  };

  const handleEdit = (paymentMethod: PaymentMethod) => {
    setEditingPaymentMethod(paymentMethod);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingPaymentMethod(null);
    setIsModalOpen(true);
  };

  const getCardBrand = (brand: string) => {
    return CARD_BRANDS[brand.toLowerCase()] || CARD_BRANDS.default;
  };

  return (
    <div
      className={cn(
        "bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8",
        allowAnimations && "animate-customerFadeInUp"
      )}
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Métodos de Pago
        </h2>
        <button
          onClick={handleAddNew}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <Plus className="h-5 w-5" />
          <span>Agregar Tarjeta</span>
        </button>
      </div>

      {paymentMethods.length === 0 ? (
        <div className="text-center py-12">
          <CreditCard className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            No tienes métodos de pago guardados
          </p>
          <button
            onClick={handleAddNew}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Agregar Tu Primera Tarjeta
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {paymentMethods.map((paymentMethod) => {
            const cardBrand = getCardBrand(paymentMethod.brand);
            const isExpired =
              new Date(paymentMethod.expiryYear, paymentMethod.expiryMonth) <
              new Date();

            return (
              <div
                key={paymentMethod.id}
                className={cn(
                  "relative border rounded-xl p-6 transition-all hover:shadow-md",
                  paymentMethod.isDefault
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                    : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600",
                  isExpired && "opacity-60"
                )}
              >
                {/* Default Badge */}
                {paymentMethod.isDefault && (
                  <div className="absolute top-4 right-4">
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs font-medium rounded-full">
                      <Check className="h-3 w-3" />
                      Predeterminada
                    </span>
                  </div>
                )}

                {/* Expired Badge */}
                {isExpired && (
                  <div className="absolute top-4 right-4">
                    <span className="inline-flex items-center px-2 py-1 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 text-xs font-medium rounded-full">
                      Vencida
                    </span>
                  </div>
                )}

                {/* Card Info */}
                <div className="flex items-start gap-4">
                  <div
                    className={cn(
                      "flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center text-2xl",
                      cardBrand.color
                    )}
                  >
                    {cardBrand.icon}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3
                        className={cn(
                          "text-lg font-semibold capitalize",
                          cardBrand.textColor
                        )}
                      >
                        {paymentMethod.brand}
                      </h3>
                      {paymentMethod.label && (
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          • {paymentMethod.label}
                        </span>
                      )}
                    </div>

                    <p className="text-2xl font-mono font-bold text-gray-900 dark:text-gray-100 mb-2">
                      •••• {paymentMethod.last4}
                    </p>

                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Vence{" "}
                      {String(paymentMethod.expiryMonth).padStart(2, "0")}/
                      {paymentMethod.expiryYear}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  {!paymentMethod.isDefault && (
                    <button
                      onClick={() => handleSetDefault(paymentMethod.id)}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                      title="Establecer como predeterminada"
                    >
                      <Star className="h-4 w-4" />
                      <span>Predeterminada</span>
                    </button>
                  )}

                  <button
                    onClick={() => handleEdit(paymentMethod)}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    title="Editar etiqueta"
                  >
                    <Edit className="h-4 w-4" />
                    <span>Editar</span>
                  </button>

                  <button
                    onClick={() => handleDelete(paymentMethod.id)}
                    className="ml-auto flex items-center gap-1 px-3 py-1.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                    title="Eliminar"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Eliminar</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Modal */}
      <PaymentMethodModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingPaymentMethod(null);
        }}
        paymentMethod={editingPaymentMethod}
      />
    </div>
  );
};
