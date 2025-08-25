/**
 * 🚛 SUPPLIERS TAB COMPONENT
 * =========================
 *
 * Tab completo para gestión de proveedores con filtros, búsqueda y CRUD
 * Sigue el mismo patrón que CategoriesTab para consistencia
 *
 * Created: 2025-01-18 - Supplier Management UI
 */

"use client";

import React, { useState, useCallback } from "react";
import {
  Search,
  Filter,
  Grid3X3,
  List,
  Download,
  Upload,
  Truck,
  Eye,
  Edit2,
  Trash2,
  Package,
  Plus,
  Star,
  Mail,
  Phone,
  Globe,
  MapPin,
} from "lucide-react";
import { cn } from "@/shared/utils";
import { TabTransition } from "../shared/TabTransition";
import { useInventoryContext } from "../../../context";
import { useSuppliersQuery } from "../../../hooks";
import type { SupplierWithRelations, SupplierFilters } from "../../../types";

// 🎯 Supplier Filters Component
const SupplierFilters: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showInactive, setShowInactive] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const { viewMode, setViewMode, setIsSupplierModalOpen } =
    useInventoryContext();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-4">
      {/* Top Row - Search & Actions */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar proveedores por nombre, email o RFC..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setViewMode("grid")}
              className={cn(
                "p-2 rounded-md transition-colors duration-200 flex items-center justify-center",
                viewMode === "grid"
                  ? "bg-white dark:bg-gray-800 shadow-sm text-blue-600 dark:text-blue-400"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              )}
              title="Vista en cuadrícula"
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={cn(
                "p-2 rounded-md transition-colors duration-200 flex items-center justify-center",
                viewMode === "list"
                  ? "bg-white dark:bg-gray-800 shadow-sm text-blue-600 dark:text-blue-400"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              )}
              title="Vista en lista"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={cn(
              "flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg transition-colors",
              isFilterOpen
                ? "bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-600 text-blue-700 dark:text-blue-300"
                : "bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
            )}
          >
            <Filter className="w-4 h-4" />
            <span className="text-sm font-medium">Filtros</span>
          </button>

          {/* Export */}
          <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <Download className="w-4 h-4" />
            <span className="text-sm font-medium">Exportar</span>
          </button>

          {/* Import */}
          <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <Upload className="w-4 h-4" />
            <span className="text-sm font-medium">Importar</span>
          </button>

          {/* Add Supplier */}
          <button
            onClick={() => setIsSupplierModalOpen(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm font-medium">Agregar</span>
          </button>
        </div>
      </div>

      {/* Expanded Filters */}
      {isFilterOpen && (
        <div className="border-t border-gray-200 dark:border-gray-600 pt-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Status Filter */}
            <div>
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={showInactive}
                  onChange={(e) => setShowInactive(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded border-gray-300 dark:border-gray-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Mostrar proveedores inactivos
                </span>
              </label>
            </div>

            {/* Rating Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Calificación mínima
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
                <option value="">Cualquiera</option>
                <option value="5">5 estrellas</option>
                <option value="4">4+ estrellas</option>
                <option value="3">3+ estrellas</option>
                <option value="2">2+ estrellas</option>
              </select>
            </div>

            {/* Payment Terms Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Términos de pago
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
                <option value="">Todos</option>
                <option value="fast">Rápido (≤15 días)</option>
                <option value="standard">Estándar (16-45 días)</option>
                <option value="extended">Extendido (≥60 días)</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// 🎯 Supplier Grid Card Component
const SupplierGridCard: React.FC<{
  supplier: SupplierWithRelations;
  onView: (supplier: SupplierWithRelations) => void;
  onEdit: (supplier: SupplierWithRelations) => void;
  onDelete: (supplier: SupplierWithRelations) => void;
}> = ({ supplier, onView, onEdit, onDelete }) => {
  const totalProducts = supplier._count?.products || 0;

  // Rating stars
  const ratingStars = supplier.rating
    ? Array.from({ length: 5 }, (_, i) => i + 1)
    : [];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md dark:hover:shadow-gray-900/10 transition-all duration-200 group">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <Truck className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h3
                className="font-semibold text-gray-900 dark:text-white truncate cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                onClick={() => onView(supplier)}
              >
                {supplier.name}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                {supplier.contactPerson || "Sin contacto"}
              </p>
            </div>
          </div>
        </div>

        {/* Actions Dropdown */}
        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onView(supplier)}
            className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
            title="Ver detalles"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => onEdit(supplier)}
            className="p-2 text-gray-400 hover:text-amber-600 dark:hover:text-amber-400 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors"
            title="Editar"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(supplier)}
            className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            title="Eliminar"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Contact Info */}
      <div className="space-y-2 mb-4">
        {supplier.email && (
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Mail className="w-3 h-3 text-blue-500" />
            <span className="truncate">{supplier.email}</span>
          </div>
        )}
        {supplier.phone && (
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Phone className="w-3 h-3 text-green-500" />
            <span>{supplier.phone}</span>
          </div>
        )}
        {supplier.website && (
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Globe className="w-3 h-3 text-purple-500" />
            <span className="truncate">
              {supplier.website.replace(/^https?:\/\//, "")}
            </span>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 pt-4">
        <div className="flex items-center gap-4">
          {/* Products Count */}
          <div className="flex items-center gap-1">
            <Package className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {totalProducts}
            </span>
          </div>

          {/* Payment Terms */}
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {supplier.paymentTerms}d
          </div>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-1">
          {supplier.rating ? (
            <>
              <div className="flex">
                {ratingStars.map((star) => (
                  <Star
                    key={star}
                    className={cn(
                      "w-3 h-3",
                      star <= (supplier.rating || 0)
                        ? "text-yellow-400 fill-current"
                        : "text-gray-300 dark:text-gray-600"
                    )}
                  />
                ))}
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {supplier.rating}
              </span>
            </>
          ) : (
            <span className="text-xs text-gray-400">Sin rating</span>
          )}
        </div>
      </div>

      {/* Status Indicator */}
      <div className="mt-3">
        <span
          className={cn(
            "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
            supplier.isActive
              ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
              : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
          )}
        >
          {supplier.isActive ? "Activo" : "Inactivo"}
        </span>
      </div>
    </div>
  );
};

// 🎯 Supplier List Row Component
const SupplierListRow: React.FC<{
  supplier: SupplierWithRelations;
  onView: (supplier: SupplierWithRelations) => void;
  onEdit: (supplier: SupplierWithRelations) => void;
  onDelete: (supplier: SupplierWithRelations) => void;
}> = ({ supplier, onView, onEdit, onDelete }) => {
  const totalProducts = supplier._count?.products || 0;

  // Rating stars
  const ratingStars = supplier.rating
    ? Array.from({ length: 5 }, (_, i) => i + 1)
    : [];

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-sm transition-shadow group">
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 flex-1 min-w-0">
            {/* Avatar */}
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <Truck className="w-5 h-5 text-white" />
            </div>

            {/* Supplier Info */}
            <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-4 gap-4">
              {/* Name & Contact */}
              <div className="space-y-1">
                <h3
                  className="font-medium text-gray-900 dark:text-white truncate cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  onClick={() => onView(supplier)}
                >
                  {supplier.name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                  {supplier.contactPerson || "Sin contacto"}
                </p>
              </div>

              {/* Contact Details */}
              <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                {supplier.email && (
                  <div className="flex items-center gap-1">
                    <Mail className="w-3 h-3 text-blue-500" />
                    <span className="truncate">{supplier.email}</span>
                  </div>
                )}
                {supplier.phone && (
                  <div className="flex items-center gap-1">
                    <Phone className="w-3 h-3 text-green-500" />
                    <span>{supplier.phone}</span>
                  </div>
                )}
              </div>

              {/* Stats */}
              <div className="flex flex-col space-y-1">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Package className="w-3 h-3" />
                  <span>{totalProducts} productos</span>
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {supplier.paymentTerms} días
                </div>
              </div>

              {/* Rating & Status */}
              <div className="flex items-center justify-between sm:justify-end gap-3">
                {/* Rating */}
                <div className="flex items-center gap-1">
                  {supplier.rating ? (
                    <>
                      <div className="flex">
                        {ratingStars.slice(0, 3).map((star) => (
                          <Star
                            key={star}
                            className={cn(
                              "w-3 h-3",
                              star <= (supplier.rating || 0)
                                ? "text-yellow-400 fill-current"
                                : "text-gray-300 dark:text-gray-600"
                            )}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-gray-500">
                        {supplier.rating}
                      </span>
                    </>
                  ) : (
                    <span className="text-xs text-gray-400">Sin rating</span>
                  )}
                </div>

                {/* Status */}
                <span
                  className={cn(
                    "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium",
                    supplier.isActive
                      ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                      : "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400"
                  )}
                >
                  {supplier.isActive ? "Activo" : "Inactivo"}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity ml-4">
            <button
              onClick={() => onView(supplier)}
              className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
              title="Ver detalles"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={() => onEdit(supplier)}
              className="p-2 text-gray-400 hover:text-amber-600 dark:hover:text-amber-400 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors"
              title="Editar"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(supplier)}
              className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              title="Eliminar"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// 🎯 Suppliers Display Component
const SuppliersDisplay: React.FC<{
  suppliers: SupplierWithRelations[];
  isLoading: boolean;
  error: string | null;
}> = ({ suppliers, isLoading, error }) => {
  const {
    viewMode,
    setIsSupplierModalOpen,
    openEditSupplierModal,
    openDeleteSupplierConfirm,
    openViewSupplierModal,
  } = useInventoryContext();

  // Handle actions
  const handleView = useCallback(
    (supplier: SupplierWithRelations) => {
      openViewSupplierModal(supplier);
    },
    [openViewSupplierModal]
  );

  const handleEdit = useCallback(
    (supplier: SupplierWithRelations) => {
      openEditSupplierModal(supplier);
    },
    [openEditSupplierModal]
  );

  const handleDelete = useCallback(
    (supplier: SupplierWithRelations) => {
      openDeleteSupplierConfirm(supplier);
    },
    [openDeleteSupplierConfirm]
  );

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        {/* Skeleton loading */}
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 animate-pulse"
          >
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-lg" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/4" />
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/6" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-500 mb-2">Error al cargar proveedores</div>
        <p className="text-gray-600 dark:text-gray-400 text-sm">{error}</p>
      </div>
    );
  }

  // Empty state
  if (!suppliers.length) {
    return (
      <div className="text-center py-12">
        <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
          <Truck className="w-10 h-10 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          No hay proveedores
        </h3>
        <p className="text-gray-500 dark:text-gray-400 mb-4">
          Comienza agregando tu primer proveedor
        </p>
        <button
          onClick={() => setIsSupplierModalOpen(true)}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Crear Primer Proveedor
        </button>
      </div>
    );
  }

  // Suppliers grid/list
  return (
    <div className="space-y-4">
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {suppliers.map((supplier) => (
            <SupplierGridCard
              key={supplier.id}
              supplier={supplier}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {suppliers.map((supplier) => (
            <SupplierListRow
              key={supplier.id}
              supplier={supplier}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// 🎯 Main SuppliersTab Component
export const SuppliersTab: React.FC = () => {
  // Data fetching
  const {
    data: suppliers = [],
    isLoading,
    error,
  } = useSuppliersQuery(
    {}, // filters can be added here
    {
      enabled: true,
      staleTime: 30000,
    }
  );

  return (
    <TabTransition isActive={true}>
      <div className="space-y-6">
        {/* Filters */}
        <SupplierFilters />

        {/* Suppliers Display */}
        <SuppliersDisplay
          suppliers={suppliers}
          isLoading={isLoading}
          error={error?.message || null}
        />
      </div>
    </TabTransition>
  );
};

export default SuppliersTab;
