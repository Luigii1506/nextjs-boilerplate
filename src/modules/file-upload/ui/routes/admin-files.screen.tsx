/**
 * ⚡ ADMIN FILES SCREEN - ELEGANT UX
 * ===================================
 *
 * Layout estandarizado siguiendo docs/layout_updated.md:
 * - Header que desaparece suavemente con scroll
 * - Tabs con bordes redondeados usando ReusableTabs
 * - Sin min-h-screen (sin scroll innecesario)
 * - Solo renderiza el tab activo
 * - Transiciones smooth
 *
 * Updated: 2025-01-18 - Standardized Layout
 */

"use client";

// Import custom animations
import "../../../../features/inventory/ui/styles/animations.css";

import React, { useState, useEffect, useMemo } from "react";
import {
  Upload,
  Grid,
  List,
  Search,
  MoreHorizontal,
  Image,
  File,
  RefreshCw,
  HardDrive,
} from "lucide-react";
import { ReusableTabs, type TabItem } from "@/shared/ui/components";
import { useFileUploadQuery } from "../../hooks/useFileUploadQuery";
// Notifications now handled by useFileUploadQuery
import FileUploader from "../components/FileUploader";
import FileManager from "../components/FileManager";
import FileStats from "../components/FileStats";
import ImageGallery from "../components/ImageGallery";
import type { UploadFile, UploadCardData } from "../../types";
import {
  SkeletonStatsCard,
  SkeletonCard,
  SkeletonList,
  Skeleton,
} from "@/shared/ui/components";

