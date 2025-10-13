/**
 * 📊 ACCOUNT STATS
 * ================
 *
 * Statistics dashboard showing account metrics
 */

"use client";

import React, { useMemo } from "react";
import { cn } from "@/lib/utils";
import { DollarSign, Clock, Check, MapPin } from "lucide-react";
import type { OrderSummary } from "@/features/storefront/orders";
import type { Address } from "@/features/storefront/addresses";
import type { UserProfile } from "../types";
import { formatPrice } from "../utils/formatters";

interface AccountStatsProps {
  orders: OrderSummary[];
  addresses: Address[];
  user: UserProfile;
  allowAnimations: boolean;
}

export const AccountStats: React.FC<AccountStatsProps> = ({
  orders,
  addresses,
  user: _user,
  allowAnimations,
}) => {
  const stats = useMemo(() => {
    const totalSpent = orders.reduce((sum, order) => sum + order.total, 0);
    const pendingOrders = orders.filter(
      (order) => order.status === "PROCESSING" || order.status === "SHIPPED"
    ).length;
    const completedOrders = orders.filter(
      (order) => order.status === "DELIVERED"
    ).length;

    return {
      totalSpent,
      pendingOrders,
      completedOrders,
      totalAddresses: addresses.length,
    };
  }, [orders, addresses]);

  return (
    <div
      className={cn(
        "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6",
        allowAnimations && "animate-customerFadeInUp customer-stagger-1"
      )}
    >
      {/* Total Spent */}
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
            <DollarSign className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-2xl font-bold text-green-900 dark:text-green-100">
              {formatPrice(stats.totalSpent)}
            </p>
            <p className="text-sm text-green-700 dark:text-green-300">
              Total Gastado
            </p>
          </div>
        </div>
      </div>

      {/* Pending Orders */}
      <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-xl p-6 border border-orange-200 dark:border-orange-800">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
            <Clock className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">
              {stats.pendingOrders}
            </p>
            <p className="text-sm text-orange-700 dark:text-orange-300">
              Pedidos Pendientes
            </p>
          </div>
        </div>
      </div>

      {/* Completed Orders */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
            <Check className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
              {stats.completedOrders}
            </p>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Pedidos Completados
            </p>
          </div>
        </div>
      </div>

      {/* Saved Addresses */}
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-800">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
            <MapPin className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
              {stats.totalAddresses}
            </p>
            <p className="text-sm text-purple-700 dark:text-purple-300">
              Direcciones Guardadas
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
