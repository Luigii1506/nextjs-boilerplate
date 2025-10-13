/**
 * 📦 ORDERS - BARREL EXPORTS
 * ===========================
 *
 * Centralized exports for orders feature.
 * Clean API for consuming features.
 *
 * @version 1.0.0 - Feature-First Architecture v3
 */

// 🎯 TYPES
export * from "./types";

// 🔌 SERVER ACTIONS
export {
  getOrdersAction,
  getOrderByIdAction,
  createOrderAction,
  cancelOrderAction,
} from "./server/actions";

// 🪝 HOOKS
export {
  useOrders,
  useOrder,
  useCreateOrder,
  useCancelOrder,
  useRefreshOrders,
  ORDER_QUERY_KEYS,
} from "./hooks/useOrders";

// 🔧 UTILITIES
export {
  parseShippingAddress,
  serializeShippingAddress,
} from "./server/mappers";
