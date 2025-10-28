/**
 * 📊 ANALYTICS HELPERS
 * ====================
 *
 * Pure utility functions for analytics data formatting and display
 *
 * Created: 2025-01-27
 */

/**
 * Get icon for payment method/channel
 */
export const getChannelIcon = (method: string): string => {
  const icons: Record<string, string> = {
    stripe: "💳",
    card: "💳",
    cash: "💵",
    transfer: "🏦",
    paypal: "📱",
  };
  return icons[method?.toLowerCase()] || "💰";
};

/**
 * Get color class for payment method/channel
 */
export const getChannelColor = (method: string): string => {
  const colors: Record<string, string> = {
    stripe: "bg-blue-600",
    card: "bg-indigo-600",
    cash: "bg-green-600",
    transfer: "bg-purple-600",
    paypal: "bg-blue-500",
  };
  return colors[method?.toLowerCase()] || "bg-gray-600";
};

/**
 * Get Spanish label for order status
 */
export const getStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    PENDING: "Pendiente",
    CONFIRMED: "Confirmado",
    PROCESSING: "Procesando",
    SHIPPED: "Enviado",
    DELIVERED: "Entregado",
    CANCELLED: "Cancelado",
    REFUNDED: "Reembolsado",
  };
  return labels[status] || status;
};

/**
 * Format currency with Mexican locale
 */
export const formatCurrency = (amount: number): string => {
  return `$${amount.toFixed(2)}`;
};

/**
 * Calculate success rate percentage
 */
export const calculateSuccessRate = (
  completedOrders: number,
  totalOrders: number
): number => {
  if (totalOrders === 0) return 0;
  return (completedOrders / totalOrders) * 100;
};

/**
 * Format date for charts (Spanish locale)
 */
export const formatChartDate = (date: string): string => {
  return new Date(date).toLocaleDateString("es-MX", {
    month: "short",
    day: "numeric",
  });
};

/**
 * Calculate percentage for bar width
 */
export const calculateBarPercentage = (
  value: number,
  maxValue: number
): number => {
  if (maxValue === 0) return 0;
  return Math.max(5, (value / maxValue) * 100);
};
