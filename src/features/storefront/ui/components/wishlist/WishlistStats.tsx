/**
 * 📊 WISHLIST STATS COMPONENT
 * ===========================
 *
 * Component para mostrar estadísticas del wishlist con tarjetas profesionales.
 * Displays total items, total value, and on-sale items.
 *
 * @version 2.0.0 - Clean Architecture
 */

import React from "react";
import { cn } from "@/lib/utils";
import { Heart, DollarSign, Sparkles } from "lucide-react";
import { WishlistStatsProps } from "./types";

export const WishlistStats: React.FC<WishlistStatsProps> = ({
  totalItems,
  totalValue,
  onSaleItems,
  allowAnimations,
}) => {
  return (
    <div
      className={cn(
        "grid grid-cols-1 sm:grid-cols-3 gap-6",
        allowAnimations && "animate-customerFadeInUp customer-stagger-1"
      )}
    >
      {/* Total Items */}
      <div className="bg-gradient-to-br from-pink-50 to-red-50 dark:from-pink-900/20 dark:to-red-900/20 rounded-xl p-6 border border-pink-200 dark:border-pink-800">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-pink-500 rounded-lg flex items-center justify-center">
            <Heart className="w-6 h-6 text-white fill-current animate-heartBeat" />
          </div>
          <div>
            <p className="text-2xl font-bold text-pink-900 dark:text-pink-100">
              {totalItems}
            </p>
            <p className="text-sm text-pink-700 dark:text-pink-300">
              Productos Favoritos
            </p>
          </div>
        </div>
      </div>

      {/* Total Value */}
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
            <DollarSign className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-2xl font-bold text-green-900 dark:text-green-100">
              ${totalValue.toLocaleString()}
            </p>
            <p className="text-sm text-green-700 dark:text-green-300">
              Valor Total
            </p>
          </div>
        </div>
      </div>

      {/* On Sale Items */}
      <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl p-6 border border-orange-200 dark:border-orange-800">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">
              {onSaleItems}
            </p>
            <p className="text-sm text-orange-700 dark:text-orange-300">
              En Oferta 🔥
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WishlistStats;
