/**
 * 🏢 SUPPLIER MODAL WRAPPER
 * =========================
 *
 * Wrapper del SupplierModal para usar con SupplierContext
 * Convierte el SupplierContext al formato que espera InventoryContext
 *
 * Created: 2025-01-18 - Suppliers Module Integration
 */

"use client";

import React from "react";
import { SupplierModal as BaseSupplierModal } from "../../../../inventory/ui/components";
import { useSupplierContext } from "../../../context";
import { InventoryProvider } from "../../../../inventory/context";

/**
 * 🎯 Wrapper Component
 */
export function SupplierModal() {
  const { modals, closeSupplierModal } = useSupplierContext();

  // Create a mock inventory context state with only supplier-related data
  const mockInventoryState = {
    supplier: {
      isOpen: modals.supplier.isOpen,
      mode: modals.supplier.mode,
      data: modals.supplier.data,
    },
    closeSupplierModal,
  };

  // If modal is not open, don't render anything
  if (!modals.supplier.isOpen) {
    return null;
  }

  // Render the base modal inside an InventoryProvider
  // This ensures the modal has access to inventory context
  return (
    <InventoryProvider>
      <BaseSupplierModal />
    </InventoryProvider>
  );
}

export default SupplierModal;
