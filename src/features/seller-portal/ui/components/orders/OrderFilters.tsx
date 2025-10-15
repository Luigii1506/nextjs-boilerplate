/**
 * 🔍 ORDER FILTERS COMPONENT
 * ==========================
 *
 * Filters panel for orders list
 *
 * Created: 2025-01-17 - Seller Portal Implementation
 */

"use client";

import { useState } from "react";
import { OrderFilters as OrderFiltersType } from "../../../types";

interface OrderFiltersProps {
  filters: OrderFiltersType;
  onFiltersChange: (filters: OrderFiltersType) => void;
}

export function OrderFilters({ filters, onFiltersChange }: OrderFiltersProps) {
  const [searchInput, setSearchInput] = useState(filters.searchQuery || "");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFiltersChange({ ...filters, searchQuery: searchInput });
  };

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-4">
      {/* Search */}
      <form onSubmit={handleSearchSubmit} className="flex gap-2">
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Buscar por número de orden o email..."
          className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
        >
          Buscar
        </button>
      </form>

      {/* Filter Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Order Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Estado de Orden
          </label>
          <select
            value={filters.status || "ALL"}
            onChange={(e) =>
              onFiltersChange({ ...filters, status: e.target.value as any })
            }
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
          >
            <option value="ALL">Todos</option>
            <option value="PENDING">Pendiente</option>
            <option value="CONFIRMED">Confirmada</option>
            <option value="PROCESSING">Procesando</option>
            <option value="SHIPPED">Enviada</option>
            <option value="DELIVERED">Entregada</option>
            <option value="CANCELLED">Cancelada</option>
            <option value="REFUNDED">Reembolsada</option>
          </select>
        </div>

        {/* Payment Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Estado de Pago
          </label>
          <select
            value={filters.paymentStatus || "ALL"}
            onChange={(e) =>
              onFiltersChange({ ...filters, paymentStatus: e.target.value as any })
            }
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
          >
            <option value="ALL">Todos</option>
            <option value="PENDING">Pendiente</option>
            <option value="PAID">Pagada</option>
            <option value="FAILED">Fallida</option>
            <option value="REFUNDED">Reembolsada</option>
          </select>
        </div>

        {/* Fulfillment Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Estado de Envío
          </label>
          <select
            value={filters.fulfillmentStatus || "ALL"}
            onChange={(e) =>
              onFiltersChange({ ...filters, fulfillmentStatus: e.target.value as any })
            }
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
          >
            <option value="ALL">Todos</option>
            <option value="UNFULFILLED">Sin Procesar</option>
            <option value="PARTIALLY_FULFILLED">Procesado Parcial</option>
            <option value="FULFILLED">Procesado</option>
            <option value="SHIPPED">Enviado</option>
            <option value="DELIVERED">Entregado</option>
          </select>
        </div>
      </div>

      {/* Clear Filters Button */}
      {(filters.status !== "ALL" ||
        filters.paymentStatus !== "ALL" ||
        filters.fulfillmentStatus !== "ALL" ||
        filters.searchQuery) && (
        <button
          onClick={() => {
            setSearchInput("");
            onFiltersChange({});
          }}
          className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
        >
          Limpiar Filtros
        </button>
      )}
    </div>
  );
}
