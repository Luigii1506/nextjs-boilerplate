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
 * REFACTORED: 2025-01-27
 * - Using shared Tab components (TabHeader, TabWrapper, TabLoadingSkeleton)
 * - Reduced from 434 to ~185 lines (57% reduction)
 * - Extracted 5 components (Metrics, Performance, Alerts, Carrier, Calendar)
 * - Extracted tracking helpers
 * - Clean orchestration pattern
 *
 * Created: 2025-01-17
 * Updated: 2025-01-27 - Final refactor with tab components
 */

"use client";

import { useState, useMemo } from "react";
import { Truck } from "lucide-react";
import { useOrders } from "../../hooks/useOrders";
import { FulfillmentStatus, PaymentStatus, OrderStatus } from "../../types";
import { getCarrierLogo } from "../../utils/tracking.helpers";
import {
  FulfillmentMetricsCards,
  PerformanceSection,
  AlertsSection,
  CarrierPerformance,
  DeliveryCalendar,
} from "../components/tracking";
import {
  TabHeader,
  TabWrapper,
  TabLoadingSkeleton,
} from "@/shared/ui/components/tabs";

export function TrackingTab() {
  const [selectedTimeframe, setSelectedTimeframe] = useState<
    "today" | "week" | "month"
  >("week");

  // Fetch all relevant orders
  const { data: allOrders, isLoading } = useOrders({}, 1, 200);

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
      (o) =>
        o.trackingNumber && o.fulfillmentStatus === FulfillmentStatus.SHIPPED
    );

    // Delayed (>48 hours without tracking)
    const delayed = pendingShipment.filter((o) => {
      const hoursSincePlaced =
        (now.getTime() - new Date(o.placedAt).getTime()) / (1000 * 60 * 60);
      return hoursSincePlaced > 48;
    });

    // Issues (failed deliveries, etc)
    const issues = orders.filter((o) => o.status === OrderStatus.CANCELLED);

    // Delivered
    const delivered = orders.filter(
      (o) => o.fulfillmentStatus === FulfillmentStatus.DELIVERED
    );

    // Average fulfillment time (order to ship)
    const shippedOrders = orders.filter((o) => o.shippedAt);
    const avgFulfillmentHours =
      shippedOrders.length > 0
        ? shippedOrders.reduce((acc, o) => {
            if (o.shippedAt) {
              const hours =
                (new Date(o.shippedAt).getTime() -
                  new Date(o.placedAt).getTime()) /
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
          (new Date(o.shippedAt).getTime() - new Date(o.placedAt).getTime()) /
          (1000 * 60 * 60);
        return hours <= 24;
      }
      return false;
    });
    const shippedIn24hrsPercent =
      shippedOrders.length > 0
        ? (shippedIn24hrs.length / shippedOrders.length) * 100
        : 0;

    return {
      pendingShipment: pendingShipment.length,
      inTransit: inTransit.length,
      delayed: delayed.length,
      issues: issues.length,
      delivered: delivered.length,
      avgFulfillmentHours,
      shippedIn24hrsPercent,
      delayedOrders: delayed,
      issueOrders: issues.slice(0, 5),
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

    return Object.entries(carriers).map(([name, stats]) => ({
      name,
      logo: getCarrierLogo(name),
      successRate: stats.total > 0 ? (stats.delivered / stats.total) * 100 : 0,
      total: stats.total,
      delivered: stats.delivered,
    }));
  }, [allOrders]);

  return (
    <TabWrapper>
      <TabHeader
        icon={<Truck className="w-8 h-8 text-blue-600 dark:text-blue-400" />}
        title="Centro de Control de Envíos"
        description="Monitoreo en tiempo real de tu operación logística"
        customActions={
          <select
            value={selectedTimeframe}
            onChange={(e) =>
              setSelectedTimeframe(e.target.value as "today" | "week" | "month")
            }
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
          >
            <option value="today">Hoy</option>
            <option value="week">Esta Semana</option>
            <option value="month">Este Mes</option>
          </select>
        }
      />

      {/* Loading State */}
      {isLoading && (
        <TabLoadingSkeleton type="stats" count={4} showHeader={false} />
      )}

      {/* Main Content */}
      {!isLoading && metrics && (
        <>
          {/* Main Metrics */}
          <FulfillmentMetricsCards
            metrics={{
              pendingShipment: metrics.pendingShipment,
              inTransit: metrics.inTransit,
              delayed: metrics.delayed,
              delivered: metrics.delivered,
            }}
          />

          {/* Performance Metrics & Quick Actions */}
          <PerformanceSection
            avgFulfillmentHours={metrics.avgFulfillmentHours}
            shippedIn24hrsPercent={metrics.shippedIn24hrsPercent}
          />

          {/* Alerts Section */}
          <AlertsSection
            delayedCount={metrics.delayed}
            issuesCount={metrics.issues}
          />

          {/* Carrier Performance */}
          <CarrierPerformance carriers={carrierStats} />

          {/* Upcoming Deliveries Calendar Preview */}
          <DeliveryCalendar />
        </>
      )}
    </TabWrapper>
  );
}
