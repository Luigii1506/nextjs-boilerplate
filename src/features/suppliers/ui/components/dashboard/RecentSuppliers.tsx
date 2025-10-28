/**
 * ⏰ RECENT SUPPLIERS COMPONENT
 * ==============================
 *
 * Displays list of recently added suppliers
 *
 * Created: 2025-01-27
 */

"use client";

import React from "react";
import { Clock } from "lucide-react";
import type { SupplierWithRelations } from "@/shared/types";

export interface RecentSuppliersProps {
  suppliers: SupplierWithRelations[];
  isLoading: boolean;
}

export const RecentSuppliers: React.FC<RecentSuppliersProps> = ({
  suppliers,
  isLoading,
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Proveedores Recientes
        </h3>
        <Clock className="w-5 h-5 text-gray-400" />
      </div>
      <div className="space-y-3">
        {isLoading ? (
          <p className="text-gray-500 text-sm">Cargando...</p>
        ) : suppliers.length === 0 ? (
          <p className="text-gray-500 text-sm">No hay proveedores aún</p>
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
                  {supplier.email || "Sin email"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {supplier.isActive ? (
                  <span className="px-2 py-1 text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded">
                    Activo
                  </span>
                ) : (
                  <span className="px-2 py-1 text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded">
                    Inactivo
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
