/**
 * 📝 EVENT ROW COMPONENT
 * =======================
 *
 * Componente para mostrar una fila de evento de auditoría
 * con información detallada y acción de vista
 *
 * Created: 2025-01-27 - Extracted from ActivitiesTab
 */

"use client";

import React from "react";
import { Eye, User, Calendar } from "lucide-react";
import type { AuditEvent } from "../../../types";
import { SeverityBadge } from "./SeverityBadge";

export interface EventRowProps {
  event: AuditEvent;
  onView: (event: AuditEvent) => void;
}

/**
 * EventRow - Fila de evento con información completa
 */
export const EventRow: React.FC<EventRowProps> = ({ event, onView }) => {
  return (
    <div
      className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
      onClick={() => onView(event)}
    >
      {/* Left: Event Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 mb-2">
          <SeverityBadge severity={event.severity} />
          <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded">
            {event.action}
          </span>
          <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs rounded">
            {event.resource}
          </span>
        </div>

        <p className="font-medium text-gray-900 dark:text-gray-100 mb-1">
          {event.description || `${event.action} on ${event.resource}`}
        </p>

        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-1">
            <User className="w-3 h-3" />
            <span>{event.userEmail}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            <span>{new Date(event.createdAt).toLocaleString()}</span>
          </div>
          {event.ipAddress && (
            <span className="text-xs">IP: {event.ipAddress}</span>
          )}
        </div>
      </div>

      {/* Right: View Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onView(event);
        }}
        className="ml-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
      >
        <Eye className="w-5 h-5" />
      </button>
    </div>
  );
};

export default EventRow;
