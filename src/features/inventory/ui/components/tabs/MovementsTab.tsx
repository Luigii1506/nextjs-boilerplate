/**
 * 📋 MOVEMENTS TAB COMPONENT
 * ===========================
 *
 * Historial completo de movimientos de inventario
 * Con filtros, búsqueda y paginación
 *
 * Created: 2025-01-18 - Inventory Movements Tab
 */

"use client";

import React, { useState, useMemo } from "react";
import {
  Archive,
  Search,
  Filter,
  Calendar,
  Package,
  TrendingUp,
  TrendingDown,
  Edit3,
  User,
  X,
  ChevronDown,
  Download,
  Loader2,
} from "lucide-react";
import { cn } from "@/shared/utils";
import { TabTransition } from "../shared/TabTransition";
import { useStockMovementsQuery } from "../../../hooks/useInventoryQuery";
import type { StockMovement } from "../../../types";

// 🎨 Movement Types
type MovementType = "IN" | "OUT" | "ADJUSTMENT" | "TRANSFER" | "ALL";

interface Movement {
  id: string;
  type: MovementType;
  quantity: number;
  reason: string;
  reference?: string;
  previousStock: number;
  newStock: number;
  product: {
    id: string;
    name: string;
    sku: string;
    images: string[];
  };
  user: {
    name: string;
    email: string;
  };
  createdAt: Date;
}

// 🎨 Movement Type Config
const MOVEMENT_TYPE_CONFIG = {
  IN: {
    label: "Entrada",
    icon: TrendingUp,
    color: "green",
    bgColor: "bg-green-50 dark:bg-green-900/20",
    textColor: "text-green-700 dark:text-green-300",
    borderColor: "border-green-200 dark:border-green-800",
  },
  OUT: {
    label: "Salida",
    icon: TrendingDown,
    color: "red",
    bgColor: "bg-red-50 dark:bg-red-900/20",
    textColor: "text-red-700 dark:text-red-300",
    borderColor: "border-red-200 dark:border-red-800",
  },
  ADJUSTMENT: {
    label: "Ajuste",
    icon: Edit3,
    color: "purple",
    bgColor: "bg-purple-50 dark:bg-purple-900/20",
    textColor: "text-purple-700 dark:text-purple-300",
    borderColor: "border-purple-200 dark:border-purple-800",
  },
  TRANSFER: {
    label: "Transferencia",
    icon: Archive,
    color: "blue",
    bgColor: "bg-blue-50 dark:bg-blue-900/20",
    textColor: "text-blue-700 dark:text-blue-300",
    borderColor: "border-blue-200 dark:border-blue-800",
  },
} as const;

