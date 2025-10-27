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
  Truck,
  ExternalLink,
  Star,
  Package,
  Eye,
  ChevronRight,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/shared/utils";
import {
  TabWrapper,
  TabHeader,
  TabStatsCard,
  TabSearchBar,
  TabLoadingSkeleton,
  TabEmptyState,
} from "@/shared/ui/components/tabs";
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
    <TabWrapper spacing="space-y-6">
      {/* Header */}
      <TabHeader
        icon={<Truck className="w-8 h-8 text-blue-600 dark:text-blue-400" />}
        title="Proveedores con Productos"
        description="Visualiza proveedores y sus productos asociados"
        actions={[
          {
            label: "Gestión Completa",
            icon: <ExternalLink className="w-4 h-4" />,
            onClick: () => window.location.href = "/suppliers",
            variant: "primary",
          },
        ]}
      />

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <TabStatsCard
          title="Proveedores Activos"
          value={suppliersWithProducts.length}
          icon={Truck}
          color="blue"
          description="Con productos en inventario"
        />

        <TabStatsCard
          title="Total Productos"
          value={totalProducts}
          icon={Package}
          color="purple"
          description="En todos los proveedores"
        />

        <TabStatsCard
          title="Promedio por Proveedor"
          value={avgProductsPerSupplier.toFixed(1)}
          icon={Star}
          color="green"
          description="Productos por proveedor"
        />
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
      <TabSearchBar
        value={searchTerm}
        onChange={setSearchTerm}
        placeholder="Buscar proveedor por nombre, contacto o email..."
      />

      {/* Suppliers Grid */}
      {isLoading ? (
        <TabLoadingSkeleton type="grid" count={6} className="h-64" />
      ) : filteredSuppliers.length === 0 ? (
        <TabEmptyState
          icon={searchTerm ? <AlertCircle className="w-20 h-20" /> : <AlertCircle className="w-20 h-20" />}
          title={searchTerm ? "No se encontraron proveedores" : "No hay proveedores con productos"}
          description={
            searchTerm
              ? "Intenta con otros términos de búsqueda"
              : "Los proveedores aparecerán aquí cuando tengan productos asignados"
          }
          action={{
            label: "Ir a Gestión de Proveedores",
            onClick: () => window.location.href = "/suppliers",
            icon: <ExternalLink className="w-4 h-4" />,
          }}
        />
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
    </TabWrapper>
  );
}
