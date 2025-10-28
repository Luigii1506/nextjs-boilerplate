/**
 * 📄 EVENTS PAGINATION COMPONENT
 * ================================
 *
 * Componente de paginación para eventos de auditoría
 * con controles de navegación y display de información
 *
 * Created: 2025-01-27 - Extracted from ActivitiesTab
 */

"use client";

import React from "react";
import { cn } from "@/shared/utils";

export interface EventsPaginationProps {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  isLoading?: boolean;
  onPageChange: (page: number) => void;
}

/**
 * EventsPagination - Controles de paginación
 */
export const EventsPagination: React.FC<EventsPaginationProps> = ({
  currentPage,
  totalPages,
  totalCount,
  isLoading,
  onPageChange,
}) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
      <div className="text-sm text-gray-600 dark:text-gray-400">
        Mostrando página {currentPage} de {totalPages} ({totalCount} eventos
        totales)
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1 || isLoading}
          className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Anterior
        </button>

        {/* Page Numbers */}
        <div className="flex gap-1">
          {[...Array(Math.min(5, totalPages))].map((_, i) => {
            const pageNum = i + 1;
            return (
              <button
                key={pageNum}
                onClick={() => onPageChange(pageNum)}
                disabled={isLoading}
                className={cn(
                  "px-4 py-2 rounded-lg transition-colors",
                  pageNum === currentPage
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                )}
              >
                {pageNum}
              </button>
            );
          })}
        </div>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages || isLoading}
          className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Siguiente
        </button>
      </div>
    </div>
  );
};

export default EventsPagination;
