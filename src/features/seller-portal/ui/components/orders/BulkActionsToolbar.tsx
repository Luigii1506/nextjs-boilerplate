/**
 * 🔧 BULK ACTIONS TOOLBAR COMPONENT
 * ===================================
 *
 * Toolbar for bulk selection and export functionality
 *
 * Created: 2025-01-27
 */

"use client";

import React from "react";

export interface BulkActionsToolbarProps {
  bulkMode: boolean;
  onToggleBulkMode: () => void;
  selectedCount: number;
  totalCount: number;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onExport: () => void;
  canExport: boolean;
}

/**
 * BulkActionsToolbar - Selection mode and export controls
 */
export const BulkActionsToolbar: React.FC<BulkActionsToolbarProps> = React.memo(
  ({
    bulkMode,
    onToggleBulkMode,
    selectedCount,
    totalCount,
    onSelectAll,
    onClearSelection,
    onExport,
    canExport,
  }) => {
    return (
      <div className="flex items-center justify-between bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3">
        <div className="flex items-center gap-4">
          <button
            onClick={onToggleBulkMode}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              bulkMode
                ? "bg-blue-600 dark:bg-blue-500 text-white hover:bg-blue-700 dark:hover:bg-blue-600"
                : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
            }`}
          >
            {bulkMode ? "✓ Modo Selección" : "☐ Seleccionar Múltiples"}
          </button>

          {bulkMode && totalCount > 0 && (
            <>
              <button
                onClick={onSelectAll}
                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
              >
                Seleccionar Todo
              </button>
              {selectedCount > 0 && (
                <button
                  onClick={onClearSelection}
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 font-medium"
                >
                  Limpiar ({selectedCount})
                </button>
              )}
            </>
          )}
        </div>

        <button
          onClick={onExport}
          disabled={!canExport}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 dark:bg-green-500 text-white rounded-md hover:bg-green-700 dark:hover:bg-green-600 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          Exportar CSV {selectedCount > 0 && `(${selectedCount})`}
        </button>
      </div>
    );
  }
);

BulkActionsToolbar.displayName = "BulkActionsToolbar";
