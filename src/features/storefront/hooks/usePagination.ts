"use client";
/**
 * 📄 usePagination Hook
 * =====================
 *
 * Custom hook for managing pagination logic.
 * Encapsulates pagination state and paginated items computation.
 *
 * @module storefront/hooks/usePagination
 */

import { useState, useMemo, useCallback } from "react";
import {
  paginateItems,
  getPaginationInfo,
  calculateVisiblePages,
  type PaginationInfo,
  type VisiblePagesResult,
} from "../utils";

export interface UsePaginationOptions<T> {
  items: T[];
  initialPage?: number;
  initialItemsPerPage?: number;
}

export interface UsePaginationReturn<T> {
  currentPage: number;
  itemsPerPage: number;
  totalPages: number;
  paginatedItems: T[];
  paginationInfo: PaginationInfo;
  visiblePages: VisiblePagesResult;
  setCurrentPage: (page: number) => void;
  setItemsPerPage: (itemsPerPage: number) => void;
  goToNextPage: () => void;
  goToPreviousPage: () => void;
  goToFirstPage: () => void;
  goToLastPage: () => void;
  canGoNext: boolean;
  canGoPrevious: boolean;
}

/**
 * Hook for managing pagination
 */
export function usePagination<T>({
  items,
  initialPage = 1,
  initialItemsPerPage = 24,
}: UsePaginationOptions<T>): UsePaginationReturn<T> {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [itemsPerPage, setItemsPerPage] = useState(initialItemsPerPage);

  // Calculate pagination info
  const paginationInfo = useMemo(() => {
    return getPaginationInfo(items.length, currentPage, itemsPerPage);
  }, [items.length, currentPage, itemsPerPage]);

  const totalPages = paginationInfo.totalPages;

  // Get paginated items
  const paginatedItems = useMemo(() => {
    return paginateItems(items, currentPage, itemsPerPage);
  }, [items, currentPage, itemsPerPage]);

  // Calculate visible pages
  const visiblePages = useMemo(() => {
    return calculateVisiblePages({ currentPage, totalPages });
  }, [currentPage, totalPages]);

  // Navigation flags
  const canGoNext = currentPage < totalPages;
  const canGoPrevious = currentPage > 1;

  // Set current page with validation
  const handleSetCurrentPage = useCallback(
    (page: number) => {
      if (page >= 1 && page <= totalPages) {
        setCurrentPage(page);
      }
    },
    [totalPages]
  );

  // Set items per page and reset to page 1
  const handleSetItemsPerPage = useCallback((newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  }, []);

  // Navigation functions
  const goToNextPage = useCallback(() => {
    if (canGoNext) {
      setCurrentPage((prev) => prev + 1);
    }
  }, [canGoNext]);

  const goToPreviousPage = useCallback(() => {
    if (canGoPrevious) {
      setCurrentPage((prev) => prev - 1);
    }
  }, [canGoPrevious]);

  const goToFirstPage = useCallback(() => {
    setCurrentPage(1);
  }, []);

  const goToLastPage = useCallback(() => {
    setCurrentPage(totalPages);
  }, [totalPages]);

  return {
    currentPage,
    itemsPerPage,
    totalPages,
    paginatedItems,
    paginationInfo,
    visiblePages,
    setCurrentPage: handleSetCurrentPage,
    setItemsPerPage: handleSetItemsPerPage,
    goToNextPage,
    goToPreviousPage,
    goToFirstPage,
    goToLastPage,
    canGoNext,
    canGoPrevious,
  };
}
