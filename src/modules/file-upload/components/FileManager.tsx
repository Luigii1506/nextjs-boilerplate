// 🗂️ FILE MANAGER COMPONENT
// ==========================
// Componente para gestionar archivos existentes (CRUD)

"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  Filter,
  Grid3X3,
  List,
  Download,
  Trash2,
  Eye,
  MoreVertical,
  RefreshCw,
  Upload as UploadIcon,
  File,
  Calendar,
  HardDrive,
} from "lucide-react";
import { useFileManager } from "../hooks";
import { getFileIcon, FILE_CATEGORIES } from "../config";
import { humanFileSize } from "../utils";
import type { UploadFile, FileCategory } from "../types";

interface FileManagerProps {
  onFileSelect?: (file: UploadFile) => void;
  onFileUpload?: () => void;
  viewMode?: "grid" | "list";
  selectable?: boolean;
  className?: string;
}

export function FileManager({
  onFileSelect,
  onFileUpload,
  viewMode: initialViewMode = "grid",
  selectable = false,
  className = "",
}: FileManagerProps) {
  const [viewMode, setViewMode] = useState<"grid" | "list">(initialViewMode);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);

  const {
    files,
    loading,
    error,
    categories,
    selectedCategory,
    setSelectedCategory,
    refreshFiles,
    deleteFile,
    downloadFile,
    searchFiles,
  } = useFileManager();

  // Filtrar archivos según búsqueda
  const filteredFiles = useMemo(() => {
    if (!searchQuery) return files;

    return files.filter(
      (file) =>
        file.originalName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        file.mimeType.toLowerCase().includes(searchQuery.toLowerCase()) ||
        file.tags.some((tag) =>
          tag.toLowerCase().includes(searchQuery.toLowerCase())
        )
    );
  }, [files, searchQuery]);

  // Manejar búsqueda
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    searchFiles(query);
  };

  // Manejar selección de archivos
  const toggleFileSelection = (fileId: string) => {
    if (!selectable) return;

    setSelectedFiles((prev) => {
      const newSelection = new Set(prev);
      if (newSelection.has(fileId)) {
        newSelection.delete(fileId);
      } else {
        newSelection.add(fileId);
      }
      return newSelection;
    });
  };

  // Eliminar archivo con confirmación
  const handleDeleteFile = async (file: UploadFile) => {
    if (window.confirm(`¿Estás seguro de eliminar "${file.originalName}"?`)) {
      try {
        await deleteFile(file.id);
      } catch (error) {
        console.error("Error deleting file:", error);
      }
    }
  };

  // Eliminar archivos seleccionados
  const handleDeleteSelected = async () => {
    if (selectedFiles.size === 0) return;

    if (
      window.confirm(
        `¿Eliminar ${selectedFiles.size} archivo(s) seleccionado(s)?`
      )
    ) {
      const deletePromises = Array.from(selectedFiles).map((fileId) => {
        const file = files.find((f) => f.id === fileId);
        return file ? deleteFile(file.id) : Promise.resolve();
      });

      try {
        await Promise.all(deletePromises);
        setSelectedFiles(new Set());
      } catch (error) {
        console.error("Error deleting files:", error);
      }
    }
  };

  if (loading && files.length === 0) {
    return (
      <div className={`file-manager ${className}`}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 text-gray-400 animate-spin mx-auto mb-2" />
            <p className="text-gray-500">Cargando archivos...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`file-manager ${className}`}>
      {/* Header con controles */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Administrador de Archivos
          </h2>

          <div className="flex items-center space-x-2">
            {/* Botón subir archivos */}
            {onFileUpload && (
              <button
                onClick={onFileUpload}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <UploadIcon className="w-4 h-4" />
                <span>Subir archivos</span>
              </button>
            )}

            {/* Refresh */}
            <button
              onClick={refreshFiles}
              className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              disabled={loading}
            >
              <RefreshCw
                className={`w-5 h-5 ${loading ? "animate-spin" : ""}`}
              />
            </button>

            {/* View mode toggles */}
            <div className="flex rounded-lg border border-gray-300 dark:border-gray-600">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 ${
                  viewMode === "grid"
                    ? "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400"
                    : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                }`}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 border-l border-gray-300 dark:border-gray-600 ${
                  viewMode === "list"
                    ? "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400"
                    : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Barra de búsqueda y filtros */}
        <div className="flex items-center space-x-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar archivos..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2 rounded-lg border transition-colors ${
              showFilters
                ? "border-blue-500 bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400"
                : "border-gray-300 dark:border-gray-600 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            }`}
          >
            <Filter className="w-4 h-4" />
          </button>
        </div>

        {/* Panel de filtros */}
        {showFilters && (
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg mb-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Filtro por categoría */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Categoría
                </label>
                <select
                  value={selectedCategory || ""}
                  onChange={(e) => setSelectedCategory(e.target.value || null)}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="">Todas</option>
                  {Object.entries(FILE_CATEGORIES).map(([key, category]) => (
                    <option key={key} value={key}>
                      {category.icon} {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Acciones masivas */}
        {selectable && selectedFiles.size > 0 && (
          <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg flex items-center justify-between">
            <span className="text-sm text-blue-700 dark:text-blue-300">
              {selectedFiles.size} archivo(s) seleccionado(s)
            </span>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleDeleteSelected}
                className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors flex items-center space-x-1"
              >
                <Trash2 className="w-3 h-3" />
                <span>Eliminar</span>
              </button>
              <button
                onClick={() => setSelectedFiles(new Set())}
                className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Error display */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}

      {/* Lista/Grid de archivos */}
      {filteredFiles.length === 0 ? (
        <div className="text-center py-12">
          <File className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            No hay archivos
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            {searchQuery
              ? "No se encontraron archivos con esa búsqueda"
              : "Aún no has subido archivos"}
          </p>
          {onFileUpload && !searchQuery && (
            <button
              onClick={onFileUpload}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Subir primer archivo
            </button>
          )}
        </div>
      ) : (
        <div
          className={`
          ${
            viewMode === "grid"
              ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4"
              : "space-y-2"
          }
        `}
        >
          {filteredFiles.map((file) => (
            <FileItem
              key={file.id}
              file={file}
              viewMode={viewMode}
              selected={selectedFiles.has(file.id)}
              selectable={selectable}
              onSelect={() => toggleFileSelection(file.id)}
              onClick={() => onFileSelect?.(file)}
              onDownload={() => downloadFile(file)}
              onDelete={() => handleDeleteFile(file)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Componente individual de archivo
interface FileItemProps {
  file: UploadFile;
  viewMode: "grid" | "list";
  selected: boolean;
  selectable: boolean;
  onSelect: () => void;
  onClick?: () => void;
  onDownload: () => void;
  onDelete: () => void;
}

function FileItem({
  file,
  viewMode,
  selected,
  selectable,
  onSelect,
  onClick,
  onDownload,
  onDelete,
}: FileItemProps) {
  const [showActions, setShowActions] = useState(false);
  const fileIcon = getFileIcon(file.mimeType);
  const isImage = file.mimeType.startsWith("image/");

  if (viewMode === "grid") {
    return (
      <div
        className={`
          relative group bg-white dark:bg-gray-800 rounded-lg border-2 transition-all duration-200 hover:shadow-md
          ${
            selected
              ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
              : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
          }
          ${onClick ? "cursor-pointer" : ""}
        `}
        onClick={onClick}
      >
        {/* Checkbox para selección */}
        {selectable && (
          <div className="absolute top-2 left-2 z-10">
            <input
              type="checkbox"
              checked={selected}
              onChange={onSelect}
              onClick={(e) => e.stopPropagation()}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
          </div>
        )}

        {/* Menú de acciones */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowActions(!showActions);
              }}
              className="p-1 bg-white dark:bg-gray-800 rounded-full shadow-md hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <MoreVertical className="w-4 h-4 text-gray-500" />
            </button>

            {showActions && (
              <div className="absolute right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-20 min-w-[140px]">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDownload();
                    setShowActions(false);
                  }}
                  className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <Download className="w-4 h-4" />
                  <span>Descargar</span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                    setShowActions(false);
                  }}
                  className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Eliminar</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Preview del archivo */}
        <div className="aspect-square p-4">
          {isImage ? (
            <img
              src={file.url}
              alt={file.originalName}
              className="w-full h-full object-cover rounded"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded">
              <span className="text-4xl">{fileIcon}</span>
            </div>
          )}
        </div>

        {/* Info del archivo */}
        <div className="p-3 border-t border-gray-200 dark:border-gray-700">
          <p
            className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate"
            title={file.originalName}
          >
            {file.originalName}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {humanFileSize(file.size)}
          </p>
        </div>
      </div>
    );
  }

  // Vista de lista
  return (
    <div
      className={`
        flex items-center space-x-4 p-3 bg-white dark:bg-gray-800 rounded-lg border transition-all duration-200
        ${
          selected
            ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
            : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
        }
        ${onClick ? "cursor-pointer hover:shadow-sm" : ""}
      `}
      onClick={onClick}
    >
      {/* Checkbox */}
      {selectable && (
        <input
          type="checkbox"
          checked={selected}
          onChange={onSelect}
          onClick={(e) => e.stopPropagation()}
          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
        />
      )}

      {/* Preview/Icon */}
      <div className="flex-shrink-0">
        {isImage ? (
          <img
            src={file.url}
            alt={file.originalName}
            className="w-10 h-10 object-cover rounded"
          />
        ) : (
          <div className="w-10 h-10 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded">
            <span className="text-lg">{fileIcon}</span>
          </div>
        )}
      </div>

      {/* File info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
          {file.originalName}
        </p>
        <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
          <span>{humanFileSize(file.size)}</span>
          <span>{file.provider.toUpperCase()}</span>
          <span>{new Date(file.createdAt).toLocaleDateString()}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center space-x-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDownload();
          }}
          className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
          title="Descargar"
        >
          <Download className="w-4 h-4" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="p-2 text-gray-400 hover:text-red-600 transition-colors"
          title="Eliminar"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
