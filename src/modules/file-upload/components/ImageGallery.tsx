// 🖼️ IMAGE GALLERY COMPONENT
// ===========================
// Galería de imágenes con modal de preview

"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Download,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Maximize2,
  Info,
} from "lucide-react";
import { humanFileSize } from "../utils";
import type { UploadFile } from "../types";

interface ImageGalleryProps {
  images: UploadFile[];
  onImageSelect?: (image: UploadFile) => void;
  onImageDelete?: (image: UploadFile) => void;
  onImageDownload?: (image: UploadFile) => void;
  className?: string;
  columns?: number;
}

export function ImageGallery({
  images,
  onImageSelect,
  onImageDelete,
  onImageDownload,
  className = "",
  columns = 4,
}: ImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<UploadFile | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Filtrar solo imágenes
  const imageFiles = images.filter((file) =>
    file.mimeType.startsWith("image/")
  );

  const openModal = (image: UploadFile) => {
    setSelectedImage(image);
    setCurrentIndex(imageFiles.findIndex((img) => img.id === image.id));
  };

  const closeModal = () => {
    setSelectedImage(null);
  };

  const navigateImage = (direction: "prev" | "next") => {
    if (imageFiles.length === 0) return;

    let newIndex;
    if (direction === "prev") {
      newIndex = currentIndex > 0 ? currentIndex - 1 : imageFiles.length - 1;
    } else {
      newIndex = currentIndex < imageFiles.length - 1 ? currentIndex + 1 : 0;
    }

    setCurrentIndex(newIndex);
    setSelectedImage(imageFiles[newIndex]);
  };

  // Navegación con teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedImage) return;

      switch (e.key) {
        case "Escape":
          closeModal();
          break;
        case "ArrowLeft":
          navigateImage("prev");
          break;
        case "ArrowRight":
          navigateImage("next");
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [selectedImage, currentIndex, imageFiles.length]);

  if (imageFiles.length === 0) {
    return (
      <div className={`image-gallery ${className}`}>
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🖼️</div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            No hay imágenes
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Las imágenes que subas aparecerán aquí
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`image-gallery ${className}`}>
      {/* Grid de imágenes */}
      <div
        className={`grid gap-4`}
        style={{
          gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
        }}
      >
        {imageFiles.map((image) => (
          <ImageThumbnail
            key={image.id}
            image={image}
            onClick={() => {
              onImageSelect?.(image);
              openModal(image);
            }}
            onDelete={() => onImageDelete?.(image)}
            onDownload={() => onImageDownload?.(image)}
          />
        ))}
      </div>

      {/* Modal de preview */}
      {selectedImage && (
        <ImageModal
          image={selectedImage}
          currentIndex={currentIndex}
          totalImages={imageFiles.length}
          onClose={closeModal}
          onPrev={() => navigateImage("prev")}
          onNext={() => navigateImage("next")}
          onDelete={() => {
            onImageDelete?.(selectedImage);
            closeModal();
          }}
          onDownload={() => onImageDownload?.(selectedImage)}
        />
      )}
    </div>
  );
}

// Componente de thumbnail individual
interface ImageThumbnailProps {
  image: UploadFile;
  onClick: () => void;
  onDelete?: () => void;
  onDownload?: () => void;
}

