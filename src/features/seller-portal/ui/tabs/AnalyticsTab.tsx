/**
 * 📊 ANALYTICS TAB - Seller Portal
 * =================================
 *
 * Dashboard de métricas y reportes
 * - Revenue & Sales metrics
 * - Top products
 * - Channel performance
 * - Discount analytics
 *
 * Created: 2025-01-17
 * Updated: 2025-01-17 - Full backend integration
 */

"use client";

import { useState } from "react";
import {
  useAnalyticsMetrics,
  useRevenueByChannel,
  useTopProducts,
  useDiscountAnalytics,
  useDailyRevenue,
  useOrderStatusDistribution,
} from "../../hooks/useAnalytics";

export function AnalyticsTab() {
  const [dateRange, setDateRange] = useState("7d");

  // Queries
  const { data: metrics, isLoading: metricsLoading } = useAnalyticsMetrics(dateRange);
  const { data: channelData } = useRevenueByChannel(dateRange);
  const { data: topProducts } = useTopProducts(dateRange, 5);
  const { data: discounts } = useDiscountAnalytics(dateRange);
  const { data: dailyRevenue } = useDailyRevenue(dateRange);
  const { data: statusDistribution } = useOrderStatusDistribution(dateRange);

  // Helper to get payment method icon
  const getChannelIcon = (method: string) => {
    const icons: Record<string, string> = {
      stripe: "💳",
      card: "💳",
      cash: "💵",
      transfer: "🏦",
      paypal: "📱",
    };
    return icons[method?.toLowerCase()] || "💰";
  };

  // Helper to get payment method color
  const getChannelColor = (method: string) => {
    const colors: Record<string, string> = {
      stripe: "bg-blue-600",
      card: "bg-indigo-600",
      cash: "bg-green-600",
      transfer: "bg-purple-600",
      paypal: "bg-blue-500",
    };
    return colors[method?.toLowerCase()] || "bg-gray-600";
  };

  // Helper for status labels
  const getStatusLabel = (status: string) => {
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics</h2>
          <p className="text-gray-600 dark:text-gray-300">Métricas y reportes de ventas</p>
        </div>
        <div>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="24h">Últimas 24 horas</option>
            <option value="7d">Últimos 7 días</option>
            <option value="30d">Últimos 30 días</option>
            <option value="90d">Últimos 90 días</option>
            <option value="12m">Último año</option>
          </select>
        </div>
      </div>

      {/* Loading State */}
      {metricsLoading && (
        <div className="text-center py-12">
          <div className="text-gray-400">Cargando métricas...</div>
        </div>
      )}

      {/* Main Metrics */}
      {!metricsLoading && metrics && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">Ingresos Totales</div>
                <div className="text-2xl">💰</div>
              </div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">
                ${metrics.totalRevenue.toFixed(2)}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {metrics.completedOrders} órdenes completadas
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">Órdenes</div>
                <div className="text-2xl">📦</div>
              </div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">{metrics.totalOrders}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {metrics.pendingOrders} pendientes
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">Ticket Promedio</div>
                <div className="text-2xl">📊</div>
              </div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">
                ${metrics.averageOrderValue.toFixed(2)}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Por orden completada
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">Clientes</div>
                <div className="text-2xl">👥</div>
              </div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">{metrics.totalCustomers}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Clientes únicos
              </div>
            </div>
          </div>

          {/* Revenue Chart */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Ingresos por Día</h3>
            {dailyRevenue && dailyRevenue.length > 0 ? (
              <div className="space-y-2">
                {dailyRevenue.map((day) => (
                  <div key={day.date} className="flex items-center gap-4">
                    <div className="text-sm text-gray-600 dark:text-gray-300 w-24">
                      {new Date(day.date).toLocaleDateString("es-MX", {
                        month: "short",
                        day: "numeric",
                      })}
                    </div>
                    <div className="flex-1">
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-6 relative">
                        <div
                          className="bg-blue-600 dark:bg-blue-500 h-6 rounded-full flex items-center justify-end pr-2"
                          style={{
                            width: `${Math.max(
                              5,
                              (day.revenue / (Math.max(...dailyRevenue.map(d => d.revenue)) || 1)) * 100
                            )}%`,
                          }}
                        >
                          <span className="text-xs text-white font-medium">
                            ${day.revenue.toFixed(0)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 w-16 text-right">
                      {day.orders} órdenes
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                <div className="text-center text-gray-500 dark:text-gray-400">
                  <div className="text-4xl mb-2">📈</div>
                  <p>Sin datos para el período seleccionado</p>
                </div>
              </div>
            )}
          </div>

          {/* Channel Performance & Top Products */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Payment Method Performance */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Ventas por Método de Pago
              </h3>
              {channelData && channelData.length > 0 ? (
                <div className="space-y-4">
                  {channelData.map((channel) => (
                    <div key={channel.channel}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{getChannelIcon(channel.channel)}</span>
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                            {channel.channel}
                          </span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-bold text-gray-900 dark:text-white">
                            ${channel.revenue.toFixed(2)}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {channel.orders} órdenes
                          </div>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className={`${getChannelColor(channel.channel)} h-2 rounded-full`}
                          style={{ width: `${channel.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  Sin datos de canales
                </div>
              )}
            </div>

            {/* Top Products */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Productos Más Vendidos
              </h3>
              {topProducts && topProducts.length > 0 ? (
                <div className="space-y-3">
                  {topProducts.map((product, index) => (
                    <div
                      key={product.productId}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full font-bold text-sm">
                          #{index + 1}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {product.productName}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">SKU: {product.sku}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-gray-900 dark:text-white">
                          ${product.revenue.toFixed(2)}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {product.quantitySold} vendidos
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  Sin productos vendidos
                </div>
              )}
            </div>
          </div>

          {/* Discounts & Order Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Discount Analytics */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Análisis de Descuentos
              </h3>
              {discounts ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
                    <div>
                      <div className="text-sm text-purple-600 dark:text-purple-400 font-medium">
                        Total Descuentos
                      </div>
                      <div className="text-2xl font-bold text-purple-900 dark:text-purple-200">
                        ${discounts.totalDiscounts.toFixed(2)}
                      </div>
                    </div>
                    <div className="text-4xl">🎁</div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="text-xs text-gray-600 dark:text-gray-300">Órdenes con Descuento</div>
                      <div className="text-xl font-bold text-gray-900 dark:text-white">
                        {discounts.discountedOrders}
                      </div>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="text-xs text-gray-600 dark:text-gray-300">Descuento Promedio</div>
                      <div className="text-xl font-bold text-gray-900 dark:text-white">
                        ${discounts.averageDiscount.toFixed(2)}
                      </div>
                    </div>
                  </div>

                  {discounts.topPromotion && (
                    <div className="p-3 border border-green-200 dark:border-green-700 bg-green-50 dark:bg-green-900/30 rounded-lg">
                      <div className="text-xs text-green-600 dark:text-green-400 font-medium mb-1">
                        Top Promoción
                      </div>
                      <div className="text-sm font-bold text-gray-900 dark:text-white">
                        {discounts.topPromotion.name}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-300">
                        {discounts.topPromotion.usageCount} usos - $
                        {discounts.topPromotion.totalDiscount.toFixed(2)}
                      </div>
                    </div>
                  )}

                  {discounts.topCoupon && (
                    <div className="p-3 border border-blue-200 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                      <div className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-1">
                        Top Cupón
                      </div>
                      <div className="font-mono text-sm font-bold text-gray-900 dark:text-white">
                        {discounts.topCoupon.code}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-300">
                        {discounts.topCoupon.usageCount} usos - $
                        {discounts.topCoupon.totalDiscount.toFixed(2)}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  Sin datos de descuentos
                </div>
              )}
            </div>

            {/* Order Status Distribution */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Estado de Órdenes
              </h3>
              {statusDistribution && statusDistribution.length > 0 ? (
                <div className="space-y-3">
                  {statusDistribution.map((status) => (
                    <div key={status.status}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                          {getStatusLabel(status.status)}
                        </span>
                        <div className="text-right">
                          <span className="text-sm font-bold text-gray-900 dark:text-white">
                            {status.count}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                            ({status.percentage.toFixed(1)}%)
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                          style={{ width: `${status.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  Sin datos de estados
                </div>
              )}
            </div>
          </div>

          {/* Summary Stats */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              📈 Resumen del Período
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Completadas</div>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {metrics.completedOrders}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Pendientes</div>
                <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {metrics.pendingOrders}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Canceladas</div>
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {metrics.cancelledOrders}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Tasa de Éxito</div>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {metrics.totalOrders > 0
                    ? ((metrics.completedOrders / metrics.totalOrders) * 100).toFixed(1)
                    : 0}
                  %
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
