/**
 * 🚛 SUPPLIERS TAB - INVENTORY CONTEXT
 * =====================================
 *
 * Vista de proveedores en el contexto de Inventory
 * Muestra proveedores que tienen productos asociados
 * Permite ver detalles del proveedor y sus productos
 *
 * Created: 2025-01-18 - Supplier-Product Relationship View
 */

"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  Truck,
  ExternalLink,
  Star,
  Package,
  Eye,
  ChevronRight,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/shared/utils";
import { TabTransition } from "../shared/TabTransition";
import { useSuppliersQuery } from "@/features/suppliers";
import { useInventoryContext } from "../../../context";
import type { SupplierWithRelations } from "@/shared/types";

/**
 * 📇 Supplier Card with Product Count
 */
interface SupplierCardProps {
  supplier: SupplierWithRelations;
  onViewDetails: (supplier: SupplierWithRelations) => void;
}

const SupplierCard: React.FC<SupplierCardProps> = ({
  supplier,
  onViewDetails,
}) => {
  const productCount = supplier._count?.products || 0;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-200 overflow-hidden group">
      {/* Header */}
      <div className="p-5 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {supplier.name}
            </h3>
            {supplier.contactPerson && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {supplier.contactPerson}
              </p>
            )}
          </div>
          {supplier.isActive ? (
            <span className="px-2.5 py-1 text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full">
              Activo
            </span>
          ) : (
            <span className="px-2.5 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full">
              Inactivo
            </span>
          )}
        </div>

        {/* Rating */}
        {supplier.rating !== null && supplier.rating > 0 && (
          <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }, (_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "w-3.5 h-3.5",
                    i < supplier.rating!
                      ? "text-yellow-500 fill-yellow-500"
                      : "text-gray-300 dark:text-gray-600"
                  )}
                />
              ))}
            </div>
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
              {supplier.rating.toFixed(1)}
            </span>
          </div>
        )}
      </div>

      {/* Product Count - Destacado */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-100 dark:bg-blue-900/40 rounded-lg">
              <Package className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                Productos
              </p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {productCount}
              </p>
            </div>
          </div>
          <button
            onClick={() => onViewDetails(supplier)}
            className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <Eye className="w-4 h-4" />
            Ver Detalles
          </button>
        </div>
      </div>

      {/* Footer Info */}
      {supplier.paymentTerms && (
        <div className="px-5 py-3 bg-gray-50 dark:bg-gray-900/50 text-xs text-gray-600 dark:text-gray-400">
          <span className="font-medium">Términos:</span> {supplier.paymentTerms}{" "}
          días
        </div>
      )}
    </div>
  );
};

/**
 * 🚛 Main Suppliers Tab - Inventory Context
 */
