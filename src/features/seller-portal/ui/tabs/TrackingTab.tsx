/**
 * 🚚 FULFILLMENT DASHBOARD - Seller Portal
 * =========================================
 *
 * Professional shipping & logistics command center:
 * - Real-time fulfillment metrics
 * - Urgent alerts and actions
 * - Delivery calendar
 * - Carrier performance analytics
 * - Quick actions for bulk operations
 * - Issues tracker
 *
 * Created: 2025-01-17
 * Updated: 2025-01-17 - Transformed to Fulfillment Dashboard
 */

"use client";

import { useState, useMemo } from "react";
import { useOrders } from "../../hooks/useOrders";
import { OrderFilters, FulfillmentStatus, PaymentStatus, OrderStatus } from "../../types";
import {
  Package,
  Truck,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  Calendar,
  Printer,
  ExternalLink,
  XCircle,
} from "lucide-react";

export function TrackingTab() {
  const [selectedTimeframe, setSelectedTimeframe] = useState<"today" | "week" | "month">("week");

  // Fetch all relevant orders
  const { data: allOrders } = useOrders({}, 1, 200);

  // Calculate metrics
  const metrics = useMemo(() => {
    if (!allOrders) return null;

    const now = new Date();
    const orders = allOrders.items;

    // Pending shipment (paid but not shipped)
    const pendingShipment = orders.filter(
      (o) =>
        o.paymentStatus === PaymentStatus.PAID &&
        o.fulfillmentStatus === FulfillmentStatus.UNFULFILLED &&
        !o.trackingNumber
    );

    // In transit
    const inTransit = orders.filter(
      (o) => o.trackingNumber && o.fulfillmentStatus === FulfillmentStatus.SHIPPED
    );

    // Delayed (>48 hours without tracking)
    const delayed = pendingShipment.filter((o) => {
      const hoursSincePlaced = (now.getTime() - new Date(o.placedAt).getTime()) / (1000 * 60 * 60);
      return hoursSincePlaced > 48;
    });

    // Issues (failed deliveries, etc)
    const issues = orders.filter((o) => o.status === OrderStatus.CANCELLED);

    // Delivered
    const delivered = orders.filter((o) => o.fulfillmentStatus === FulfillmentStatus.DELIVERED);

    // Average fulfillment time (order to ship)
    const shippedOrders = orders.filter((o) => o.shippedAt);
    const avgFulfillmentHours =
      shippedOrders.length > 0
        ? shippedOrders.reduce((acc, o) => {
            if (o.shippedAt) {
              const hours =
                (new Date(o.shippedAt).getTime() - new Date(o.placedAt).getTime()) /
                (1000 * 60 * 60);
              return acc + hours;
            }
            return acc;
          }, 0) / shippedOrders.length
        : 0;

    // Shipped in 24hrs percentage
    const shippedIn24hrs = shippedOrders.filter((o) => {
      if (o.shippedAt) {
        const hours =
          (new Date(o.shippedAt).getTime() - new Date(o.placedAt).getTime()) / (1000 * 60 * 60);
        return hours <= 24;
      }
      return false;
    });
    const shippedIn24hrsPercent =
      shippedOrders.length > 0 ? (shippedIn24hrs.length / shippedOrders.length) * 100 : 0;

    return {
      pendingShipment: pendingShipment.length,
      inTransit: inTransit.length,
      delayed: delayed.length,
      issues: issues.length,
      delivered: delivered.length,
      avgFulfillmentHours,
      shippedIn24hrsPercent,
      delayedOrders: delayed,
      issueOrders: issues.slice(0, 5), // Top 5 issues
    };
  }, [allOrders]);

  // Carrier stats
  const carrierStats = useMemo(() => {
    if (!allOrders) return [];

    const orders = allOrders.items.filter((o) => o.trackingNumber);
    const carriers: Record<
      string,
      { total: number; delivered: number; avgCost: number; logo: string }
    > = {};

    orders.forEach((o) => {
      const carrier = o.paymentMethod || "Otro";
      if (!carriers[carrier]) {
        carriers[carrier] = { total: 0, delivered: 0, avgCost: 0, logo: "📦" };
      }
      carriers[carrier].total++;
      if (o.fulfillmentStatus === FulfillmentStatus.DELIVERED) {
        carriers[carrier].delivered++;
      }
    });

    const carrierLogos: Record<string, string> = {
      FedEx: "📦",
      DHL: "🔴",
      Estafeta: "📮",
      UPS: "🟤",
      "99Minutos": "⚡",
      Redpack: "🔴",
    };

    return Object.entries(carriers).map(([name, stats]) => ({
      name,
      logo: carrierLogos[name] || "📦",
      successRate: stats.total > 0 ? (stats.delivered / stats.total) * 100 : 0,
      total: stats.total,
      delivered: stats.delivered,
    }));
  }, [allOrders]);

  if (!metrics) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-300">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Centro de Control de Envíos
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Monitoreo en tiempo real de tu operación logística
          </p>
        </div>
        <select
          value={selectedTimeframe}
          onChange={(e) => setSelectedTimeframe(e.target.value as any)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
        >
          <option value="today">Hoy</option>
          <option value="week">Esta Semana</option>
          <option value="month">Este Mes</option>
        </select>
      </div>

      {/* Main Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Pending Shipment */}
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/30 dark:to-yellow-800/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <Package className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
            <span className="text-3xl font-bold text-yellow-700 dark:text-yellow-200">
              {metrics.pendingShipment}
            </span>
          </div>
          <h3 className="text-sm font-semibold text-yellow-900 dark:text-yellow-100">
            Pendientes de Envío
          </h3>
          <p className="text-xs text-yellow-600 dark:text-yellow-300 mt-1">
            Requieren tracking
          </p>
        </div>

        {/* In Transit */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <Truck className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            <span className="text-3xl font-bold text-blue-700 dark:text-blue-200">
              {metrics.inTransit}
            </span>
          </div>
          <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100">En Tránsito</h3>
          <p className="text-xs text-blue-600 dark:text-blue-300 mt-1">Activos con tracking</p>
        </div>

        {/* Delayed */}
        <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
            <span className="text-3xl font-bold text-red-700 dark:text-red-200">
              {metrics.delayed}
            </span>
          </div>
          <h3 className="text-sm font-semibold text-red-900 dark:text-red-100">Retrasadas</h3>
          <p className="text-xs text-red-600 dark:text-red-300 mt-1">&gt;48hrs sin enviar</p>
        </div>

        {/* Delivered */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
            <span className="text-3xl font-bold text-green-700 dark:text-green-200">
              {metrics.delivered}
            </span>
          </div>
          <h3 className="text-sm font-semibold text-green-900 dark:text-green-100">
            Entregadas
          </h3>
          <p className="text-xs text-green-600 dark:text-green-300 mt-1">Completadas</p>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Average Fulfillment Time */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <Clock className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Tiempo Promedio de Fulfillment
            </h3>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-purple-600 dark:text-purple-400">
              {metrics.avgFulfillmentHours.toFixed(1)}
            </span>
            <span className="text-lg text-gray-600 dark:text-gray-300">horas</span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Desde orden hasta envío
          </p>
          <div className="mt-4 flex items-center gap-2 text-sm">
            <TrendingUp className="w-4 h-4 text-green-600" />
            <span className="text-green-600 dark:text-green-400 font-medium">
              {metrics.shippedIn24hrsPercent.toFixed(0)}% enviadas en 24hrs
            </span>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Acciones Rápidas
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <button className="flex flex-col items-center gap-2 p-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors">
              <Printer className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              <span className="text-xs font-medium text-blue-900 dark:text-blue-100">
                Imprimir Etiquetas
              </span>
            </button>
            <button className="flex flex-col items-center gap-2 p-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/50 transition-colors">
              <Truck className="w-6 h-6 text-green-600 dark:text-green-400" />
              <span className="text-xs font-medium text-green-900 dark:text-green-100">
                Solicitar Recolección
              </span>
            </button>
            <button className="flex flex-col items-center gap-2 p-4 bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-700 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors">
              <ExternalLink className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              <span className="text-xs font-medium text-purple-900 dark:text-purple-100">
                Trackear Múltiples
              </span>
            </button>
            <button className="flex flex-col items-center gap-2 p-4 bg-orange-50 dark:bg-orange-900/30 border border-orange-200 dark:border-orange-700 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/50 transition-colors">
              <AlertTriangle className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              <span className="text-xs font-medium text-orange-900 dark:text-orange-100">
                Reportar Problema
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Alerts Section */}
      {(metrics.delayed > 0 || metrics.issues > 0) && (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
            <h3 className="text-lg font-semibold text-red-900 dark:text-red-100">
              Alertas y Acciones Urgentes
            </h3>
          </div>
          <div className="space-y-3">
            {metrics.delayed > 0 && (
              <div className="flex items-start gap-3 p-4 bg-white dark:bg-gray-800 rounded-lg">
                <Clock className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-white">
                    {metrics.delayed} órdenes sin enviar por más de 48 horas
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Estas órdenes requieren atención inmediata
                  </p>
                </div>
                <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium">
                  Ver Órdenes
                </button>
              </div>
            )}
            {metrics.issues > 0 && (
              <div className="flex items-start gap-3 p-4 bg-white dark:bg-gray-800 rounded-lg">
                <XCircle className="w-5 h-5 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-white">
                    {metrics.issues} problemas de entrega detectados
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Incluye cancelaciones y entregas fallidas
                  </p>
                </div>
                <button className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium">
                  Resolver
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Carrier Performance */}
      {carrierStats.length > 0 && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Performance por Paquetería
            </h3>
          </div>
          <div className="space-y-4">
            {carrierStats.map((carrier) => (
              <div key={carrier.name} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{carrier.logo}</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {carrier.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      {carrier.delivered}/{carrier.total} entregas
                    </span>
                    <span
                      className={`font-semibold ${
                        carrier.successRate >= 85
                          ? "text-green-600 dark:text-green-400"
                          : carrier.successRate >= 70
                            ? "text-yellow-600 dark:text-yellow-400"
                            : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {carrier.successRate.toFixed(0)}%
                    </span>
                  </div>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      carrier.successRate >= 85
                        ? "bg-green-600 dark:bg-green-500"
                        : carrier.successRate >= 70
                          ? "bg-yellow-600 dark:bg-yellow-500"
                          : "bg-red-600 dark:bg-red-500"
                    }`}
                    style={{ width: `${carrier.successRate}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Deliveries Calendar Preview */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Entregas Programadas - Esta Semana
            </h3>
          </div>
          <button className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium">
            Ver Calendario Completo →
          </button>
        </div>
        <div className="grid grid-cols-7 gap-2">
          {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map((day, i) => (
            <div key={i} className="text-center">
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">{day}</p>
              <div className="aspect-square rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                <span className="text-xs text-gray-500 dark:text-gray-400">{i + 15}</span>
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-4 text-center">
          Vista previa - Próximamente: calendario interactivo con entregas estimadas
        </p>
      </div>
    </div>
  );
}
