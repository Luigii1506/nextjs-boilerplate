/**
 * 📄 PAGINATION CONTROLS COMPONENT
 * ==================================
 *
 * Smart pagination with page numbers and ellipsis
 *
 * Created: 2025-01-27
 */

"use client";

import React from "react";
import {
  getSmartPaginationPages,
  shouldShowEllipsis,
} from "../../../utils/orders.helpers";

export interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

/**
 * PaginationControls - Navigation between pages
 */
export const PaginationControls: React.FC<PaginationControlsProps> = React.memo(
  ({ currentPage, totalPages, totalItems, pageSize, onPageChange }) => {
    if (totalPages <= 1) return null;

    const pages = getSmartPaginationPages(currentPage, totalPages);
    const startItem = (currentPage - 1) * pageSize + 1;
    const endItem = Math.min(currentPage * pageSize, totalItems);

    return (
      <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 pt-4">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Mostrando {startItem} - {endItem} de {totalItems} órdenes
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Anterior
          </button>

          {/* Page Numbers */}
          <div className="flex gap-1">
            {pages.map((p, idx, arr) => {
              const prevPage = arr[idx - 1];
              const showEllipsisBefore = shouldShowEllipsis(p, prevPage);

              return (
                <div key={p} className="flex gap-1">
                  {showEllipsisBefore && (
                    <span className="px-3 py-1 text-gray-500 dark:text-gray-400">
                      ...
                    </span>
                  )}
                  <button
                    onClick={() => onPageChange(p)}
                    className={`px-3 py-1 rounded-md text-sm font-medium ${
                      p === currentPage
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
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Siguiente
          </button>
        </div>
      </div>
    );
  }
);

PaginationControls.displayName = "PaginationControls";
