/**
 * 🛒 STOREFRONT LOGGING UTILITIES
 * ===============================
 *
 * Lightweight logging for Storefront Customer Module
 * Performance tracking, security events, and audit trails
 * (Simplified version without winston dependency)
 *
 * Created: 2025-01-17 - Storefront Customer Module
 */

// 🎯 Simple Logger Interface
interface Logger {
  info(message: string, meta?: any): void;
  error(message: string, meta?: any): void;
  warn(message: string, meta?: any): void;
  debug(message: string, meta?: any): void;
}

// 🎯 Create simple console logger
const createConsoleLogger = (service: string): Logger => ({
  info: (message: string, meta?: any) => {
    console.log(`[${service.toUpperCase()}] INFO:`, message, meta || "");
  },
  error: (message: string, meta?: any) => {
    console.error(`[${service.toUpperCase()}] ERROR:`, message, meta || "");
  },
  warn: (message: string, meta?: any) => {
    console.warn(`[${service.toUpperCase()}] WARN:`, message, meta || "");
  },
  debug: (message: string, meta?: any) => {
    if (process.env.NODE_ENV === "development") {
      console.debug(`[${service.toUpperCase()}] DEBUG:`, message, meta || "");
    }
  },
});

// 📊 Server Actions Logger
export const storefrontServerActionLogger: Logger =
  createConsoleLogger("storefront-actions");

// 🔐 Security Logger
export const storefrontSecurityLogger: Logger = createConsoleLogger(
  "storefront-security"
);

// 💖 Wishlist Logger
export const wishlistLogger: Logger = createConsoleLogger(
  "storefront-wishlist"
);

// 🛒 Cart Logger
export const cartLogger: Logger = createConsoleLogger("storefront-cart");

// 📊 Analytics Logger
export const storefrontAnalyticsLogger: Logger = createConsoleLogger(
  "storefront-analytics"
);

// 🚀 Performance Logger
export const storefrontPerformanceLogger: Logger = createConsoleLogger(
  "storefront-performance"
);

// 🎯 Specialized logging functions
export const storefrontLogger = {
  // 📊 Server Action Logging
  logActionStart(actionName: string, requestId: string, params: any) {
    storefrontServerActionLogger.info("Server action started", {
      action: actionName,
      requestId,
      params: JSON.stringify(params),
      timestamp: new Date().toISOString(),
    });
  },

  logActionSuccess(
    actionName: string,
    requestId: string,
    duration: number,
    result?: any
  ) {
    storefrontServerActionLogger.info("Server action completed successfully", {
      action: actionName,
      requestId,
      duration,
      success: true,
      resultSize: result ? JSON.stringify(result).length : 0,
      timestamp: new Date().toISOString(),
    });
  },

  logActionError(
    actionName: string,
    requestId: string,
    duration: number,
    error: Error
  ) {
    storefrontServerActionLogger.error("Server action failed", {
      action: actionName,
      requestId,
      duration,
      success: false,
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    });
  },

  // 🔐 Security Logging
  logSecurityEvent(event: string, userId?: string, details?: any) {
    storefrontSecurityLogger.warn("Security event detected", {
      event,
      userId,
      timestamp: new Date().toISOString(),
      ...details,
    });
  },

  logAuthAttempt(userId: string, success: boolean, method: string) {
    storefrontSecurityLogger.info("Authentication attempt", {
      userId,
      success,
      method,
      timestamp: new Date().toISOString(),
    });
  },

  // 💖 Wishlist Logging
  logWishlistAction(
    action: "add" | "remove" | "view",
    userId: string,
    productId?: string,
    details?: any
  ) {
    wishlistLogger.info("Wishlist action performed", {
      action,
      userId,
      productId,
      timestamp: new Date().toISOString(),
      ...details,
    });
  },

  // 🛒 Cart Logging
  logCartAction(
    action: "add" | "remove" | "update" | "clear",
    userId?: string,
    sessionId?: string,
    details?: any
  ) {
    cartLogger.info("Cart action performed", {
      action,
      userId,
      sessionId,
      timestamp: new Date().toISOString(),
      ...details,
    });
  },

  // 📊 Analytics Logging
  logCustomerView(
    event: "product_view" | "category_view" | "search",
    userId?: string,
    details?: any
  ) {
    storefrontAnalyticsLogger.info("Customer interaction", {
      event,
      userId,
      timestamp: new Date().toISOString(),
      ...details,
    });
  },

  logPurchaseFunnel(
    stage: "view" | "add_to_cart" | "checkout" | "purchase",
    userId?: string,
    productId?: string,
    details?: any
  ) {
    storefrontAnalyticsLogger.info("Purchase funnel event", {
      stage,
      userId,
      productId,
      timestamp: new Date().toISOString(),
      ...details,
    });
  },

  // 🚀 Performance Logging
  logPerformanceMetric(metric: string, value: number, context?: any) {
    storefrontPerformanceLogger.info("Performance metric", {
      metric,
      value,
      context,
      timestamp: new Date().toISOString(),
    });
  },

  logQueryPerformance(
    queryName: string,
    duration: number,
    resultCount?: number
  ) {
    storefrontPerformanceLogger.info("Database query performance", {
      query: queryName,
      duration,
      resultCount,
      timestamp: new Date().toISOString(),
    });
  },
};

// 🎭 Request ID Generator
export function generateRequestId(prefix: string = "storefront"): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// ⏱️ Performance Timer
export class PerformanceTimer {
  private startTime: number;
  private name: string;

  constructor(name: string) {
    this.name = name;
    this.startTime = performance.now();
  }

  end(): number {
    const duration = performance.now() - this.startTime;
    storefrontLogger.logPerformanceMetric(this.name, duration);
    return duration;
  }
}

// 🔄 Async Action Wrapper with Logging
export async function loggedAction<T>(
  actionName: string,
  action: () => Promise<T>,
  context?: any
): Promise<T> {
  const requestId = generateRequestId(actionName);
  const timer = new PerformanceTimer(`action-${actionName}`);

  try {
    storefrontLogger.logActionStart(actionName, requestId, context);

    const result = await action();
    const duration = timer.end();

    storefrontLogger.logActionSuccess(actionName, requestId, duration, result);
    return result;
  } catch (error) {
    const duration = timer.end();
    storefrontLogger.logActionError(
      actionName,
      requestId,
      duration,
      error as Error
    );
    throw error;
  }
}

// 📊 Batch Analytics Logger
export function logBatchAnalytics(
  events: Array<{
    event: string;
    userId?: string;
    data?: any;
  }>
) {
  events.forEach(({ event, userId, data }) => {
    storefrontAnalyticsLogger.info("Batch analytics event", {
      event,
      userId,
      timestamp: new Date().toISOString(),
      ...data,
    });
  });
}

export default storefrontLogger;
