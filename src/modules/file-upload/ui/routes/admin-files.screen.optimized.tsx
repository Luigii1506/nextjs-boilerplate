/**
 * ⚡ ADMIN FILES SCREEN - TANSTACK OPTIMIZED
 * ========================================
 *
 * Screen principal de gestión de archivos súper optimizada con TanStack Query.
 * Performance enterprise, cache inteligente, optimistic updates.
 *
 * Enterprise: 2025-01-17 - TanStack Query migration
 */

"use client";

import React, { useState, useMemo } from "react";
import {
  Upload,
  Grid,
  List,
  Search,
  MoreHorizontal,
  Image,
  File,
  RefreshCw,
} from "lucide-react";
import { useFileUploadQuery } from "../../hooks/useFileUploadQuery";
import { useNotifications } from "@/shared/hooks/useNotifications";
import FileUploader from "../components/FileUploader";
import FileManager from "../components/FileManager";
import FileStats from "../components/FileStats";
import ImageGallery from "../components/ImageGallery";
import type {} from "../../types";

// Component props
type AdminFilesScreenProps = Record<string, never>;

export const AdminFilesScreen: React.FC<AdminFilesScreenProps> = () => {
  // 🎯 Local UI States
  const [selectedProvider] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [uploadProvider, setUploadProvider] = useState<"local" | "s3">("local");
  const [selectedUploadCategory, setSelectedUploadCategory] = useState<
    string | null
  >(null);
  const [activeTab, setActiveTab] = useState<
    "upload" | "manager" | "stats" | "gallery"
  >("manager");

  // ⚡ TanStack Query Hook - Enterprise optimized
  const {
    files,
    stats,
    categories,
    isLoading,
    isRefreshing,
    error,
    uploadFile,
    deleteFile,
    updateFile,
    refresh,
    isUploading,
    isDeleting,
    isUpdating,
  } = useFileUploadQuery({
    autoFetch: true,
    enableOptimistic: true,
    staleTime: 30 * 1000, // 30s
    cacheTime: 10 * 60 * 1000, // 10 min
  });

  const { notify } = useNotifications();

  // 🔍 Filter files based on UI state
  const filteredFiles = useMemo(() => {
    let result = files;

    // Filter by search term
    if (searchTerm) {
      result = result.filter(
        (file) =>
          file.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
          file.originalName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by type
    if (filterType !== "all") {
      result = result.filter((file) => {
        switch (filterType) {
          case "images":
            return file.mimeType.startsWith("image/");
          case "documents":
            return (
              file.mimeType.includes("pdf") ||
              file.mimeType.includes("document") ||
              file.mimeType.includes("text")
            );
          case "videos":
            return file.mimeType.startsWith("video/");
          case "audio":
            return file.mimeType.startsWith("audio/");
          default:
            return true;
        }
      });
    }

    // Filter by category
    if (selectedCategory) {
      result = result.filter((file) => file.categoryId === selectedCategory);
    }

    // Filter by provider
    if (selectedProvider) {
      result = result.filter((file) => file.provider === selectedProvider);
    }

    return result;
  }, [files, searchTerm, filterType, selectedCategory, selectedProvider]);

  // 🎨 Get file type stats
  const fileTypeStats = useMemo(() => {
    const stats = {
      images: 0,
      documents: 0,
      videos: 0,
      audio: 0,
      other: 0,
    };

    files.forEach((file) => {
      if (file.mimeType.startsWith("image/")) {
        stats.images++;
      } else if (
        file.mimeType.includes("pdf") ||
        file.mimeType.includes("document")
      ) {
        stats.documents++;
      } else if (file.mimeType.startsWith("video/")) {
        stats.videos++;
      } else if (file.mimeType.startsWith("audio/")) {
        stats.audio++;
      } else {
        stats.other++;
      }
    });

    return stats;
  }, [files]);

  // 📤 Handle file upload
  const handleFileUpload = async (newFiles: File[]) => {
    try {
      for (const file of newFiles) {
        await uploadFile(file);
      }
      notify(`${newFiles.length} archivo(s) subido(s) exitosamente`, "success");
    } catch {
      notify("Error en la subida de archivos", "error");
    }
  };

  // 🗑️ Handle file delete
  const handleFileDelete = async (fileId: string) => {
    try {
      await deleteFile(fileId);
    } catch {
      notify("Error eliminando archivo", "error");
    }
  };

  // ✏️ Handle file update
  const handleFileUpdate = async (
    fileId: string,
    updates: { filename?: string; isPublic?: boolean; tags?: string[] }
  ) => {
    try {
      await updateFile({ fileId, ...updates });
    } catch {
      notify("Error actualizando archivo", "error");
    }
  };

  // Images are filtered inline in the gallery tab

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-500 mb-2">❌ Error cargando archivos</div>
          <div className="text-sm text-gray-600 mb-4">{error}</div>
          <button
            onClick={refresh}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-gray-900">
            Gestión de Archivos
          </h1>
          <p className="text-sm text-gray-600">
            {files.length} archivo(s) • TanStack Query Optimized
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={refresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw
              className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
            />
            Actualizar
          </button>

          <div className="flex border border-gray-300 rounded-md">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 ${
                viewMode === "grid"
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 ${
                viewMode === "list"
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: "manager", label: "Gestor", icon: File },
            { key: "upload", label: "Subir", icon: Upload },
            { key: "stats", label: "Estadísticas", icon: MoreHorizontal },
            { key: "gallery", label: "Galería", icon: Image },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() =>
                setActiveTab(key as "upload" | "manager" | "stats" | "gallery")
              }
              className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === key
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </nav>
      </div>

      {/* Search and Filters */}
      {(activeTab === "manager" || activeTab === "gallery") && (
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar archivos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Type Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">Todos los tipos</option>
            <option value="images">Imágenes ({fileTypeStats.images})</option>
            <option value="documents">
              Documentos ({fileTypeStats.documents})
            </option>
            <option value="videos">Videos ({fileTypeStats.videos})</option>
            <option value="audio">Audio ({fileTypeStats.audio})</option>
          </select>

          {/* Category Filter */}
          <select
            value={selectedCategory || ""}
            onChange={(e) => setSelectedCategory(e.target.value || null)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Todas las categorías</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Content */}
      <div className="min-h-[400px]">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <div className="text-gray-600">Cargando archivos...</div>
            </div>
          </div>
        ) : (
          <>
            {activeTab === "upload" && (
              <FileUploader
                onUpload={handleFileUpload}
                isUploading={isUploading}
                categories={categories}
                selectedCategory={selectedUploadCategory}
                onCategoryChange={setSelectedUploadCategory}
                provider={uploadProvider}
                onProviderChange={setUploadProvider}
              />
            )}

            {activeTab === "manager" && (
              <FileManager
                files={filteredFiles}
                onDelete={handleFileDelete}
                onUpdate={handleFileUpdate}
                viewMode={viewMode}
                isDeleting={isDeleting}
                isUpdating={isUpdating}
                categories={categories}
              />
            )}

            {activeTab === "stats" && (
              <FileStats
                stats={stats}
                isLoading={false}
                fileTypeStats={fileTypeStats}
                totalFiles={files.length}
              />
            )}

            {activeTab === "gallery" && (
              <ImageGallery
                images={filteredFiles.filter((f) =>
                  f.mimeType.startsWith("image/")
                )}
                onDelete={handleFileDelete}
                isDeleting={isDeleting}
              />
            )}
          </>
        )}
      </div>

      {/* Loading Overlay for Mutations */}
      {(isUploading || isDeleting || isUpdating) && (
        <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
              <div className="text-sm text-gray-600">
                {isUploading && "Subiendo archivo..."}
                {isDeleting && "Eliminando archivo..."}
                {isUpdating && "Actualizando archivo..."}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminFilesScreen;
