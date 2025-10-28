/**
 * 📄 Pagination Helpers
 * =====================
 *
 * Pure functions for pagination calculations.
 * Used across storefront for consistent pagination logic.
 *
 * @module storefront/utils/pagination
 */

/**
 * Calculate total pages based on items and items per page
 */
export function calculateTotalPages(
  totalItems: number,
  itemsPerPage: number
): number {
  return Math.ceil(totalItems / itemsPerPage);
}

/**
 * Get paginated items from an array
 */
export function paginateItems<T>(
  items: T[],
  currentPage: number,
  itemsPerPage: number
): T[] {
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  return items.slice(startIndex, endIndex);
}

/**
 * Calculate visible page numbers for pagination UI
 */
export interface VisiblePagesOptions {
  currentPage: number;
  totalPages: number;
  maxVisible?: number;
}

export interface VisiblePagesResult {
  pages: number[];
  showLeftEllipsis: boolean;
  showRightEllipsis: boolean;
}

export function calculateVisiblePages({
  currentPage,
  totalPages,
  maxVisible = 7,
}: VisiblePagesOptions): VisiblePagesResult {
  const half = Math.floor(maxVisible / 2);

  let start = Math.max(1, currentPage - half);
  const end = Math.min(totalPages, start + maxVisible - 1);

  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1);
  }

  const pages = Array.from({ length: end - start + 1 }, (_, i) => start + i);

  return {
    pages,
    showLeftEllipsis: pages[0] > 1,
    showRightEllipsis: pages[pages.length - 1] < totalPages,
  };
}

/**
 * Calculate pagination info (start, end, total)
 */
export interface PaginationInfo {
  startIndex: number;
  endIndex: number;
  totalItems: number;
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  showingStart: number;
  showingEnd: number;
}

export function getPaginationInfo(
  totalItems: number,
  currentPage: number,
  itemsPerPage: number
): PaginationInfo {
  const totalPages = calculateTotalPages(totalItems, itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const showingStart = Math.min(startIndex + 1, totalItems);
  const showingEnd = Math.min(currentPage * itemsPerPage, totalItems);

  return {
    startIndex,
    endIndex,
    totalItems,
    currentPage,
    totalPages,
    itemsPerPage,
    showingStart,
    showingEnd,
  };
}

/**
 * Check if page number is valid
 */
export function isValidPage(page: number, totalPages: number): boolean {
  return page >= 1 && page <= totalPages;
}

/**
 * Get safe page number (ensures it's within valid range)
 */
export function getSafePage(page: number, totalPages: number): number {
  return Math.max(1, Math.min(page, totalPages));
}
