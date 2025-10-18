/**
 * 📋 SUPPLIERS LIST TAB
 * =====================
 *
 * Lista completa de proveedores con todas las funcionalidades CRUD
 * Tabla interactiva con filtros, ordenamiento y acciones
 *
 * Created: 2025-01-18 - Suppliers List Management
 */

"use client";

import React, { useState, useMemo } from "react";
import {
  Truck,
  Plus,
  Search,
  Star,
  Phone,
  Mail,
  MapPin,
  Edit,
  Eye,
  Trash2,
  Filter,
} from "lucide-react";
import { useSupplierContext } from "../../../context";
import { cn } from "@/shared/utils";
import type { SupplierWithRelations } from "@/shared/types";

/**
 * 🔍 Search and Filter Component
 */
interface SearchFilterProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onCreateClick: () => void;
}

const SearchFilter: React.FC<SearchFilterProps> = ({
  searchTerm,
  onSearchChange,
  onCreateClick,
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
      <div className="relative flex-1 w-full sm:max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar proveedor por nombre, email, teléfono..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      <div className="flex gap-2">
        <button
          onClick={onCreateClick}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
        >
          <Plus className="w-4 h-4" />
          Nuevo Proveedor
        </button>
      </div>
    </div>
  );
};

/**
 * 📊 Supplier Card Component
 */
interface SupplierCardProps {
  supplier: SupplierWithRelations;
  onView: (supplier: SupplierWithRelations) => void;
  onEdit: (supplier: SupplierWithRelations) => void;
  onDelete: (supplier: SupplierWithRelations) => void;
}

const SupplierCard: React.FC<SupplierCardProps> = ({
  supplier,
  onView,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {supplier.name}
            </h3>
            {supplier.active ? (
              <span className="px-2 py-1 text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded">
                Activo
              </span>
            ) : (
              <span className="px-2 py-1 text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded">
                Inactivo
              </span>
            )}
          </div>
          {supplier.rating !== null && (
            <div className="flex items-center gap-1 mt-2">
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {supplier.rating.toFixed(1)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Contact Info */}
      <div className="space-y-2 mb-4">
        {supplier.email && (
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Mail className="w-4 h-4" />
            <span>{supplier.email}</span>
          </div>
        )}
        {supplier.phone && (
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Phone className="w-4 h-4" />
            <span>{supplier.phone}</span>
          </div>
        )}
        {supplier.address && (
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <MapPin className="w-4 h-4" />
            <span className="line-clamp-1">{supplier.address}</span>
          </div>
        )}
      </div>

      {/* Contact Person */}
      {supplier.contactName && (
        <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
            Contacto
          </p>
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {supplier.contactName}
          </p>
          {supplier.contactPhone && (
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              {supplier.contactPhone}
            </p>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={() => onView(supplier)}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <Eye className="w-4 h-4" />
          Ver
        </button>
        <button
          onClick={() => onEdit(supplier)}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm border border-blue-300 dark:border-blue-600 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
        >
          <Edit className="w-4 h-4" />
          Editar
        </button>
        <button
          onClick={() => onDelete(supplier)}
          className="flex items-center justify-center gap-2 px-3 py-2 text-sm border border-red-300 dark:border-red-600 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

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
        supplier.contactName?.toLowerCase().includes(term)
    );
  }, [suppliers.data, searchTerm]);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <Truck className="w-7 h-7 text-purple-600 dark:text-purple-400" />
          Gestión de Proveedores
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Administra todos tus proveedores en un solo lugar
        </p>
      </div>

      {/* Search and Actions */}
      <SearchFilter
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onCreateClick={() => openSupplierModal("create")}
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
    </div>
  );
}
