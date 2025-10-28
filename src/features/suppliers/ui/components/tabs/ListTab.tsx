/**
 * 📋 SUPPLIERS LIST TAB
 * =====================
 *
 * Lista completa de proveedores con todas las funcionalidades CRUD
 * Tabla interactiva con filtros, ordenamiento y acciones
 *
 * REFACTORED: 2025-01-27
 * - Using shared Tab components (TabHeader, TabWrapper, TabSearchBar)
 * - Extracted SupplierCard component
 * - Clean orchestration pattern (~100 lines)
 *
 * Created: 2025-01-18 - Suppliers List Management
 */

"use client";

import React, { useState, useMemo } from "react";
import { Truck, Plus } from "lucide-react";
import { useSupplierContext } from "../../../context";
import {
  TabHeader,
  TabWrapper,
  TabSearchBar,
} from "@/shared/ui/components/tabs";
import { SupplierCard } from "../list/SupplierCard";

/**
 * 📋 Main List Tab
 */
export default function ListTab() {
  const {
    suppliers,
    openSupplierModal,
    openViewModal,
    openDeleteModal,
  } = useSupplierContext();

  const [searchTerm, setSearchTerm] = useState("");

  // Filter suppliers
  const filteredSuppliers = useMemo(() => {
    if (!searchTerm) return suppliers.data;

    const term = searchTerm.toLowerCase();
    return suppliers.data.filter(
      (supplier) =>
        supplier.name.toLowerCase().includes(term) ||
        supplier.email?.toLowerCase().includes(term) ||
        supplier.phone?.toLowerCase().includes(term) ||
        supplier.contactPerson?.toLowerCase().includes(term)
    );
  }, [suppliers.data, searchTerm]);

  return (
    <TabWrapper>
      <TabHeader
        icon={<Truck className="w-8 h-8 text-blue-600 dark:text-blue-400" />}
        title="Gestión de Proveedores"
        description="Administra todos tus proveedores en un solo lugar"
        actions={[
          {
            label: "Nuevo Proveedor",
            icon: <Plus className="w-4 h-4" />,
            onClick: () => openSupplierModal("create"),
            variant: "primary",
          },
        ]}
      />

      {/* Search Bar */}
      <TabSearchBar
        placeholder="Buscar proveedor por nombre, email, teléfono..."
        value={searchTerm}
        onChange={setSearchTerm}
      />

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Mostrando {filteredSuppliers.length} de {suppliers.data.length}{" "}
          proveedores
        </p>
      </div>

      {/* Suppliers Grid */}
      {suppliers.isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="bg-gray-100 dark:bg-gray-800 rounded-lg h-64 animate-pulse"
            />
          ))}
        </div>
      ) : filteredSuppliers.length === 0 ? (
        <div className="text-center py-12">
          <Truck className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            {searchTerm
              ? "No se encontraron proveedores"
              : "No hay proveedores aún"}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {searchTerm
              ? "Intenta con otros términos de búsqueda"
              : "Comienza agregando tu primer proveedor"}
          </p>
          {!searchTerm && (
            <button
              onClick={() => openSupplierModal("create")}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Crear Proveedor
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSuppliers.map((supplier) => (
            <SupplierCard
              key={supplier.id}
              supplier={supplier}
              onView={openViewModal}
              onEdit={(s) => openSupplierModal("edit", s)}
              onDelete={openDeleteModal}
            />
          ))}
        </div>
      )}
    </TabWrapper>
  );
}
