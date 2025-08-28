/**
 * 📦 CHECKOUT SERVER - BARREL EXPORTS
 * ===================================
 *
 * Centralized exports for all checkout server functionality
 */

// Actions (Main interface for frontend)
export * from "./actions";

// Services (Business logic)
export * from "./service";

// Queries (Database operations)
export * from "./queries";

// Mappers (Data transformation)
export * from "./mappers";

// Validators (Server-side validation)
export * from "./validators";

// Re-export commonly used functions with shorter names
export {
  createOrderAction as createOrder,
  processPaymentAction as processPayment,
  calculateOrderAction as calculateOrder,
  calculateShippingAction as calculateShipping,
  getOrderAction as getOrder,
  getUserOrdersAction as getUserOrders,
} from "./actions";
