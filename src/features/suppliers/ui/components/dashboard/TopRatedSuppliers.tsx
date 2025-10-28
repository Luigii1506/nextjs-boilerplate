/**
 * ⭐ TOP RATED SUPPLIERS COMPONENT
 * =================================
 *
 * Displays list of top-rated suppliers
 *
 * Created: 2025-01-27
 */

"use client";

import React from "react";
import { Star } from "lucide-react";
import type { SupplierWithRelations } from "@/shared/types";

export interface TopRatedSuppliersProps {
  suppliers: SupplierWithRelations[];
  isLoading: boolean;
}

export const TopRatedSuppliers: React.FC<TopRatedSuppliersProps> = ({
  suppliers,
  isLoading,
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Mejor Calificados
        </h3>
        <Star className="w-5 h-5 text-yellow-500" />
      </div>
      <div className="space-y-3">
        {isLoading ? (
          <p className="text-gray-500 text-sm">Cargando...</p>
        ) : suppliers.length === 0 ? (
          <p className="text-gray-500 text-sm">
            No hay proveedores calificados
          </p>
        ) : (
          suppliers.map((supplier) => (
            <div
              key={supplier.id}
              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg"
            >
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  {supplier.name}
                </p>
                <p className="text-sm text-gray-500">
                  {supplier.contactPerson || "Sin contacto"}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {supplier.rating?.toFixed(1)}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
