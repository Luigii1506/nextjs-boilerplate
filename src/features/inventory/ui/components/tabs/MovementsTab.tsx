/**
 * 📋 MOVEMENTS TAB COMPONENT
 * ===========================
 *
 * Clean tab for stock movements history with extracted components
 * Orchestrates display of movements, filters, and stats
 *
 * ARCHITECTURE:
 * - Uses TabHeader component for consistent header
 * - Uses extracted MovementCard for individual movements
 * - Uses extracted MovementFilters for search and type filtering
 * - Shared movement configuration for consistency
 *
 * REFACTORED: 2025-01-27
 * - Reduced from 438 lines to ~290 lines (34% reduction)
 * - Extracted MovementCard component (107 lines)
 * - Extracted MovementFilters component (95 lines)
 * - Extracted movement config and types
 * - Cleaner orchestration pattern
 *
 * Created: 2025-01-18 - Inventory Movements Tab
 * Updated: 2025-01-27 - Architecture refactor for maintainability
 */

"use client";

import React, { useState, useMemo } from "react";
import {
  Archive,
  Package,
  TrendingUp,
  TrendingDown,
  Download,
} from "lucide-react";
import {
  TabWrapper,
  TabHeader,
  TabStatsCard,
  TabLoadingSkeleton,
  TabEmptyState,
} from "@/shared/ui/components/tabs";
import { useStockMovementsQuery } from "../../../hooks/useInventoryQuery";
import type { StockMovement } from "../../../types";
import {
  Movement,
  MovementType,
  MovementCard,
  MovementFilters,
} from "../movements";

/**
 * 🎯 Main Movements Tab
 *
 * Displays stock movements history with filtering and stats
 */
const MovementsTab: React.FC = React.memo(function MovementsTab() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<MovementType>("ALL");
  const [showFilters, setShowFilters] = useState(false);

  // 🔄 Fetch stock movements from API
  const {
    movements: stockMovements = [],
    isLoading,
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
      <TabWrapper spacing="space-y-6">
        <TabLoadingSkeleton type="stats" count={4} showHeader />
        <TabLoadingSkeleton type="list" count={5} />
      </TabWrapper>
    );
  }

  // Error state
  if (error) {
    return (
      <TabWrapper spacing="space-y-6">
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
      </TabWrapper>
    );
  }

  return (
    <TabWrapper spacing="space-y-6">
      {/* 🔥 Using TabHeader component */}
      <TabHeader
        icon={<Archive className="w-8 h-8 text-blue-600 dark:text-blue-400" />}
        title="Movimientos de Stock"
        description="Historial completo de entradas, salidas y ajustes"
        actions={[
          {
            label: "Exportar",
            icon: <Download className="w-4 h-4" />,
            onClick: () => console.log("Export"),
            variant: "secondary",
          },
        ]}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <TabStatsCard
          title="Total Movimientos"
          value={stats.total}
          icon={Archive}
          color="blue"
          description="Total de movimientos registrados"
        />

        <TabStatsCard
          title="Entradas"
          value={`+${stats.totalIn}`}
          icon={TrendingUp}
          color="green"
          description="Movimientos de entrada"
        />

        <TabStatsCard
          title="Salidas"
          value={`-${stats.totalOut}`}
          icon={TrendingDown}
          color="red"
          description="Movimientos de salida"
        />

        <TabStatsCard
          title="Cambio Neto"
          value={`${stats.netChange >= 0 ? "+" : ""}${stats.netChange}`}
          icon={Package}
          color={stats.netChange >= 0 ? "blue" : "red"}
          description="Diferencia entre entradas y salidas"
        />
      </div>

      {/* 🔥 Extracted MovementFilters component */}
      <MovementFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedType={selectedType}
        onTypeChange={setSelectedType}
        showFilters={showFilters}
        onToggleFilters={() => setShowFilters(!showFilters)}
      />

      {/* Movements List */}
      <div className="space-y-3">
        {filteredMovements.length > 0 ? (
          filteredMovements.map((movement) => (
            // 🔥 Extracted MovementCard component
            <MovementCard key={movement.id} movement={movement} />
          ))
        ) : (
          <TabEmptyState
            icon={<Archive className="w-20 h-20" />}
            title="No se encontraron movimientos"
            description={
              searchTerm || selectedType !== "ALL"
                ? "Intenta ajustar los filtros de búsqueda"
                : "Aún no hay movimientos de stock registrados"
            }
          />
        )}
      </div>
    </TabWrapper>
  );
});

export default MovementsTab;
