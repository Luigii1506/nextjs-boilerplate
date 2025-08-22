/**
 * 🔍 AUDIT FILTERS COMPONENT
 * ==========================
 *
 * Panel de filtros para eventos de auditoría
 */

"use client";

import { useState } from "react";
import { Button } from "@/shared/ui/components/Button";
import { Input } from "@/shared/ui/components/Input";
import { Label } from "@/shared/ui/components/Label";
import { Badge } from "@/shared/ui/components/Badge";
import { Card } from "@/shared/ui/components/Card";
import { cn } from "@/shared/utils";
import {
  AUDIT_ACTIONS,
  AUDIT_RESOURCES,
  AUDIT_SEVERITIES,
  AUDIT_ACTION_LABELS,
  AUDIT_RESOURCE_LABELS,
  AUDIT_SEVERITY_LABELS,
  DATE_RANGE_PRESETS,
} from "../../constants";
import type { AuditFilters as AuditFiltersType } from "../../types";
import {
  Search,
  Filter,
  X,
  Calendar,
  User,
  Settings,
  AlertTriangle,
} from "lucide-react";

interface AuditFiltersProps {
  filters: AuditFiltersType;
  onFiltersChange: (filters: AuditFiltersType) => void;
  onReset: () => void;
  className?: string;
}

export function AuditFilters({
  filters,
  onFiltersChange,
  onReset,
  className,
}: AuditFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const updateFilter = (key: keyof AuditFiltersType, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const removeFilter = (key: keyof AuditFiltersType) => {
    const newFilters = { ...filters };
    delete newFilters[key];
    onFiltersChange(newFilters);
  };

  const hasActiveFilters = Object.keys(filters).some(
    (key) =>
      key !== "page" &&
      key !== "limit" &&
      filters[key as keyof AuditFiltersType]
  );

  const activeFilterCount = Object.keys(filters).filter(
    (key) =>
      key !== "page" &&
      key !== "limit" &&
      filters[key as keyof AuditFiltersType]
  ).length;

  return (
    <Card className={cn("p-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-gray-600" />
          <h3 className="font-medium text-gray-900">Filtros</h3>
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="ml-2">
              {activeFilterCount}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={onReset}>
              <X className="h-4 w-4 mr-1" />
              Limpiar
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? "Colapsar" : "Expandir"}
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar eventos..."
            value={filters.search || ""}
            onChange={(e) => updateFilter("search", e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Quick Filters */}
      <div className="space-y-3">
        {/* Date Range Presets */}
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-2 block">
            <Calendar className="h-4 w-4 inline mr-1" />
            Período
          </Label>
          <div className="flex flex-wrap gap-2">
            {DATE_RANGE_PRESETS.map((preset) => {
              // Calculate dates dynamically
              const now = new Date();
              let presetDateFrom: Date | undefined;
              let presetDateTo: Date | undefined = now;

              if ("hours" in preset) {
                presetDateFrom = new Date(
                  now.getTime() - preset.hours * 60 * 60 * 1000
                );
              } else if ("days" in preset) {
                presetDateFrom = new Date(
                  now.getTime() - preset.days * 24 * 60 * 60 * 1000
                );
              }

              // Check if current filters match this preset
              const isActive =
                presetDateFrom &&
                presetDateTo &&
                filters.dateFrom?.getTime() === presetDateFrom.getTime() &&
                filters.dateTo?.getTime() === presetDateTo.getTime();

              return (
                <Button
                  key={preset.label}
                  variant={isActive ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    updateFilter("dateFrom", presetDateFrom);
                    updateFilter("dateTo", presetDateTo);
                  }}
                >
                  {preset.label}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-2 block">
            <Settings className="h-4 w-4 inline mr-1" />
            Acciones
          </Label>
          <div className="flex flex-wrap gap-2">
            {Object.entries(AUDIT_ACTIONS).map(([key, action]) => (
              <Button
                key={action}
                variant={filters.action === action ? "default" : "outline"}
                size="sm"
                onClick={() =>
                  filters.action === action
                    ? removeFilter("action")
                    : updateFilter("action", action)
                }
              >
                {AUDIT_ACTION_LABELS[action]}
              </Button>
            ))}
          </div>
        </div>

        {/* Severities */}
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-2 block">
            <AlertTriangle className="h-4 w-4 inline mr-1" />
            Severidad
          </Label>
          <div className="flex flex-wrap gap-2">
            {Object.entries(AUDIT_SEVERITIES).map(([key, severity]) => (
              <Button
                key={severity}
                variant={filters.severity === severity ? "default" : "outline"}
                size="sm"
                onClick={() =>
                  filters.severity === severity
                    ? removeFilter("severity")
                    : updateFilter("severity", severity)
                }
              >
                {AUDIT_SEVERITY_LABELS[severity]}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Expanded Filters */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
          {/* Resources */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-2 block">
              Recursos
            </Label>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(AUDIT_RESOURCES).map(([key, resource]) => (
                <Button
                  key={resource}
                  variant={
                    filters.resource === resource ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() =>
                    filters.resource === resource
                      ? removeFilter("resource")
                      : updateFilter("resource", resource)
                  }
                  className="justify-start"
                >
                  {AUDIT_RESOURCE_LABELS[resource]}
                </Button>
              ))}
            </div>
          </div>

          {/* User Filter */}
          <div>
            <Label
              htmlFor="user-filter"
              className="text-sm font-medium text-gray-700 mb-2 block"
            >
              <User className="h-4 w-4 inline mr-1" />
              Usuario
            </Label>
            <Input
              id="user-filter"
              placeholder="ID o email del usuario..."
              value={filters.userId || ""}
              onChange={(e) => updateFilter("userId", e.target.value)}
            />
          </div>

          {/* Custom Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label
                htmlFor="date-from"
                className="text-sm font-medium text-gray-700 mb-2 block"
              >
                Desde
              </Label>
              <Input
                id="date-from"
                type="datetime-local"
                value={
                  filters.dateFrom
                    ? filters.dateFrom.toISOString().slice(0, 16)
                    : ""
                }
                onChange={(e) =>
                  updateFilter(
                    "dateFrom",
                    e.target.value ? new Date(e.target.value) : undefined
                  )
                }
              />
            </div>
            <div>
              <Label
                htmlFor="date-to"
                className="text-sm font-medium text-gray-700 mb-2 block"
              >
                Hasta
              </Label>
              <Input
                id="date-to"
                type="datetime-local"
                value={
                  filters.dateTo
                    ? filters.dateTo.toISOString().slice(0, 16)
                    : ""
                }
                onChange={(e) =>
                  updateFilter(
                    "dateTo",
                    e.target.value ? new Date(e.target.value) : undefined
                  )
                }
              />
            </div>
          </div>
        </div>
      )}

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex flex-wrap gap-2">
            {filters.action && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Acción: {AUDIT_ACTION_LABELS[filters.action]}
                <button
                  onClick={() => removeFilter("action")}
                  className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {filters.resource && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Recurso: {AUDIT_RESOURCE_LABELS[filters.resource]}
                <button
                  onClick={() => removeFilter("resource")}
                  className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {filters.severity && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Severidad: {AUDIT_SEVERITY_LABELS[filters.severity]}
                <button
                  onClick={() => removeFilter("severity")}
                  className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {filters.userId && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Usuario: {filters.userId}
                <button
                  onClick={() => removeFilter("userId")}
                  className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}