// 📦 Movement Card Component
const MovementCard: React.FC<{ movement: Movement }> = ({ movement }) => {
  const config =
    MOVEMENT_TYPE_CONFIG[movement.type as keyof typeof MOVEMENT_TYPE_CONFIG];
  const Icon = config.icon;

  const quantityChange =
    movement.type === "IN"
      ? `+${movement.quantity}`
      : movement.type === "OUT"
      ? `-${movement.quantity}`
      : movement.quantity.toString();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-4">
        {/* Left: Product Info */}
        <div className="flex items-start gap-3 flex-1 min-w-0">
          {/* Product Image */}
          <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-700 flex-shrink-0 overflow-hidden">
            {movement.product.images[0] ? (
              <img
                src={movement.product.images[0]}
                alt={movement.product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Package className="w-6 h-6 text-gray-400" />
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 dark:text-white truncate">
              {movement.product.name}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">
              SKU: {movement.product.sku}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
              {movement.reason}
            </p>
            {movement.reference && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Ref: {movement.reference}
              </p>
            )}
          </div>
        </div>

        {/* Right: Movement Info */}
        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          {/* Type Badge */}
          <span
            className={cn(
              "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border",
              config.bgColor,
              config.textColor,
              config.borderColor
            )}
          >
            <Icon className="w-3 h-3" />
            {config.label}
          </span>

          {/* Quantity Change */}
          <div className="text-right">
            <div
              className={cn(
                "text-2xl font-bold",
                movement.type === "IN" && "text-green-600 dark:text-green-400",
                movement.type === "OUT" && "text-red-600 dark:text-red-400",
                movement.type === "ADJUSTMENT" &&
                  "text-purple-600 dark:text-purple-400"
              )}
            >
              {quantityChange}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {movement.previousStock} → {movement.newStock}
            </div>
          </div>

          {/* User & Date */}
          <div className="text-xs text-gray-500 dark:text-gray-400 text-right">
            <div className="flex items-center gap-1">
              <User className="w-3 h-3" />
              <span>{movement.user.name}</span>
            </div>
            <div className="flex items-center gap-1 mt-0.5">
              <Calendar className="w-3 h-3" />
              <span>
                {new Intl.DateTimeFormat("es-MX", {
                  day: "2-digit",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                }).format(new Date(movement.createdAt))}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// 🎯 Main Movements Tab
const MovementsTab: React.FC = React.memo(function MovementsTab() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<MovementType>("ALL");
  const [showFilters, setShowFilters] = useState(false);

  // 🔄 Fetch stock movements from API
  const {
    movements: stockMovements = [],
    isLoading,
    isFetching,
    error,
  } = useStockMovementsQuery({
    enabled: true,
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: false,
  });

  // 🔄 Transform API data to Movement format
  const movements: Movement[] = useMemo(() => {
    return stockMovements
      .filter((movement: StockMovement) => movement.product && movement.user) // Filter out incomplete data
      .map((movement: StockMovement) => ({
        id: movement.id,
        type: movement.type as MovementType,
        quantity: movement.quantity,
        reason: movement.reason || "Ajuste de stock",
        reference: movement.reference || undefined,
        previousStock: movement.previousStock || 0,
        newStock: movement.newStock || 0,
        product: {
          id: movement.product!.id,
          name: movement.product!.name,
          sku: movement.product!.sku,
          images: movement.product!.images || [],
        },
        user: {
          name: movement.user!.name || "Sistema",
          email: movement.user!.email || "sistema@inventory.com",
        },
        createdAt: new Date(movement.createdAt),
      }));
  }, [stockMovements]);

  // Filter movements
  const filteredMovements = useMemo(() => {
    let filtered = movements;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (m) =>
          m.product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          m.product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
          m.reason.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by type
    if (selectedType !== "ALL") {
      filtered = filtered.filter((m) => m.type === selectedType);
    }

    // Sort by date (newest first)
    return filtered.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [movements, searchTerm, selectedType]);

  // Stats
  const stats = useMemo(() => {
    const totalIn = movements
      .filter((m) => m.type === "IN")
      .reduce((acc, m) => acc + m.quantity, 0);
    const totalOut = movements
      .filter((m) => m.type === "OUT")
      .reduce((acc, m) => acc + m.quantity, 0);

    return {
      total: movements.length,
      totalIn,
      totalOut,
      netChange: totalIn - totalOut,
    };
  }, [movements]);

  // Loading state
  if (isLoading) {
    return (
      <TabTransition isActive={true} transitionType="fade" delay={50}>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-blue-600 dark:text-blue-400 animate-spin mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              Cargando movimientos...
            </p>
          </div>
        </div>
      </TabTransition>
    );
  }

  // Error state
  if (error) {
    return (
      <TabTransition isActive={true} transitionType="fade" delay={50}>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <Archive className="w-16 h-16 text-red-300 dark:text-red-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              Error al cargar movimientos
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {error.message || "Ocurrió un error al cargar los movimientos"}
            </p>
          </div>
        </div>
      </TabTransition>
    );
  }

  return (
    <TabTransition isActive={true} transitionType="fade" delay={50}>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Movimientos de Stock
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Historial completo de entradas, salidas y ajustes
            </p>
          </div>

          <div className="flex items-center gap-2">
            {isFetching && (
              <Loader2 className="w-4 h-4 text-blue-600 dark:text-blue-400 animate-spin" />
            )}
            <button className="flex items-center gap-2 px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <Download className="w-4 h-4" />
              <span>Exportar</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Total Movimientos
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {stats.total}
                </p>
              </div>
              <Archive className="w-8 h-8 text-gray-400" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/10 rounded-lg border border-green-200 dark:border-green-800 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700 dark:text-green-300">
                  Entradas
                </p>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100 mt-1">
                  +{stats.totalIn}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/10 rounded-lg border border-red-200 dark:border-red-800 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-700 dark:text-red-300">
                  Salidas
                </p>
                <p className="text-2xl font-bold text-red-900 dark:text-red-100 mt-1">
                  -{stats.totalOut}
                </p>
              </div>
              <TrendingDown className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/10 rounded-lg border border-blue-200 dark:border-blue-800 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Cambio Neto
                </p>
                <p
                  className={cn(
                    "text-2xl font-bold mt-1",
                    stats.netChange >= 0
                      ? "text-blue-900 dark:text-blue-100"
                      : "text-red-900 dark:text-red-100"
                  )}
                >
                  {stats.netChange >= 0 ? "+" : ""}
                  {stats.netChange}
                </p>
              </div>
              <Package className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por producto, SKU o razón..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Type Filter */}
          <div className="flex gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors",
                showFilters
                  ? "bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300"
                  : "border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              )}
            >
              <Filter className="w-4 h-4" />
              <span>Filtros</span>
              <ChevronDown
                className={cn(
                  "w-4 h-4 transition-transform",
                  showFilters && "rotate-180"
                )}
              />
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        {showFilters && (
          <div className="flex flex-wrap gap-2 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
            {(["ALL", "IN", "OUT", "ADJUSTMENT"] as MovementType[]).map(
              (type) => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                    selectedType === type
                      ? "bg-blue-600 text-white"
                      : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600"
                  )}
                >
                  {type === "ALL" ? "Todos" : MOVEMENT_TYPE_CONFIG[type]?.label}
                </button>
              )
            )}
          </div>
        )}

        {/* Movements List */}
        <div className="space-y-3">
          {filteredMovements.length > 0 ? (
            filteredMovements.map((movement) => (
              <MovementCard key={movement.id} movement={movement} />
            ))
          ) : (
            <div className="text-center py-12">
              <Archive className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                No se encontraron movimientos
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                {searchTerm || selectedType !== "ALL"
                  ? "Intenta ajustar los filtros de búsqueda"
                  : "Aún no hay movimientos de stock registrados"}
              </p>
            </div>
          )}
        </div>
      </div>
    </TabTransition>
  );
});

export default MovementsTab;
