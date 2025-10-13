/**
 * 📍 ADDRESS SECTION COMPONENT
 * ============================
 *
 * Displays and manages user addresses in AccountTab
 *
 * @version 1.0.0 - Address Management Feature
 */

"use client";

import { useState } from "react";
import { MapPin, Plus, Trash2, Star, Edit } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDeleteAddress, useSetDefaultAddress } from "@/features/storefront/addresses";
import type { Address } from "@/features/storefront/addresses";
import { AddressModal } from "./AddressModal";

interface AddressSectionProps {
  addresses: Address[];
  allowAnimations: boolean;
}

export const AddressSection: React.FC<AddressSectionProps> = ({
  addresses,
  allowAnimations,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  // Mutations only (data comes from props)
  const deleteAddress = useDeleteAddress();
  const setDefaultAddress = useSetDefaultAddress();

  const handleDelete = async (addressId: string, userId: string) => {
    if (confirm("¿Estás seguro de que deseas eliminar esta dirección?")) {
      try {
        await deleteAddress.mutateAsync({ addressId, userId });
      } catch (error) {
        alert("Error al eliminar la dirección");
      }
    }
  };

  const handleSetDefault = async (addressId: string, userId: string) => {
    try {
      await setDefaultAddress.mutateAsync({ addressId, userId });
    } catch (error) {
      alert("Error al establecer la dirección por defecto");
    }
  };

  const handleEdit = (address: Address) => {
    setEditingAddress(address);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingAddress(null);
    setIsModalOpen(true);
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
          Mis Direcciones
        </h2>
        <button
          onClick={handleAddNew}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <Plus className="h-5 w-5" />
          <span>Agregar Dirección</span>
        </button>
      </div>

      {addresses.length === 0 ? (
        <div className="text-center py-12">
          <MapPin className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            No tienes direcciones guardadas
          </p>
          <button
            onClick={handleAddNew}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Agregar Primera Dirección
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((address) => (
            <div
              key={address.id}
              className={cn(
                "border rounded-lg p-4 relative",
                address.isDefault
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/10"
                  : "border-gray-200 dark:border-gray-700"
              )}
            >
              {/* Default badge */}
              {address.isDefault && (
                <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 bg-blue-600 text-white text-xs rounded-full">
                  <Star className="h-3 w-3 fill-current" />
                  <span>Predeterminada</span>
                </div>
              )}

              {/* Label */}
              {address.label && (
                <div className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  {address.label}
                </div>
              )}

              {/* Name */}
              <div className="text-gray-900 dark:text-gray-100 mb-1">
                {address.firstName} {address.lastName}
              </div>

              {/* Company */}
              {address.company && (
                <div className="text-gray-600 dark:text-gray-400 text-sm mb-1">
                  {address.company}
                </div>
              )}

              {/* Address */}
              <div className="text-gray-600 dark:text-gray-400 text-sm space-y-1">
                <div>{address.street}</div>
                {address.street2 && <div>{address.street2}</div>}
                <div>
                  {address.city}, {address.state} {address.zipCode}
                </div>
                <div>{address.country}</div>
              </div>

              {/* Phone */}
              <div className="text-gray-600 dark:text-gray-400 text-sm mt-2">
                Tel: {address.phone}
              </div>

              {/* Type badge */}
              <div className="mt-3">
                <span
                  className={cn(
                    "text-xs px-2 py-1 rounded-full",
                    address.type === "SHIPPING"
                      ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                      : address.type === "BILLING"
                        ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400"
                        : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                  )}
                >
                  {address.type === "SHIPPING"
                    ? "Envío"
                    : address.type === "BILLING"
                      ? "Facturación"
                      : "Ambos"}
                </span>
              </div>

              {/* Actions */}
              <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => handleEdit(address)}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                >
                  <Edit className="h-4 w-4" />
                  <span>Editar</span>
                </button>

                {!address.isDefault && (
                  <button
                    onClick={() => handleSetDefault(address.id, address.userId)}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 rounded transition-colors"
                  >
                    <Star className="h-4 w-4" />
                    <span>Predeterminar</span>
                  </button>
                )}

                <button
                  onClick={() => handleDelete(address.id, address.userId)}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors ml-auto"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Eliminar</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Address Modal */}
      <AddressModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingAddress(null);
        }}
        address={editingAddress}
      />
    </div>
  );
};
