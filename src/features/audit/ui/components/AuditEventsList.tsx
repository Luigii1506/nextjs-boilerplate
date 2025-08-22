/**
 * 📋 AUDIT EVENTS LIST COMPONENT
 * ==============================
 *
 * Lista paginada de eventos de auditoría
 */

"use client";

import { useState } from "react";
import { Button } from "@/shared/ui/components/Button";
import { Card } from "@/shared/ui/components/Card";
import { Badge } from "@/shared/ui/components/Badge";
import { cn } from "@/shared/utils";
import { AuditEventCard } from "./AuditEventCard";
import type { AuditEvent, AuditEventsResponse } from "../../types";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  RefreshCw,
  Trash2,
  AlertCircle,
} from "lucide-react";

interface AuditEventsListProps {
  data: AuditEventsResponse;
  isLoading?: boolean;
  onPageChange: (page: number) => void;
  onRefresh: () => void;
  onExport?: (format: "csv" | "json") => void;
  onBulkDelete?: (eventIds: string[]) => void;
  onViewEvent?: (event: AuditEvent) => void;
  className?: string;
}

export function AuditEventsList({
  data,
  isLoading = false,
  onPageChange,
  onRefresh,
  onExport,
  onBulkDelete,
  onViewEvent,
  className,
}: AuditEventsListProps) {
  const [selectedEvents, setSelectedEvents] = useState<Set<string>>(new Set());
  const [isExporting, setIsExporting] = useState(false);

  const { events, currentPage, totalPages, totalCount, hasMore } = data;
  const hasNextPage = hasMore;
  const hasPreviousPage = currentPage > 1;

  const handleSelectEvent = (eventId: string, selected: boolean) => {
    const newSelected = new Set(selectedEvents);
    if (selected) {
      newSelected.add(eventId);
    } else {
      newSelected.delete(eventId);
    }
    setSelectedEvents(newSelected);
  };

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedEvents(new Set(events.map((event) => event.id)));
    } else {
      setSelectedEvents(new Set());
    }
  };

  const handleExport = async (format: "csv" | "json") => {
    if (!onExport) return;

    setIsExporting(true);
    try {
      await onExport(format);
    } finally {
      setIsExporting(false);
    }
  };

  const handleBulkDelete = () => {
    if (!onBulkDelete || selectedEvents.size === 0) return;

    if (
      confirm(
        `¿Estás seguro de que quieres eliminar ${selectedEvents.size} evento(s)?`
      )
    ) {
      onBulkDelete(Array.from(selectedEvents));
      setSelectedEvents(new Set());
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Eventos de Auditoría
              </h2>
              <p className="text-sm text-gray-600">
                {totalCount.toLocaleString()} eventos encontrados
              </p>
            </div>

            {selectedEvents.size > 0 && (
              <Badge variant="secondary" className="ml-4">
                {selectedEvents.size} seleccionado(s)
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Bulk Actions */}
            {selectedEvents.size > 0 && onBulkDelete && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleBulkDelete}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Eliminar
              </Button>
            )}

            {/* Export Actions */}
            {onExport && (
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExport("csv")}
                  disabled={isExporting}
                >
                  <Download className="h-4 w-4 mr-1" />
                  CSV
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExport("json")}
                  disabled={isExporting}
                >
                  <Download className="h-4 w-4 mr-1" />
                  JSON
                </Button>
              </div>
            )}

            {/* Refresh */}
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={isLoading}
            >
              <RefreshCw
                className={cn("h-4 w-4", isLoading && "animate-spin")}
              />
            </Button>
          </div>
        </div>

        {/* Bulk Selection */}
        {events.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={
                  selectedEvents.size === events.length && events.length > 0
                }
                onChange={(e) => handleSelectAll(e.target.checked)}
                className="rounded border-gray-300"
              />
              <span className="text-sm text-gray-600">
                Seleccionar todos en esta página
              </span>
            </div>
          </div>
        )}
      </Card>

      {/* Events List */}
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <Card key={index} className="p-4">
              <div className="animate-pulse">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-16 bg-gray-200 rounded"></div>
                    <div className="h-6 w-12 bg-gray-200 rounded"></div>
                  </div>
                  <div className="h-4 w-24 bg-gray-200 rounded"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
                  <div className="h-4 w-1/2 bg-gray-200 rounded"></div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : events.length === 0 ? (
        <Card className="p-8 text-center">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No se encontraron eventos
          </h3>
          <p className="text-gray-600">
            No hay eventos de auditoría que coincidan con los filtros aplicados.
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {events.map((event) => (
            <div key={event.id} className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={selectedEvents.has(event.id)}
                onChange={(e) => handleSelectEvent(event.id, e.target.checked)}
                className="mt-4 rounded border-gray-300"
              />
              <div className="flex-1">
                <AuditEventCard
                  event={event}
                  onViewDetails={onViewEvent}
                  showDetails={!!onViewEvent}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Página {currentPage} de {totalPages}
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={!hasPreviousPage || isLoading}
              >
                <ChevronLeft className="h-4 w-4" />
                Anterior
              </Button>

              {/* Page Numbers */}
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <Button
                      key={pageNum}
                      variant={pageNum === currentPage ? "default" : "outline"}
                      size="sm"
                      onClick={() => onPageChange(pageNum)}
                      disabled={isLoading}
                      className="w-8 h-8 p-0"
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={!hasNextPage || isLoading}
              >
                Siguiente
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
