/**
 * 📊 AUDIT DASHBOARD SCREEN
 * =========================
 *
 * Pantalla principal del dashboard de auditoría
 */

"use client";

import { useState, useEffect } from "react";
import { Card } from "@/shared/ui/components/Card";
import { Button } from "@/shared/ui/components/Button";
import { AuditStats, AuditFilters, AuditEventsList } from "../components";
import { useAuditTrail, useAuditStats, useAuditFilters } from "../../hooks";
import type { AuditFilters as AuditFiltersType } from "../../types";
import { AUDIT_CONFIG } from "../../constants";
import { BarChart3, Activity, Download, Settings } from "lucide-react";

interface AuditDashboardProps {
  onViewChange?: (view: string) => void;
}

export default function AuditDashboard({ onViewChange }: AuditDashboardProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "events">("overview");

  // Hooks
  const {
    stats,
    isLoading: statsLoading,
    error: statsError,
    refresh: refreshStats,
  } = useAuditStats();

  const { filters, updateFilter, resetFilters, applyPreset } =
    useAuditFilters();

  const {
    events,
    isLoading: eventsLoading,
    error: eventsError,
    totalCount,
    currentPage,
    hasMore,
    loadEvents,
    exportEvents,
  } = useAuditTrail();

  // Load initial data
  useEffect(() => {
    refreshStats();
    if (activeTab === "events") {
      loadEvents(filters);
    }
  }, [activeTab, filters, refreshStats, loadEvents]);

  const handleTabChange = (tab: "overview" | "events") => {
    setActiveTab(tab);
    if (tab === "events" && !events) {
      loadEvents(filters);
    }
  };

  const handleFiltersChange = (newFilters: AuditFiltersType) => {
    updateFilter(newFilters);
    if (activeTab === "events") {
      loadEvents(newFilters);
    }
  };

  const handlePageChange = (page: number) => {
    const newFilters = { ...filters, page };
    handleFiltersChange(newFilters);
  };

  const handleRefresh = () => {
    if (activeTab === "overview") {
      refreshStats();
    } else {
      loadEvents(filters);
    }
  };

  const handleExport = async (format: "csv" | "json") => {
    try {
      await exportEvents(filters, format);
    } catch (error) {
      console.error("Error exporting events:", error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Audit Trail</h1>
          <p className="text-gray-600">
            Seguimiento y auditoría de actividades del sistema
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => onViewChange?.("settings")}>
            <Settings className="h-4 w-4 mr-2" />
            Configuración
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Card className="p-1">
        <div className="flex items-center gap-1">
          <Button
            variant={activeTab === "overview" ? "default" : "ghost"}
            onClick={() => handleTabChange("overview")}
            className="flex items-center gap-2"
          >
            <BarChart3 className="h-4 w-4" />
            Resumen
          </Button>
          <Button
            variant={activeTab === "events" ? "default" : "ghost"}
            onClick={() => handleTabChange("events")}
            className="flex items-center gap-2"
          >
            <Activity className="h-4 w-4" />
            Eventos
          </Button>
        </div>
      </Card>

      {/* Content */}
      {activeTab === "overview" ? (
        <div className="space-y-6">
          {statsError ? (
            <Card className="p-8 text-center">
              <div className="text-red-600 mb-4">
                Error al cargar las estadísticas: {statsError}
              </div>
              <Button onClick={refreshStats}>Reintentar</Button>
            </Card>
          ) : statsLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <Card key={index} className="p-6">
                  <div className="animate-pulse">
                    <div className="h-6 w-1/3 bg-gray-200 rounded mb-4"></div>
                    <div className="grid grid-cols-4 gap-4">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="h-20 bg-gray-200 rounded"></div>
                      ))}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : stats ? (
            <AuditStats stats={stats} />
          ) : null}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Filters */}
          <AuditFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onReset={resetFilters}
          />

          {/* Events List */}
          {eventsError ? (
            <Card className="p-8 text-center">
              <div className="text-red-600 mb-4">
                Error al cargar los eventos: {eventsError}
              </div>
              <Button onClick={() => loadEvents(filters)}>Reintentar</Button>
            </Card>
          ) : events ? (
            <AuditEventsList
              data={{
                events,
                totalCount,
                currentPage,
                totalPages: Math.ceil(
                  totalCount / AUDIT_CONFIG.DEFAULT_PAGE_SIZE
                ),
                hasMore,
              }}
              isLoading={eventsLoading}
              onPageChange={handlePageChange}
              onRefresh={handleRefresh}
              onExport={handleExport}
              onViewEvent={(event) => {
                // TODO: Implement event details modal
                console.log("View event:", event);
              }}
            />
          ) : null}
        </div>
      )}
    </div>
  );
}
