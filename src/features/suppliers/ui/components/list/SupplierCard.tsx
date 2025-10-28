/**
 * 📊 SUPPLIER CARD COMPONENT
 * ===========================
 *
 * Display card for individual supplier with actions
 *
 * Created: 2025-01-27
 */

"use client";

import React from "react";
import { Star, Phone, Mail, MapPin, Edit, Eye, Trash2 } from "lucide-react";
import type { SupplierWithRelations } from "@/shared/types";

export interface SupplierCardProps {
  supplier: SupplierWithRelations;
  onView: (supplier: SupplierWithRelations) => void;
  onEdit: (supplier: SupplierWithRelations) => void;
  onDelete: (supplier: SupplierWithRelations) => void;
}

export const SupplierCard: React.FC<SupplierCardProps> = ({
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
        {supplier.addressLine1 && (
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <MapPin className="w-4 h-4" />
            <span className="line-clamp-1">{supplier.addressLine1}</span>
          </div>
        )}
      </div>

      {/* Contact Person */}
      {supplier.contactPerson && (
        <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
            Contacto
          </p>
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {supplier.contactPerson}
          </p>
          {supplier.phone && (
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              {supplier.phone}
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
