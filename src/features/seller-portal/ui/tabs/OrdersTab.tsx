/**
 * 📦 ORDERS TAB COMPONENT
 * =======================
 *
 * Main tab for managing all orders (ONLINE + POS)
 * - List view with filters
 * - Pagination
 * - Quick actions
 * - Order details modal
 *
 * Created: 2025-01-17 - Seller Portal Implementation
 */

"use client";

import { useState } from "react";
import { useOrders, useOrdersStats, useAddTrackingInfo, useUpdateOrderStatus } from "../../hooks/useOrders";
import { OrderFilters as OrderFiltersType, OrderSummary, OrderStatus } from "../../types";
import { OrderCard } from "../components/orders/OrderCard";
import { OrderFilters } from "../components/orders/OrderFilters";
import { OrderDetailModal } from "../components/orders/OrderDetailModal";
import { AddTrackingModal } from "../components/orders/AddTrackingModal";

export function OrdersTab() {
  const [filters, setFilters] = useState<OrderFiltersType>({});
  const [page, setPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<OrderSummary | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [trackingModalOpen, setTrackingModalOpen] = useState(false);
  const [orderForTracking, setOrderForTracking] = useState<OrderSummary | null>(null);
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());
  const [bulkMode, setBulkMode] = useState(false);
  const pageSize = 20;

  // Fetch orders with current filters and pagination
  const {
    data: ordersData,
    isLoading: ordersLoading,
    error: ordersError,
  } = useOrders(filters, page, pageSize);

  // Fetch statistics
  const { data: stats, isLoading: statsLoading } = useOrdersStats(filters);

  // Tracking mutations
  const addTrackingMutation = useAddTrackingInfo();
  const updateStatusMutation = useUpdateOrderStatus();

  // Handle filter changes
  const handleFiltersChange = (newFilters: OrderFiltersType) => {
    setFilters(newFilters);
    setPage(1); // Reset to first page when filters change
  };

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Handle order click - Open detail modal
  const handleOrderClick = (order: OrderSummary) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  // Handle modal close
  const handleCloseModal = () => {
    setIsModalOpen(false);
    // Small delay before clearing selected order for smooth animation
    setTimeout(() => setSelectedOrder(null), 300);
  };

  // Handle add tracking
  const handleAddTracking = (order: OrderSummary) => {
    setOrderForTracking(order);
    setTrackingModalOpen(true);
  };

  const handleCloseTrackingModal = () => {
    setTrackingModalOpen(false);
    setTimeout(() => setOrderForTracking(null), 300);
  };

  const handleSubmitTracking = async (data: {
    trackingNumber: string;
    carrier: string;
    estimatedDelivery?: string;
    notes?: string;
  }) => {
    if (!orderForTracking) return;

    try {
      // Add tracking info
      await addTrackingMutation.mutateAsync({
        orderId: orderForTracking.id,
        trackingNumber: data.trackingNumber,
        shippingCarrier: data.carrier,
      });

      // Update status to SHIPPED
      await updateStatusMutation.mutateAsync({
        orderId: orderForTracking.id,
        status: OrderStatus.SHIPPED,
        notes: data.notes || `Tracking agregado: ${data.trackingNumber}`,
      });

      handleCloseTrackingModal();
    } catch (error) {
      console.error("Error adding tracking:", error);
      throw error;
    }
  };

  // Bulk selection handlers
  const toggleOrderSelection = (orderId: string) => {
    const newSelected = new Set(selectedOrders);
    if (newSelected.has(orderId)) {
      newSelected.delete(orderId);
    } else {
      newSelected.add(orderId);
    }
    setSelectedOrders(newSelected);
  };

  const selectAllOrders = () => {
    if (ordersData) {
      const allIds = new Set(ordersData.items.map((o) => o.id));
      setSelectedOrders(allIds);
    }
  };

  const clearSelection = () => {
    setSelectedOrders(new Set());
  };

  // Export functionality
  const exportOrders = () => {
    if (!ordersData) return;

    const ordersToExport =
      selectedOrders.size > 0
        ? ordersData.items.filter((o) => selectedOrders.has(o.id))
        : ordersData.items;

    // Create CSV content
    const headers = [
      "Número",
      "Fecha",
      "Cliente",
      "Email",
      "Total",
      "Items",
      "Estado",
      "Pago",
      "Envío",
      "Tracking",
    ];
    const csvContent = [
      headers.join(","),
      ...ordersToExport.map((order) =>
        [
          order.number,
          new Date(order.placedAt).toLocaleString("es-MX"),
          order.customerName || "",
          order.customerEmail,
          order.total,
          order.itemsCount,
          order.status,
          order.paymentStatus,
          order.fulfillmentStatus,
          order.trackingNumber || "",
        ].join(",")
      ),
    ].join("\n");

    // Download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `orders_${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Órdenes</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Gestiona todas las órdenes de tus canales de venta
          </p>
        </div>

        {/* Quick Stats */}
        {!statsLoading && stats && (
          <div className="flex gap-4">
            <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg px-4 py-2">
              <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">Total Órdenes</p>
              <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{stats.totalOrders}</p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg px-4 py-2">
              <p className="text-xs text-green-600 dark:text-green-400 font-medium">Ingresos</p>
              <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                {new Intl.NumberFormat("es-MX", {
                  style: "currency",
                  currency: "MXN",
                  minimumFractionDigits: 0,
                }).format(stats.totalRevenue)}
              </p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-800 rounded-lg px-4 py-2">
              <p className="text-xs text-purple-600 dark:text-purple-400 font-medium">Ticket Promedio</p>
              <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                {new Intl.NumberFormat("es-MX", {
                  style: "currency",
                  currency: "MXN",
                  minimumFractionDigits: 0,
                }).format(stats.averageOrderValue)}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Filters */}
      <OrderFilters filters={filters} onFiltersChange={handleFiltersChange} />

      {/* Bulk Actions Toolbar */}
      <div className="flex items-center justify-between bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3">
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              setBulkMode(!bulkMode);
              if (bulkMode) clearSelection();
            }}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              bulkMode
                ? "bg-blue-600 dark:bg-blue-500 text-white hover:bg-blue-700 dark:hover:bg-blue-600"
                : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
            }`}
          >
            {bulkMode ? "✓ Modo Selección" : "☐ Seleccionar Múltiples"}
          </button>

          {bulkMode && ordersData && ordersData.items.length > 0 && (
            <>
              <button
                onClick={selectAllOrders}
                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
              >
                Seleccionar Todo
              </button>
              {selectedOrders.size > 0 && (
                <button
                  onClick={clearSelection}
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 font-medium"
                >
                  Limpiar ({selectedOrders.size})
                </button>
              )}
            </>
          )}
        </div>

        <button
          onClick={exportOrders}
          disabled={!ordersData || ordersData.items.length === 0}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 dark:bg-green-500 text-white rounded-md hover:bg-green-700 dark:hover:bg-green-600 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          Exportar CSV {selectedOrders.size > 0 && `(${selectedOrders.size})`}
        </button>
      </div>

      {/* Orders List */}
      {ordersLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Cargando órdenes...</p>
          </div>
        </div>
      ) : ordersError ? (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4 text-center">
          <p className="text-red-800 dark:text-red-200">
            Error al cargar órdenes. Por favor intenta de nuevo.
          </p>
        </div>
      ) : !ordersData || ordersData.items.length === 0 ? (
        <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-12 text-center">
          <p className="text-gray-500 dark:text-gray-400">No se encontraron órdenes</p>
          {Object.keys(filters).length > 0 && (
            <button
              onClick={() => handleFiltersChange({})}
              className="mt-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium text-sm"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Orders Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ordersData.items.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onClick={() => handleOrderClick(order)}
                selectionMode={bulkMode}
                isSelected={selectedOrders.has(order.id)}
                onSelectionToggle={() => toggleOrderSelection(order.id)}
                onAddTracking={handleAddTracking}
              />
            ))}
          </div>

          {/* Pagination */}
          {ordersData.totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 pt-4">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Mostrando {(page - 1) * pageSize + 1} -{" "}
                {Math.min(page * pageSize, ordersData.total)} de{" "}
                {ordersData.total} órdenes
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                  className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Anterior
                </button>

                {/* Page Numbers */}
                <div className="flex gap-1">
                  {Array.from({ length: ordersData.totalPages }, (_, i) => i + 1)
                    .filter((p) => {
                      // Show first page, last page, current page, and pages around current
                      return (
                        p === 1 ||
                        p === ordersData.totalPages ||
                        (p >= page - 2 && p <= page + 2)
                      );
                    })
                    .map((p, idx, arr) => {
                      // Add ellipsis if there's a gap
                      const prevPage = arr[idx - 1];
                      const showEllipsis = prevPage && p - prevPage > 1;

                      return (
                        <div key={p} className="flex gap-1">
                          {showEllipsis && (
                            <span className="px-3 py-1 text-gray-500 dark:text-gray-400">...</span>
                          )}
                          <button
                            onClick={() => handlePageChange(p)}
                            className={`px-3 py-1 rounded-md text-sm font-medium ${
                              p === page
                                ? "bg-blue-600 dark:bg-blue-500 text-white"
                                : "border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 bg-white dark:bg-gray-800"
                            }`}
                          >
                            {p}
                          </button>
                        </div>
                      );
                    })}
                </div>

                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === ordersData.totalPages}
                  className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Order Detail Modal */}
      <OrderDetailModal
        order={selectedOrder}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />

      {/* Add Tracking Modal */}
      <AddTrackingModal
        order={orderForTracking}
        isOpen={trackingModalOpen}
        onClose={handleCloseTrackingModal}
        onSubmit={handleSubmitTracking}
        isLoading={addTrackingMutation.isPending || updateStatusMutation.isPending}
      />
    </div>
  );
}
