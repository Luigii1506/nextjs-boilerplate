"use client";
import React, { useState } from "react";
import Image from "next/image";
import {
  X,
  Download,
  Trash2,
  Share,
  ZoomIn,
  ChevronLeft,
  ChevronRight,
  Calendar,
  HardDrive,
} from "lucide-react";
import type { UploadCardData } from "../../types";

interface ImageGalleryProps {
  images: UploadCardData[];
  onImageSelect?: (image: UploadCardData) => void;
  onImageDelete?: (image: UploadCardData) => void;
  onImageDownload?: (image: UploadCardData) => void;
  columns?: number;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({
  images,
  onImageSelect,
  onImageDelete,
  onImageDownload,
  columns = 3,
}) => {
  const [selectedImage, setSelectedImage] = useState<UploadCardData | null>(
    null
  );
  const [currentIndex, setCurrentIndex] = useState(0);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const openLightbox = (image: UploadCardData, index: number) => {
    setSelectedImage(image);
    setCurrentIndex(index);
    onImageSelect?.(image);
  };

  const closeLightbox = () => {
    setSelectedImage(null);
  };

  const navigateImage = (direction: "prev" | "next") => {
    let newIndex = currentIndex;

    if (direction === "prev") {
      newIndex = currentIndex > 0 ? currentIndex - 1 : images.length - 1;
    } else {
      newIndex = currentIndex < images.length - 1 ? currentIndex + 1 : 0;
    }

    setCurrentIndex(newIndex);
    setSelectedImage(images[newIndex]);
    onImageSelect?.(images[newIndex]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      closeLightbox();
    } else if (e.key === "ArrowLeft") {
      navigateImage("prev");
    } else if (e.key === "ArrowRight") {
      navigateImage("next");
    }
  };

  const getGridCols = () => {
    switch (columns) {
      case 2:
        return "grid-cols-1 sm:grid-cols-2";
      case 3:
        return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";
      case 4:
        return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";
      case 5:
        return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5";
      default:
        return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";
    }
  };

  if (images.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
          <ZoomIn className="w-8 h-8 text-slate-400 dark:text-slate-500" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
          No hay imágenes
        </h3>
        <p className="text-slate-600 dark:text-slate-400">
          Sube algunas imágenes para verlas aquí
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Gallery Grid */}
      <div className={`grid ${getGridCols()} gap-4`}>
        {images.map((image, index) => (
          <div
            key={image.id}
            className="group relative aspect-square bg-slate-100 dark:bg-slate-700 rounded-2xl overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-300"
            onClick={() => openLightbox(image, index)}
          >
            <Image
              src={image.url}
              alt={image.originalName || "Imagen de galería"}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />

            {/* Overlay */}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onImageDownload?.(image);
                  }}
                  className="p-2 bg-white/90 dark:bg-slate-800/90 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <Download
                    size={16}
                    className="text-slate-700 dark:text-slate-300"
                  />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openLightbox(image, index);
                  }}
                  className="p-2 bg-white/90 dark:bg-slate-800/90 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <ZoomIn
                    size={16}
                    className="text-slate-700 dark:text-slate-300"
                  />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onImageDelete?.(image);
                  }}
                  className="p-2 bg-white/90 dark:bg-slate-800/90 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <Trash2
                    size={16}
                    className="text-red-600 dark:text-red-400"
                  />
                </button>
              </div>
            </div>

            {/* Image Info */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <p className="text-white text-sm font-medium truncate">
                {image.originalName}
              </p>
              <div className="flex items-center justify-between text-xs text-white/80 mt-1">
                <span>{formatFileSize(image.size)}</span>
                {image.metadata &&
                  typeof image.metadata.width === "number" &&
                  typeof image.metadata.height === "number" && (
                    <span>
                      {image.metadata.width} × {image.metadata.height}
                    </span>
                  )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={closeLightbox}
          onKeyDown={handleKeyDown}
          tabIndex={0}
        >
          {/* Navigation Buttons */}
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigateImage("prev");
                }}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 p-3 bg-white/10 dark:bg-black/20 hover:bg-white/20 dark:hover:bg-black/40 rounded-full transition-colors z-10"
              >
                <ChevronLeft size={24} className="text-white" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigateImage("next");
                }}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 p-3 bg-white/10 dark:bg-black/20 hover:bg-white/20 dark:hover:bg-black/40 rounded-full transition-colors z-10"
              >
                <ChevronRight size={24} className="text-white" />
              </button>
            </>
          )}

          {/* Close Button */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 p-3 bg-white/10 dark:bg-black/20 hover:bg-white/20 dark:hover:bg-black/40 rounded-full transition-colors z-10"
          >
            <X size={24} className="text-white" />
          </button>

          {/* Image Counter */}
          {images.length > 1 && (
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 px-4 py-2 bg-white/10 dark:bg-black/20 rounded-full backdrop-blur-sm z-10">
              <span className="text-white text-sm">
                {currentIndex + 1} de {images.length}
              </span>
            </div>
          )}

          {/* Main Image */}
          <div className="max-w-7xl max-h-full flex items-center justify-center">
            <Image
              src={selectedImage.url}
              alt={selectedImage.originalName || "Imagen seleccionada"}
              width={(selectedImage.metadata?.width as number) || 1000}
              height={(selectedImage.metadata?.height as number) || 800}
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
              priority
            />
          </div>

          {/* Image Info Panel */}
          <div className="absolute bottom-4 left-4 right-4 bg-white/10 dark:bg-black/20 backdrop-blur-sm rounded-2xl p-6 max-w-md mx-auto border border-white/20 dark:border-black/30">
            <div className="flex items-start justify-between mb-4">
              <div className="min-w-0 flex-1">
                <h3 className="text-white font-semibold text-lg truncate">
                  {selectedImage.originalName}
                </h3>
                <div className="flex items-center gap-4 text-white/80 text-sm mt-2">
                  <div className="flex items-center gap-1">
                    <HardDrive size={14} />
                    <span>{formatFileSize(selectedImage.size)}</span>
                  </div>
                  {selectedImage.metadata &&
                    typeof selectedImage.metadata.width === "number" &&
                    typeof selectedImage.metadata.height === "number" && (
                      <span>
                        {selectedImage.metadata.width} ×{" "}
                        {selectedImage.metadata.height}
                      </span>
                    )}
                  <div className="flex items-center gap-1">
                    <Calendar size={14} />
                    <span>{formatDate(selectedImage.createdAt)}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 ml-4">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onImageDownload?.(selectedImage);
                  }}
                  className="p-2 bg-white/20 dark:bg-black/30 hover:bg-white/30 dark:hover:bg-black/50 rounded-lg transition-colors"
                >
                  <Download size={16} className="text-white" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigator.clipboard.writeText(selectedImage.url);
                  }}
                  className="p-2 bg-white/20 dark:bg-black/30 hover:bg-white/30 dark:hover:bg-black/50 rounded-lg transition-colors"
                >
                  <Share size={16} className="text-white" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onImageDelete?.(selectedImage);
                    closeLightbox();
                  }}
                  className="p-2 bg-red-500/20 dark:bg-red-500/30 hover:bg-red-500/30 dark:hover:bg-red-500/50 rounded-lg transition-colors"
                >
                  <Trash2
                    size={16}
                    className="text-red-300 dark:text-red-400"
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ImageGallery;
