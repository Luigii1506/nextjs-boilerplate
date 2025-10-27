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
import { Truck, ExternalLink, Package, Star, AlertCircle } from "lucide-react";
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
import { SupplierCard, TopSupplierHighlight } from "../suppliers";

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
            onClick: () => (window.location.href = "/suppliers"),
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
      <TopSupplierHighlight
        suppliers={suppliersWithProducts}
        onViewDetails={handleViewDetails}
      />

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
          icon={
            searchTerm ? (
              <AlertCircle className="w-20 h-20" />
            ) : (
              <AlertCircle className="w-20 h-20" />
            )
          }
          title={
            searchTerm
              ? "No se encontraron proveedores"
              : "No hay proveedores con productos"
          }
          description={
            searchTerm
              ? "Intenta con otros términos de búsqueda"
              : "Los proveedores aparecerán aquí cuando tengan productos asignados"
          }
          action={{
            label: "Ir a Gestión de Proveedores",
            onClick: () => (window.location.href = "/suppliers"),
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
