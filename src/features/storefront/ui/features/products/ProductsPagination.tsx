/**
 * 📄 PRODUCTS PAGINATION COMPONENT
 * =================================
 *
 * Componente de paginación profesional con navegación inteligente,
 * ellipsis y scroll automático. Optimizado para performance.
 *
 * @version 2.0.0 - Separated Component
 */

"use client";

import React, { memo, useMemo } from "react";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { ProductsPaginationProps } from "./types";

const ProductsPagination: React.FC<ProductsPaginationProps> = memo(
  function ProductsPagination({
    currentPage,
    totalPages,
    onPageChange,
    allowAnimations,
  }) {
    // 📭 EARLY RETURN - No pagination needed
    if (totalPages <= 1) return null;

    // 🔢 VISIBLE PAGES CALCULATION
    const visiblePages = useMemo(() => {
      const maxVisible = 7;
      const half = Math.floor(maxVisible / 2);

      let start = Math.max(1, currentPage - half);
      const end = Math.min(totalPages, start + maxVisible - 1);

      if (end - start + 1 < maxVisible) {
        start = Math.max(1, end - maxVisible + 1);
      }

      return Array.from({ length: end - start + 1 }, (_, i) => start + i);
    }, [currentPage, totalPages]);

    const showLeftEllipsis = visiblePages[0] > 1;
    const showRightEllipsis =
      visiblePages[visiblePages.length - 1] < totalPages;

    return (
      <div
        className={cn(
          "flex items-center justify-center space-x-2 mt-12 py-8",
          allowAnimations && "animate-customerFadeInUp"
        )}
      >
        {/* Previous Button */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={cn(
            "flex items-center space-x-2 px-4 py-2 rounded-lg border transition-all duration-200",
            currentPage === 1
              ? "border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-600 cursor-not-allowed"
              : "border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
          )}
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Anterior</span>
        </button>

        {/* First Page + Ellipsis */}
        {showLeftEllipsis && (
          <>
            <button
              onClick={() => onPageChange(1)}
              className="w-10 h-10 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              1
            </button>
            <span className="text-gray-400">...</span>
          </>
        )}

        {/* Visible Pages */}
        {visiblePages.map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={cn(
              "w-10 h-10 rounded-lg border transition-all duration-200",
              page === currentPage
                ? "bg-blue-600 border-blue-600 text-white shadow-lg"
                : "border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
            )}
          >
            {page}
          </button>
        ))}

        {/* Last Page + Ellipsis */}
        {showRightEllipsis && (
          <>
            <span className="text-gray-400">...</span>
            <button
              onClick={() => onPageChange(totalPages)}
              className="w-10 h-10 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              {totalPages}
            </button>
          </>
        )}

        {/* Next Button */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={cn(
            "flex items-center space-x-2 px-4 py-2 rounded-lg border transition-all duration-200",
            currentPage === totalPages
              ? "border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-600 cursor-not-allowed"
              : "border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
          )}
        >
          <span className="hidden sm:inline">Siguiente</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    );
  }
);

export default ProductsPagination;
