/**
 * 🎨 Client-side Formatters
 * =========================
 *
 * Utilidades de formateo para el lado del cliente.
 * No usan "use server" para poder ser importadas en componentes.
 *
 * @module pos/utils/formatters.client
 * @version 1.0.0
 */

/**
 * Formatear precio en moneda mexicana
 */
export function formatCurrency(amount: number, locale: string = "es-MX"): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "MXN",
  }).format(amount);
}

/**
 * Formatear fecha para transacciones
 */
export function formatTransactionDate(date: Date, locale: string = "es-MX"): string {
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(date);
}

/**
 * Formatear número corto de transacción (últimos 4 dígitos)
 */
export function formatShortTransactionNumber(transactionNumber: string): string {
  return transactionNumber.slice(-4);
}