// 💀 Files Loading Skeleton Component
const FilesSkeleton: React.FC<{
  activeTab: "upload" | "manager" | "gallery" | "stats";
  viewMode: "list" | "grid";
}> = ({ activeTab, viewMode }) => {
  switch (activeTab) {
    case "upload":
      return (
        <div className="space-y-6">
          {/* Upload Area Skeleton */}
          <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-2xl p-8">
            <div className="flex flex-col items-center text-center space-y-4">
              <Skeleton width="4rem" height="4rem" rounded="full" />
              <Skeleton height="1.5rem" width="16rem" />
              <Skeleton height="1rem" width="12rem" />
              <Skeleton height="1rem" width="8rem" />
              <Skeleton height="2.5rem" width="10rem" rounded="lg" />
            </div>
          </div>
          {/* Selected Files Area */}
          <div className="space-y-3">
            {Array.from({ length: 2 }).map((_, i) => (
              <SkeletonCard key={i} showAvatar={false} lines={2} />
            ))}
          </div>
        </div>
      );

    case "manager":
      return viewMode === "grid" ? (
        // Grid View Skeleton
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden"
            >
              <Skeleton height="12rem" rounded="none" />
              <div className="p-4">
                <Skeleton height="1rem" width="80%" className="mb-2" />
                <div className="flex justify-between">
                  <Skeleton height="0.75rem" width="3rem" />
                  <Skeleton height="0.75rem" width="4rem" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        // List View Skeleton
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-5">
                <Skeleton height="1rem" width="6rem" />
              </div>
              <div className="col-span-2">
                <Skeleton height="1rem" width="4rem" />
              </div>
              <div className="col-span-2">
                <Skeleton height="1rem" width="5rem" />
              </div>
              <div className="col-span-2">
                <Skeleton height="1rem" width="6rem" />
              </div>
            </div>
          </div>
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 last:border-b-0"
            >
              <div className="grid grid-cols-12 gap-4 items-center">
                <div className="col-span-5 flex items-center gap-3">
                  <Skeleton width="1.25rem" height="1.25rem" />
                  <Skeleton height="0.875rem" width="8rem" />
                </div>
                <div className="col-span-2">
                  <Skeleton height="0.875rem" width="3rem" />
                </div>
                <div className="col-span-2">
                  <Skeleton height="0.875rem" width="4rem" />
                </div>
                <div className="col-span-2">
                  <Skeleton height="0.875rem" width="5rem" />
                </div>
                <div className="col-span-1">
                  <Skeleton width="1.5rem" height="1.5rem" rounded="sm" />
                </div>
              </div>
            </div>
          ))}
        </div>
      );

    case "gallery":
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden"
            >
              <Skeleton height="12rem" rounded="none" />
            </div>
          ))}
        </div>
      );

    case "stats":
      return (
        <div className="space-y-6">
          {/* Storage Overview */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Skeleton width="3rem" height="3rem" rounded="lg" />
                <div>
                  <Skeleton height="1.5rem" width="8rem" className="mb-1" />
                  <Skeleton height="0.875rem" width="10rem" />
                </div>
              </div>
              <div className="text-right">
                <Skeleton height="2rem" width="6rem" className="mb-1" />
                <Skeleton height="0.875rem" width="4rem" />
              </div>
            </div>
            <Skeleton
              height="0.5rem"
              width="100%"
              rounded="full"
              className="mb-2"
            />
            <Skeleton height="0.875rem" width="12rem" />
          </div>

          {/* File Type Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <SkeletonStatsCard key={i} />
            ))}
          </div>

          {/* Detailed Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SkeletonCard lines={4} />
            <SkeletonCard lines={4} />
          </div>
        </div>
      );

    default:
      return <SkeletonList items={6} showAvatar={false} />;
  }
};

// Component props
type AdminFilesScreenProps = Record<string, never>;

export const AdminFilesScreen: React.FC<AdminFilesScreenProps> = () => {
  // 🎯 Local UI States
  const [selectedProvider] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [activeTab, setActiveTab] = useState<
    "upload" | "manager" | "stats" | "gallery"
  >("manager");

  // Estado para visibilidad del header
  const [showHeader, setShowHeader] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

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
    // updateFile, // Removed - not used in this screen
    refresh,
    isUploading,
    isDeleting,
    isUpdating,
  } = useFileUploadQuery();

  // Notifications now handled by useFileUploadQuery hook

  // 🔧 Default upload config
  const uploadConfig = {
    provider: "local" as const,
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: [
      "image/*",
      "application/pdf",
      "text/*",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "video/*",
      "audio/*",
    ],
    multiple: true,
  };

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

  // Removed unused handler

  // Upload files handler for FileManager
  const handleUploadForManager = async (files: File[]) => {
    const results = [];
    for (const file of files) {
      try {
        const result = await uploadFile(file);
        results.push({ success: true, file: transformToCardData(result) });
      } catch (error) {
        results.push({
          success: false,
          error: error instanceof Error ? error.message : "Upload failed",
        });
      }
    }
    return results;
  };

  // 🗑️ Handle file delete (notifications handled by useFileUploadQuery)
  const handleFileDelete = async (fileId: string) => {
    await deleteFile(fileId); // useFileUploadQuery handles success/error notifications
  };

  // File transformations for compatibility
  const transformToCardData = (file: UploadFile): UploadCardData => ({
    ...file,
    fileType: file.mimeType.split("/")[0] as
      | "image"
      | "video"
      | "audio"
      | "document"
      | "other",
    sizeFormatted: (file.size / 1024 / 1024).toFixed(2) + " MB",
    isImage: file.mimeType.startsWith("image/"),
    extension: file.originalName.split(".").pop()?.toLowerCase() || "",
  });

  // Images are filtered inline in the gallery tab

  // 🎯 Smooth scroll detection
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Mostrar header cuando: scroll up o está en top
      // Ocultar header cuando: scroll down > 50px
      if (currentScrollY < lastScrollY || currentScrollY < 50) {
        setShowHeader(true);
      } else if (currentScrollY > 50) {
        setShowHeader(false);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  // Tab configuration for ReusableTabs
  const tabs: TabItem[] = [
    {
      id: "manager",
      label: "Gestor",
      icon: <File className="w-4 h-4" />,
      color: "blue",
    },
    {
      id: "upload",
      label: "Subir",
      icon: <Upload className="w-4 h-4" />,
      color: "green",
    },
    {
      id: "stats",
      label: "Estadísticas",
      icon: <MoreHorizontal className="w-4 h-4" />,
      color: "purple",
    },
    {
      id: "gallery",
      label: "Galería",
      icon: <Image className="w-4 h-4" />,
      color: "pink",
    },
  ];

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-500 dark:text-red-400 mb-2">
            ❌ Error cargando archivos
          </div>
          <div className="text-sm text-gray-600 dark:text-slate-400 mb-4">
            {error}
          </div>
          <button
            onClick={refresh}
            className="px-4 py-2 bg-blue-500 dark:bg-blue-600 text-white rounded hover:bg-blue-600 dark:hover:bg-blue-700 transition-colors duration-200"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900">
      {/*
        🎯 HEADER - Smooth fade out on scroll down
        - NO sticky (se oculta completamente)
        - Aparece cuando: scroll up o en top
        - Desaparece cuando: scroll down > 50px
      */}
      {showHeader && (
        <div className="transition-all duration-300 ease-in-out animate-fadeIn">
          <div className="border-b border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="max-w-[1600px] mx-auto px-6 py-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
                    <HardDrive className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                    Gestión de Archivos
                  </h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {files.length} archivo(s) • TanStack Query Optimized
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-3">
                  <button
                    onClick={refresh}
                    disabled={isRefreshing}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-2 transition-all duration-200 disabled:opacity-50"
                  >
                    <RefreshCw
                      className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
                    />
                    <span>Actualizar</span>
                  </button>

                  <div className="flex border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800">
                    <button
                      onClick={() => setViewMode("grid")}
                      className={`p-2 transition-colors duration-200 ${
                        viewMode === "grid"
                          ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                          : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                      }`}
                    >
                      <Grid className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode("list")}
                      className={`p-2 transition-colors duration-200 ${
                        viewMode === "list"
                          ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                          : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                      }`}
                    >
                      <List className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/*
        🎯 TABS - Sticky & Rounded
        - Sticky top-0 siempre
        - Bordes redondeados elegantes
        - Shadow para profundidad
      */}
      <div className="sticky top-0 z-50 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-[1600px] mx-auto px-6 pt-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-2">
            <ReusableTabs
              tabs={tabs}
              activeTab={activeTab}
              onTabChange={(tabId) =>
                setActiveTab(tabId as "upload" | "manager" | "stats" | "gallery")
              }
              variant="default"
              size="md"
              animated={true}
              scrollable={true}
              className="bg-transparent border-0 shadow-none p-0"
            />
          </div>
        </div>
      </div>

      {/*
        📦 CONTENT AREA - Professional Spacing
      */}
      <div className="max-w-[1600px] mx-auto px-6 py-6">
        {/* Search and Filters */}
        {(activeTab === "manager" || activeTab === "gallery") && (
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar archivos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 transition-colors duration-200"
              />
            </div>

            {/* Type Filter */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition-colors duration-200"
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
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition-colors duration-200"
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

        {/* Tab Content - Only Active Tab */}
        <div className="transition-opacity duration-200">
          {isLoading ? (
            <FilesSkeleton activeTab={activeTab} viewMode={viewMode} />
          ) : (
            <>
              {activeTab === "upload" && (
                <div className="animate-fadeIn">
                  <FileUploader
                    config={uploadConfig}
                    onUploadComplete={() => {}}
                    onUploadError={() => {}}
                    isUploading={isUploading}
                    uploadProgress={[]}
                    uploadError={null}
                    uploadFiles={async (files) => {
                      const results = [];
                      for (const file of files) {
                        try {
                          const result = await uploadFile(file);
                          results.push({
                            success: true,
                            file: transformToCardData(result),
                          });
                        } catch (error) {
                          results.push({
                            success: false,
                            error:
                              error instanceof Error
                                ? error.message
                                : "Upload failed",
                          });
                        }
                      }
                      return results;
                    }}
                    clearError={() => {}}
                  />
                </div>
              )}

              {activeTab === "manager" && (
                <div className="animate-fadeIn">
                  <FileManager
                    files={filteredFiles.map(transformToCardData)}
                    uploadProgress={[]}
                    uploadFiles={handleUploadForManager}
                    deleteFile={handleFileDelete}
                    viewMode={viewMode}
                    selectable={false}
                  />
                </div>
              )}

              {activeTab === "stats" && stats && (
                <div className="animate-fadeIn">
                  <FileStats stats={stats} showDetails={true} />
                </div>
              )}

              {activeTab === "gallery" && (
                <div className="animate-fadeIn">
                  <ImageGallery
                    images={filteredFiles
                      .filter((f) => f.mimeType.startsWith("image/"))
                      .map(transformToCardData)}
                    onImageDelete={(image) => handleFileDelete(image.id)}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Loading Overlay for Mutations */}
      {(isUploading || isDeleting || isUpdating) && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.25)" }}
        >
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-xl border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500 dark:border-blue-400"></div>
              <div className="text-sm text-gray-600 dark:text-slate-300">
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
