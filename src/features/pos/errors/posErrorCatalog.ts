import { AppError, type AppErrorOptions } from "@/shared/errors";

const POS_ERROR_CATALOG = {
  SALE_NOT_FOUND: {
    code: "POS_SALE_NOT_FOUND",
    message: "No se encontró una venta activa para la sesión actual.",
    stage: "domain" as const,
    severity: "medium" as const,
  },
  SALE_EMPTY: {
    code: "POS_SALE_EMPTY",
    message: "La venta está vacía. Agrega productos antes de continuar.",
    stage: "domain" as const,
    severity: "low" as const,
  },
  SALE_VALIDATION_FAILED: {
    code: "POS_SALE_VALIDATION_FAILED",
    message: "La venta no está lista para checkout.",
    stage: "validation" as const,
    severity: "medium" as const,
  },
  PAYMENT_INSUFFICIENT_FUNDS: {
    code: "POS_PAYMENT_INSUFFICIENT_FUNDS",
    message: "El monto pagado es insuficiente para completar la transacción.",
    stage: "domain" as const,
    severity: "medium" as const,
  },
  PAYMENT_PERSISTENCE_FAILED: {
    code: "POS_PAYMENT_PERSISTENCE_FAILED",
    message: "No fue posible completar el pago. Intenta nuevamente.",
    stage: "infrastructure" as const,
    severity: "high" as const,
  },
  PRODUCT_NOT_FOUND: {
    code: "POS_PRODUCT_NOT_FOUND",
    message: "El producto seleccionado no está disponible.",
    stage: "domain" as const,
    severity: "medium" as const,
  },
  STOCK_INSUFFICIENT: {
    code: "POS_STOCK_INSUFFICIENT",
    message: "No hay inventario suficiente para la cantidad solicitada.",
    stage: "domain" as const,
    severity: "medium" as const,
  },
  SESSION_NOT_FOUND: {
    code: "POS_SESSION_NOT_FOUND",
    message: "La sesión de caja solicitada no existe o ya fue cerrada.",
    stage: "domain" as const,
    severity: "medium" as const,
  },
  SESSION_OPEN_FAILED: {
    code: "POS_SESSION_OPEN_FAILED",
    message: "No fue posible abrir la sesión de caja.",
    stage: "infrastructure" as const,
    severity: "high" as const,
  },
  SESSION_CLOSE_FAILED: {
    code: "POS_SESSION_CLOSE_FAILED",
    message: "No fue posible cerrar la sesión de caja.",
    stage: "infrastructure" as const,
    severity: "high" as const,
  },
  SESSION_VALIDATION_FAILED: {
    code: "POS_SESSION_VALIDATION_FAILED",
    message: "La sesión de caja contiene datos inválidos.",
    stage: "validation" as const,
    severity: "medium" as const,
  },
  SESSION_SUSPEND_FAILED: {
    code: "POS_SESSION_SUSPEND_FAILED",
    message: "No fue posible suspender la sesión de caja.",
    stage: "infrastructure" as const,
    severity: "medium" as const,
  },
  SESSION_RESUME_FAILED: {
    code: "POS_SESSION_RESUME_FAILED",
    message: "No fue posible reanudar la sesión de caja.",
    stage: "infrastructure" as const,
    severity: "medium" as const,
  },
  SESSION_INVALID_STATUS: {
    code: "POS_SESSION_INVALID_STATUS",
    message: "La sesión de caja no se encuentra en un estado válido para esta operación.",
    stage: "domain" as const,
    severity: "medium" as const,
  },
  SESSION_FETCH_FAILED: {
    code: "POS_SESSION_FETCH_FAILED",
    message: "No fue posible obtener la información de la sesión de caja.",
    stage: "infrastructure" as const,
    severity: "medium" as const,
  },
  SESSION_HISTORY_FAILED: {
    code: "POS_SESSION_HISTORY_FAILED",
    message: "No fue posible obtener el historial de sesiones.",
    stage: "infrastructure" as const,
    severity: "medium" as const,
  },
  SESSION_TRANSACTIONS_FAILED: {
    code: "POS_SESSION_TRANSACTIONS_FAILED",
    message: "No fue posible obtener las transacciones de la sesión.",
    stage: "infrastructure" as const,
    severity: "medium" as const,
  },
  SALE_FETCH_FAILED: {
    code: "POS_SALE_FETCH_FAILED",
    message: "No fue posible obtener la venta activa.",
    stage: "infrastructure" as const,
    severity: "medium" as const,
  },
  SALE_MUTATION_FAILED: {
    code: "POS_SALE_MUTATION_FAILED",
    message: "No fue posible actualizar la venta en este momento.",
    stage: "infrastructure" as const,
    severity: "medium" as const,
  },
  PAYMENT_FETCH_FAILED: {
    code: "POS_PAYMENT_FETCH_FAILED",
    message: "No fue posible obtener la información de pagos.",
    stage: "infrastructure" as const,
    severity: "medium" as const,
  },
  PAYMENT_VOID_FAILED: {
    code: "POS_PAYMENT_VOID_FAILED",
    message: "No fue posible anular la transacción seleccionada.",
    stage: "infrastructure" as const,
    severity: "high" as const,
  },
} satisfies Record<string, AppErrorOptions>;

export type POSErrorKey = keyof typeof POS_ERROR_CATALOG;

export function createPOSError(
  key: POSErrorKey,
  overrides?: Partial<AppErrorOptions>
): AppError {
  const base = POS_ERROR_CATALOG[key];
  return new AppError({ ...base, ...overrides });
}