function ImageThumbnail({
  image,
  onClick,
  onDelete,
  onDownload,
}: ImageThumbnailProps) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  return (
    <div className="group relative aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-200">
      {/* Imagen */}
      <img
        src={image.url}
        alt={image.originalName}
        className={`w-full h-full object-cover transition-all duration-300 ${
          loaded ? "opacity-100" : "opacity-0"
        } group-hover:scale-105`}
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        onClick={onClick}
      />

      {/* Loading/Error states */}
      {!loaded && !error && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
          <div className="text-center">
            <div className="text-2xl mb-2">⚠️</div>
            <p className="text-xs text-gray-500">Error cargando</p>
          </div>
        </div>
      )}

      {/* Overlay con acciones */}
      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
        <div className="flex space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDownload?.();
            }}
            className="p-2 bg-white bg-opacity-90 rounded-full hover:bg-opacity-100 transition-all"
            title="Descargar"
          >
            <Download className="w-4 h-4 text-gray-700" />
          </button>

          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="p-2 bg-white bg-opacity-90 rounded-full hover:bg-opacity-100 transition-all"
              title="Eliminar"
            >
              <Trash2 className="w-4 h-4 text-red-600" />
            </button>
          )}
        </div>
      </div>

      {/* Info overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity">
        <p className="text-white text-sm font-medium truncate">
          {image.originalName}
        </p>
        <p className="text-white text-xs opacity-80">
          {humanFileSize(image.size)}
        </p>
      </div>
    </div>
  );
}

// Modal de imagen
interface ImageModalProps {
  image: UploadFile;
  currentIndex: number;
  totalImages: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  onDelete?: () => void;
  onDownload?: () => void;
}

function ImageModal({
  image,
  currentIndex,
  totalImages,
  onClose,
  onPrev,
  onNext,
  onDelete,
  onDownload,
}: ImageModalProps) {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [showInfo, setShowInfo] = useState(false);

  const resetTransforms = () => {
    setZoom(1);
    setRotation(0);
  };

  // Reset transforms when image changes
  useEffect(() => {
    resetTransforms();
  }, [image.id]);

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 p-4 bg-gradient-to-b from-black to-transparent">
        <div className="flex items-center justify-between text-white">
          <div>
            <h3 className="font-medium">{image.originalName}</h3>
            <p className="text-sm opacity-80">
              {currentIndex + 1} de {totalImages}
            </p>
          </div>

          <div className="flex items-center space-x-2">
            {/* Zoom controls */}
            <button
              onClick={() => setZoom(Math.max(0.25, zoom - 0.25))}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded"
              title="Zoom out"
            >
              <ZoomOut className="w-5 h-5" />
            </button>

            <span className="text-sm px-2">{Math.round(zoom * 100)}%</span>

            <button
              onClick={() => setZoom(Math.min(4, zoom + 0.25))}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded"
              title="Zoom in"
            >
              <ZoomIn className="w-5 h-5" />
            </button>

            {/* Rotate */}
            <button
              onClick={() => setRotation(rotation + 90)}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded"
              title="Rotar"
            >
              <RotateCw className="w-5 h-5" />
            </button>

            {/* Info */}
            <button
              onClick={() => setShowInfo(!showInfo)}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded"
              title="Información"
            >
              <Info className="w-5 h-5" />
            </button>

            {/* Download */}
            {onDownload && (
              <button
                onClick={onDownload}
                className="p-2 hover:bg-white hover:bg-opacity-20 rounded"
                title="Descargar"
              >
                <Download className="w-5 h-5" />
              </button>
            )}

            {/* Delete */}
            {onDelete && (
              <button
                onClick={onDelete}
                className="p-2 hover:bg-white hover:bg-opacity-20 rounded text-red-400"
                title="Eliminar"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}

            {/* Close */}
            <button
              onClick={onClose}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded"
              title="Cerrar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Navigation arrows */}
      {totalImages > 1 && (
        <>
          <button
            onClick={onPrev}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 p-3 bg-black bg-opacity-50 hover:bg-opacity-75 rounded-full text-white transition-all"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            onClick={onNext}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 p-3 bg-black bg-opacity-50 hover:bg-opacity-75 rounded-full text-white transition-all"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Image container */}
      <div className="relative max-w-full max-h-full overflow-hidden">
        <img
          src={image.url}
          alt={image.originalName}
          className="max-w-none transition-transform duration-200 select-none"
          style={{
            transform: `scale(${zoom}) rotate(${rotation}deg)`,
            maxHeight: "80vh",
            maxWidth: "80vw",
          }}
          draggable={false}
        />
      </div>

      {/* Info panel */}
      {showInfo && (
        <div className="absolute top-16 right-4 z-20 bg-black bg-opacity-80 text-white p-4 rounded-lg max-w-sm">
          <h4 className="font-medium mb-3">Información del archivo</h4>
          <div className="space-y-2 text-sm">
            <div>
              <span className="opacity-60">Nombre:</span> {image.originalName}
            </div>
            <div>
              <span className="opacity-60">Tamaño:</span>{" "}
              {humanFileSize(image.size)}
            </div>
            <div>
              <span className="opacity-60">Tipo:</span> {image.mimeType}
            </div>
            <div>
              <span className="opacity-60">Proveedor:</span>{" "}
              {image.provider.toUpperCase()}
            </div>
            <div>
              <span className="opacity-60">Subido:</span>{" "}
              {new Date(image.createdAt).toLocaleDateString()}
            </div>
            {image.metadata && (
              <>
                {typeof image.metadata.width === "number" &&
                  typeof image.metadata.height === "number" && (
                    <div>
                      <span className="opacity-60">Dimensiones:</span>{" "}
                      {image.metadata.width} × {image.metadata.height}
                    </div>
                  )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
