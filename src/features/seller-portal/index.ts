/**
 * 👨‍💼 SELLER PORTAL - PUBLIC API
 * ================================
 *
 * Main export file for the Seller Portal module
 *
 * Usage:
 *   import { SellerPortalScreen, useOrders } from '@/features/seller-portal';
 *
 * Created: 2025-01-17 - Seller Portal Implementation
 */

// ========================================
// 🎨 UI COMPONENTS
// ========================================

export { SellerPortalScreen } from "./ui/routes/seller-portal.screen";
export { OrdersTab } from "./ui/tabs/OrdersTab";
export { TrackingTab } from "./ui/tabs/TrackingTab";
export { ProductsTab } from "./ui/tabs/ProductsTab";
export { PromotionsTab } from "./ui/tabs/PromotionsTab";
export { CouponsTab } from "./ui/tabs/CouponsTab";
export { AnalyticsTab } from "./ui/tabs/AnalyticsTab";
export { OrderCard } from "./ui/components/orders/OrderCard";
export { OrderStatusBadge } from "./ui/components/orders/OrderStatusBadge";
export { OrderFilters as OrderFiltersComponent } from "./ui/components/orders/OrderFilters";

// ========================================
// 🪝 HOOKS
// ========================================

export {
  useOrders,
  useOrderDetails,
  useOrdersStats,
  usePendingOrdersCount,
  useUpdateOrderStatus,
  useAddTrackingInfo,
  useCancelOrder,
} from "./hooks/useOrders";

export {
  useProducts,
  useCategories,
  useUpdateProductVisibility,
  useToggleProductActive,
  useBulkUpdateVisibility,
} from "./hooks/useProducts";

export {
  usePromotions,
  usePromotionDetails,
  useActivePromotionsCount,
  usePromotionsStats,
  useCreatePromotion,
  useUpdatePromotion,
  useDeletePromotion,
  useTogglePromotionActive,
  useDuplicatePromotion,
} from "./hooks/usePromotions";

export {
  useCoupons,
  useCouponDetails,
  useActiveCouponsCount,
  useCouponsStats,
  useValidateCouponCode,
  useCreateCoupon,
  useUpdateCoupon,
  useDeleteCoupon,
  useToggleCouponActive,
  useDuplicateCoupon,
} from "./hooks/useCoupons";

export {
  useAnalyticsMetrics,
  useRevenueByChannel,
  useTopProducts,
  useDiscountAnalytics,
  useDailyRevenue,
  useOrderStatusDistribution,
} from "./hooks/useAnalytics";

// ========================================
// 🎬 SERVER ACTIONS
// ========================================

export {
  updateOrderStatusAction,
  addTrackingInfoAction,
  addAdminNotesAction,
  cancelOrderAction,
} from "./server/actions/orders.actions";

export {
  updateProductVisibilityAction,
  toggleProductActiveAction,
  bulkUpdateVisibilityAction,
} from "./server/actions/products.actions";

export {
  createPromotionAction,
  updatePromotionAction,
  deletePromotionAction,
  togglePromotionActiveAction,
  duplicatePromotionAction,
  getPromotionsAction,
  getPromotionDetailsAction,
  getActivePromotionsCountAction,
  getPromotionsStatsAction,
} from "./server/actions/promotions.actions";

export {
  createCouponAction,
  updateCouponAction,
  deleteCouponAction,
  toggleCouponActiveAction,
  duplicateCouponAction,
  validateCouponCodeAction,
  getCouponsAction,
  getCouponDetailsAction,
  getActiveCouponsCountAction,
  getCouponsStatsAction,
} from "./server/actions/coupons.actions";

export {
  getAnalyticsMetricsAction,
  getRevenueByChannelAction,
  getTopProductsAction,
  getDiscountAnalyticsAction,
  getDailyRevenueAction,
  getOrderStatusDistributionAction,
} from "./server/actions/analytics.actions";

// ========================================
// 📊 QUERIES
// ========================================

export {
  getOrdersQuery,
  getOrderDetailsQuery,
  getOrdersStatsQuery,
  getPendingOrdersCountQuery,
  getOrdersNeedingTrackingQuery,
} from "./server/queries/orders.queries";

export {
  getProductsQuickView,
  getCategoriesForFilter,
} from "./server/queries/products.queries";

export {
  getPromotionsQuery,
  getPromotionDetailsQuery,
  getActivePromotionsCountQuery,
  getPromotionsStatsQuery,
} from "./server/queries/promotions.queries";

export type {
  PromotionListItem,
  PromotionDetails as PromotionDetailsType,
  PromotionFilters,
} from "./server/queries/promotions.queries";

export {
  getCouponsQuery,
  getCouponDetailsQuery,
  getActiveCouponsCountQuery,
  getCouponsStatsQuery,
  isCouponCodeAvailableQuery,
} from "./server/queries/coupons.queries";

export type {
  CouponListItem,
  CouponDetails as CouponDetailsType,
  CouponFilters,
} from "./server/queries/coupons.queries";

export {
  getAnalyticsMetricsQuery,
  getRevenueByChannelQuery,
  getTopProductsQuery,
  getDiscountAnalyticsQuery,
  getDailyRevenueQuery,
  getOrderStatusDistributionQuery,
} from "./server/queries/analytics.queries";

export type {
  AnalyticsMetrics,
  ChannelRevenue,
  TopProduct,
  DiscountAnalytics,
  DailyRevenue,
  OrderStatusDistribution,
} from "./server/queries/analytics.queries";

// ========================================
// 📊 TYPES
// ========================================

export type {
  // Orders
  OrderFilters,
  OrderSummary,
  OrderDetails,
  OrderItemDetails,
  OrderStatusHistoryItem,

  // Tracking
  TrackingUpdate,
  TrackingInfo,
  TrackingTimelineEvent,

  // Products
  ProductQuickView,
  ProductVisibilityUpdate,

  // Promotions & Coupons
  PromotionFormData,
  CouponFormData,

  // Analytics
  AnalyticsSummary,
  RevenueChartData,

  // Reviews
  ReviewSummary,

  // Responses
  ApiResponse,
  PaginatedResponse,

  // Tabs
  SellerPortalTab,
  TabConfig,
} from "./types";

// Re-export Prisma enums
export {
  OrderStatus,
  PaymentStatus,
  FulfillmentStatus,
  SalesChannel,
  ProductVisibility,
  PromotionType,
  CouponType,
  DiscountType,
  AppliesTo,
} from "@prisma/client";
