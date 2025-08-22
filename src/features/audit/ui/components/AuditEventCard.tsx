/**
 * 📋 AUDIT EVENT CARD COMPONENT
 * =============================
 *
 * Tarjeta individual para mostrar un evento de auditoría
 */

"use client";

import { Badge } from "@/shared/ui/components/Badge";
import { Card } from "@/shared/ui/components/Card";
import { Button } from "@/shared/ui/components/Button";
import { cn } from "@/shared/utils";
import { formatDateTime, formatActionLabel, formatResourceLabel } from "../../utils";
import { AUDIT_ACTION_COLORS, AUDIT_SEVERITY_COLORS } from "../../constants";
import type { AuditEvent } from "../../types";
import {
  Clock,
  User,
  Globe,
  Monitor,
  ChevronDown,
  ChevronUp,
  Eye,
} from "lucide-react";
import { useState } from "react";

interface AuditEventCardProps {
  event: AuditEvent;
  showDetails?: boolean;
  onViewDetails?: (event: AuditEvent) => void;
  className?: string;
}

export function AuditEventCard({
  event,
  showDetails = false,
  onViewDetails,
  className,
}: AuditEventCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const actionColor = AUDIT_ACTION_COLORS[event.action] || "gray";
  const severityColor = AUDIT_SEVERITY_COLORS[event.severity] || "gray";

  return (
    <Card className={cn("p-4 hover:shadow-md transition-shadow", className)}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={`border-${actionColor}-200 text-${actionColor}-700`}>
            {formatActionLabel(event.action)}
          </Badge>
          <Badge variant="secondary" className={`bg-${severityColor}-100 text-${severityColor}-700`}>
            {event.severity}
          </Badge>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Clock className="h-4 w-4" />
          {formatDateTime(event.createdAt)}
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-900">
            {formatResourceLabel(event.resource)}
          </span>
          {event.resourceName && (
            <span className="text-gray-600">• {event.resourceName}</span>
          )}
        </div>

        {event.description && (
          <p className="text-gray-700 text-sm">{event.description}</p>
        )}

        {/* User Info */}
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <User className="h-4 w-4" />
            <span>{event.userName || event.userEmail}</span>
          </div>
          {event.ipAddress && (
            <div className="flex items-center gap-1">
              <Globe className="h-4 w-4" />
              <span>{event.ipAddress}</span>
            </div>
          )}
        </div>
      </div>

      {/* Changes Preview */}
      {event.changes && event.changes.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">
              {event.changes.length} cambio(s)
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-6 px-2"
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>

          {isExpanded && (
            <div className="mt-2 space-y-2">
              {event.changes.slice(0, 3).map((change, index) => (
                <div key={index} className="text-sm">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-xs",
                        change.type === "added" && "border-green-200 text-green-700",
                        change.type === "modified" && "border-blue-200 text-blue-700",
                        change.type === "removed" && "border-red-200 text-red-700"
                      )}
                    >
                      {change.type}
                    </Badge>
                    <span className="font-medium">{change.fieldLabel || change.field}</span>
                  </div>
                  {change.type === "modified" && (
                    <div className="mt-1 ml-6 text-xs text-gray-600">
                      <div className="line-through">
                        {String(change.oldValue).substring(0, 50)}
                        {String(change.oldValue).length > 50 && "..."}
                      </div>
                      <div className="text-green-600">
                        {String(change.newValue).substring(0, 50)}
                        {String(change.newValue).length > 50 && "..."}
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {event.changes.length > 3 && (
                <div className="text-xs text-gray-500">
                  +{event.changes.length - 3} cambios más
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      {(showDetails || onViewDetails) && (
        <div className="mt-4 pt-3 border-t border-gray-200">
          <div className="flex justify-end">
            {onViewDetails && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onViewDetails(event)}
                className="flex items-center gap-2"
              >
                <Eye className="h-4 w-4" />
                Ver detalles
              </Button>
            )}
          </div>
        </div>
      )}

      {/* User Agent (collapsed by default) */}
      {event.userAgent && isExpanded && (
        <div className="mt-2 pt-2 border-t border-gray-100">
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Monitor className="h-3 w-3" />
            <span className="truncate">{event.userAgent}</span>
          </div>
        </div>
      )}
    </Card>
  );
}
