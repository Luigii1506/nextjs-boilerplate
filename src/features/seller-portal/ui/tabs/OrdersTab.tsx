/**
 * 📦 ORDERS TAB - Seller Portal
 * ==============================
 *
 * Gestión completa de órdenes
 * - Vista en tiempo real
 * - Filtros avanzados
 * - Exportación CSV
 * - Acciones bulk
 *
 * REFACTORED: 2025-01-27
 * - Using shared Tab components (TabHeader, TabWrapper, TabSearchBar, TabLoadingSkeleton)
 * - Reduced from 423 to ~240 lines (43% reduction)
 * - Extracted 5 components
 * - Extracted orders helpers
 * - Clean orchestration pattern
 *
 * Created: 2025-01-17
 * Last Updated: 2025-01-27
 */

"use client";

import { useState } from "react";
import { Package, FileDown } from "lucide-react";
import { useOrders } from "../../hooks/useOrders";
import type { OrderFilters as OrderFiltersType } from "../../types";
import {
  OrderFilters,
  OrderCard,
  BulkActionsToolbar,
  PaginationControls,
} from "../components/orders";
import { exportOrdersToCSV } from "../../utils/orders.helpers";
import {
  TabHeader,
  TabWrapper,
  TabSearchBar,
  TabLoadingSkeleton,
} from "@/shared/ui/components/tabs";

export function OrdersTab() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<OrderFiltersType>({});
  const [page, setPage] = useState(1);
  const [bulkMode, setBulkMode] = useState(false);
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());

  const pageSize = 20;

  // Query orders
  const {
    data: ordersData,
    isLoading,
    error,
  } = useOrders(filters, page, pageSize);

  const orders = ordersData?.items || [];

  // Bulk Selection Handlers
  const handleSelectAll = () => {
    if (selectedOrders.size === orders.length) {
      setSelectedOrders(new Set());
    } else {
      setSelectedOrders(new Set(orders.map((o) => o.id)));
    }
  };

  const toggleOrderSelection = (orderId: string) => {
    const newSelected = new Set(selectedOrders);
    if (newSelected.has(orderId)) {
      newSelected.delete(orderId);
    } else {
      newSelected.add(orderId);
    }
    setSelectedOrders(newSelected);
  };

  const clearSelection = () => {
    setSelectedOrders(new Set());
    setBulkMode(false);
  };

  // Export Handler
  const handleExport = () => {
    const ordersToExport = bulkMode
      ? orders.filter((o) => selectedOrders.has(o.id))
      : orders;
    exportOrdersToCSV(ordersToExport, "ordenes-vendedor.csv");
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setFilters({ ...filters, searchQuery: term || undefined });
    setPage(1);
  };

  return (
    <TabWrapper>
      <TabHeader
        icon={<Package className="w-8 h-8 text-blue-600 dark:text-blue-400" />}
        title="Órdenes"
        description="Gestiona y monitorea todas tus órdenes"
        actions={[
          {
            label: "Exportar",
            icon: <FileDown className="w-4 h-4" />,
            onClick: handleExport,
            disabled: bulkMode && selectedOrders.size === 0,
            variant: "secondary",
          },
        ]}
      />

      {/* Search Bar */}
      <TabSearchBar
        placeholder="Buscar por ID, cliente, email..."
        value={searchTerm}
        onChange={handleSearch}
      />

      {/* Filters */}
      <OrderFilters filters={filters} onFiltersChange={setFilters} />

      {/* Bulk Actions Toolbar */}
      <BulkActionsToolbar
        bulkMode={bulkMode}
        onToggleBulkMode={() => setBulkMode(!bulkMode)}
        selectedCount={selectedOrders.size}
        totalCount={orders.length}
        onSelectAll={handleSelectAll}
        onClearSelection={clearSelection}
        onExport={handleExport}
        canExport={selectedOrders.size > 0}
      />

      {/* Orders List */}
      <div className="space-y-4">
        {/* Loading State */}
        {isLoading && (
          <TabLoadingSkeleton type="list" count={5} showHeader={false} />
        )}

        {/* Error State */}
        {error && (
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-12 text-center">
            <div className="text-red-600 mb-2">Error al cargar órdenes</div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && orders.length === 0 && (
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-12 text-center">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No se encontraron órdenes
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {searchTerm || Object.keys(filters).length > 0
                ? "Intenta ajustar los filtros de búsqueda"
                : "Aún no hay órdenes registradas"}
            </p>
          </div>
        )}

        {/* Orders List */}
        {!isLoading &&
          !error &&
          orders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              selectionMode={bulkMode}
              isSelected={selectedOrders.has(order.id)}
              onSelectionToggle={() => toggleOrderSelection(order.id)}
            />
          ))}
      </div>

      {/* Pagination */}
      {ordersData && ordersData.totalPages > 1 && (
        <PaginationControls
          currentPage={page}
          totalPages={ordersData.totalPages}
          totalItems={ordersData.total}
          pageSize={pageSize}
          onPageChange={setPage}
        />
      )}
    </TabWrapper>
  );
}
