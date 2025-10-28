/**
 * 📅 DELIVERY CALENDAR COMPONENT
 * ================================
 *
 * Weekly delivery calendar preview
 *
 * Created: 2025-01-27
 */

"use client";

import React from "react";
import { Calendar } from "lucide-react";

/**
 * DeliveryCalendar - Displays upcoming deliveries calendar
 */
export const DeliveryCalendar: React.FC = React.memo(() => {
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Entregas Programadas - Esta Semana
          </h3>
        </div>
        <button className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium">
          Ver Calendario Completo →
        </button>
      </div>
      <div className="grid grid-cols-7 gap-2">
        {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map((day, i) => (
          <div key={i} className="text-center">
            <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
              {day}
            </p>
            <div className="aspect-square rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {i + 15}
              </span>
            </div>
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-4 text-center">
        Vista previa - Próximamente: calendario interactivo con entregas
        estimadas
      </p>
    </div>
  );
});

DeliveryCalendar.displayName = "DeliveryCalendar";
