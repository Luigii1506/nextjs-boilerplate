/**
 * 📦 ORDERS HELPERS
 * ==================
 *
 * Pure utility functions for orders management
 *
 * Created: 2025-01-27
 */

import type { OrderSummary } from "../types";

/**
 * Format currency for orders
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 0,
  }).format(amount);
}

/**
 * Export orders to CSV
 */
export function exportOrdersToCSV(
  orders: OrderSummary[],
  filename?: string
): void {
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
    ...orders.map((order) =>
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
    filename || `orders_${new Date().toISOString().split("T")[0]}.csv`
  );
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Calculate pagination range for display
 */
export function calculatePaginationRange(
  currentPage: number,
  totalPages: number,
  maxButtons: number = 5
): number[] {
  const pages: number[] = [];
  const halfButtons = Math.floor(maxButtons / 2);

  let startPage = Math.max(1, currentPage - halfButtons);
  let endPage = Math.min(totalPages, currentPage + halfButtons);

  // Adjust if we're at the beginning or end
  if (currentPage <= halfButtons) {
    endPage = Math.min(totalPages, maxButtons);
  }
  if (currentPage + halfButtons >= totalPages) {
    startPage = Math.max(1, totalPages - maxButtons + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return pages;
}

/**
 * Filter pages for smart pagination display (with ellipsis)
 */
export function getSmartPaginationPages(
  currentPage: number,
  totalPages: number
): number[] {
  return Array.from({ length: totalPages }, (_, i) => i + 1).filter((p) => {
    // Show first page, last page, current page, and pages around current
    return (
      p === 1 ||
      p === totalPages ||
      (p >= currentPage - 2 && p <= currentPage + 2)
    );
  });
}

/**
 * Check if ellipsis should be shown between page numbers
 */
export function shouldShowEllipsis(
  currentPageNumber: number,
  previousPageNumber: number | undefined
): boolean {
  return !!previousPageNumber && currentPageNumber - previousPageNumber > 1;
}
