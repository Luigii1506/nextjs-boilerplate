/**
 * 🔑 POS - Query Keys
 * ===================
 *
 * Query keys para TanStack Query en el módulo POS.
 * Organiza las keys de caché de manera estructurada.
 *
 * @module pos/hooks/queryKeys
 * @version 1.0.0
 */

// ========================================
// BASE KEYS
// ========================================

export const posKeys = {
  all: ["pos"] as const,

  // ========================================
  // PRODUCTS
  // ========================================
  products: () => [...posKeys.all, "products"] as const,
  productList: (filters?: {
    search?: string;
    categoryId?: string;
    page?: number;
  }) => [...posKeys.products(), "list", filters] as const,
  product: (productId: string) => [...posKeys.products(), productId] as const,
  productByBarcode: (barcode: string) =>
    [...posKeys.products(), "barcode", barcode] as const,

  // ========================================
  // CATEGORIES
  // ========================================
  categories: () => [...posKeys.all, "categories"] as const,
  categoryList: () => [...posKeys.categories(), "list"] as const,
  category: (categoryId: string) =>
    [...posKeys.categories(), categoryId] as const,

  // ========================================
  // SESSION
  // ========================================
  session: () => [...posKeys.all, "session"] as const,
  activeSession: (userId: string) =>
    [...posKeys.session(), "active", userId] as const,
  sessionById: (sessionId: string) =>
    [...posKeys.session(), sessionId] as const,
  sessionWithSummary: (sessionId: string) =>
    [...posKeys.session(), sessionId, "summary"] as const,
  sessionHistory: (userId: string, filters?: { status?: string }) =>
    [...posKeys.session(), "history", userId, filters] as const,
  sessionTransactions: (sessionId: string) =>
    [...posKeys.session(), sessionId, "transactions"] as const,

  // ========================================
  // SALE (CART)
  // ========================================
  sale: () => [...posKeys.all, "sale"] as const,
  activeSale: (sessionId: string) =>
    [...posKeys.sale(), "active", sessionId] as const,
  saleWithSummary: (sessionId: string) =>
    [...posKeys.sale(), sessionId, "summary"] as const,

  // ========================================
  // TRANSACTIONS
  // ========================================
  transactions: () => [...posKeys.all, "transactions"] as const,
  transactionList: (filters?: {
    sessionId?: string;
    userId?: string;
    limit?: number;
  }) => [...posKeys.transactions(), "list", filters] as const,
  transaction: (transactionId: string) =>
    [...posKeys.transactions(), transactionId] as const,
  transactionByNumber: (transactionNumber: string) =>
    [...posKeys.transactions(), "number", transactionNumber] as const,
  transactionDetails: (transactionId: string) =>
    [...posKeys.transactions(), transactionId, "details"] as const,

  // ========================================
  // DASHBOARD
  // ========================================
  dashboard: () => [...posKeys.all, "dashboard"] as const,
  dashboardData: (userId: string) =>
    [...posKeys.dashboard(), userId] as const,
  dailyStats: (date?: string) =>
    [...posKeys.dashboard(), "daily-stats", date] as const,
  topProducts: (filters?: { startDate?: string; endDate?: string }) =>
    [...posKeys.dashboard(), "top-products", filters] as const,

  // ========================================
  // REPORTS
  // ========================================
  reports: () => [...posKeys.all, "reports"] as const,
  salesReport: (startDate: string, endDate: string) =>
    [...posKeys.reports(), "sales", startDate, endDate] as const,
};

/**
 * Helper para invalidar todas las queries de POS
 */
export const invalidateAllPOSQueries = (queryClient: any) => {
  queryClient.invalidateQueries({ queryKey: posKeys.all });
};

/**
 * Helper para invalidar queries de sesión
 */
export const invalidateSessionQueries = (queryClient: any, userId?: string) => {
  if (userId) {
    queryClient.invalidateQueries({ queryKey: posKeys.activeSession(userId) });
    queryClient.invalidateQueries({ queryKey: posKeys.sessionHistory(userId) });
  } else {
    queryClient.invalidateQueries({ queryKey: posKeys.session() });
  }
};

/**
 * Helper para invalidar queries de venta
 */
export const invalidateSaleQueries = (queryClient: any, sessionId?: string) => {
  if (sessionId) {
    queryClient.invalidateQueries({ queryKey: posKeys.activeSale(sessionId) });
    queryClient.invalidateQueries({
      queryKey: posKeys.saleWithSummary(sessionId),
    });
  } else {
    queryClient.invalidateQueries({ queryKey: posKeys.sale() });
  }
};

/**
 * Helper para invalidar queries de transacciones
 */
export const invalidateTransactionQueries = (queryClient: any) => {
  queryClient.invalidateQueries({ queryKey: posKeys.transactions() });
};

/**
 * Helper para invalidar queries de dashboard
 */
export const invalidateDashboardQueries = (queryClient: any, userId?: string) => {
  if (userId) {
    queryClient.invalidateQueries({ queryKey: posKeys.dashboardData(userId) });
  } else {
    queryClient.invalidateQueries({ queryKey: posKeys.dashboard() });
  }
};