export default function SuppliersTab() {
  const [searchTerm, setSearchTerm] = useState("");
  const { data: allSuppliers = [], isLoading } = useSuppliersQuery();
  const { openViewSupplierModal } = useInventoryContext();

  // Filter: Only suppliers with products
  const suppliersWithProducts = useMemo(() => {
    return allSuppliers.filter(
      (supplier) => (supplier._count?.products || 0) > 0
    );
  }, [allSuppliers]);

  // Search filter
  const filteredSuppliers = useMemo(() => {
    if (!searchTerm) return suppliersWithProducts;

    const term = searchTerm.toLowerCase();
    return suppliersWithProducts.filter(
      (supplier) =>
        supplier.name.toLowerCase().includes(term) ||
        supplier.contactPerson?.toLowerCase().includes(term) ||
        supplier.email?.toLowerCase().includes(term)
    );
  }, [suppliersWithProducts, searchTerm]);

  // Stats
  const totalProducts = suppliersWithProducts.reduce(
    (sum, s) => sum + (s._count?.products || 0),
    0
  );
  const avgProductsPerSupplier =
    suppliersWithProducts.length > 0
      ? totalProducts / suppliersWithProducts.length
      : 0;
  const topSupplier = [...suppliersWithProducts].sort(
    (a, b) => (b._count?.products || 0) - (a._count?.products || 0)
  )[0];

  const handleViewDetails = (supplier: SupplierWithRelations) => {
    openViewSupplierModal(supplier);
  };

  return (
    <TabTransition isActive={true} transitionType="fade" delay={50}>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Truck className="w-7 h-7 text-blue-600 dark:text-blue-400" />
              Proveedores con Productos
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Visualiza proveedores y sus productos asociados
            </p>
          </div>

          {/* Link to Full Suppliers Module */}
          <Link
            href="/suppliers"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg transition-all font-medium shadow-md hover:shadow-lg"
          >
            <ExternalLink className="w-4 h-4" />
            Gestión Completa
          </Link>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-5 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                  Proveedores Activos
                </p>
                <p className="text-3xl font-bold text-blue-900 dark:text-blue-100 mt-2">
                  {suppliersWithProducts.length}
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                  Con productos en inventario
                </p>
              </div>
              <Truck className="w-10 h-10 text-blue-600 dark:text-blue-400 opacity-30" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl p-5 border border-purple-200 dark:border-purple-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600 dark:text-purple-400">
                  Total Productos
                </p>
                <p className="text-3xl font-bold text-purple-900 dark:text-purple-100 mt-2">
                  {totalProducts}
                </p>
                <p className="text-xs text-purple-700 dark:text-purple-300 mt-1">
                  En todos los proveedores
                </p>
              </div>
              <Package className="w-10 h-10 text-purple-600 dark:text-purple-400 opacity-30" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl p-5 border border-green-200 dark:border-green-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600 dark:text-green-400">
                  Promedio por Proveedor
                </p>
                <p className="text-3xl font-bold text-green-900 dark:text-green-100 mt-2">
                  {avgProductsPerSupplier.toFixed(1)}
                </p>
                <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                  Productos por proveedor
                </p>
              </div>
              <Star className="w-10 h-10 text-green-600 dark:text-green-400 opacity-30" />
            </div>
          </div>
        </div>

        {/* Top Supplier Highlight */}
        {topSupplier && (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-5">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-100 dark:bg-amber-900/40 rounded-lg">
                <Star className="w-6 h-6 text-amber-600 dark:text-amber-400 fill-amber-600 dark:fill-amber-400" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-amber-900 dark:text-amber-100">
                  Proveedor Principal
                </h4>
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  <span className="font-semibold">{topSupplier.name}</span> con{" "}
                  {topSupplier._count?.products || 0} productos
                </p>
              </div>
              <button
                onClick={() => handleViewDetails(topSupplier)}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
              >
                Ver Productos
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar proveedor por nombre, contacto o email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
          />
        </div>

        {/* Suppliers Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="bg-gray-100 dark:bg-gray-800 rounded-lg h-64 animate-pulse"
              />
            ))}
          </div>
        ) : filteredSuppliers.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 dark:bg-gray-800 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full mb-4">
              {searchTerm ? (
                <Search className="w-8 h-8 text-gray-400" />
              ) : (
                <AlertCircle className="w-8 h-8 text-gray-400" />
              )}
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              {searchTerm
                ? "No se encontraron proveedores"
                : "No hay proveedores con productos"}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
              {searchTerm
                ? "Intenta con otros términos de búsqueda"
                : "Los proveedores aparecerán aquí cuando tengan productos asignados"}
            </p>
            <Link
              href="/suppliers"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
            >
              <ExternalLink className="w-4 h-4" />
              Ir a Gestión de Proveedores
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSuppliers.map((supplier) => (
              <SupplierCard
                key={supplier.id}
                supplier={supplier}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>
        )}

        {/* Info Box */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-5">
          <div className="flex items-start gap-4">
            <div className="p-2.5 bg-blue-100 dark:bg-blue-900/40 rounded-lg flex-shrink-0">
              <ExternalLink className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                Vista del Contexto de Inventario
              </h4>
              <p className="text-sm text-blue-700 dark:text-blue-300 leading-relaxed">
                Esta vista muestra solo los proveedores que tienen productos
                asociados en tu inventario. Para gestión completa de proveedores
                (crear, editar, eliminar, analytics), visita el{" "}
                <Link
                  href="/suppliers"
                  className="underline font-semibold hover:text-blue-800 dark:hover:text-blue-200"
                >
                  módulo de Proveedores
                </Link>
                .
              </p>
            </div>
          </div>
        </div>
      </div>
    </TabTransition>
  );
}
